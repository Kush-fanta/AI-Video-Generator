#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.run_signal_benchmarks
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Signal benchmark orchestrator.
# use_when: Run the deterministic signal metric suite.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Run deterministic signal-processing benchmarks against known artifacts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable

from cut_rate import analyze_video as analyze_cut_rate
from frame_clutter import analyze_video as analyze_frame_clutter
from frame_integrity import analyze_video as analyze_frame_integrity
from layout_repetition import analyze_video as analyze_layout_repetition
from mode_interleave import analyze_storyboard as analyze_mode_interleave
from reveal_contraction import analyze_mix as analyze_reveal_contraction
from speech_masking import analyze_mix as analyze_speech_masking
from visual_novelty import analyze_video as analyze_visual_novelty


ANALYZERS: dict[str, Callable[..., dict[str, Any]]] = {
    "cut_rate": analyze_cut_rate,
    "frame_clutter": analyze_frame_clutter,
    "frame_integrity": analyze_frame_integrity,
    "layout_repetition": analyze_layout_repetition,
    "mode_interleave": analyze_mode_interleave,
    "reveal_contraction": analyze_reveal_contraction,
    "speech_masking": analyze_speech_masking,
    "visual_novelty": analyze_visual_novelty,
}


def load_manifest(path: Path) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _check_metric(name: str, actual: Any, rule: dict[str, Any]) -> dict[str, Any]:
    passed = True
    failure_reason = None

    if "min" in rule and actual < rule["min"]:
        passed = False
        failure_reason = f"{name}={actual} < min={rule['min']}"
    if "max" in rule and actual > rule["max"]:
        passed = False
        failure_reason = f"{name}={actual} > max={rule['max']}"

    return {
        "metric": name,
        "actual": actual,
        "expected": rule,
        "pass": passed,
        "failure_reason": failure_reason,
    }


def _resolve_arg_paths(repo_root: Path, args: dict[str, Any]) -> dict[str, Any]:
    resolved: dict[str, Any] = {}
    for key, value in args.items():
        if isinstance(value, str) and key.endswith("_path"):
            resolved[key] = (repo_root / value).resolve()
            continue
        resolved[key] = value
    return resolved


def run_benchmark_case(repo_root: Path, case: dict[str, Any]) -> dict[str, Any]:
    artifact = case.get("input", case.get("video"))
    if artifact is None:
        raise KeyError("Benchmark case is missing an 'input' or 'video' field")
    artifact_path = (repo_root / artifact).resolve()
    case_result: dict[str, Any] = {
        "id": case["id"],
        "input": str(artifact_path),
        "notes": case.get("notes", ""),
        "pass": True,
        "evals": {},
    }
    if "video" in case:
        case_result["video"] = str(artifact_path)

    for eval_name, expectation in case["expectations"].items():
        analyzer = ANALYZERS.get(eval_name)
        if analyzer is None:
            raise ValueError(f"Unknown analyzer: {eval_name}")

        args = _resolve_arg_paths(repo_root, expectation.get("args", {}))
        result = analyzer(artifact_path, **args)
        checks = []
        for metric_name, rule in expectation.get("metrics", {}).items():
            if metric_name not in result:
                raise KeyError(f"{eval_name} result missing metric '{metric_name}'")
            checks.append(_check_metric(metric_name, result[metric_name], rule))

        eval_pass = all(check["pass"] for check in checks)
        case_result["evals"][eval_name] = {
            "pass": eval_pass,
            "checks": checks,
            "result": result,
        }
        if not eval_pass:
            case_result["pass"] = False

    return case_result


def run_manifest(manifest_path: Path) -> dict[str, Any]:
    manifest = load_manifest(manifest_path)
    repo_root = manifest_path.resolve().parents[2]
    benchmarks = [run_benchmark_case(repo_root, case) for case in manifest["benchmarks"]]
    overall_pass = all(case["pass"] for case in benchmarks)
    return {
      "manifest": str(manifest_path.resolve()),
      "overall_pass": overall_pass,
      "benchmarks": benchmarks,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run signal-processing benchmark manifest")
    parser.add_argument(
        "manifest",
        nargs="?",
        default="benchmarks/signal-processing/visual-evals.json",
        help="Path to benchmark manifest",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    manifest_path = Path(args.manifest).expanduser().resolve()
    try:
        summary = run_manifest(manifest_path)
    except (FileNotFoundError, KeyError, ValueError, json.JSONDecodeError) as exc:
        json.dump({"error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(summary, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if summary["overall_pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
