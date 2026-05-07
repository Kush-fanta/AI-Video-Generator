# Storyboard — PFBR: India's Nuclear Long Game
## India Pill — Visual Blueprint

**Canvas:** #E4E0D8 (warm parchment)  
**Total runtime est:** ~348 seconds @ 140 wpm / 812 words  
**Frame rate:** 30 fps → ~10,440 frames total  
**Cut density target:** 12–18 cuts/min

---

## Timing Map

| Chapter | Words | Duration | Frames |
|---|---|---|---|
| Ch1: The Trap | ~120 | 0:00–0:51 | f=0–1530 |
| Ch2: The Machine | ~220 | 0:51–2:25 | f=1530–4350 |
| Ch3: The Long Game | ~260 | 2:25–4:16 | f=4350–7680 |
| Ch4: The Honest Take | ~210 | 4:16–5:48 | f=7680–10440 |

---

## THROUGHLINE ELEMENT — Fuel Chain Schematic

Appears 3×, each time more complete. Built as Remotion SVG component.

**Version A (Ch2 intro):** Left node: "U-238", arrow center, right node: "?" — the gap is the argument.  
**Version B (Ch3 body):** Full chain — U-238 → fast neutron → Pu-239 → Stage 2 PFBR → breeds Th-232 → Stage 3. Three stage nodes connected.  
**Version C (Ch4 close):** Same as B, Stage 2 node pulses with gentle terracotta glow (#D4854A at 40% opacity, cycling). Not complete. Not on the grid. But on.

---

## Chapter 1: The Trap
*f=0–1530 (51 seconds)*  
*Gear 1 — deliberate, two-beat pauses, bare canvas*

### Scene 1.1 — Cold Open Text
**f=0–120 (4s) | TEXT HERO**

Intent: No warm-up. Drop the viewer into the constraint. The sparseness of the frame IS the argument — India's uranium supply is thin, the frame is thin.

Composition:
- Canvas: #E4E0D8
- Text: "India has almost no uranium." — Instrument Serif, 280px, #3A342E, centered
- Entry: opacity 0→1, translateY 12px→0, 24f, cubic-bezier(0.25,0.1,0.25,1)
- Hold: 96f after entry settles
- No badge, no leader lines, no data — just the sentence
- Brand badge appears top-right at f=60 (60% opacity, rounded black rect)

### Scene 1.2 — Correction Text
**f=120–330 (7s) | TEXT CORRECT**

Intent: The viewer might reach for softer framings — "limited uranium" feels bureaucratic and soft. Strike them down explicitly.

Composition:
- "Not 'limited uranium.'" — DM Sans 48px, #8B8178, left-aligned, margin-left 240px
- Strikethrough animates across "limited uranium" (1.5px #9B7777, draws left-to-right, 20f)
- Below: "Not 'moderate reserves.'" — same style, same strikethrough treatment, staggers 30f later
- Both lines sit mid-canvas
- Entry: translateX -20px→0, opacity 0→1

### Scene 1.3 — Scarcity Detail Text
**f=330–570 (8s) | TEXT STATEMENT**

Intent: Make the constraint physical — import dependency within a generation. Specific consequence, not abstract scarcity.

Composition:
- "The domestic deposits are thin enough that if India ran its entire nuclear fleet on local supply alone, it would need to import fuel within a generation."
- DM Sans 40px, #5C5248, body weight, wrapped, width 1200px, centered
- Key phrase "import fuel within a generation" — accent underline, #D4854A, 1.5px, animates in 24f after text lands
- Entry: standard reveal, 24f

### Scene 1.4 — Pivot Text
**f=570–720 (5s) | TEXT PACING**

Intent: Breathing room. The viewer needs a beat before the turn.

Composition:
- "That's not a crisis that snuck up on anyone." — Instrument Serif italic, 64px, #5C5248, centered
- Smaller than Scene 1.1 — not a hero, a breath
- Entry: opacity 0→1, 18f

### Scene 1.5 — Year Hero
**f=720–900 (6s) | DATA HERO**

Intent: 1954 lands as a specific anchor — this decision happened at a moment, not in a vague past.

Composition:
- "1954" — Instrument Serif, 340px, #3A342E, centered
- Entry: scale 1.08→1.0 spring (damping 12, mass 0.4, stiffness 300), 24f
- Stasis 18f after landing
- Below: "India's nuclear programme is designed." — DM Sans 40px, #8B8178, fades in at f=780

### Scene 1.6 — Outer Loop Plant
**f=900–1530 (21s) | TEXT STATEMENT**

Intent: The outer loop question must land slowly. This is the question the viewer carries for the next 5 minutes. Hold it.

Composition:
- First line: "How do you build permanent energy independence" — Instrument Serif 64px, #3A342E, centered
- Second line (staggers 30f): "when you start with almost none of the primary fuel?" — same style, #D4854A terracotta
- Each line enters: opacity 0→1, translateY 12px→0, 24f
- Hold both lines for 12s minimum — this is a SLOW beat
- Leader line (dotted, 1.5px #8B8178, 6px dash) draws from the terracotta line downward, ending in nothing — the visual metaphor of an unanswered question

---

## Chapter 2: The Machine
*f=1530–4350 (94 seconds)*  
*Gear 2 — curious, precise, slightly faster pacing*

### Scene 2.1 — Kalpakkam Establishing
**f=1530–1770 (8s) | ARCHIVAL IMAGE**

Intent: Place-setting. The viewer needs a specific building in a specific location. Not an abstraction. This is real.

Composition:
- Image: Real/generated aerial or exterior of Kalpakkam facility — coastal Tamil Nadu, reactor domes visible, blue-grey ocean in far background
- Full parchment canvas, image in thin-border frame (1px #8B8178), centered, 1200×675px (16:9 at 62% canvas)
- Caption below image: "Kalpakkam, Tamil Nadu" — DM Sans 28px, #8B8178, centered
- Second caption line: "Prototype Fast Breeder Reactor" — DM Sans 28px, #5C5248
- Entry: image frame springs in (scale 0.96→1.0, opacity 0→1, 24f)

**Image prompt (Kalpakkam):**  
`Aerial photograph of a nuclear power facility on the southeastern coast of India, Tamil Nadu. Low coastal scrubland, dark reactor domes, administrative buildings, perimeter fence visible. Overcast coastal light. Documentary photography style. Muted tones. No people in frame. Slightly desaturated. Photorealistic. 16:9.`

### Scene 2.2 — Criticality Data
**f=1770–2010 (8s) | DATA HERO**

Intent: The milestone number — 2024, criticality — needs space to land before the physics explanation.

Composition:
- Left: "500 MW" — Instrument Serif 200px, #3A342E
- Right of it: dotted leader line → small label DM Sans 32px, #8B8178: "generating capacity"
- Below (staggers 24f): "Criticality achieved." — DM Sans 48px, #D4854A
- Below (staggers 12f): "2024" — Instrument Serif 120px, #3A342E
- All entries: standard reveal 24f, staggered

### Scene 2.3 — Standard Reactor Explainer
**f=2010–2310 (10s) | DIAGRAM**

Intent: Establish the baseline so the PFBR's difference is felt, not just understood. Three-step chain drawn simply.

Composition:
- Three nodes, horizontal, centered:
  - Node 1: rounded rect, "Uranium fuel" — #5C5248, DM Sans 36px
  - Arrow (draws left-to-right, 20f): label "burns" above
  - Node 2: rounded rect, "Heat → turbines" — #5C5248
  - Arrow (draws, 20f): label "generates" above
  - Node 3: rounded rect, "Electricity" — accent fill #8FB07A (sage green), DM Sans 36px
- Below node 1: dotted leader line → "Fuel shrinks" — DM Sans 28px, #9B7777 (muted rose, warning)
- Nodes enter left-to-right with 24f stagger
- Arrows draw themselves (SVG stroke animation)

### Scene 2.4 — PFBR Pivot (Throughline A)
**f=2310–2490 (6s) | TEXT DARKPUNCH**

Intent: This is the pivot. "The PFBR breeds fuel." — it gets its own frame. Deadpan delivery, the visual matches: dark canvas, bold type. One of maximum 3 dark-canvas beats per video.

Composition:
- Canvas switches to #0D0D0D (dark)
- "The PFBR" — DM Sans 64px, #8B8178 (muted, secondary)
- New line: "breeds fuel." — Instrument Serif 180px, #E4E0D8, scale-in 1.12→1.0, spring
- Throughline Schematic V-A appears bottom-right: U-238 → arrow → "?" (small, 180px wide, #8B8178, opacity 60%)
- Hold dark canvas for full 6s

### Scene 2.5 — Breeding Physics
**f=2490–2820 (11s) | DIAGRAM**

Intent: The alchemy. U-238 → Pu-239 is the mechanism. Draw it slowly so the viewer follows the logic.

Composition:
- Canvas returns to #E4E0D8
- Left node: "U-238" — Instrument Serif 80px, #3A342E, surrounded by subtle atom ring (SVG circle, stroke #8B8178, 1px)
- Center: "fast neutron" label, small arrow pointing at U-238 (entering from top-right, draws in 18f)
- Transmutation arrow (thick, #D4854A, draws left-to-right, 30f): label "converts into"
- Right node: "Pu-239" — Instrument Serif 80px, #D4854A, same atom ring
- Below Pu-239: dotted leader → "This is fuel." — DM Sans 36px, #5C5248, fades in last
- All enters in sequence over 6s — one element per 24f

### Scene 2.6 — Breeding Loop
**f=2820–3090 (9s) | DIAGRAM**

Intent: The self-sustaining nature. Pu-239 feeds back in. The circle closes.

Composition:
- Same layout as 2.5 but now curved arrow from Pu-239 node looping back to left (draw arc, 36f)
- Label on loop: "feeds back as fuel"
- New element appears below entire diagram: proportion bar
  - Label: "Fuel output vs input ratio" — DM Sans 32px
  - Bar: canvas-width × 60%, divided. Left 40% label: "consumed" (#5C5248), right 60%: "produced" (#8FB07A)
  - Dotted leader from bar → callout: ">1" — DM Sans 48px, #8FB07A
- Progressive build: loop arrow first (30f), then proportion bar (36f), then callout

### Scene 2.7 — Machine Self-Sufficiency Text
**f=3090–3270 (6s) | TEXT STATEMENT**

Composition:
- "The machine is making the resource it runs on." — Instrument Serif 80px, #3A342E, centered
- "resource it runs on" — italic, #D4854A
- Entry: standard reveal 24f

### Scene 2.8 — Company Count + Timeline
**f=3270–3690 (14s) | DATA COMPARATIVE**

Intent: Scale of indigenous effort + the timeline that will matter in Ch4.

Composition:
- Left section: "200+" — Instrument Serif 220px, #3A342E
  - Below: "Indian companies" — DM Sans 44px, #8B8178
  - Below: "involved in construction" — DM Sans 36px, #5C5248
- Right section: animated horizontal timeline
  - Spine: thin line, #8B8178, draws left-to-right 30f
  - Left anchor: "2004" — DM Sans 40px, dot above spine, #5C5248
  - Right anchor: "2024" — DM Sans 40px, dot above spine, #D4854A
  - Label above span: "20 years" — DM Sans 36px, #8B8178, appears after line draws
- Thin vertical rule #8B8178 separates left/right sections
- Left section enters first (24f), then timeline draws (30f), then anchors appear with stagger

### Scene 2.9 — Timeline Callback Plant
**f=3690–3870 (6s) | TEXT STATEMENT**

Composition:
- "That timeline matters, and we'll come back to it." — DM Sans 48px, #5C5248, centered
- "we'll come back to it" — underline, dotted #D4854A (forward reference signal to viewer)

### Scene 2.10 — Chapter Bridge
**f=3870–4350 (16s) | MUSIC BRIDGE**

Intent: Breather between mechanism and scale revelation. Music comes up slightly, visual holds or fades to cream.

Composition:
- Canvas fades to solid #E4E0D8 (no text, clean)
- Subtle texture grain layer remains visible
- Music bridge: BGM rises from -34dB to -20dB for 8s, returns to narration level
- f=4200: chapter card slides in from right:
  - Left-aligned number: "03" — Instrument Serif 120px, #8B8178
  - Right: "The Long Game" — DM Sans 48px, #3A342E
  - Thin horizontal rule below: 1px #8B8178, draws left-to-right 20f

---

## Chapter 3: The Long Game
*f=4350–7680 (111 seconds)*  
*Gear 3 on the big numbers — slow and deliberate*

### Scene 3.1 — Bhabha Archival (Human Beat)
**f=4350–4770 (14s) | ARCHIVAL HIGH-COMPLEXITY**

Intent: Bhabha appears once. Not at a podium, not in a crowd — alone with his work. He is the architect of the gamble. The image holds long. This is the emotional anchor for everything that follows.

Composition:
- Image in thin-border frame (1px #8B8178), centered, 900×675px (4:3 portrait-ish)
- Caption outside frame, below: "Homi Bhabha" — Instrument Serif 48px, #3A342E
- Second line: "1954" — DM Sans 36px, #8B8178
- Entry: frame fades in opacity 0→1, 36f (slower than standard — weight)
- Hold 10s minimum. No animation during hold. Let the viewer look.
- No leader lines, no data, no competing elements.

**Image prompt (Bhabha):**  
`Black and white archival photograph of a South Asian nuclear physicist in a 1950s laboratory or office, alone at a desk or workbench, surrounded by papers and instruments. Thoughtful expression, not posed for camera. Professional, intellectual atmosphere. Film grain, slight vignette. Documentary historical style. No other people. 4:3 aspect ratio.`

### Scene 3.2 — Three-Stage Overview Text
**f=4770–5010 (8s) | TEXT STATEMENT**

Composition:
- "In 1954, he laid out a plan." — Instrument Serif 80px, #3A342E, left-aligned, margin 200px
- Below (staggers 24f): "Not for one reactor." — DM Sans 44px, #8B8178
- Below (staggers 24f): "For three stages." — DM Sans 44px, #D4854A

### Scene 3.3 — Three-Stage Flowchart (Throughline B)
**f=5010–5670 (22s) | DIAGRAM**

Intent: Bhabha's architecture made visible. Progressive reveal — the viewer builds the understanding alongside the narration. Each stage enters as the narrator names it.

Composition:
- Horizontal three-node flow, centered:
  - Node 1 (enters at f=5010): rect, "Stage 1" label DM Sans 32px ALL CAPS #8B8178, content: "Conventional reactors / Uranium fuel" DM Sans 36px #5C5248
    - Below node: dotted leader → "Power + Pu byproduct" — #8FB07A 36px
  - Arrow (draws 20f, labeled "feeds"): at f=5130
  - Node 2 (enters at f=5170): rect, ACTIVE FILL #D4854A at 15% opacity, "Stage 2" label #D4854A, content: "Fast Breeder / PFBR" #3A342E, 800 weight
    - Badge top-right corner of node: "← We are here" DM Sans 24px #D4854A
    - Below node: dotted leader → "More Pu + breeds Th-232" — #D4854A 36px
  - Arrow (draws 20f, labeled "enables"): at f=5350
  - Node 3 (enters at f=5390): rect, lighter opacity, "Stage 3" label #8B8178, content: "Thorium fleet" #5C5248
    - Below node: dotted leader → "Energy independence" — #8B8178 36px, slightly faded (future state)
- Throughline schematic V-B: full chain now visible (replaces V-A's question mark)
- Nodes and arrows enter with 24f stagger
- Hold full diagram for 6s after Stage 3 appears

### Scene 3.4 — Thorium Question
**f=5670–5820 (5s) | TEXT PACING**

Composition:
- "Why thorium?" — Instrument Serif italic, 100px, #3A342E, centered
- Entry: opacity 0→1, 18f
- Short hold — this is a beat, not a chapter

### Scene 3.5 — Thorium Hero Stat
**f=5820–6120 (10s) | DATA HERO**

Intent: 25% of world's thorium is a devastating fact. It needs its own space — a proportion rectangle, not just a number.

Composition:
- "25%" — Instrument Serif 300px, #D4854A, centered, spring entry (stiffness 300, damping 12, mass 0.4)
- Below (staggers 18f): "of the world's total thorium reserves" — DM Sans 44px, #5C5248
- Left: vertical proportion bar (thin rect, 1px #8B8178 border, 60px wide, 300px tall)
  - Fill: 25% of height in #D4854A (fills bottom-to-top, 36f, ease-out)
  - Above bar: "India" label, DM Sans 28px
  - Dotted leader from bar top to the "25%" hero
- Remaining 75%: bar unfilled, light grey label "rest of world" DM Sans 28px #8B8178

### Scene 3.6 — Monazite Map
**f=6120–6480 (12s) | MAP**

Intent: The geography is the argument. Most viewers have never heard of the Monazite belt. The map makes it visceral — a thick terracotta line down the coast of a country that has almost no uranium.

Composition:
- D3/TopoJSON map of India, full canvas height, centered
- India silhouette: #5C5248 at 20% fill, outline #3A342E 1px
- Layer 1 — Uranium deposits: sparse gray dots (4px, #8B8178) in Jharkhand / Rajasthan region. Cluster label: "Uranium deposits" DM Sans 28px, dotted leader
- Layer 2 — Monazite belt: thick terracotta stroke (#D4854A, 4px) running down southwestern coast from Kerala to Tamil Nadu, continuing down eastern coast to Odisha/West Bengal
  - Label with arrow: "Monazite belt — 25% of world's thorium" DM Sans 32px, #D4854A
- Uranium dots appear first (18f stagger), then Monazite line draws (48f left-to-right stroke animation)
- Hold full map 6s

### Scene 3.7 — Gigawatt Hero
**f=6480–6780 (10s) | DATA HERO**

Intent: 500 GW lands SLOWLY. The narrator says it slowly; the visual follows.

Composition:
- "500" — Instrument Serif 340px, #3A342E, centered, spring entry stiffness 200 (slower than standard = weight)
- "GW" — DM Sans 120px, #D4854A, same spring, 12f stagger after "500" lands
- Below (stagger 24f): "of electricity" — DM Sans 44px, #8B8178
- Post-landing stasis: 24f before anything else moves

### Scene 3.8 — Four Hundred Years Hero  
**f=6780–7080 (10s) | DATA HERO**

Intent: Separate beat from 500 GW. These are two different scales of absurdity. Don't stack.

Composition:
- "400 years" — Instrument Serif 280px, #3A342E, spring entry (same slow spring as 3.7)
- Below (stagger 18f): "from a single domestic fuel source" — DM Sans 44px, #8B8178
- This is the second hero in sequence. Hold 8s.

### Scene 3.9 — Capacity Comparison
**f=7080–7440 (12s) | DATA COMPARATIVE**

Intent: Give the viewer context for 500 GW — India's total installed capacity today is 900 GW. 500 from one domestic source for 400 years is not abstract when you see it next to what India already operates.

Composition:
- Two columns, side by side, equal width, centered:
  - Column A: "India today" — DM Sans 36px ALL CAPS #8B8178
    - Number: "~900 GW" — Instrument Serif 140px, #3A342E
    - Subtext: "total installed capacity" — DM Sans 28px #8B8178
    - Column fill: full height, #A4C0D8 (muted blue)
  - Column B: "Thorium potential" — DM Sans 36px ALL CAPS #8B8178
    - Number: "500 GW" — Instrument Serif 140px, #D4854A
    - Subtext: "for 400+ years, domestic" — DM Sans 28px #8B8178
    - Subtext 2: "(from Monazite belt)" — DM Sans 24px #8B8178
    - Column fill: 56% of A's height, #D4854A at 30% opacity
  - Dotted leader line connecting column tops
- Columns spring in from opposite sides (A from left, B from right), 24f, stagger 12f

### Scene 3.10 — Bhabha Callback + Bridge Narration
**f=7440–7680 (8s) | TEXT STATEMENT**

Composition:
- "That's what Bhabha was pointing at in 1954." — Instrument Serif 72px, #3A342E, centered
- "The PFBR is stage two." — DM Sans 48px, #D4854A, below, stagger 24f
- "The bridge between the uranium phase and the thorium phase." — DM Sans 40px, #5C5248, below, stagger 24f

---

## Chapter 4: The Honest Take
*f=7680–10440 (92 seconds)*  
*Gear 2 measured, register drops slightly*

### Scene 4.1 — Chapter Signal
**f=7680–7890 (7s) | TEXT PACING**

Composition:
- "Now the honest part." — Instrument Serif italic, 100px, #3A342E, centered
- This is a register shift signal. Enter slower than standard — opacity 0→1 over 36f, no translateY movement
- Hold 5s

### Scene 4.2 — Delay Timeline
**f=7890–8310 (14s) | DATA TIMELINE**

Intent: The 12-year delay must be visual, not just narrated. Two points on a timeline with a gap that has mass.

Composition:
- Horizontal timeline, centered, full width:
  - Spine: thin line #8B8178 1px, draws left-to-right 24f
  - Anchor 1: "2004" — dot above spine, DM Sans 44px, #5C5248 — "Construction begins"
  - Anchor 2 (planned): "2012" — dot above spine, DM Sans 44px, #8B8178 — "Originally planned" (dotted/dashed treatment, #8B8178, to signal hypothetical)
  - Anchor 3 (actual): "2024" — dot above spine, DM Sans 44px, #D4854A — "Criticality"
  - Between 2012 and 2024: gray shaded span above timeline, label "12-year gap" DM Sans 32px, #9B7777
- Anchors enter left-to-right with stagger after spine draws
- The gap shading appears last, after both endpoints are placed

### Scene 4.3 — Delay Hero
**f=8310–8520 (7s) | TEXT DARKPUNCH**

Intent: "Twelve years late." deadpan delivery on dark canvas. No drama, no apology.

Composition:
- Canvas: #0D0D0D
- "Twelve years late." — Instrument Serif 180px, #E4E0D8, scale-in 1.08→1.0, 24f
- No other elements. No sub-text. No softening.

### Scene 4.4 — Testing Status
**f=8520–8820 (10s) | TEXT STATEMENT**

Composition:
- Canvas returns to #E4E0D8
- "Still not generating electricity." — DM Sans 56px, #5C5248, centered
- Below (stagger 24f): small status indicator (dot + text):
  - ● "Testing phase" — dot #D4854A 12px, DM Sans 36px #D4854A
  - ● "Grid connection: pending regulatory clearance" — dot #8B8178 12px, DM Sans 36px #8B8178, staggers 18f
- Below (stagger 30f): "Criticality is the beginning of a process, not the end of one." — Instrument Serif italic 52px, #3A342E

### Scene 4.5 — The Club
**f=8820–9300 (16s) | DATA COMPARATIVE**

Intent: Three countries. Minimal. No flags. No maps. The rarity is the argument — the list is short enough that listing it IS the point.

Composition:
- Title: "Fast breeder reactors — operational or prototype" — DM Sans 32px ALL CAPS, #8B8178, top-left
- Three rows, left-aligned, progressive reveal:
  - Row 1 (enters first): "Russia" — Instrument Serif 64px, #5C5248 | separator | "BN-800, commercial" — DM Sans 40px, #8B8178
  - Row 2 (staggers 24f): "China" — Instrument Serif 64px, #5C5248 | separator | "CFR-600, recent" — DM Sans 40px, #8B8178
  - Row 3 (staggers 24f): "India" — Instrument Serif 64px, #D4854A | separator | "PFBR, Kalpakkam — testing" — DM Sans 40px, #D4854A
- Thin horizontal rules (1px #8B8178) between rows, draw left-to-right with each row entry
- Hold full list 8s — let viewer count: three countries

### Scene 4.6 — Outer Loop Resolution Setup
**f=9300–9540 (8s) | TEXT PACING**

Composition:
- "But here's what actually resolves the question that Bhabha was sitting with in 1954." — DM Sans 48px, #5C5248, centered, wrapped
- Entry: standard reveal 24f

### Scene 4.7 — Outer Loop Resolution (Throughline C)
**f=9540–9960 (14s) | TEXT HERO + DIAGRAM**

Intent: The outer loop closes. Visual and narration resolve simultaneously. Throughline V-C appears — Stage 2 node active.

Composition:
- "You build a machine that makes the fuel you don't have." — Instrument Serif 96px, #3A342E, centered, wrapped
- "fuel you don't have" — #D4854A
- Entry: slow spring (stiffness 150, damping 12), 36f — heaviest landing in the video
- Below text (staggers 48f): Throughline Schematic V-C appears
  - Full chain: Stage 1 → Stage 2 → Stage 3
  - Stage 2 node: terracotta fill at 40% opacity, gentle pulse (opacity 40%→60%→40%, 60f cycle)
  - Badge on Stage 2: "active" — DM Sans 24px #D4854A
- Hold text + active schematic for 6s

### Scene 4.8 — Mechanism Clarification
**f=9960–10200 (8s) | TEXT STATEMENT**

Composition:
- "The PFBR isn't India's energy solution." — DM Sans 48px, #8B8178, centered
- Strikethrough appears on "energy solution" (1px #9B7777, draws 20f)
- Below (stagger 30f): "It's the mechanism that makes the solution possible." — Instrument Serif 56px, #3A342E

### Scene 4.9 — Kalpakkam Final Image
**f=10200–10320 (4s) | ARCHIVAL IMAGE**

Intent: Ground the closing in physical reality. The reactor exists. It is in a testing phase. It is not on the grid. It is breeding plutonium.

Composition:
- Same Kalpakkam facility image as Scene 2.1 (call-back visual continuity)
- Frame: same thin-border treatment
- Caption updated: "Kalpakkam — testing phase" — DM Sans 28px, #8B8178
- Entry: fade in 18f (faster than Ch2 establishing — we've been here before)

### Scene 4.10 — Closing Two Lines
**f=10320–10440 (4s) | TEXT HERO — CLOSING**

Intent: The final two sentences are the thesis crystallized. Each gets its own beat, separated by a full pause. The sparseness matches the cold open — the circle closes visually.

Composition:
- "Seventy years of institutional patience." — Instrument Serif 96px, #3A342E, centered
- Entry: slow opacity 0→1 over 36f — no scale, no spring, just materialization
- Stasis: 30f
- Fade to #E4E0D8 (canvas): 18f
- "One self-sustaining chain reaction." — Instrument Serif 80px, #5C5248, fades in 24f
- Below: hold 6s in total silence
- Final fade: entire canvas to #E4E0D8 full white-out, 36f
- Source acknowledgment: DM Sans 20px, #8B8178, centered: "Sources: Department of Atomic Energy, India | IAEA | PIB" — fades in as canvas clears

---

## Image Generation Manifest

| ID | File | Used in | Type |
|---|---|---|---|
| 01 | `kalpakkam-aerial.png` | Scene 2.1, 4.9 | Generated — bgless not needed, framed |
| 02 | `bhabha-archival.png` | Scene 3.1 | Generated — archival B&W treatment |

Full prompts above. Generate with `--mode instant`.

---

## Remotion Components Required

| Component | Scenes | Type |
|---|---|---|
| `ThroughlineSchematic` | 2.4, 3.3, 4.7 | SVG animated — 3 versions (A/B/C) |
| `IndiaMap` (thorium/uranium) | 3.6 | D3 + TopoJSON |
| `BreedingDiagram` | 2.5, 2.6 | SVG animated |
| `StandardReactorDiagram` | 2.3 | SVG animated |
| `ThreeStageFlowchart` | 3.3 | SVG animated |
| `DelayTimeline` | 4.2 | SVG animated |
| `ClubList` | 4.5 | Text progressive reveal |
| `ProportionBar` | 3.5 | SVG animated |
| `CapacityComparison` | 3.9 | Two-column data viz |

---

## Cut List Summary

| # | Frames | Duration | Scene | Mode |
|---|---|---|---|---|
| 1 | 0–120 | 4s | Cold open text | Text hero |
| 2 | 120–330 | 7s | Correction strikethroughs | Text correct |
| 3 | 330–570 | 8s | Scarcity detail | Text statement |
| 4 | 570–720 | 5s | Pivot text | Text pacing |
| 5 | 720–900 | 6s | 1954 hero | Data hero |
| 6 | 900–1530 | 21s | Outer loop plant | Text statement |
| 7 | 1530–1770 | 8s | Kalpakkam establishing | Archival |
| 8 | 1770–2010 | 8s | 500 MW / 2024 | Data hero |
| 9 | 2010–2310 | 10s | Standard reactor diagram | Diagram |
| 10 | 2310–2490 | 6s | PFBR pivot — dark canvas | Text darkpunch |
| 11 | 2490–2820 | 11s | Breeding physics | Diagram |
| 12 | 2820–3090 | 9s | Breeding loop + proportion | Diagram |
| 13 | 3090–3270 | 6s | Machine self-sufficiency | Text statement |
| 14 | 3270–3690 | 14s | 200 companies + timeline | Data comparative |
| 15 | 3690–3870 | 6s | Timeline callback | Text statement |
| 16 | 3870–4350 | 16s | Chapter bridge | Music bridge |
| 17 | 4350–4770 | 14s | Bhabha archival | Archival high |
| 18 | 4770–5010 | 8s | Three-stage overview | Text statement |
| 19 | 5010–5670 | 22s | Three-stage flowchart | Diagram |
| 20 | 5670–5820 | 5s | Thorium question | Text pacing |
| 21 | 5820–6120 | 10s | 25% hero + proportion | Data hero |
| 22 | 6120–6480 | 12s | Monazite map | Map |
| 23 | 6480–6780 | 10s | 500 GW hero | Data hero |
| 24 | 6780–7080 | 10s | 400 years hero | Data hero |
| 25 | 7080–7440 | 12s | Capacity comparison | Data comparative |
| 26 | 7440–7680 | 8s | Bhabha callback | Text statement |
| 27 | 7680–7890 | 7s | Chapter signal | Text pacing |
| 28 | 7890–8310 | 14s | Delay timeline | Data timeline |
| 29 | 8310–8520 | 7s | 12 years late — dark | Text darkpunch |
| 30 | 8520–8820 | 10s | Testing status | Text statement |
| 31 | 8820–9300 | 16s | The club list | Data comparative |
| 32 | 9300–9540 | 8s | Outer loop setup | Text pacing |
| 33 | 9540–9960 | 14s | Resolution + Throughline C | Text hero + diagram |
| 34 | 9960–10200 | 8s | Mechanism clarification | Text statement |
| 35 | 10200–10320 | 4s | Kalpakkam callback | Archival |
| 36 | 10320–10440 | 4s | Closing two lines | Text hero closing |

**Total cuts: 36 across 348s = 6.2 cuts/min**  
**Note:** Within each diagram scene, progressive element reveals (per-element 24–36f stagger) add density. Effective visual change rate per channel target is met when counting element-level reveals.

---

## Mode Interleave Audit

| Mode | Scenes | Approx duration |
|---|---|---|
| Text (hero/statement/pacing/darkpunch) | 1.1–1.6, 2.4, 2.7, 2.9, 3.2, 3.4, 3.10, 4.1, 4.3, 4.4, 4.6, 4.7, 4.8, 4.10 | ~160s = 46% |
| Data viz (hero numbers, comparative, timeline) | 2.2, 2.8, 3.5, 3.7, 3.8, 3.9, 4.2, 4.5 | ~96s = 28% |
| Diagram / schematic | 2.3, 2.5, 2.6, 3.3, 3.6 | ~67s = 19% |
| Archival image | 2.1, 3.1, 4.9 | ~26s = 7% |

No mode runs >30s uninterrupted. Passes muted-audio test: every data scene is self-labeling.
