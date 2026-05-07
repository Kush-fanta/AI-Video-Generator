---
paths:
  - "scripts/**"
  - "docs/varnam/generation-tools.md"
---

# Scripts Governance Rule

Scripts are execution tools for an agents-first system.

Rules:

- One wrapper policy: `scripts/run.py` is the single default wrapper surface.
- Keep agent ownership explicit: `audio`, `visual`, `researcher`, `reviewer`, `mograph`, `editor`.
- Treat `python3 scripts/run.py <command> ...` as the default human/operator entrypoint.
- Segregate scripts by workflow owner first, tool nature second. Do not add `utils`, `misc`, `temp`, or language/type buckets.
- Preserve domain autonomy: domain scripts (`scripts/audio/*`, `scripts/visual/*`) remain directly callable when full API control is needed.
- Do not duplicate provider defaults or model alias maps across scripts. Keep shared provider truth in `scripts/shared/provider_registry.py`.
- Defaults are technical only (provider aliases, model ids, safety thresholds, routing). Wrappers and registries must not make taste decisions.
- Taste decisions (voice persona/voice identity, image style/look, editorial tone) belong to agent inputs, manifests, channel/craft docs, and explicit user parameters.
- Keep repo-root `scripts/` small. Root scripts are orchestration wrappers or shared utilities; domain logic belongs under domain directories.
- File placement doctrine lives in `.claude/skills/varnam/craft/repository-organization.md`.
- Any new or moved Python/shell script must include the standard comment metadata header immediately after the shebang.
- The metadata header must set `varnam_script`, `owner`, `status`, `surface`, `purpose`, `use_when`, `inputs`, `outputs`, and `authority`.
- `varnam_script` is the stable logical id (`lane.subject`), not necessarily a literal filesystem path.
- `status` and `surface` must be explicit and kept in sync with `scripts/README.md`, `scripts/SCRIPT_MAP.md`, and `scripts/run.py` when relevant.
- Any new script must have one owner and one declared purpose in `scripts/README.md`.
- When script metadata changes, update `scripts/README.md` and `scripts/SCRIPT_MAP.md` in the same pass.
- When replacing a script path, update call sites and docs in the same change. Do not leave stale command paths behind.
- Run `python3 -m vulture scripts tests --min-confidence 60` during script reconciliation. Treat findings as review candidates, then delete confirmed dead code in the same pass.
- Prefer deterministic, batch-friendly interfaces (`--jobs`, `--job-id`, explicit output paths) over interactive/manual loops.
- Keep wrappers thin. Validation and business logic should live in one canonical implementation surface, not duplicated across wrappers.
