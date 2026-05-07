"""Repository-wide command-script shape checks."""

from __future__ import annotations

import ast
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def _uses_argparse_parser(tree: ast.AST) -> bool:
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        if isinstance(func, ast.Attribute) and func.attr == "ArgumentParser":
            return True
    return False


def _function_defs(tree: ast.AST) -> dict[str, ast.FunctionDef | ast.AsyncFunctionDef]:
    return {
        node.name: node
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }


def test_argparse_scripts_expose_importable_parse_args() -> None:
    offenders: list[str] = []

    for path in sorted((REPO_ROOT / "scripts").rglob("*.py")):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        if not _uses_argparse_parser(tree):
            continue

        functions = _function_defs(tree)
        parse_args = functions.get("parse_args")
        if "_parse_args" in functions:
            offenders.append(f"{path.relative_to(REPO_ROOT)} uses private _parse_args")
        if parse_args is None:
            offenders.append(f"{path.relative_to(REPO_ROOT)} has ArgumentParser but no parse_args(argv)")
            continue
        if not parse_args.args.args or parse_args.args.args[0].arg != "argv":
            offenders.append(f"{path.relative_to(REPO_ROOT)} parse_args must accept argv")

    assert offenders == []
