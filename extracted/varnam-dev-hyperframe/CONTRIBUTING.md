# Contributing

This repo is small and fast-moving. Keep the merge path simple and strict.

## Main Branch Policy

- `main` is the release branch.
- Do not push directly to `main`.
- All substantive changes should land through a pull request.
- Prefer squash merges for focused PRs.

## PR Shape

- One PR should do one thing.
- Do not mix infra, control-plane docs, generated assets, and scenario/demo work in the same PR unless the change truly cannot be split.
- If a branch grows into multiple concerns, split it before merge.

## Verification

- Verify the exact thing you changed.
- For control-plane/docs work, check that the active docs and contracts stay aligned.
- For render/runtime work, verify against real output or the narrowest meaningful render path.

## Reviews

- At least one human review before merge.
- If a PR rewrites architecture or routing, review scope and source-of-truth ownership first, not just whether the code runs.

## Current limitation

This private repo currently cannot use GitHub branch protection/rulesets on the
current plan. Because of that, `.github/workflows/mainline-guard.yml` acts as a
soft guard:

- pushes to `main` without an associated PR are flagged
- the workflow fails
- an issue is opened to record the violation

That is not a substitute for real branch protection. When GitHub allows it,
enable branch protection on `main` and keep this file as the human policy.
