# Varnam

## Doctrine

`docs/doctrine.md` is the runtime surface for the system's SDLC primitives. Read it at session start alongside this file. All cross-cutting rules (routing, handoff, lane lifecycle, pre-flight, classification) live there as primitives with use-case expansions. Do not restate doctrine here or in agent specs — cross-reference by primitive name.

## Record Book

`docs/record-book.md` is the dev story — what we did, what we observed, what to look for next. Read the last 15–20 rows + the Open threads table at session start. This is how a fresh session knows what's in flight without re-reading the full chat history. When you ship a non-trivial change to the system itself (doctrine, agents, hooks, skills, scripts that change behavior), append a row before close. Project-only work does not append; that lives in `projects/<slug>/session_learning.md` instead.

## Entrypoint

`/varnam` is the single entrypoint.

The editor:
- loads the channel
- runs the interactive intake and locks the brief into `projects/<slug>/`
- opens/closes the think tank and stays out of its internal routing
- approves the package
- translates the approved storyboard into build specs
- runs review against real renders

## System Shape

- `channels/<name>/` -> taste, with `design.md` as the channel design-system reasoning layer
- `.claude/skills/varnam/craft/` -> method
- `.claude/skills/varnam/tools/` -> APIs
- `.claude/skills/varnam/orchestration.md` -> routing and handoffs

## Authority Chain (doctrine §2)

1. channel files
2. `task-config.md`
3. approved package:
   - `story/script.md`
   - `direction/board/index.md`
   - `direction/board/<scene-id>.md`
   - `audio/voiceover.words.json`
   - `audio/voiceover.tagged.txt`
   - `direction/render-manifest.yaml`
4. editor-written build specs
5. rendered output

## Boundaries

- think tank authors the package under `core` supervision
- editor approves and translates it
- specialists execute it
- reviewer blocks weak authored work before build and weak execution after build

## Rules

- do not let builders invent missing visual direction
- do not treat narration as main on-screen text
- do not treat ADRs as the live contract
- do not close the loop on theory; close it on render evidence

## Routing Gate (doctrine §1)

At any subagent dispatch or multi-step plan kickoff, state in one line: scope read + chosen approach + why. Then commit. No half-routes, no mid-flight escalation without a new gate. Applies system-wide — varnam, improvise, and any future skill.

If the scope read against project state produces two or more defensible candidates for what the user meant (e.g. "ch2" could map to Chapter 2 of the film OR Segment 2 of the build series, both plausible in `tasks.md`), the one-liner becomes a question instead of a commit. Still one gate, still decisive — just resolve the ambiguity before dispatching, not after. Unambiguous inputs commit as normal.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Python 3.13+, Node.js, and `pnpm` are required.

## Project Bootstrap

Use:

```bash
python3 scripts/run.py project:intake
```

Project bootstrap belongs under `projects/<slug>/` only. Do not scaffold project state under `templates/`.

Backend fallback:

```bash
python3 scripts/run.py project:scaffold --from scaffolds/project-intake.sh
```
