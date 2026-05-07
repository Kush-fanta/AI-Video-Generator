# ADR-007: Teams and Specialists — Supervisor Pattern with Shared State

## Status: Accepted (2026-04-14), Amended (2026-04-15)

Current note: this ADR still owns the team-coordination model, but current capability availability and app-surface indexing live in `docs/contracts/capability-registry.json`. Where this ADR names concrete specialist surfaces or old route vocabulary, treat that as historical context unless a newer runtime doc repeats it.

This is the current coordination model: editor as brief gate and execution supervisor,
core as active think-tank supervisor during authoring, shared project state, explicit
routing, persistent teammates when the task earns them, and domain specialists for
visual execution.

## Context

ADR-006 introduced a phase-based production engine: Assessment → Creative Core → Review → Storyboard → Visual Production → Sound Design → Final Review. Phases are ordered, skippable but not reorderable. Each phase dispatches subagents that report back and die.

Three problems surfaced in production:

1. **The researcher never gets used.** In the GCC v2 session, core wrote the entire script from raw source material without a researcher pass. Overlapping stats (1,850 vs 1,700 GCCs, $105B vs $125B) went unverified. The system had a researcher agent and didn't deploy it — the phase-based engine left the "do we need research?" decision to Main's assessment, and Main skipped it.

2. **The editor does grunt work.** After the reviewer flagged "timestamp the JPMorgan hook" and "upgrade the counter-argument," Main did the web searches itself — two searches, manual rewrites, treatment updates. That's researcher work performed by the orchestrator. The reviewer knew what was missing but had no way to ask the researcher directly.

3. **One-way handoffs kill feedback loops.** Subagents report back and die. When the reviewer finds that research is weak, the finding goes to Main, Main does the work or re-dispatches from scratch. There's no mechanism for reviewer → researcher → core as a reactive loop. The phase model forces: reviewer → Main → (decision) → new subagent → Main → next phase.

The phase model assumes work flows forward. Production doesn't — it flows in loops. Research informs writing, review exposes research gaps, better research improves writing. The current architecture can't express this.

### What the references say

Three patterns from Anthropic's multi-agent coordination docs match the problem:

**Agent Teams** — persistent teammates with direct messaging and a shared task list. Unlike subagents (report back and die), teammates stay alive, message each other, and self-coordinate. The lead (editor) spawns teammates and supervises. Teammates can request the lead to spawn additional teammates they need.

**Shared State** — agents read/write a shared store (the project folder) without routing through a coordinator. Research writes to `research/`, core reads from it and writes to `story/`, reviewer reads everything. The project folder becomes a living knowledge base, not a sequential handoff chain.

**Generator-Verifier** — the reviewer doesn't just pass/fail. It returns specific feedback routed to the right agent. "Unverified stat" → researcher. "Slop sentence" → core. The reviewer routes findings directly to the teammate who should fix them.

The advisor strategy (Anthropic blog) provides a secondary pattern: a smaller executor (Haiku researcher) can escalate to a larger advisor (Opus core) for strategic direction — "is this the right angle?" — without the advisor taking over execution.

## Decision

### Replace the phase engine with a supervisor model

The editor activates the think tank based on what the task needs, but inside the think tank `core` is the active supervisor. No fixed phase ordering. The editor assesses the situation, spawns the right agents, watches the package-level outcome, and decides when the work is done. Inside the think tank, teammates route findings and tasks between themselves directly under `core`.

### Three teammate roles, same definitions

The existing agent definitions (`researcher.md`, `core.md`, `reviewer.md`) stay. Their competency boundaries are correct and become *more* important in a team where role bleed is the main risk. What gets added to each is **team awareness**.

#### The think tank

The three teammates form a self-organizing think tank. core is the creative lead and active supervisor once the team is live. The editor spawns all three together, sets the brief, and stays out of the internal loop unless the brief changes or the loop stalls. Inside the think tank, core assigns researcher tasks dynamically, reviewer flags issues directly to the teammate who should fix them, and findings are resolved through direct conversation — not routed through the editor.

#### core (Opus) — creative lead
Unchanged competency: script + treatment + storyboard + voiceover as one decision. Never generate images, never load tool docs, never do research.

**Team role:** Leads the think tank. Starts writing from raw source + task config. Assigns tasks to researcher dynamically as gaps emerge — not pre-planned by the editor. core discovers what it needs while writing and dispatches research asks in real time.

- Assigns researcher tasks directly: "I need a named human in the first 40%" / "verify this GCC count" / "find me the real BM accession number for the Dandan Uiliq plaque"
- Resolves reviewer findings directly — reviewer flags slop or drift, core fixes it in conversation with the reviewer, no editor relay
- The "never do research" constraint is strict: assign the researcher, don't web search

#### Researcher (Haiku) — core's hands
Unchanged competency: find real media, verify facts, download assets, write research memo. Never editorialize, never make creative decisions.

**Team role:** Works for core. core assigns tasks dynamically; researcher executes them. Reviewer can also request verification directly.

- Receives task config for scope (anti-goals, evidence level, media stance) — but core drives the specific asks as they emerge during writing
- Messages core directly when framing is ambiguous ("three conflicting counts — which one?")
- Writes structured output: `research/findings.md` with verified facts, disputed claims, media manifest with license info

#### Reviewer (Sonnet) — runs alongside, not after
Unchanged competency: cold-read, two-pass review, specific findings with timestamps and severity.

**Team role:** Reviews script drafts for slop, channel voice alignment, unverified claims, and structural issues. Also reviews rendered video post-production. Runs alongside core during script work, not just as a post-production gate.

- Findings include a **route** field, but the live route vocabulary now belongs to `docs/contracts/reviewer-findings.md`.
- Routing is direct within the think tank where the current route resolves there. For execution findings outside the think tank, the reviewer routes back through the editor, who owns specialist re-dispatch.
- The reviewer's contract is dynamic — it emerges from the cold-read. Beyond slop and brand alignment, the reviewer flags whatever it judges necessary: unverified claims, structural issues, factual risks, visual opportunities. The check list is not pre-specified.
- The editor intervenes if a review-fix loop isn't converging (2-cycle max).

### The editor's role changes

The editor stops being a pipeline operator and becomes a brief gate plus execution supervisor:

| Before (ADR-006) | After |
|---|---|
| Decides phase ordering | Decides which teammates to spawn |
| Dispatches subagents sequentially | Activates teammates, `core` supervises inside the team via messages + shared state |
| Fills gaps when subagents fall short | Supervises — teammates route work between themselves |
| Does research when reviewer flags gaps | Never does research — spawns or messages researcher |
| Reads all output, writes rewrites | Reads all output, decides if it's done |
| Holds creative control by doing the work | Holds creative control by supervising the work |

The editor still:
- Writes the task config (intent lock)
- Loads the channel identity (sole reader of taste)
- Translates taste into specs that teammates receive
- Decides when to spawn teammates and when one agent working solo is enough
- Decides when the work is done (termination condition)
- Locks the storyboard and translates it into bound execution specs

### Spawning logic: team mode is emergent, not declared

The editor doesn't choose between "solo mode" and "team mode." It spawns what the task needs:

- **User gives a polished script, wants production only** → editor still spawns core for storyboard ownership, then derives the bound manifest and dispatches the relevant execution specialists from the approved storyboard. No researcher unless core needs verification.
- **User gives a topic, wants a full video** → editor writes task config, spawns the think tank (all three together). They self-coordinate from there and return script + storyboard as one package.
- **User gives raw research, wants a rewrite** → editor spawns core + reviewer. Researcher added if core requests verification.
- **Reviewer flags research gaps** → reviewer messages researcher directly (or core assigns the task). Editor does not relay.

The team size scales with complexity. A quick rewrite is one agent. A full production might have researcher + core + reviewer alive simultaneously, messaging each other.

### Shared state: project folder as knowledge base

The project folder (`projects/<slug>/`) is the shared store. All teammates read from and write to it. The structure:

```
projects/<slug>/
  task-config.md          # Scaffold command writes from intake; all read
  channel.md              # Channel pointer
  tasks.md                # Scaffold command creates; editor maintains, all read
  research/
    findings.md           # Researcher writes (structured: verified facts, disputed, media manifest)
    source.raw.md         # Researcher writes (verbatim fetched content)
  images/refs/            # Researcher writes (downloaded media with license metadata)
  story/
    narrative.md          # core writes
  direction/
    treatment.md          # core writes
    storyboard.md         # core writes
    voiceover.txt         # core writes
  ...
```

**Convention: each directory has one writer.** `research/` is the researcher's. `story/` and `direction/` are core's. The reviewer writes findings to messages, not to disk (findings are transient — they drive fixes, not artifacts). The scaffold command writes the initial `task-config.md` and `tasks.md`; after bootstrap, the editor owns updates to those files.

This prevents file conflicts. Teammates read each other's directories but only write to their own.

### Feedback routing

When the reviewer produces findings, each finding has a remediation lane:

```markdown
## Finding: JPMorgan hook has no timestamp
- Severity: hard
- Route: research_correction
- What's needed: date of JPMorgan Mumbai campus announcement or lease signing

## Finding: "That's not an anecdote. It's a pattern." — tell-don't-show
- Severity: hard
- Route: narrative_rewrite
- What's needed: cut the meta-commentary, let the evidence argue

## Finding: counter-argument is industry self-critique, not the skeptic's real challenge
- Severity: hard
- Route: coordination_required
- Route chain: research_correction -> narrative_rewrite
- What's needed: researcher finds the real counter-stat, core rewrites Ch 3 with it
```

The reviewer routes findings according to the current contract vocabulary. Inside the think tank, direct teammate messaging still resolves the simple cases. The editor monitors but does not relay unless the route leaves the think tank.

### Task list as coordination mechanism

The shared task list (`tasks.md` + Claude Code's TaskCreate/TaskUpdate) tracks work:

```
- verify-stats: completed (researcher)
- write-script: completed (core)
- review-script: completed (reviewer)
- fix-jpmorgan-timestamp: in_progress (researcher)
- fix-counter-argument: pending, blocked by fix-jpmorgan-timestamp (research_correction -> narrative_rewrite)
- rewrite-ch3: pending, blocked by fix-counter-argument (core)
- re-review: pending, blocked by rewrite-ch3 (reviewer)
```

Tasks unblock automatically when dependencies complete. The editor monitors and intervenes if a loop isn't converging (max 2 review cycles before the editor makes the call).

### Termination

The editor decides when work is done. Not a timer, not a convergence threshold — editorial judgment. The editor watches the artifacts, reads the reviewer's latest findings, and makes the call: "this package is ready for production" or "one more pass."

Max loop depth: 2 review-fix dispatch cycles per phase before the editor escalates. After 2 cycles, the editor reads the remaining findings and makes a judgment call: dispatch another targeted fix to the appropriate lane, accept the current state with noted caveats, or override the reviewer if the finding is a false positive (verified by rendering evidence, not assumption). The editor never fixes code directly — it dispatches or accepts.

Note on the agent-level patch limit: within a single dispatch cycle, specialists enforce their own rewrite rule — if a third correction pass is needed on the same component or asset package, the specialist discards and rewrites from spec clean. This is a within-cycle rule and is independent of the 2-cycle dispatch max. The two rules operate at different granularities: dispatch cycles are counted by the editor across the review-fix loop; patch passes are counted by the specialist within a single dispatch.

## What changes from ADR-006

| Area | ADR-006 (phases) | ADR-007 (teams) |
|---|---|---|
| Engine shape | Fixed phases, skip but not reorder | Editor spawns what's needed, no fixed order |
| Agent lifecycle | Subagents report back and die | Teammates stay alive, message each other |
| Research | Phase 1, optional, one-shot | Spawned on demand, can be re-engaged mid-production |
| Review feedback | Goes to Main, Main fixes or re-dispatches | Reviewer routes directly to the teammate who should fix it |
| Editor role | Pipeline operator + gap filler | Supervisor: spawns, watches, intervenes when stuck |
| Inter-agent communication | None — all through Main | Direct messaging between teammates |
| State | Conversation context + disk artifacts | Project folder as shared state, messages for transient coordination |
| Coordination | Implicit in phase ordering | Shared task list with dependencies |

## What stays from ADR-006

- **Task config** — still written by the editor, still the intent lock, still the source of truth for all agents. This was the best idea in ADR-006.
- **Channel identity** — still the sole owner of taste. The editor is the primary reader. core is the one exception: it receives raw channel files because writing a script in the channel's voice requires direct access to narrative taste, not a spec translation. All other teammates and execution agents receive taste values through specs, not raw channel files.
- **Taste/craft/tool separation** — unchanged. The editor translates taste into specs for execution agents. core reads channel files directly (the only teammate that does).
- **core as one agent** — script + treatment + storyboard + VO are still one decision. The team model doesn't split this.
- **Reviewer independence** — still cold-read, still zero prior context. The team model adds routing to findings, not context to the reviewer.
- **Project folder structure** — same directories, same artifacts. The convention of one-writer-per-directory is new but the structure isn't.

## What this doesn't solve

- **Token cost.** Agent teams use significantly more tokens than subagents. Three persistent teammates each have their own context window. For a quick rewrite, solo mode is cheaper. The editor's judgment about when to spawn a team is the cost control.
- **Agent teams are experimental.** The Claude Code agent teams feature has known limitations: no session resumption, task status can lag, no nested teams. Three production sessions with subagent fallback (editor manually routing) confirmed the friction is unacceptable — the think tank needs real agent team infrastructure.
- **Visual production.** Addressed in Amendment A below.
- **Learning.** The improviser (ADR-005) learns from production sessions. How it integrates with the team model — does it watch the team's messages? does it run post-mortem? — is not addressed here.

## Risks

- **Role bleed.** The biggest risk. In a team where agents can message each other, core might start doing research ("let me just search for this one thing") or researcher might editorialize findings. The existing agent definitions are the guardrail. If role bleed occurs in practice, the fix is stricter tool allowlists in agent definitions (e.g., researcher gets WebSearch + WebFetch, core does not).
- **Loop divergence.** Reviewer flags an issue, researcher provides new material, core rewrites, reviewer flags a new issue in the rewrite. The 2-cycle max prevents infinite loops but might terminate before the script is good enough. The editor's judgment is the escape hatch.
- **Coordination overhead.** Three agents messaging each other + reading/writing shared state + the editor supervising = more moving parts than a pipeline. If the team spends more time coordinating than producing, the architecture is wrong for that task. The editor should default to fewer agents and only scale up when the task demands it.
- **Premature team spawning.** The editor might spawn a full team for work that one agent could handle. The heuristic: if the task config has no research requirements and the user provided good source material, skip the researcher. If the script is a minor revision, skip the reviewer. Team mode is earned, not default.

---

## Amendment A: Specialist Execution Agents (2026-04-15)

### What changed

The general DoP agent is replaced by domain-specialist execution agents. The editor's visual production role shifts from directing a general-purpose agent to architecting the frame that specialists populate.

### Context

Bengal Fall production surfaced a repeatable failure mode: the DoP's first output was strong, but quality degraded under iterative correction. Root cause: a general DoP owned too much visual surface area in one context window. Corrections to one subdomain silently corrupted another. The patch accumulated context debt until a clean rewrite would have been faster.

The same session also confirmed that general agents over-literalize visual specs. The DoP executed "show the partition" by finding a historical photo of partition — correct but uncreative. Domain specialists with narrower scope and fresh context on each invocation avoid both failure modes.

### Decision

**Editor as binding architect.** The editor derives the bound storyboard manifest — timing, template IDs, props, asset bindings, and specialist packets. The storyboard manifest is the taste boundary: it encodes what goes where and when. The shared runtime renders it; projects do not grow local Remotion skeletons.

**Specialists replace the DoP.** The exact specialist surface is runtime-owned and may evolve; see the live registry and agent docs for the current names and boundaries.

**D3 is projection math only.** In this system, D3 converts lat/lng coordinates to x/y positions on the map canvas. It is not a general data viz library. All data viz (bar charts, counters, stat reveals) uses Remotion templates.

**Dispatch pattern:** Editor derives/updates bound storyboard manifest → dispatches the relevant specialists in parallel for unresolved templates/assets/maps → specialists report back with template IDs, props, assets, or component paths → runtime renders from the manifest.

**Fix loops:** When a reviewer finding targets a component, the editor re-dispatches the relevant specialist with the corrected spec. Fresh context, clean rewrite from spec. No patch accumulation.

**Patch limit:** Any specialist hitting a third correction loop on the same component discards and rewrites from spec. This is enforced in each agent definition, not left to judgment.

### What replaces the DoP's old responsibilities

The runtime specialist surface is registry-owned. This amendment records why the DoP was split, not a permanent inventory of the replacement lanes.

### What the editor still owns directly

- Data viz that requires editorial judgment about what to show (the editor specifies the data and display type; mograph builds it)
- Any component that crosses specialist domains — the editor writes the binding/spec layer and routes each owned part
- See SKILL.md for the full editor ownership list — storyboard approval, manifest binding, specialist packet translation, and VO review are also non-delegable.

### Why not a team

The specialist agents are fire-and-forget, not teammates. Coordination overhead between specialists would collapse the parallelism that makes this pattern worth running. The editor relays handoffs where needed. If relay trips become frequent enough to be a bottleneck, that's a signal to revisit — not a reason to pre-optimize now.

### Risks

- **Domain gaps.** A visual component that genuinely crosses multiple specialist domains requires the editor to write the integration scaffold and dispatch specialists for each layer. This is more work than dispatching one general DoP. Worth it when the alternative is patch-degradation spirals, but the editor needs to recognize cross-domain scenes early during storyboarding.
- **Spec completeness.** Specialists fail when the spec is underspecified. The editor must provide complete component contracts before dispatching. "Build the map scene" is not a spec. Bounds, keyframes, label list, timing — that's a spec.

### Relationship to ADR-007 core model

The think tank (core + researcher + reviewer) is unchanged. Specialists are execution agents, not teammates — they don't message each other or participate in the review-fix loop directly. The reviewer watches rendered output and routes visual findings back to the editor, who re-dispatches the relevant specialist. The coordination model stays: editor as brief gate and execution supervisor, core as think-tank supervisor, specialists as hands.
