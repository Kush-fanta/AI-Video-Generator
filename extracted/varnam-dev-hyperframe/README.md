# varnam

Narration-driven video studio. One editor, a think tank that authors, specialists that build, a reviewer that blocks weak work.

## Get Started

**1. Install**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cd templates && pnpm install
```

Requires Python 3.13+, Node.js, and `pnpm`.

**2. Open Claude Code in this repo and run**

```
/varnam
```

That's the single entrypoint. The editor handles intake, authoring, build, and review from there.

**3. Pick a channel — or add your own**

Channels live in [`channels/`](channels/). Current: `indiapill`, `nightshift`, `stickman`, `swarajya`, `system12`, `warindex`, `wtf`. A channel is the taste — voice, palette, format defaults.

To add one, create `channels/<name>/design.md` first by adapting the closest existing channel's design file, then add `references.md` only as needed. The cleanest way is via `/improvise` — it studies an existing channel's shape and helps you author a new one to match. Don't hand-scaffold from a parallel channel.

**4. Say what you want to make**

Inside `/varnam`, just tell the editor what the film is. It runs intake as a conversation — asks the brief questions, locks `task-config.md` and `tasks.md` into `projects/<slug>/`, opens the think tank, and keeps going. No scripts to run.

```
you: /varnam
editor: which channel?
you: swarajya — 4-min explainer on the Maratha navy
editor: [runs intake, locks brief, opens think tank]
```

Everything the project produces lives under `projects/<slug>/`. You don't edit those files by hand — the editor and the think tank own them. You review, redirect, and approve.

Current pipeline model is explicit:
- `story/script.md` and `direction/board/index.md` + `direction/board/<scene-id>.md` are authored together by core first.
- `audio/voiceover.source.txt` is produced in the same pass before any voiceover audio.
- Audio turns `story/script.md` + `voiceover.source.txt` into `audio/voiceover.mp3` and `audio/voiceover.words.json`.
- The editor/tooling derives `direction/render-manifest.yaml` from the approved board package plus `audio/voiceover.words.json`.

## What You Get

After intake, your workspace looks like:

```
projects/<slug>/
  task-config.md       the locked brief
  tasks.md             live build-state index
  story/script.md
  research/
  direction/board/index.md
  direction/board/<scene-id>.md
  direction/render-manifest.yaml
  audio/
  audio/voiceover.source.txt
  images/
  output/
```

The **authored package** (`story/script.md`, board files, `audio/voiceover.source.txt`) is the source of truth. `direction/render-manifest.yaml` is derived from that board plus `audio/voiceover.words.json` and is checked against the timing contract — see [board/render contract](docs/contracts/board-render-contract.md).

## Docs

**Start here**
- [`CLAUDE.md`](CLAUDE.md) — system shape, authority chain, routing gate
- [`AGENTS.md`](AGENTS.md) — one-line charter
- [orchestration](.claude/skills/varnam/orchestration.md) — routing, handoffs, team model, dispatch rules
- [varnam skill](.claude/skills/varnam/SKILL.md) — what the editor knows

**Contracts** (the rules the reviewer enforces) — [`docs/contracts/`](docs/contracts/)
- [board/render](docs/contracts/board-render-contract.md)
- [timing](docs/contracts/timing-contract.md)
- [artifact naming](docs/contracts/artifact-naming.md)
- [reviewer findings vocabulary](docs/contracts/reviewer-findings.md)
- [capability surface](docs/contracts/capability-surface.md) · [registry](docs/contracts/capability-registry.json)
- [shot prompt packet](docs/contracts/shot-prompt-packet.md)

**Craft** — how authors and specialists work — [`.claude/skills/varnam/craft/`](.claude/skills/varnam/craft/)
- scripting · storytelling · directing · storyboarding
- cinematography-coverage · editing · motion-design · art-direction
- data-visualization · editorial-typography · sound · primitives-and-sprites
- research-evidence · review-qc · flight-checks

**Formats** — [`.claude/skills/varnam/formats/`](.claude/skills/varnam/formats/) — `story.md`, `ads.md`

**Tools** — [`.claude/skills/varnam/tools/`](.claude/skills/varnam/tools/) — API and execution contracts: voiceover, mixing, lyria, image-gen, video-gen, media-index, maps, google-workspace, source-priority

**Legacy source catalog** — [`templates/`](templates/) remains available during migration for geo data, reference components, and catalog inspection. It is not the production render root for new work. New executable video work lives under `projects/<slug>/hyperframes/` and is built from primitives, sprites, compositions, and manifest variables.

**Operations** — [`docs/varnam/`](docs/varnam/) — error handling, generation tools, tasks template, web research

**Decisions** — [`docs/adr/`](docs/adr/) — why the system is shaped this way

## Help

- Something broke in a render → [review-qc craft](.claude/skills/varnam/craft/review-qc.md) + [error handling](docs/varnam/error-handling.md)
- Specialist refused a brief → it's probably thin; see [orchestration §Outcome Briefs](.claude/skills/varnam/orchestration.md)
- Wondering where a project is → read its `projects/<slug>/tasks.md`
- Improving the system itself → [`/improvise`](.claude/skills/varnam/craft/improviser.md), never for live project work
- Contributing → [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Principle

The harness licenses initiative. Agents own outcomes, not tasks — expected to refuse thin briefs, widen scope to close a loop, escalate to a sibling. When behavior drifts, expand what the agent is allowed to do; do not narrow it.
