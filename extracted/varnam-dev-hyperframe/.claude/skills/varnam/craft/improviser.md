# Improviser

Reverse engineers any source — a channel, a video, a frame, a technique, a Claude Design export, a failed `/varnam` run, or a runtime pack — decomposes what works and why, and promotes the lesson into the correct Varnam surface.

The improvisor is now responsible for keeping the learning loop current with Varnam's active architecture: channel taste, board-index design packs, craft method, HyperFrames runtime practice, primitives/sprites/compositions, execution agents, and review contracts. If the finding would improve the next run, it must land somewhere durable or be rejected as noise.

## Record book — mandatory entry and exit

**Open every improviser round by reading `docs/record-book.md`** — last 15–20 rows plus the Open threads table at the bottom. That file is the dev story across sessions. It tells you what's in flight, what was tried, what's pending. Without it the round starts blind and re-derives state from chat (or worse, from a model's unreliable memory of prior sessions).

**Close every improviser round by appending a row** to `docs/record-book.md` — even if "round" was small. Format is the four-column table: Date / Did / Observing / Look for. Move any newly-shipped items from Open threads into the main table with a "shipped" row; add any new open threads at the bottom. If you proposed something but didn't ship, log it as an Open thread — that's the only way it survives to the next round.

A round that doesn't append a row didn't happen, by the system's reckoning. The next round won't see it.

## What This Is

The improviser is not an analysis tool. It is a reverse engineering and promotion system. Each round:

1. Studies the source (a channel, a video, a single frame, a motion technique, a scoring approach)
2. Compares against what you produced (or what the system currently knows)
3. Identifies the specific gap — taste, craft, runtime, contract, or execution
4. Updates the right durable surface with the right finding
5. The next production is better because the system learned

Round 1 is study. Round 2+ is study-compare-update. The memory is not one file: `channels/<name>/design.md`, `direction/board/index.md` conventions, `.claude/skills/varnam/craft/*.md`, `.claude/skills/varnam/hyperframes/`, `.claude/agents/*.md`, `docs/contracts/*.md`, and routed tools/scripts are the surfaces that accumulate real findings across rounds.

Temporary pass files are not the memory. Once a finding is promoted into `channels/`, `craft/`, or `tools/`, delete the scratch memory or feedback note that carried it. Keep the operating system clean.

## Current Operating Model

The improviser must reason in the current Varnam architecture, not older render doctrine:

| Layer | Owns | Promotion target |
|---|---|---|
| Channel taste | Stable channel identity, voice, palette, proof stance, recurring values | `channels/<name>/design.md` |
| Per-story design pack | Story-specific visual modes, image language, text grammar, edit grammar, sound grammar, primitive set, sprite pack, composition recipes | `direction/board/index.md` conventions via craft/directing/storyboarding docs; never as generic template picking |
| Craft method | Universal techniques that help any channel | `.claude/skills/varnam/craft/*.md` |
| Runtime practice | HyperFrames composition shape, timing authority, variable binding, nested composition behavior | `.claude/skills/varnam/craft/hyperframes.md`, `.claude/skills/varnam/hyperframes/`, runtime scripts |
| Primitive/sprite capability | Reusable visual building blocks and sprite-pack grammar | `.claude/skills/varnam/craft/primitives-and-sprites.md`, mograph/map/visual lane specs, later runtime packs |
| Contract enforcement | Board/render manifest, timing, handoff knobs, naming, capability registry | `docs/contracts/*.md`, validators, route scripts |
| Execution reliability | Agents failed to apply known rules | `.claude/agents/*.md`, orchestration, reviewer checks, hooks |

Do not translate every reference into a channel rule. Claude Design exports and HyperFrames samples often teach runtime structure or primitive/sprite grammar, not taste. A good round names the layer before writing.

## Pass 1 Redefinition: Contract-Handoff Shaping

Pass 1 is no longer vague quality commentary. Pass 1 now hardens handoff contracts so quality survives the next lane.

The goal is to improve handoff quality through explicit control knobs that downstream lanes can verify:

| Knob | Owner | Pass condition |
|---|---|---|
| `board_decision_coverage` | `core` -> `reviewer` | Board index and scene canvases are decision-complete enough that the manifest can derive without creative invention. No builder-guess placeholders. |
| `manifest_decision_coverage` | `editor` -> `reviewer` | Render manifest cuts are timing-complete (`span`, payload, screen intent, triggers). |
| `board_manifest_consistency` | `editor` -> `reviewer` | Every manifest cut resolves to a board moment, and every board visual turn lands in the manifest. |
| `audio_pair_etag_freshness` | `audio` -> `core` -> `reviewer` | Voiceover/audio fingerprints and words fingerprint are current, lock parity is true, no stale lock against updated words. |
| `render_survival` | `reviewer` | Postflight required checks run and pass for the scoped output; unresolved hard findings are not passed forward. |

If a knob is not measured, that handoff is not complete.

## Input Sources

The improviser reads from multiple signal types:

- **Reference channels** — YouTube channels studied via yt-dlp (transcripts, heatmaps, video analysis)
- **Reference artifact bundles** — local zips, exported HTML, JSX/TSX compositions, HyperFrames projects, primitive/sprite packs, media packs, prompt packs, or design handoff folders
- **Produced output** — videos the system made, compared against reference via Gemini
- **User feedback** — direct comments from the user about what's working or not. This is the highest-signal input. When the user says "the pacing felt flat" or "the closing didn't land," that's a finding that skips analysis and goes straight to classification.
- **Audience feedback** — YouTube comments, retention data on published videos, viewer reactions the user shares. These are lower-signal (noisy, biased toward vocal minorities) but useful for spotting patterns across multiple viewers
- **Runtime pack work** — new primitives, sprites, compositions, variables, manifests, and sample renders that prove whether the system can actually execute the learned design language

User feedback on a specific video (e.g., "the GCC video lacked structure") is an improviser trigger. The feedback itself is the finding — the improviser's job is to classify it, trace it to a root cause, and update the right durable surface.

## When to Invoke

- User says "study this channel" / "learn from this" / provides a YouTube link for reference
- User says the output "doesn't feel right" / "lacks structure" / "isn't like X"
- After a production, user wants to push quality by comparing against a reference
- User wants to build a new channel identity from scratch by studying existing creators
- User provides feedback on a produced video — the feedback IS round input
- A `/varnam` session ended without editorial approval — the session trace is itself a study source (the system failed; the transcript shows where)
- User provides local design/code artifacts or asks to reverse engineer a zip/export/runtime pack — run the artifact report first, then study the files the report identifies as entrypoints, design doctrine, timing surfaces, and promotion candidates
- User asks to create or absorb a primitive/sprite/composition pack — treat it as runtime capability work, not `/varnam` project work, unless the user explicitly binds it to a project

## Local Artifact Bundle Pass

When the source is a local exported artifact bundle, start with a deterministic manifest before opening files ad hoc:

```bash
python3 scripts/run.py review:artifact-report <path-to-artifact-or-zip> \
  --report /tmp/varnam-artifact-report.json
```

The report is not the finding. It is the intake map. Use it to answer:

- What is the authored design system: voice, visuals, audio, motion, typography, image language, primitive set, sprite pack, and composition recipes?
- What is the timeline model: explicit beat list, board order, HyperFrames runtime clock, media timeline, GSAP timeline, or static gallery?
- Which files are implementation entrypoints, and which are design/prompt doctrine?
- Which choices are story-specific taste, and which are reusable craft?
- Which technical practices are production-safe for Varnam, and which are reference-only?
- What should be promoted into `channels/`, `.claude/skills/varnam/craft/`, `.claude/skills/varnam/tools/`, or execution surfaces?

Do not copy the runtime just because the artifact looks good. If the artifact uses script-controlled timing, translate the lesson into HyperFrames timing attributes. If it uses unseeded randomness, promote the visual idea but require seeded implementation. If it is a static bundled HTML export, treat it as visual reference unless it exposes clean variables, timing, and reusable composition boundaries.

## Runtime Pack Pass

When the source is a primitive/sprite/composition pack, or the user asks us to create one, the improviser does not route it through `/varnam` by default. It runs a runtime-capability pass:

1. Identify the design promise: what kind of video quality or visual behavior this pack makes easier.
2. Inventory primitives, sprites, variables, composition recipes, timing model, asset dependencies, and seed/randomness behavior.
3. Classify the pack:
   - **sample/reference** — useful taste or craft, not production-ready
   - **runtime addition** — reusable primitives/sprites/compositions that should live in the shared runtime surface
   - **channel companion** — a reusable pack plus a channel `design.md` identity
   - **project-only** — story-specific assets that belong under one `projects/<slug>/`
4. Render at least one composition or preview frame before promotion. Static code inspection is not enough.
5. Promote only the durable part. Delete scratch sample packs after promotion or mark them clearly as reference-only.

If a pack introduces a new visual capability Varnam lacks, write the primitive/sprite grammar first. Wiring every project by hand is a smell; the goal is a reusable composition interface with variables, not per-run custom code.

## Post-Session Hook

When a `/varnam` run ends without an explicit ship or approval — the user walks away, asks for the trace file, or stops engaging mid-build — that session is a study candidate. The trace contains what the system got wrong at production scale: subagent briefs that got misread, defaults that were wrong, enforcement that didn't run, coordination that collapsed. These are the highest-signal findings available, because they come from a real run with real cost.

Inputs for a post-session pass:
- session JSONL at `~/.claude/projects/<cwd-slug>/<session-id>.jsonl`
- subagent trace shards at `~/.claude/projects/<cwd-slug>/<session-id>/subagents/`
- produced artifacts under `projects/<slug>/`

**Manifest first, always.** The improviser is responsible for reading agent trace. Before interpreting the session, build or read a trace manifest:

```bash
python3 scripts/run.py trace:manifest \
  --session-jsonl ~/.claude/projects/<cwd-slug>/<session-id>.jsonl \
  --project projects/<slug> \
  --output projects/<slug>/trace_manifest.json
```

The manifest must identify: main JSONL path, subagent shard paths, shard role, parent/child or tool edge, task id, timestamps, tool counts, token totals, queue events, hook events, durable artifacts, and temporary task-envelope paths. Treat `/private/tmp/claude-501/.../tasks/*.output` as temporary envelope evidence only; if those files are missing, say so instead of pretending they are durable artifacts.

Method: read the manifest first, then distill the session arc, extract explicit user feedback (those are pre-classified findings), inventory subagent failures and silences, classify into taste / craft / runtime / contract / execution, and surgically update. Same round discipline as a reference study — present before writing, user confirms what to adopt.

Trace-handling rules from real sessions:
- If the user asks for the session trace, answer with the concrete local JSONL path for the current session. Do not invent a Claude URL when the transcript is already on disk.
- Prefer reusing the same lead slot inside the same team when the role is still available. A replacement name like `core-2` is a continuity smell, not a success condition.
- If a reviewer cannot write findings to disk because of harness permissions, keep the finding in the conversation and surface the blocker plainly. The disk write is a durability step, not the definition of whether the review succeeded.

## The Round

Every round has the same skeleton. What changes is depth — Round 1 is broad, Round N is surgical.

### Round 0: Hypothesis (when no channel study is possible yet)

**Trigger:** Channel identity files need to exist before a proper study can happen — user has partial data (an archived aesthetic, a brief, a single production, genre knowledge).

Build the identity files from whatever exists, but mark every file with:

```
# ⚠️ HYPOTHESIS — not study-derived. Replace with Round 1 findings.
```

A hypothesis is not a spec. It is a placeholder that unblocks production while the real study is pending. When Round 1 happens, the hypothesis files are **replaced**, not extended. Don't try to reconcile — the study wins.

**What went wrong without this:** A Round 0 bootstrap built from a single short-form reference can miss the long-form channel entirely. The hypothesis gets treated as truth, and the wrong visual identity hardens until a real study replaces it.

**Platform separation — always ask before Round 0 or Round 1:** The same channel name may have completely different identities across platforms. Instagram Reels, YouTube long-form, and YouTube Shorts are different products with different visual grammars and pacing. Ask which platform before building any identity. If both are needed, create separate namespaces such as `channels/<name>-youtube/` and `channels/<name>-reels/`.

### Round 1: Initial Study

**Trigger:** User provides a channel link or reference video(s). No prior analysis exists.

**Pipeline:**

1. **Catalog the channel.** `yt-dlp --flat-playlist` to get video list with titles, durations, view counts. Look at the arc — how has the channel evolved? What are the recent videos vs early ones? What topics recur?

2. **Select study set.** Pick 5-8 videos: 2-3 most recent (current voice), 2-3 highest performing, 1-2 from different eras. The selection should capture range and evolution.

3. **Extract transcripts.** `yt-dlp --write-auto-sub --sub-lang en --skip-download` for each video. These are the structural backbone.

4. **Extract heatmaps.** `yt-dlp --print "%(heatmap)j"` for each video. This is engagement ground truth — what moments viewers replay, where they leave.

5. **Structural analysis.** For each video, break down:
   - Opening hook strategy (first 60 seconds)
   - Argument architecture (how the case builds)
   - Transition patterns (how sections connect)
   - Emotional arc (where peaks land)
   - Evidence deployment (when data appears, how it's framed)
   - Closing strategy (how it lands)
   
   Then synthesize ACROSS videos: what patterns repeat? What's the formula? What distinguishes the strong ones from the flat ones?

5b. **Writing mechanics pass — mandatory before updating the `design.md` Voice section.** Read the full transcripts of the 2–3 highest-performing videos as prose. Do not skim. Extract the actual sentence-level patterns that produce the channel's voice. Without this step, channel voice gets built from genre assumptions ("it's a defence channel, so it probably sounds authoritative") instead of from what this specific channel actually does.

   Extract:
   - **How the narrator opens.** Exact first sentence structure. Statement or question? Specific date/number or abstract claim? Does it answer the question or create one?
   - **How the narrator handles objections.** Does the script anticipate the viewer's counter-argument? What's the exact phrasing? ("You might say... And you'd be right. But...")
   - **How context is introduced.** Does the narrator justify the context before delivering it? ("To understand why X, you first need to understand Y") or does it appear without framing?
   - **Narrator's voice register.** First-person singular ("I want you to sit with that") or editorial plural ("Allow us to explain")? Personal stakes stated or withheld? Phrases like "I hope" or "I'd really encourage you to" signal personal investment — note whether they appear.
   - **How the video zooms out.** Does it end on the specific event, or does it name the larger pattern the event is evidence of? What is the exact sentence that makes the zoom-out?
   - **How the verdict lands.** Summary (restates what was said) or challenge (opens a question, transfers accountability to viewer)? Quote the actual closing line.
   - **Signature transition phrases** — the specific words the narrator uses to move between sections. These are channel fingerprints.

   Compare HIGH-performing vs LOW-performing videos on every dimension. The differences tell you what actually drives the channel's engagement. In this session: the low-performing battery video opened with "Allow us to explain" (editorial we) and "Did you know" (soft ask). The high-performing rocket force video opened with "I want you to sit with that" (first-person, direct transfer). That contrast is a finding. It goes into `design.md` under Voice.

   **The Voice section cannot be written from genre knowledge. It can only be written from reading actual scripts.** The writing mechanics pass is what makes the identity real instead of assumed.

6. **Heatmap cross-reference.** For each peak and dead zone in the heatmap, find the exact transcript moment. Answer: what was being said? What narrative move was happening? Why did viewers replay (or leave)?

   **Interpretation principle for investigative/analytical content:** Replay peaks in this genre tend NOT to land on technical facts or data. They tend to land on:
   - **Human stories with specific outcome numbers** — a person or company whose arc (struggle → proof) resolves with a concrete result
   - **Verified superlatives** — claims with measurable confirmation
   - **Cost asymmetry arguments** — the economic absurdity made concrete through a stark ratio or cost contrast
   - **Honest accountability moments** — admitting failure or uncertainty alongside success

   If your heatmap peak appears to be on exposition or technical explanation, look harder. There is almost always a narrative move — a human detail, a superlative, an admission — buried in that window that you initially read as background. That's what viewers are replaying.

7. **Visual analysis.** Download 2-3 videos at low quality. Upload to Gemini. Analyze: cut rate, visual modes, mode switching rhythm, text treatment, color palette, motion graphics, image sourcing, what makes it visually distinctive.

8. **Audio analysis.** Using the same Gemini uploads, analyze the scoring and sound design:
   - What instruments actually appear — not what you'd assume from the channel's genre. Name them specifically.
   - When does music enter and exit? Is it constant bed or does it breathe? How long are the silent stretches?
   - What does the score do at emotional peaks — swell, cut out, shift key, add layers?
   - What's the relationship between VO and music — does music duck under narration or sit beside it? What are the relative levels?
   - Are there SFX? What kind — whooshes, impacts, ambient, diegetic? When do they land — on cuts, on words, on visual events?
   - Does the score have a throughline (same theme, same key, same instrument returning) or is it a patchwork of moods?
   - What makes the audio feel professional vs amateur? Often it's restraint — fewer instruments, more silence, tighter ducking.

   Ask Gemini specific timestamp questions: "At 3:45, what instruments are playing? At 7:20 when the narrator pauses, what happens to the music?" Don't accept "atmospheric background music" — decompose it.

9. **Synthesis and hypothesis.** Present findings directly to the user: "Here's what I found. I believe the gap is in [taste/craft/runtime/contract/execution]. Here's what I'd update. Does this land?"

9. **Write to system.** Based on user confirmation, surgically update the right files:
    - **If taste gap:** Write/update `channels/<name>/design.md` for channel identity.
    - **If craft gap:** Write/update files in `.claude/skills/varnam/craft/` (new or existing craft doc)
    - **If per-story design-pack gap:** Update the board-index/directing/storyboarding craft so `direction/board/index.md` asks for the missing primitive set, sprite pack, composition recipes, or edit grammar before build starts.
    - **If contract gap:** Update `docs/contracts/*.md`, validators, script routes, or handoff knobs so the next run cannot skip the requirement.
    - **If execution gap in runtime:** Build or fix the HyperFrames composition directly. The first implementation surface is an HTML composition with `data-composition-id` / `data-width` / `data-height`, timed `.clip` elements with `data-start` / `data-duration` / `data-track-index`, `data-variable-values` for reusable inputs, and a paused GSAP timeline registered in `window.__timelines`; validate with `npx hyperframes lint` and render with `npx hyperframes render`. The study pipeline produces specs precise enough to build components — reference frames ARE the spec.
    - **If both:** Update both, but be explicit about which finding goes where
    
    No intermediate pass files. The findings go directly into the system files that govern production. Channel, craft, runtime, contract, and execution surfaces ARE the accumulated learning. If a finding isn't worth putting in a system file, it wasn't worth finding.

    **`design.md` must carry concrete voice evidence — not just descriptions of patterns.** A model reading "use first-person singular with personal stakes" will produce generic first-person narration. A model reading the actual line — *"Now, I want you to sit with that for a second because the natural instinct is to say, 'So what? We won. We hit them. We dominated.' And you'd be right."* — can reproduce that specific register. Descriptions tell the model what to do. Examples show the model what it sounds like. The Voice section of `design.md` should carry the compact rule, while longer excerpt sets can live in `references.md`.

10. **Update the study archive.** Record what was studied in `docs/history/channels/<name>/references.md` — channel link, date, videos analyzed, key finding summary, round number. This is the breadcrumb for future rounds, not a live runtime input.

### Round 2+: Compare and Push

**Trigger:** A video has been produced using the current system. User wants to push further.

**Pipeline:**

1. **Watch your output.** Upload the produced video to Gemini. Analyze structure, pacing, visual grammar, engagement feel. Be specific — timestamps, not vibes.

2. **Re-watch reference.** Either re-analyze the reference channel (new videos may exist) or re-read the Round N-1 findings. The reference is the target.

3. **Gap analysis.** Compare output vs reference on every dimension:
   
   | Dimension | What to compare |
   |---|---|
   | **Structure** | Does the argument build the same way? Are there inner loops? Does the escalation ladder work? |
   | **Hooks** | Does the opening create the same kind of dissonance? Is there a paradox? |
   | **Pacing** | Cut rate, mode switching, energy resets. Where does it feel flat vs the reference? |
   | **Data deployment** | Does data answer narrative questions, or does it lead? Is it contextualized? |
   | **Visual grammar** | Mode variety, text treatment, image quality, animation sophistication |
   | **Emotional arc** | Where are the peaks? Are they earned? Is there breathing room? |
   | **Scoring / sound** | When does music enter/exit vs reference? What instruments? Where is silence? Does the score follow narrative or sit as ambient bed? SFX placement — on cuts, on words, on visual events? Mix levels — is VO dominant or competing? |
   | **Closings** | Does it land? Agency transfer vs summary? |
   | **Engagement patterns** | If heatmap data exists for your output, compare peak/valley patterns |

4. **Classify each gap.** For every finding, determine:
   - **Taste gap:** The system knows HOW but the values are wrong (wrong cut rate, wrong palette, wrong voice register, wrong channel-specific structure)
   - **Craft gap:** The system doesn't know HOW (doesn't understand escalation ladders, doesn't know how to deploy data after narrative setup, can't construct inner loops)
   - **Runtime gap:** The system can describe the idea but lacks primitives, sprites, composition recipes, variables, or HyperFrames timing to execute it.
   - **Contract gap:** The system knows the idea but no validator, handoff knob, or naming rule forces it at the boundary where it fails.
   - **Execution gap:** The system knows both but the subagent didn't deliver (spec was right, output was wrong). Unlike taste and craft gaps, execution gaps update the **execution surfaces**: reviewer briefs and subagent specs. The knowledge exists — the pipeline didn't apply it reliably.

5. **Incorporate user feedback.** If the user provided feedback on the produced video (or shared audience reactions), treat these as pre-classified findings. User saying "the pacing felt flat in the middle" -> check the middle section against reference -> identify which structural move, visual capability, contract check, or execution step is missing. User feedback skips the "discover the gap" phase and goes straight to "trace the root cause."

6. **Surgical update.** Don't rewrite files wholesale. Add the specific finding to the specific file:
   - New structural pattern → add section to craft doc
   - New anti-pattern discovered from production failure → add to SLOP kill list or craft doc anti-patterns
   - Wrong visual identity value (palette, type, spacing, component language) → update design.md
   - Wrong runtime/provider value → update design.md
   - Missing voice rule → add to design.md
   - Visual mode the system doesn't use → add to design.md
   - Missing primitive/sprite/composition grammar → update `craft/primitives-and-sprites.md`, mograph/maps/visual specs, or the runtime pack
   - Board index does not request a real per-story design pack → update `craft/directing.md`, `craft/storyboarding.md`, or core/reviewer execution surfaces
   - Render manifest can drift from board → update `docs/contracts/board-render-contract.md` or `scripts/review/validate_render_manifest.py`
   - Builder ignored spec → tighten subagent brief
   - Reviewer missed a class of problem → add check to reviewer agent spec
   - Script review gate missed a structural issue → expand the reviewer's brief in craft/scripting.md
   - Handoff quality was vague or lossy → update `docs/contracts/handoff-quality-knobs.md` and the owning lane handoff section in `.claude/agents/*.md` or `.claude/skills/varnam/orchestration.md`

7. **Classification review gate.** Before writing ANY finding to a system file, dispatch a Sonnet reviewer subagent with the proposed change. The reviewer cold-reads the finding and the target file, then answers:

   **Reviewer prompt:**
   ```
   You are a classification reviewer for a video production system. The system 
   has three layers that must never be mixed:
   
   - TASTE (channels/<name>/): specific values — hex codes, font sizes, spring 
     configs, cut rates, style descriptors. Only valid for ONE channel.
   - CRAFT (craft/*.md): universal principles — structural patterns, techniques, 
     anti-patterns. Valid for ANY channel.
   - RUNTIME (hyperframes/tools/runtime packs): executable primitives, sprites,
     composition interfaces, variables, timing, and validators.
   - CONTRACTS (docs/contracts/*.md and scripts): boundary rules that make the
     next lane prove the requirement instead of remembering it.
   - EXECUTION SURFACES (agents/): reviewer and subagent instructions that
     ensure taste, craft, runtime, and contracts are actually followed during production.
   
   You will receive:
   1. A proposed finding and the file it would be written to
   2. The current contents of that file
   
   Answer these questions:
   1. Does the finding contain any specific number, value, or style descriptor 
      (e.g., "<layer count>", "<pixel size>", "<named color mood>")? If yes, that's a taste
      component — it belongs in the channel file, not craft.
   2. If this finding were applied to a completely different channel (a comedy 
      tech channel, a history documentary, a cooking show), would it still be 
      valid? If no, it's taste disguised as craft.
   3. Does the system already know this? Search craft, channel, HyperFrames,
      contracts, and agent files for the principle. If it's already written,
      this is an execution or contract gap — the fix goes to enforcement, not
      more prose.
   4. Is this finding surgical or is it rewriting existing content? Flag any 
      proposed change that replaces more than it adds.
   
   Verdict: APPROVE (correctly classified), RECLASSIFY (wrong target file — 
   say where it should go), or SPLIT (contains both taste and craft — separate 
   them).
   ```

   If the reviewer says RECLASSIFY or SPLIT, fix the classification before writing. This gate catches taste leaking into craft, craft restating what's already known, and findings landing in the wrong layer.

8. **Present findings and frontier.** Show the user: "Round N found these gaps. I updated [specific files]. The frontier is now: [specific things still not matching]. Next round should focus on X."

   Update `docs/history/channels/<name>/references.md` with the round number, date, what changed.

## What Makes a Good Finding

**Bad finding (vague):** "The pacing feels off compared to the reference."

**Good finding (surgical):** "The reference deploys data AFTER establishing emotional investment (heatmap confirms: data-after-narrative peaks while data-first passages are dead zones). Our craft/scripting.md says 'data answers narrative questions' but doesn't enforce sequencing. Adding a rule: 'Never open a section with a statistic. Open with the human consequence. The statistic arrives as proof of what the viewer already feels.'"

**Bad update (rewrite):** Replacing `design.md` wholesale with new content.

**Good update (surgical):** Adding one focused Voice or Components rule to `design.md`, backed by evidence in `references.md`: "Inner loops every 2-3 minutes. A hook that creates forward pull — 'But here's what nobody expected...' followed by a 90-second answer. The video is a chain of small satisfactions leading to a big one."

## The Classification Decision

This is the critical judgment call. The improviser must correctly diagnose WHERE the gap lives.

**Signals it's a taste gap:**
- The reference uses different values (faster cuts, different palette, different voice register)
- The structure is the same but the feel is different
- The channel identity files don't capture what makes the reference distinctive
- Fixing it means changing numbers, lists, and specific descriptions in channel files

**Signals it's a craft gap:**
- The system doesn't have a structural pattern the reference uses
- The editor doesn't know HOW to do something (construct an escalation ladder, deploy a paradox hook)
- Fixing it means teaching a new technique that works across channels
- The finding would help ANY channel, not just this one

**Signals it's both:**
- A new structural pattern (craft) that also has channel-specific values (taste)
- Example: "Investigation videos use escalation ladders" (craft) + "This channel's ladders have 3-4 layers, each revealed via a personal anecdote" (taste)

When both, write the universal pattern to craft, write the specific values to channel.

**Signals it's a runtime gap:**
- The board can name the visual idea, but no primitive/sprite/composition exists to build it.
- A reference pack has reusable layer/timing behavior Varnam cannot currently express.
- Builders have to rewire the same visual behavior each run.
- Fixing it means adding or changing a HyperFrames composition interface, primitive, sprite pack, variable schema, or render tool.

When runtime, build or patch the executable surface and render proof. A prose note without a runnable composition is not enough.

**Signals it's a contract gap:**
- The system knows the rule, but nothing checks it at the handoff where failure occurs.
- A board/render-manifest mismatch, stale audio lock, missing asset, or placeholder reaches a later lane.
- Fixing it means validators, route scripts, handoff knobs, naming rules, or guard hooks.

When contract, update the enforcing surface. Do not bury boundary rules inside a craft essay.

**Signals it's an execution gap:**
- The channel spec or craft doc already contains the principle, but the output doesn't follow it
- The board or render manifest called for images/maps/cutouts that don't appear in the render
- The script review gate or reviewer missed a class of problem they should have caught
- Fixing it means tightening enforcement: expanding the reviewer's brief, or adding preconditions to subagent specs

When execution, update the execution surfaces — reviewer specs and subagent briefs. Don't add more craft, taste, runtime, or contract knowledge the system already has.

## Tools

The improviser uses these tools across rounds:

| Tool | What For |
|---|---|
| `yt-dlp` | Video catalog, transcripts, heatmaps, video download |
| `python3 scripts/run.py review:artifact-report` | Local zip/export/HTML/JSX artifact intake before reverse engineering |
| `python3 scripts/run.py trace:manifest` | Trace topology before post-session learning |
| `python3 scripts/run.py render:validate-manifest` | Board/render manifest validation before promotion |
| `npx hyperframes lint/compositions/render` | Runtime proof for HyperFrames projects and packs |
| Gemini (via subagent) | Video visual analysis, comparing output vs reference |
| Transcript analysis | Structural breakdown, pattern extraction |
| Heatmap cross-reference | Engagement ground truth mapped to narrative moments |

### yt-dlp Commands

```bash
# Channel catalog
yt-dlp --flat-playlist --print "%(id)s | %(title)s | %(duration)s | %(view_count)s" "CHANNEL_URL/videos"

# Transcripts
yt-dlp --write-auto-sub --sub-lang en --skip-download --write-info-json -o "/tmp/study/%(id)s" "VIDEO_URL"

# Heatmaps
yt-dlp --print "%(heatmap)j" "VIDEO_URL"

```

**Gemini visual analysis:** Pass the YouTube URL directly — Gemini supports YouTube URLs natively. Never download video files for Gemini analysis.

### Gemini Visual Analysis Prompts

For reference video:
```
Analyze this video's visual editing:
1. Cut rate (cuts per minute, does it vary?)
2. Visual modes (talking head, b-roll, graphics, text, data viz, maps)
3. Mode switching pattern and rhythm
4. Text treatment (fonts, sizes, animations, how text appears)
5. Color palette
6. Motion graphics sophistication
7. What makes it visually distinctive?
```

For comparing output vs reference:
```
I'll show you two videos. Video A is the reference (the target quality). Video B is our output.
Compare them on: structure, pacing, visual variety, text treatment, motion quality, 
energy management, and overall engagement feel. Be specific — timestamps, not vibes.
What does A do that B doesn't? What's the biggest gap?
```

## Reference Channels

Channels being studied can be saved in the history archive:

```markdown
# docs/history/channels/<name>/references.md

## @aevytv
- Studied: 2026-04-10
- Videos analyzed: 5 (WW3, Nothing, BigFood, Roads, China Air)
- Key finding: 5-move investigation structure (paradox hook → personal ground → escalation ladder → proof of alternative → agency transfer)
- Heatmap insight: Replays spike on contradiction moments, die on exposition without payoff
- Round: 1
```

This lets future rounds pick up where the last one left off.

## Anti-Patterns

**Don't analyze without producing.** The improviser exists to improve production output. If no video has been made, Round 1 produces the initial durable learning. But Round 2 requires a produced video to compare. Don't run Round 3 analysis without a Round 2 production in between.

**Don't rewrite files wholesale.** Surgical additions preserve what already works. The improviser adds to the system — it doesn't replace it.

**Don't confuse "different" with "better."** The reference channel is studied for structural mechanics, not copied. If the reference uses humor and the target channel doesn't, that's a taste choice, not a gap. The improviser learns TECHNIQUES (how to build an escalation ladder), not PERSONALITY (be funny).

**Don't skip the user checkpoint.** Every round presents findings before writing to system files. The user confirms what to adopt. The improviser proposes — the editor decides.

**Don't treat heatmap data as absolute.** Heatmaps show what viewers of THAT channel replay. Different audiences have different patterns. Use heatmaps to understand structural mechanics (what types of moments engage), not to copy specific content choices.

## Escalating Resolution

The improviser doesn't run the same analysis every round. Each round is forced to look at a finer grain than the last, because the obvious patterns have already been absorbed into the system.

### How Resolution Escalates

Before analyzing anything, the improviser reads the current channel, craft, runtime, contract, and execution surfaces relevant to the source. Everything already written is KNOWN. Then it watches the reference and asks:

**"What can I not yet explain about why this works?"**

The delta between what's written and what's observed IS the finding. But finding it requires looking through something — a lens. Raw observation without a framework misses patterns the same way a framework without observation misses reality.

### Lenses

Lenses are frameworks for seeing. The improviser builds its own.

**Round 1 starts with zero lenses.** Watch the reference material. Describe what you observe — plain language, no borrowed terminology. Group observations that seem related. Name each group. Those names are the first lenses. Write them to `docs/history/channels/<name>/references.md` alongside the round findings.

Each round can:
- **Use existing lenses** to look for things the system knows how to see
- **Generate new lenses** when observations don't fit existing ones
- **Retire lenses** that stop producing findings (the pattern they described is fully absorbed)
- **Split or merge lenses** as understanding sharpens

The lens toolkit is an artifact that evolves alongside channel, craft, runtime, and contract surfaces. It's the improviser's own vocabulary for what matters — not inherited from the craft docs, not prescribed by the system. Built from observation, refined through production.

**When no lens produces findings:** Describe what happens in the reference moment-to-moment, without using any existing lens vocabulary. If new language emerges, that's a new lens being born. If nothing emerges, the system has converged — remaining differences are taste choices, not learnable gaps.

### What Forces Depth

**1. The production test.** Making a video with the current craft exposes what's still missing. Theory looks complete until you build with it. Production failures are the sharpest signal for what the next round should target.

**2. The user's eye.** The user watches both reference and output. They notice things the analysis missed — "it uses a pinboard," "there's a history-to-current loop." User observations land at whatever resolution the system needs next. When the user names a pattern, the improviser traces it: where does it appear? How often? What happens without it? Then writes the principle.

**3. "Feels different but I can't say why."** When output is structurally correct but still feels wrong, the gap is in something the improviser hasn't learned to see yet. This is the most valuable signal — it means there's a pattern operating below the system's current awareness. The improviser's job is to make the invisible visible: re-watch the reference with fresh eyes, describe what happens moment-to-moment without using any terminology from the existing craft docs, and see what new language emerges.

### The Convergence Signal

The improviser has done its job when:
- The durable system surfaces can explain WHY the reference works at every layer
- The production output, when compared to reference, differs only in deliberate taste choices
- The user stops finding patterns the system missed
- New rounds produce diminishing returns — findings get smaller and more edge-case

At convergence, the system doesn't need more analysis. It needs more production reps to internalize what it already knows.
