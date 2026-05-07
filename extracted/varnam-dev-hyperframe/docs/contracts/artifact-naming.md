# Artifact Naming Convention

Repo-wide file naming convention (not storyboard-specific).

Scope: this applies to all repo-governance files; project-owned files under `projects/<slug>/` are out of scope for audit.

**File names are the ontology.** Every dot in a filename is a claimed relation. The path is a walk through the graph.

```
audio/voiceover.words.json
   │      │       │      │
   │      │       │      └── encoding
   │      │       └── facet (a form of the subject)
   │      └── subject
   └── domain
```

Each dot narrows specificity by naming a real relation: *belongs to*, *is a form of*, *encodes*. The filename tells you where in the repo's web this artifact lives. The naming does not document the ontology — the naming **is** the ontology.

### Rules

- **Slashes = domain.** The folder places the artifact in the repo's top-level category.
- **Dots = relation.** Each dot must name a real relation in the repo's vocabulary. Dots chain specificity.
- **Hyphens = compound noun within one segment.** `timing-lock.json` is fine — "timing lock" is one concept. `voiceover-audio.mp3` is wrong — a hyphen cannot carry a relation; the relation *is* the `.mp3`.
- **New dot terms are ontology changes**, not local decisions. Adding a term adds a node to the web. Resist ad-hoc invention.
- **An artifact's position in the graph is its name.** Moving a file in the tree is renaming it.

### The honesty test

If you cannot read a filename and state what its relation to the rest of the repo is, it has not earned its place. Vague or unearned dots attract attention because they break the graph.

- `audio/voiceover.words.json` — reads as "the word-level timing encoding of the voiceover in the audio domain." Earned.
- `audio/voiceover.tagged.txt` — "the performance-tagged text form of the voiceover." Earned.
- `audio/foo.thing.json` — `.thing` names no relation. Failure.

If a file cannot earn a clean dot-path, either the file is wrong, its placement is wrong, or the relation it tries to encode does not yet exist in the graph — in which case the fix is upstream, not local.

### Current graph (representative, not exhaustive)

| Domain | Subject | Facet | Encoding |
|---|---|---|---|
| `audio/` | `voiceover` | `.mp3` `.words.json` `.tagged.txt` `.srt` | native to facet |
| `audio/` | `timing` | `.lock.json` | |
| `story/` | `script` | `.md` | |
| `direction/` | `render-manifest` | `.yaml` | derived render manifest; canvas under `direction/board/` is authored first |
| `direction/board/` | `index` | `.md` | film-level canvas root; replaces separate creative-direction artifacts |
| `direction/board/` | scene id (`s1_hook`, `s2_pivot`, etc.) | `.md` | one file per scene; the authored creative canvas |
| `research/` | `findings` | `.md` | |
| `research/` | `media-index` | `.md` | |
| `.claude/agents/` | agent role (`core`, `researcher`, `reviewer`, etc.) | `.md` | |
| `.claude/skills/varnam/` | `SKILL` `orchestration` `evaluator` | `.md` | |
| `.claude/skills/varnam/craft/` | craft domain (`storyboarding`, `directing`, `review-qc`, etc.) | `.md` | |
| `.claude/skills/varnam/formats/` | format domain (`ads`, `story`, `README`) | `.md` | |
| `.claude/skills/varnam/templates/` | template subject (`intake`, `task-config`) | `.md` | |
| `.claude/skills/varnam/tools/` | tool/API contract (`voiceover`, `mixing`, `lyria`, `image-gen`, `video-gen`, `media-index`, `maps`, `google-workspace`, `source-priority`) | `.md` | |
| `.claude/rules/` | rule subject (`visual-media-index`) | `.md` | |
| `channels/<channel>/` | channel facet (`design`, `references`, `ledger`) | `.md` | |
| `channels/<channel>/` | channel code subject (people names, data adapters) | `.ts` | Do not create parallel hand-authored identity files. |
| `docs/adr/` | ADR number + subject (`NNN-slug`) | `.md` | |
| `docs/contracts/` | contract subject (`timing-contract`, `capability-registry`, etc.) | `.md` `.json` `.schema.json` | |
| `docs/proposals/` | dated proposal subject (`YYYY-MM-DD-slug`) | `.md` | |
| `docs/research/` | research subject or dated memo | `.md` | |
| `docs/research/signal-processing/` | signal metric subject | `.md` | |
| `docs/superpowers/{plans,specs}/` | dated plan/spec subject | `.md` | |
| `docs/history/channels/<channel>/` | historical channel subject (`references`) | `.md` | |
| `docs/varnam/` | product doc subject (`generation-tools`, `tasks-template`, etc.) | `.md` | |
| `benchmarks/signal-processing/` | eval pack subject (`audio-evals`, `visual-evals`, `structure-evals`) | `.json` | |
| `benchmarks/signal-processing/fixtures/` | fixture subject | `.md` `.mp3` `.mp4` `.json` | |
| `scripts/` | root router/docs only (`run`, `README`, `SCRIPT_MAP`) | `.py` `.md` | |
| `scripts/{audio,visual,research,project,review,hooks,shared}/` | script subject | `.py` `.sh` | |
| `scripts/review/benchmarks/` | signal metric subject | `.py` | |
| `hooks/` | hook subject (`hooks`) | `.json` | |
| `.github/workflows/` | workflow subject (`mainline-guard`, `checkpoint-release`) | `.yml` | |
| `scaffolds/` | governance scaffold subject (`task-config`) | `.md` `.sh` | |
| `research/` | repo research subject (`media-manifest`, signal analysis, source studies) | `.md` | Do not keep live channel taste files here; promote them into `channels/<channel>/design.md`. |
| `reports/` | report subject (`weekly-wrapup-YYYY-MM-DD`, review package) | `.md` `.pdf` `.pptx` | |
| `projects/<slug>/hyperframes/` | executable HyperFrames project (`index`, composition HTML, assets) | `.html` `.css` `.js` media | |
| `projects/<slug>/hyperframes/compositions/` | nested composition subject | `.html` | |
| `projects/<slug>/hyperframes/assets/` | runtime asset subject | media | |
| `templates/` | legacy/shared source references during migration | `.md` `.tsx` `.ts` `.json` | Do not use as the executable render root for new work. |
| `projects/<slug>/` | project ledger/config subject (`task-config`, `tasks`) | `.md` | |
| root | governance/config subject (`AGENTS`, `CLAUDE`, `README`, `CONTRIBUTING`, `skills-lock`, etc.) | `.md` `.json` `.txt` `.ts` | |

### Controlled facet vocabulary (current)

- `.words` — word-level timing
- `.tagged` — with performance or semantic markup
- `.lock` — frozen, authoritative state
- `.srt` — subtitle encoding

Additions to this list are design acts, not naming choices.
