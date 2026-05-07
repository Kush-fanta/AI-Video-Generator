#!/usr/bin/env python3
# ---
# varnam_script: visual.image
# owner: visual
# status: live
# surface: python3 scripts/run.py visual:image
# purpose: Canonical image provider runner.
# use_when: Generate image assets through the approved provider path.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Generate images with the Google Gen AI Python SDK."""

from __future__ import annotations

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
ROOT = SCRIPTS_DIR.parent
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from provider_registry import (  # noqa: E402
    DEFAULT_IMAGE_MODEL_ALIAS,
    image_model_aliases_csv,
    resolve_image_model,
)
from env_file import get_env, require_env  # noqa: E402


BGLESS_SUFFIX = (
    ", isolated subject on a plain solid-color background, "
    "clean edges, no shadows, no text, no signage"
)
VALID_SIZES = {"0.5K", "1K", "2K", "4K"}
VALID_ASPECT_RATIOS = {
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "4:5",
    "5:4",
    "9:16",
    "16:9",
    "21:9",
}
GEMINI_SAFETY_CATEGORIES = (
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
    "HARM_CATEGORY_CIVIC_INTEGRITY",
)
VALID_GEMINI_SAFETY_THRESHOLDS = {
    "BLOCK_LOW_AND_ABOVE",
    "BLOCK_MEDIUM_AND_ABOVE",
    "BLOCK_ONLY_HIGH",
    "BLOCK_NONE",
    "OFF",
}


def repo_root() -> Path:
    return ROOT


def get_sdk() -> Any:
    try:
        from google import genai
    except ImportError as exc:
        raise RuntimeError(
            "Missing google-genai. Install it with `pip install google-genai` "
            "or add it to your environment from requirements.txt."
        ) from exc
    return genai


def get_client(mode: str = "instant") -> Any:
    api_key = require_env("GOOGLE_API_KEY")
    genai = get_sdk()
    # Flex requests can queue 1-15 min; set 15min timeout to avoid premature close
    timeout_ms = 900_000 if mode == "flex" else 120_000
    return genai.Client(
        api_key=api_key,
        http_options={"timeout": timeout_ms},
    )


def gemini_safety_threshold_name() -> str:
    threshold_name = (get_env("GEMINI_SAFETY_THRESHOLD", "OFF") or "OFF").strip().upper() or "OFF"
    if threshold_name not in VALID_GEMINI_SAFETY_THRESHOLDS:
        raise ValueError(
            "Invalid GEMINI_SAFETY_THRESHOLD. "
            "Use one of BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE, BLOCK_ONLY_HIGH, BLOCK_NONE, OFF."
        )
    return threshold_name


def gemini_safety_settings() -> list[dict[str, str]]:
    threshold = gemini_safety_threshold_name()
    return [
        {"category": category, "threshold": threshold}
        for category in GEMINI_SAFETY_CATEGORIES
    ]


def guess_mime_type(path: Path) -> str:
    ext = path.suffix.lower()
    mime_map = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    if ext not in mime_map:
        raise ValueError(
            f"Unsupported reference image format: {path.suffix}. Use .png, .jpg, .jpeg, or .webp"
        )
    return mime_map[ext]


def build_inline_reference(path: Path) -> dict[str, Any]:
    return {
        "inline_data": {
            "mime_type": guess_mime_type(path),
            "data": path.read_bytes(),
        }
    }


def build_parts(prompt: str, references: list[Path]) -> list[dict[str, Any]]:
    parts = [build_inline_reference(reference) for reference in references]
    parts.append({"text": prompt})
    return parts


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def first_image_bytes(payload: Any) -> bytes | None:
    if payload is None:
        return None

    parts = getattr(payload, "parts", None)
    if parts:
        for part in parts:
            data = getattr(getattr(part, "inline_data", None), "data", None)
            if data:
                if isinstance(data, str):
                    import base64

                    return base64.b64decode(data)
                return data if isinstance(data, bytes) else bytes(data)

    candidates = getattr(payload, "candidates", None)
    if candidates:
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            for part in getattr(content, "parts", []) or []:
                data = getattr(getattr(part, "inline_data", None), "data", None)
                if data:
                    if isinstance(data, str):
                        import base64

                        return base64.b64decode(data)
                    return data if isinstance(data, bytes) else bytes(data)

    if isinstance(payload, dict):
        candidate_list = payload.get("candidates") or []
        for candidate in candidate_list:
            content = candidate.get("content") or {}
            for part in content.get("parts") or []:
                inline_data = part.get("inlineData") or part.get("inline_data") or {}
                data = inline_data.get("data")
                if isinstance(data, str):
                    import base64

                    return base64.b64decode(data)
                if isinstance(data, bytes):
                    return data
    return None


def generate_content_config(model: str, aspect_ratio: str, size: str, mode: str = "instant") -> dict[str, Any]:
    image_config: dict[str, Any] = {
        "aspect_ratio": aspect_ratio,
    }
    if model in {"gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview"}:
        image_config["image_size"] = size

    config: dict[str, Any] = {
        "response_modalities": ["IMAGE"],
        "image_config": image_config,
        "safety_settings": gemini_safety_settings(),
    }

    if mode == "flex":
        config["service_tier"] = "flex"

    return config


def detect_background_color(arr: "np.ndarray", sample_depth: int = 10) -> "np.ndarray":
    """Detect the dominant background color by sampling image edges."""
    import numpy as np

    h, w = arr.shape[:2]
    samples = np.concatenate([
        arr[:sample_depth, :, :3].reshape(-1, 3),       # top
        arr[-sample_depth:, :, :3].reshape(-1, 3),      # bottom
        arr[:, :sample_depth, :3].reshape(-1, 3),       # left
        arr[:, -sample_depth:, :3].reshape(-1, 3),      # right
    ]).astype(np.float32)
    return np.median(samples, axis=0)


def apply_chromakey(image_path: Path) -> None:
    """Remove background in-place. Auto-detects background color from edges."""
    import numpy as np
    from PIL import Image, ImageFilter

    img = Image.open(image_path).convert("RGBA")
    arr = np.array(img).astype(np.float32)

    bg_color = detect_background_color(arr)

    # Distance from each pixel to detected background color
    diff = np.sqrt(np.sum((arr[..., :3] - bg_color) ** 2, axis=-1))

    # Threshold: pixels within this distance are background
    # Tight threshold for clean subjects, wider for soft edges
    bg_mask = diff < 60.0

    # Soft alpha via PIL GaussianBlur
    mask_img = Image.fromarray((bg_mask * 255).astype(np.uint8), mode="L")
    soft_mask = np.array(mask_img.filter(ImageFilter.GaussianBlur(radius=1.5))).astype(np.float32) / 255.0

    # Despill: on edge pixels, push each channel toward neutral relative to bg
    edge = (soft_mask > 0.05) & (soft_mask < 0.95)
    for ch in range(3):
        channel = arr[..., ch]
        bg_val = bg_color[ch]
        # If bg channel is dominant, clamp it toward the average of other channels
        other_chs = [c for c in range(3) if c != ch]
        if bg_val > np.mean(bg_color[other_chs]) + 30:
            other_avg = np.maximum(arr[..., other_chs[0]][edge], arr[..., other_chs[1]][edge])
            channel[edge] = np.minimum(channel[edge], other_avg)
        arr[..., ch] = channel

    arr[..., 3] = np.clip((1.0 - soft_mask) * 255.0, 0, 255)

    Image.fromarray(arr.astype(np.uint8)).save(image_path)


def run_instant(args: argparse.Namespace) -> None:
    mode = getattr(args, "mode", "instant")
    bgless = getattr(args, "bgless", False)
    client = get_client(mode=mode)
    model = resolve_image_model(args.model)

    prompt = args.prompt + BGLESS_SUFFIX if bgless else args.prompt
    references = [Path(ref).expanduser().resolve() for ref in args.reference_images]
    parts = build_parts(prompt, references)

    label = f"🎨 Generating {'bgless ' if bgless else ''}image ({args.size}, {args.aspect_ratio}, mode={mode})"
    if references:
        label += f" with {len(references)} reference image(s)"
    print(f"{label}...")

    response = client.models.generate_content(
        model=model,
        contents=[{"role": "user", "parts": parts}],
        config=generate_content_config(model, args.aspect_ratio, args.size, mode),
    )

    image_bytes = first_image_bytes(response)
    if not image_bytes:
        raise RuntimeError("No image data returned from Google Gen AI")

    output_path = Path(args.output).expanduser().resolve()
    ensure_parent(output_path)
    output_path.write_bytes(image_bytes)

    if bgless:
        apply_chromakey(output_path)
        print(f"✅ Transparent PNG saved to {output_path}")
    else:
        print(f"✅ Image saved to {output_path}")


def load_manifest(path: str) -> tuple[dict[str, Any], Path]:
    manifest_path = Path(path).expanduser().resolve()
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    if "entries" in data:
        data["jobs"] = data["entries"]
    if "jobs" not in data or not isinstance(data["jobs"], list):
        raise ValueError("Manifest must contain a 'jobs' array")
    return data, manifest_path


def generate_one(
    client: Any, model: str, prompt: str, references: list[Path],
    aspect_ratio: str, size: str, mode: str, bgless: bool, output_path: Path,
) -> dict[str, Any]:
    """Generate a single image. Returns result dict."""
    actual_prompt = prompt + BGLESS_SUFFIX if bgless else prompt
    parts = build_parts(actual_prompt, references)
    try:
        response = client.models.generate_content(
            model=model,
            contents=[{"role": "user", "parts": parts}],
            config=generate_content_config(model, aspect_ratio, size, mode),
        )
        image_bytes = first_image_bytes(response)
        if not image_bytes:
            return {"output": str(output_path), "status": "error", "error": "No image data returned"}
        ensure_parent(output_path)
        output_path.write_bytes(image_bytes)
        if bgless:
            apply_chromakey(output_path)
        return {"output": str(output_path), "status": "ok"}
    except Exception as exc:
        return {"output": str(output_path), "status": "error", "error": str(exc)}


def run_jobs(args: argparse.Namespace) -> None:
    manifest, manifest_path = load_manifest(args.jobs)
    mode = getattr(args, "mode", "instant")
    bgless = getattr(args, "bgless", False)
    client = get_client(mode=mode)

    manifest_model = manifest.get("model", args.model)
    model = resolve_image_model(manifest_model)
    manifest_size = manifest.get("size", args.size)
    manifest_ar = manifest.get("aspect_ratio", args.aspect_ratio)
    output_dir = Path(manifest.get("output_dir", "."))
    if not output_dir.is_absolute():
        output_dir = (manifest_path.parent / output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    jobs = manifest["jobs"]
    if args.job_id:
        jobs = [j for j in jobs if str(j.get("id")) == args.job_id]
        if not jobs:
            raise ValueError(f"Job '{args.job_id}' not found in manifest")

    label = f"🎨 Running {len(jobs)} {'bgless ' if bgless else ''}image job(s) (mode={mode})"
    print(label)

    def _run_job(index: int, job: dict) -> dict[str, Any]:
        prompt = job["prompt"]
        size = job.get("size", manifest_size)
        ar = job.get("aspect_ratio", manifest_ar)
        job_model = resolve_image_model(job.get("model", manifest_model))
        output_name = job.get("file") or f"{job.get('id', index)}.png"
        output_path = output_dir / output_name

        refs: list[Path] = []
        for ref in job.get("references", job.get("reference_images", [])):
            p = Path(ref)
            refs.append(p if p.is_absolute() else (manifest_path.parent / p).resolve())
        if job.get("reference_image"):
            p = Path(job["reference_image"])
            refs.append(p if p.is_absolute() else (manifest_path.parent / p).resolve())

        result = generate_one(client, job_model, prompt, refs, ar, size, mode, bgless, output_path)
        result["job_id"] = str(job.get("id", index))
        status_icon = "✅" if result["status"] == "ok" else "❌"
        print(f"  {status_icon} {result['job_id']} → {output_name}")
        return result

    workers = getattr(args, "workers", 4)
    if workers <= 1:
        results = [_run_job(i, job) for i, job in enumerate(jobs, 1)]
    else:
        results = [None] * len(jobs)
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(_run_job, i, job): i - 1
                for i, job in enumerate(jobs, 1)
            }
            for future in as_completed(futures):
                results[futures[future]] = future.result()

    failures = [r for r in results if r["status"] != "ok"]
    summary = {"status": "ok" if not failures else "partial", "results": results}
    if failures:
        summary["failures"] = len(failures)
    print(json.dumps(summary, indent=2))


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate images with Google Gen AI using Python."
    )
    parser.add_argument("--prompt", help="Image generation prompt (single image mode)")
    parser.add_argument("--jobs", help="Path to JSON manifest with multiple image jobs")
    parser.add_argument("--job-id", help="Run only a specific job from manifest")
    parser.add_argument("--workers", type=int, default=4, help="Parallel workers for manifest mode (default: 4)")
    parser.add_argument("--mode", choices=["instant", "flex"], default="instant")
    parser.add_argument("--bgless", action="store_true", help="Transparent PNG via chromakey (defaults size to 0.5K)")
    parser.add_argument("--size", default=None, help="0.5K, 1K, 2K, or 4K (default: 0.5K with --bgless, 1K otherwise)")
    parser.add_argument("--aspect-ratio", default="16:9", help="Image aspect ratio")
    parser.add_argument("--output", help="Output file path (required for single image mode)")
    parser.add_argument(
        "--reference-image",
        action="append",
        default=[],
        dest="reference_images",
        help="Reference image path (repeatable)",
    )
    parser.add_argument(
        "--model",
        default=get_env("GEMINI_IMAGE_MODEL", DEFAULT_IMAGE_MODEL_ALIAS),
        help=(
            "Image generation model or alias. "
            f"Aliases: {image_model_aliases_csv()}. "
            "Raw Google model strings still work."
        ),
    )

    args = parser.parse_args(argv)

    if args.size is None:
        args.size = "0.5K" if args.bgless else "1K"
    if args.size not in VALID_SIZES:
        parser.error(f"--size must be one of: {', '.join(sorted(VALID_SIZES))}")
    if args.aspect_ratio not in VALID_ASPECT_RATIOS:
        parser.error(f"--aspect-ratio must be one of: {', '.join(sorted(VALID_ASPECT_RATIOS))}")
    if not args.jobs and not args.prompt:
        parser.error("Provide --prompt (single image) or --jobs (manifest)")
    if args.prompt and not args.output:
        parser.error("Provide --output with --prompt")

    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if args.jobs:
        run_jobs(args)
    else:
        run_instant(args)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"❌ {exc}", file=sys.stderr)
        raise SystemExit(1)
