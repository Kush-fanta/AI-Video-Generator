#!/usr/bin/env python3
# ---
# varnam_script: visual.video_clip
# owner: visual
# status: live
# surface: python3 scripts/run.py video:clip
# purpose: Source clip acquisition helper.
# use_when: Acquire trimmed clips from URL/timestamp evidence.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""
Video clip downloader using yt-dlp.
Downloads clips from YouTube, Twitter, government sites, etc.
Use video_scout.py first to find relevant timestamps in long videos.

REQUIREMENT: Deno must be installed for YouTube downloads.
Install: curl -fsSL https://deno.land/install.sh | sh
"""

from __future__ import annotations

import argparse
import os
import subprocess
import json
import shutil
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    yt_dlp = None


def require_yt_dlp() -> None:
    if yt_dlp is None:
        raise RuntimeError("Missing yt-dlp. Install it with `pip install yt-dlp`.")


def check_deno():
    """Check if Deno is installed (required for YouTube)."""
    # Check common paths
    deno_paths = [
        shutil.which("deno"),
        os.path.expanduser("~/.deno/bin/deno"),
        "/usr/local/bin/deno",
    ]
    
    for path in deno_paths:
        if path and os.path.exists(path):
            return True
    
    return False


def ensure_deno():
    """Return whether Deno is available."""
    if check_deno():
        return True

    print("Deno not found. Install it with:")
    print("  curl -fsSL https://deno.land/install.sh | sh")
    print("  export PATH=\"$HOME/.deno/bin:$PATH\"")
    return False


def get_video_info(url: str) -> dict:
    """Get video metadata without downloading."""
    require_yt_dlp()

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get("title", ""),
                "duration": info.get("duration", 0),
                "duration_string": info.get("duration_string", ""),
                "uploader": info.get("uploader", ""),
                "description": info.get("description", "")[:500],
                "chapters": info.get("chapters", []),
            }
    except Exception as e:
        print(f"Info extraction error: {e}")
        return None


QUALITY_PRESETS = {
    "1080": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best",
    "720": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best",
    "4k": "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best",
    "best": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
}


def download_clip(
    url: str,
    output_path: str,
    start_time: str = None,
    end_time: str = None,
    quality: str = "1080"
):
    """
    Download video clip with optional time range.

    When start/end are specified, downloads only that segment (much faster for long videos).
    Quality presets: 1080 (default), 720, 4k, best.
    Downloads separate video+audio streams and merges via ffmpeg for true HD.
    """
    require_yt_dlp()

    # Check for Deno if this is a YouTube URL
    if "youtube.com" in url or "youtu.be" in url:
        if not ensure_deno():
            print("ERROR: Deno is required for YouTube downloads.")
            return None

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    output_template = str(output_path.with_suffix(''))

    # Use quality presets for proper video+audio merge (gets true 1080p+)
    format_spec = QUALITY_PRESETS.get(quality, QUALITY_PRESETS["1080"])

    ydl_opts = {
        "format": format_spec,
        "merge_output_format": "mp4",
        "outtmpl": output_template + ".%(ext)s",
        "quiet": False,  # Show progress for debugging
        "no_warnings": False,
        "extract_flat": False,
        "ignoreerrors": False,
    }
    
    # Add time range using yt-dlp's download_ranges (efficient - downloads only segment)
    if start_time or end_time:
        def time_to_seconds(t):
            if not t:
                return None
            parts = t.split(':')
            if len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
            elif len(parts) == 2:
                return int(parts[0]) * 60 + float(parts[1])
            return float(t)
        
        start_sec = time_to_seconds(start_time) or 0
        end_sec = time_to_seconds(end_time)
        
        if end_sec:
            # Use download_ranges for efficient segment download
            ydl_opts["download_ranges"] = lambda info, ydl: [(start_sec, end_sec)]
        
        # Fallback: post-processor args
        postprocessor_args = []
        if start_time:
            postprocessor_args.extend(["-ss", start_time])
        if end_time:
            postprocessor_args.extend(["-to", end_time])
        
        if postprocessor_args:
            ydl_opts["postprocessor_args"] = {"ffmpeg": postprocessor_args}
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            downloaded_file = None
            for ext in ['.mp4', '.webm', '.mkv', '.mp4.part']:
                candidate = Path(output_template + ext)
                if candidate.exists() and candidate.stat().st_size > 0:
                    downloaded_file = candidate
                    break
            
            # Also check with video ID in filename (yt-dlp sometimes adds it)
            if not downloaded_file:
                import glob
                matches = glob.glob(f"{output_template}*")
                for m in matches:
                    p = Path(m)
                    if p.suffix in ['.mp4', '.webm', '.mkv'] and p.stat().st_size > 0:
                        downloaded_file = p
                        break
            
            if downloaded_file and downloaded_file.stat().st_size > 0:
                final_path = output_path.with_suffix(downloaded_file.suffix)
                if downloaded_file != final_path:
                    downloaded_file.rename(final_path)
                
                print(f"Downloaded: {final_path}")
                
                return {
                    "path": str(final_path),
                    "title": info.get("title", ""),
                    "duration": info.get("duration", 0),
                    "source": url
                }
            else:
                raise FileNotFoundError("Download completed but file not found")
                
    except Exception as e:
        print(f"Download error: {e}")
        return None


def extract_frame(
    video_path: str,
    output_path: str,
    timestamp: str = "00:00:01"
):
    """Extract a single frame from video as image."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        "ffmpeg", "-y",
        "-ss", timestamp,
        "-i", video_path,
        "-vframes", "1",
        "-q:v", "2",
        str(output_path)
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"Frame extracted: {output_path}")
        return str(output_path)
    except subprocess.CalledProcessError as e:
        print(f"Frame extraction error: {e}")
        return None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Download video clips. Use video_scout.py first to find timestamps in long videos."
    )
    parser.add_argument("--url", required=True, help="Video URL")
    parser.add_argument("--output", help="Output path")
    parser.add_argument("--start", help="Start time (HH:MM:SS or MM:SS)")
    parser.add_argument("--end", help="End time (HH:MM:SS or MM:SS)")
    parser.add_argument("--quality", choices=["1080", "720", "4k", "best"], default="1080",
                        help="Quality preset (default: 1080). Downloads video+audio separately and merges.")
    parser.add_argument("--info-only", action="store_true", help="Get metadata without downloading")
    parser.add_argument("--extract-frame", help="Extract frame at timestamp (requires --output)")
    parser.add_argument("--test", action="store_true", help="Test mode: just check if URL is downloadable")
    return parser


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = build_parser()
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    
    if args.test:
        # Test mode: check if video is accessible
        print(f"Testing URL: {args.url}")
        info = get_video_info(args.url)
        if info:
            print(f"✓ Video accessible: {info['title']}")
            print(f"  Duration: {info.get('duration_string', 'unknown')}")
            print(f"  Uploader: {info.get('uploader', 'unknown')}")
        else:
            print("✗ Video not accessible or URL invalid")
            return 1
        return 0
    
    if args.info_only:
        info = get_video_info(args.url)
        if info:
            print(json.dumps(info, indent=2))
            if info.get("chapters"):
                print("\nChapters:")
                for ch in info["chapters"]:
                    print(f"  {ch.get('start_time', 0):.0f}s - {ch.get('title', '')}")
        return 0 if info else 1
    
    elif args.extract_frame:
        if not args.output:
            parser.error("--output required for frame extraction")
        # Download a tiny segment around the frame timestamp
        result = download_clip(
            args.url, 
            args.output,
            start_time=args.extract_frame,
            end_time=None  # Just a few seconds
        )
        if result:
            frame_path = Path(args.output).with_suffix('.png')
            extract_frame(result["path"], str(frame_path), "00:00:00")
            return 0
        return 1
    
    else:
        if not args.output:
            parser.error("--output required for download")
        result = download_clip(
            url=args.url,
            output_path=args.output,
            start_time=args.start,
            end_time=args.end,
            quality=args.quality
        )
        return 0 if result else 1


if __name__ == "__main__":
    raise SystemExit(main())
