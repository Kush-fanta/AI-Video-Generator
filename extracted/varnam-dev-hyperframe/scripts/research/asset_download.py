#!/usr/bin/env python3
# ---
# varnam_script: research.asset_download
# owner: researcher
# status: live
# surface: direct-only
# purpose: Rights-gated media download and extraction.
# use_when: Fetch approved source assets with provenance and rights checks.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Strict asset downloader for the researcher pipeline.

The downloader accepts a manifest of approved assets and fetches them using
the right transport:

- `curl` for direct files
- `yt-dlp` for supported video hosts
- `ffmpeg` for audio extraction / trimming
- `screenshot.py` for open dashboards and public-record pages

Every item is gated by a copyright policy before download starts. Unknown or
unsupported rights are rejected up front.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SCRIPTS_DIR = Path(__file__).resolve().parent
SCRIPT_ROOT = SCRIPTS_DIR.parent
VISUAL_DIR = SCRIPT_ROOT / "visual"
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
APPROVED_LICENSES = {
    "public-domain",
    "cc0",
    "cc-by",
    "cc-by-sa",
    "government",
    "open-data",
    "odbl",
}
BLACKLIST_DOMAINS = {
    "gettyimages.com",
    "shutterstock.com",
    "istockphoto.com",
    "alamy.com",
    "dreamstime.com",
    "123rf.com",
    "depositphotos.com",
    "stock.adobe.com",
    "bigstockphoto.com",
    "vectorstock.com",
    "apimages.com",
    "reutersimages.com",
    "pinterest.com",
    "pin.it",
    "midjourney.com",
    "lexica.art",
    "playground.ai",
    "openart.ai",
    "tiktok.com",
}
TRUSTED_OPEN_DOMAINS = {
    "commons.wikimedia.org",
    "upload.wikimedia.org",
    "archive.org",
    "loc.gov",
    "digitalcollections.nypl.org",
    "europeana.eu",
    "dp.la",
    "openverse.org",
    "openstreetmap.org",
    "naturalearthdata.com",
    "worldbank.org",
    "data.worldbank.org",
    "ourworldindata.org",
    "un.org",
    "who.int",
    "fao.org",
    "ilo.org",
    "undp.org",
    "nasa.gov",
    "earthdata.nasa.gov",
    "worldview.earthdata.nasa.gov",
    "usgs.gov",
    "earthexplorer.usgs.gov",
}
SCREENSHOT_SAFE_DOMAINS = {
    "ourworldindata.org",
    "data.worldbank.org",
    "data.gov.in",
    "openstreetmap.org",
    "worldview.earthdata.nasa.gov",
    "earthexplorer.usgs.gov",
}

def normalize_license(value: str | None) -> str:
    raw = (value or "").strip().lower()
    if not raw:
        return ""
    raw = raw.replace("_", "-").replace(" ", "-")
    if "creative-commons" in raw and ("by-sa" in raw or "attribution-sharealike" in raw):
        return "cc-by-sa"
    if "creative-commons" in raw and ("by" in raw or "attribution" in raw):
        return "cc-by"
    if raw.startswith("cc-by-sa"):
        return "cc-by-sa"
    if raw.startswith("cc-by"):
        return "cc-by"
    if raw.startswith("cc0"):
        return "cc0"
    if "public-domain" in raw or "publicdomain" in raw or raw == "pd":
        return "public-domain"
    if raw.startswith("government") or "public-record" in raw:
        return "government"
    if raw.startswith("odbl"):
        return "odbl"
    if raw.startswith("open-data") or "open-government-license" in raw:
        return "open-data"
    return raw


def license_is_approved(value: str | None) -> bool:
    return normalize_license(value) in APPROVED_LICENSES


def host_from_url(url: str) -> str:
    return urlparse(url).netloc.lower().split(":")[0]


def _host_matches(host: str, domain: str) -> bool:
    return host == domain or host.endswith(f".{domain}")


def domain_is_blacklisted(host: str) -> bool:
    return any(_host_matches(host, domain) for domain in BLACKLIST_DOMAINS)


def domain_is_trusted_public(host: str) -> bool:
    if host.endswith(".gov.in") or host.endswith(".nic.in"):
        return True
    return any(_host_matches(host, domain) for domain in TRUSTED_OPEN_DOMAINS)


def domain_allows_screenshot(host: str) -> bool:
    if host.endswith(".gov.in") or host.endswith(".nic.in"):
        return True
    return any(_host_matches(host, domain) for domain in SCREENSHOT_SAFE_DOMAINS)


def build_curl_command(url: str, target: Path) -> list[str]:
    host = host_from_url(url)
    cmd = [
        "curl",
        "-L",
        "--fail",
        "--silent",
        "--show-error",
        "--retry",
        "2",
        "--compressed",
        "-A",
        USER_AGENT,
    ]
    if _host_matches(host, "upload.wikimedia.org"):
        cmd.extend(["--referer", "https://commons.wikimedia.org/"])
    cmd.extend(["--output", str(target), url])
    return cmd


def evaluate_download_policy(item: dict[str, Any]) -> tuple[bool, str]:
    url = str(item.get("source_url") or "").strip()
    if not url:
        return False, "missing source_url"

    host = host_from_url(url)
    if not host:
        return False, "could not determine source host"
    if domain_is_blacklisted(host):
        return False, f"blacklisted source domain: {host}"

    license_name = normalize_license(item.get("license_claim"))
    method = str(item.get("download_method") or "").strip().lower()
    asset_type = str(item.get("asset_type") or "").strip().lower()

    if method == "screenshot":
        if not domain_allows_screenshot(host):
            return False, f"screenshots limited to open charts/public records, rejected host: {host}"
        if license_name and not license_is_approved(license_name):
            return False, f"unsupported screenshot license: {license_name}"
        if not license_name and not domain_is_trusted_public(host):
            return False, "screenshots need approved license or trusted public domain"
        return True, "ok"

    if license_name:
        if license_is_approved(license_name):
            return True, "ok"
        return False, f"unsupported license: {license_name}"

    if domain_is_trusted_public(host) and asset_type in {"image", "document", "dashboard", "data"}:
        return True, "ok"

    return False, "missing approved license claim"


async def _run_command(cmd: list[str], timeout: int) -> tuple[int, str, str]:
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        return 124, "", f"command timed out after {timeout}s"
    return proc.returncode, stdout.decode("utf-8", errors="replace"), stderr.decode("utf-8", errors="replace")


def _existing_result(item: dict[str, Any], target: Path) -> dict[str, Any] | None:
    if target.exists() and target.stat().st_size > 0:
        return {
            **item,
            "status": "skipped",
            "reason": "already exists",
            "local_path": str(target),
            "file_size": target.stat().st_size,
        }
    return None


async def download_with_curl(item: dict[str, Any], project_dir: Path, semaphore: asyncio.Semaphore) -> dict[str, Any]:
    async with semaphore:
        target = project_dir / str(item["target_path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        existing = _existing_result(item, target)
        if existing:
            return existing

        cmd = build_curl_command(str(item["source_url"]), target)
        code, _, stderr = await _run_command(cmd, timeout=120)
        if code != 0:
            return {**item, "status": "error", "error": stderr.strip() or f"curl exited {code}"}
        if not target.exists() or target.stat().st_size == 0:
            return {**item, "status": "error", "error": "curl completed but output file is empty"}
        return {**item, "status": "ok", "local_path": str(target), "file_size": target.stat().st_size}


async def download_with_ytdlp(item: dict[str, Any], project_dir: Path, semaphore: asyncio.Semaphore) -> dict[str, Any]:
    async with semaphore:
        target = project_dir / str(item["target_path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        existing = _existing_result(item, target)
        if existing:
            return existing

        cmd = [
            "yt-dlp",
            "--no-progress",
            "--quiet",
            "--format",
            "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
            "-o",
            str(target),
            str(item["source_url"]),
        ]
        time_range = str(item.get("time_range") or "").strip()
        if time_range:
            cmd.extend(["--download-sections", f"*{time_range}"])

        code, _, stderr = await _run_command(cmd, timeout=600)
        if code != 0:
            return {**item, "status": "error", "error": stderr.strip() or f"yt-dlp exited {code}"}

        candidates = [target, *sorted(target.parent.glob(f"{target.stem}*"))]
        for candidate in candidates:
            if candidate.exists() and candidate.stat().st_size > 0:
                return {**item, "status": "ok", "local_path": str(candidate), "file_size": candidate.stat().st_size}
        return {**item, "status": "error", "error": "yt-dlp finished but no output file was found"}


async def extract_audio_with_ffmpeg(item: dict[str, Any], project_dir: Path, semaphore: asyncio.Semaphore) -> dict[str, Any]:
    async with semaphore:
        target = project_dir / str(item["target_path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        existing = _existing_result(item, target)
        if existing:
            return existing

        source = str(item.get("source_path") or item.get("source_url") or "").strip()
        if not source:
            return {**item, "status": "error", "error": "ffmpeg download requires source_path or source_url"}

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            source,
            "-vn",
            "-acodec",
            "libmp3lame",
            "-q:a",
            "2",
            str(target),
        ]
        code, _, stderr = await _run_command(cmd, timeout=600)
        if code != 0:
            return {**item, "status": "error", "error": stderr.strip() or f"ffmpeg exited {code}"}
        if not target.exists() or target.stat().st_size == 0:
            return {**item, "status": "error", "error": "ffmpeg finished but no audio file was produced"}
        return {**item, "status": "ok", "local_path": str(target), "file_size": target.stat().st_size}


async def capture_screenshot(item: dict[str, Any], project_dir: Path, semaphore: asyncio.Semaphore) -> dict[str, Any]:
    async with semaphore:
        target = project_dir / str(item["target_path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        existing = _existing_result(item, target)
        if existing:
            return existing

        cmd = [
            sys.executable,
            str(VISUAL_DIR / "screenshot.py"),
            "--url",
            str(item["source_url"]),
            "--output",
            str(target),
        ]
        site_type = str(item.get("site_type") or "").strip()
        if site_type:
            cmd.extend(["--type", site_type])

        code, _, stderr = await _run_command(cmd, timeout=300)
        if code != 0:
            return {**item, "status": "error", "error": stderr.strip() or f"screenshot.py exited {code}"}
        if not target.exists() or target.stat().st_size == 0:
            return {**item, "status": "error", "error": "screenshot capture completed but output file is empty"}
        return {**item, "status": "ok", "local_path": str(target), "file_size": target.stat().st_size}


async def process_item(
    item: dict[str, Any],
    project_dir: Path,
    http_semaphore: asyncio.Semaphore,
    heavy_semaphore: asyncio.Semaphore,
) -> dict[str, Any]:
    allowed, policy_reason = evaluate_download_policy(item)
    if not allowed:
        return {**item, "status": "error", "error": policy_reason, "policy_status": "rejected"}

    method = str(item.get("download_method") or "").strip().lower()
    asset_type = str(item.get("asset_type") or "").strip().lower()

    if method in {"curl", ""} or asset_type in {"image", "document"}:
        result = await download_with_curl(item, project_dir, http_semaphore)
    elif method == "yt-dlp" or asset_type == "video":
        result = await download_with_ytdlp(item, project_dir, heavy_semaphore)
    elif method == "ffmpeg" or asset_type == "audio":
        result = await extract_audio_with_ffmpeg(item, project_dir, heavy_semaphore)
    elif method == "screenshot" or asset_type in {"dashboard", "data"}:
        result = await capture_screenshot(item, project_dir, heavy_semaphore)
    else:
        result = {**item, "status": "error", "error": f"unsupported download method: {method or asset_type}"}

    result.setdefault("policy_status", "accepted")
    result.setdefault("license_normalized", normalize_license(item.get("license_claim")))
    return result


async def download_all(
    downloads: list[dict[str, Any]],
    project_dir: Path,
    max_http: int,
    max_heavy: int,
    logger: Any = None,
) -> list[dict[str, Any]]:
    http_semaphore = asyncio.Semaphore(max_http)
    heavy_semaphore = asyncio.Semaphore(max_heavy)
    tasks = [
        asyncio.create_task(process_item(item, project_dir, http_semaphore, heavy_semaphore))
        for item in downloads
    ]
    results = await asyncio.gather(*tasks)

    if logger:
        for entry in results:
            logger.log(
                "download",
                agent="asset_download.py",
                asset_id=entry.get("id"),
                method=entry.get("download_method"),
                asset_type=entry.get("asset_type"),
                source_url=entry.get("source_url"),
                status=entry.get("status"),
                policy_status=entry.get("policy_status"),
                file_size=entry.get("file_size"),
                error=entry.get("error"),
            )
    return results


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Copyright-gated asset downloader for researcher manifests")
    parser.add_argument("--manifest", required=True, help="Path to the filtered_results.json manifest")
    parser.add_argument("--project-dir", required=True, help="Project directory root")
    parser.add_argument("--output", help="Path for the resulting download_manifest.json")
    parser.add_argument("--max-http", type=int, default=4, help="Max concurrent curl downloads")
    parser.add_argument("--max-heavy", type=int, default=2, help="Max concurrent yt-dlp/ffmpeg/screenshot jobs")
    parser.add_argument("--log", help="Optional research_log.jsonl path")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    with Path(args.manifest).open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)
    downloads = manifest.get("downloads", [])
    if not isinstance(downloads, list):
        raise ValueError("manifest must contain a 'downloads' list")

    logger = None
    if args.log:
        from research.research_logger import ResearchLogger

        logger = ResearchLogger(args.log)

    start = time.monotonic()
    results = asyncio.run(
        download_all(
            downloads=downloads,
            project_dir=Path(args.project_dir).resolve(),
            max_http=args.max_http,
            max_heavy=args.max_heavy,
            logger=logger,
        )
    )
    elapsed = int((time.monotonic() - start) * 1000)

    ok = [entry for entry in results if entry.get("status") == "ok"]
    skipped = [entry for entry in results if entry.get("status") == "skipped"]
    errors = [entry for entry in results if entry.get("status") == "error"]
    output = {
        "downloaded_at": datetime.now(timezone.utc).isoformat(),
        "total": len(results),
        "ok": len(ok),
        "skipped": len(skipped),
        "errors": len(errors),
        "duration_ms": elapsed,
        "assets": results,
    }

    output_path = Path(args.output) if args.output else Path(args.project_dir) / "research" / "download_manifest.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2, ensure_ascii=False)

    if logger:
        logger.log(
            "download_all",
            agent="asset_download.py",
            total=len(results),
            ok=len(ok),
            skipped=len(skipped),
            errors=len(errors),
            duration_ms=elapsed,
            status="ok",
        )

    print(
        json.dumps(
            {
                "status": "ok",
                "output": str(output_path),
                "downloaded": len(ok),
                "skipped": len(skipped),
                "errors": len(errors),
                "duration_ms": elapsed,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"status": "error", "error": str(exc)}, indent=2))
        sys.exit(1)
