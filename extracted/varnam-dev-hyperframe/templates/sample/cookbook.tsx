/**
 * swarajya-cookbook.tsx — design system, not frames.
 *
 * Four layers:
 *   1. Tokens          — palette, type, space, identity constants
 *   2. Atoms           — smallest visual units (Eyebrow, Rule, Headline, Stat…)
 *   3. Canvas          — SwarajyaPage with named slots. Nothing places by coordinate.
 *   4. Frames          — named recipes that compose atoms into slots.
 *
 * A specialist never writes a <div style={left,top}>. They either
 *   - use an atom,
 *   - drop atoms into Canvas slots, or
 *   - pick a frame recipe.
 *
 *   npx remotion still sample/cookbook.tsx Index        out/cb-index.png
 *   npx remotion still sample/cookbook.tsx StatRecipe   out/cb-statrecipe.png
 *   npx remotion still sample/cookbook.tsx QuoteRecipe  out/cb-quoterecipe.png
 *   npx remotion still sample/cookbook.tsx ChapterRecipe out/cb-chapterrecipe.png
 */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: FR } = loadFraunces();

// ───────────────────────────────────────────────────────────────
// 1. TOKENS — the only place constants exist. Atoms read from here.
// ───────────────────────────────────────────────────────────────

const tokens = {
  bg: "#F2EDE7",
  coral: "#DC7070",
  ink: "#202020",
  font: { body: PT, display: FR },
  size: { eyebrow: 40, body: 40, headline: 80, caption: 28 },
  weight: { regular: 400, bold: 700 },
  space: { xs: 16, s: 24, m: 40, l: 80, xl: 120 },
  canvas: { w: 1920, h: 1080, margin: 120, reserveBottom: 80 },
  limits: {
    eyebrow: 48,
    value: 14,
    label: 44,
    source: 60,
    headline: 80,
    quote: 180,
    body: 240,
  },
} as const;

const check = (s: string | undefined, max: number, where: string) => {
  if (s && s.length > max)
    throw new Error(`[${where}] ${s.length}/${max} chars — rewrite, don't relayout: "${s}"`);
};

// ───────────────────────────────────────────────────────────────
// 2. ATOMS — single-purpose visual primitives. No positioning.
// They return inline-level content that flows inside a layout.
// ───────────────────────────────────────────────────────────────

export const Eyebrow: React.FC<{ children: string }> = ({ children }) => {
  check(children, tokens.limits.eyebrow, "Eyebrow");
  return (
    <div style={{
      fontFamily: tokens.font.body, fontWeight: tokens.weight.regular,
      fontSize: tokens.size.eyebrow, letterSpacing: 6, textTransform: "uppercase",
      color: tokens.ink, opacity: 0.5, lineHeight: 1.2,
    }}>{children}</div>
  );
};

export const Rule: React.FC = () => (
  <div style={{ height: 1, background: tokens.ink, opacity: 0.15, width: "100%" }} />
);

export const Headline: React.FC<{ children: string; accent?: boolean; display?: boolean }> = ({
  children, accent, display,
}) => {
  check(children, tokens.limits.headline, "Headline");
  return (
    <div style={{
      fontFamily: display ? tokens.font.display : tokens.font.body,
      fontWeight: tokens.weight.bold, fontSize: tokens.size.headline,
      color: accent ? tokens.coral : tokens.ink, lineHeight: 1.08, letterSpacing: -1,
    }}>{children}</div>
  );
};

export const Kicker: React.FC<{ children: string }> = ({ children }) => {
  check(children, tokens.limits.headline, "Kicker");
  return (
    <div style={{
      fontFamily: tokens.font.display, fontWeight: tokens.weight.bold, fontStyle: "italic",
      fontSize: tokens.size.headline, color: tokens.coral, lineHeight: 1.08, letterSpacing: -1,
    }}>{children}</div>
  );
};

export const Body: React.FC<{ children: string; muted?: boolean }> = ({ children, muted }) => {
  check(children, tokens.limits.body, "Body");
  return (
    <div style={{
      fontFamily: tokens.font.body, fontWeight: tokens.weight.regular,
      fontSize: tokens.size.body, color: tokens.ink,
      opacity: muted ? 0.7 : 1, lineHeight: 1.35,
    }}>{children}</div>
  );
};

export const Source: React.FC<{ children: string }> = ({ children }) => {
  check(children, tokens.limits.source, "Source");
  return (
    <div style={{
      fontFamily: tokens.font.body, fontWeight: tokens.weight.regular,
      fontSize: tokens.size.caption, color: tokens.ink, opacity: 0.5,
    }}>{children}</div>
  );
};

export const CoralBar: React.FC<{ height?: number }> = ({ height = 420 }) => (
  <div style={{ width: 3, height, background: tokens.coral, flexShrink: 0 }} />
);

export const Divider: React.FC<{ height?: number }> = ({ height = 240 }) => (
  <div style={{ width: 1.5, height, background: tokens.ink, opacity: 0.2 }} />
);

export const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  check(value, tokens.limits.value, "Stat.value");
  check(label, tokens.limits.label, "Stat.label");
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: tokens.space.s, textAlign: "center",
    }}>
      <div style={{
        fontFamily: tokens.font.body, fontWeight: tokens.weight.bold,
        fontSize: tokens.size.headline, lineHeight: 1, color: tokens.coral,
      }}>{value}</div>
      <div style={{
        fontFamily: tokens.font.body, fontWeight: tokens.weight.regular,
        fontSize: tokens.size.body, lineHeight: 1.25, letterSpacing: 2,
        textTransform: "uppercase", color: tokens.ink, maxWidth: 640,
      }}>{label}</div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// 3. CANVAS — layout primitive. Atoms go in slots, not coordinates.
// Slots are bands with hard vertical rhythm. Collision is unrepresentable.
// ───────────────────────────────────────────────────────────────

type SlotName = "eyebrow" | "rule" | "title" | "body" | "anchor" | "source";

type CanvasProps = {
  slots: Partial<Record<SlotName, React.ReactNode>>;
  children?: never;
};

export const SwarajyaPage: React.FC<CanvasProps> = ({ slots }) => (
  <AbsoluteFill style={{
    background: tokens.bg,
    padding: `${tokens.canvas.margin}px ${tokens.canvas.margin}px ${tokens.canvas.reserveBottom}px`,
    display: "grid",
    gridTemplateRows: "auto auto 1fr auto auto",
    rowGap: tokens.space.m,
  }}>
    <div>{slots.eyebrow ?? null}</div>
    <div>{slots.rule ?? null}</div>
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center",
      gap: tokens.space.m, minHeight: 0,
    }}>
      {slots.title ?? null}
      {slots.body ?? null}
    </div>
    <div>{slots.anchor ?? null}</div>
    <div style={{ textAlign: "right" }}>{slots.source ?? null}</div>
  </AbsoluteFill>
);

// ───────────────────────────────────────────────────────────────
// 4. FRAME RECIPES — named compositions of atoms-in-slots.
// Specialists use these. If none fits, a new recipe is authored,
// not a one-off AbsoluteFill.
// ───────────────────────────────────────────────────────────────

export const StatFrameRecipe: React.FC<{
  eyebrow: string;
  stats: [{ value: string; label: string }, { value: string; label: string }];
  source?: string;
}> = ({ eyebrow, stats, source }) => (
  <SwarajyaPage slots={{
    eyebrow: <Eyebrow>{eyebrow}</Eyebrow>,
    rule: <Rule />,
    title: (
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: tokens.space.l, padding: `${tokens.space.l}px 0`,
      }}>
        <Stat value={stats[0].value} label={stats[0].label} />
        <Divider />
        <Stat value={stats[1].value} label={stats[1].label} />
      </div>
    ),
    source: source ? <Source>{source}</Source> : undefined,
  }} />
);

export const QuoteFrameRecipe: React.FC<{
  eyebrow: string;
  quote: string;
  attribution: string;
}> = ({ eyebrow, quote, attribution }) => {
  check(quote, tokens.limits.quote, "Quote");
  return (
    <SwarajyaPage slots={{
      eyebrow: <Eyebrow>{eyebrow}</Eyebrow>,
      rule: <Rule />,
      title: (
        <div style={{ display: "flex", gap: tokens.space.m, alignItems: "stretch" }}>
          <CoralBar />
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.l }}>
            <Body>{quote}</Body>
            <Source>{attribution}</Source>
          </div>
        </div>
      ),
    }} />
  );
};

export const ChapterFrameRecipe: React.FC<{
  eyebrow: string;
  kicker: string;
  lead: string;
}> = ({ eyebrow, kicker, lead }) => (
  <SwarajyaPage slots={{
    eyebrow: <Eyebrow>{eyebrow}</Eyebrow>,
    rule: <Rule />,
    title: (
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s }}>
        <Body muted>{lead}</Body>
        <Kicker>{kicker}</Kicker>
      </div>
    ),
  }} />
);

// ───────────────────────────────────────────────────────────────
// COOKBOOK INDEX — one screen showing the vocabulary.
// This is what a specialist reads first. Not a frame — a contact sheet.
// ───────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{
      fontFamily: PT, fontSize: 22, letterSpacing: 4, textTransform: "uppercase",
      color: tokens.ink, opacity: 0.4,
    }}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  </div>
);

const Row: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "center" }}>
    <div style={{
      fontFamily: PT, fontSize: 22, color: tokens.ink, opacity: 0.55, fontStyle: "italic",
    }}>{name}</div>
    <div style={{ transform: "scale(0.5)", transformOrigin: "left center" }}>{children}</div>
  </div>
);

const Index: React.FC = () => (
  <AbsoluteFill style={{
    background: tokens.bg, padding: "80px 100px",
    display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 80, rowGap: 60,
    fontFamily: PT,
  }}>
    <div style={{ gridColumn: "1 / span 2" }}>
      <div style={{
        fontFamily: FR, fontWeight: 700, fontSize: 56, color: tokens.ink, lineHeight: 1.05,
      }}>Swarajya — cookbook.</div>
      <div style={{
        marginTop: 12, fontSize: 22, opacity: 0.6, color: tokens.ink,
      }}>
        Atoms → Canvas → Recipes. A specialist picks, never places.
      </div>
    </div>

    <Section title="Atoms">
      <Row name="Eyebrow"><Eyebrow>Naval aviation · 2026</Eyebrow></Row>
      <Row name="Rule"><div style={{ width: 800 }}><Rule /></div></Row>
      <Row name="Headline"><Headline>The carrier with no plane.</Headline></Row>
      <Row name="Kicker"><Kicker>if the plane isn't?</Kicker></Row>
      <Row name="Body"><Body>Indigenous naval fighter — not before 2032.</Body></Row>
      <Row name="Body (muted)"><Body muted>HAL projection, 2025.</Body></Row>
      <Row name="Source"><Source>IISS Military Balance · 2024</Source></Row>
    </Section>

    <Section title="Atoms (structural)">
      <Row name="CoralBar"><CoralBar height={120} /></Row>
      <Row name="Divider"><Divider height={120} /></Row>
      <Row name="Stat"><Stat value="31" label="Flying" /></Row>
    </Section>

    <Section title="Canvas">
      <div style={{
        fontSize: 20, color: tokens.ink, opacity: 0.7, maxWidth: 720, lineHeight: 1.4,
      }}>
        <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 18 }}>
          SwarajyaPage &#123;&#123; eyebrow, rule, title, body, anchor, source &#125;&#125;
        </code>
        <div style={{ marginTop: 10, opacity: 0.75 }}>
          Six named slots with fixed vertical rhythm. Atoms go in, collisions don't.
        </div>
      </div>
    </Section>

    <Section title="Frame recipes">
      <div style={{ fontFamily: PT, fontSize: 22, color: tokens.ink, opacity: 0.85, lineHeight: 1.7 }}>
        <div>· <b>StatFrameRecipe</b>  — Eyebrow / Rule / 2×Stat+Divider / Source</div>
        <div>· <b>QuoteFrameRecipe</b> — Eyebrow / Rule / CoralBar+Body+Source</div>
        <div>· <b>ChapterFrameRecipe</b> — Eyebrow / Rule / Body+Kicker</div>
        <div style={{ marginTop: 12, fontStyle: "italic", opacity: 0.6, fontSize: 20 }}>
          Need another? Author a recipe in the cookbook, not a one-off frame.
        </div>
      </div>
    </Section>

    <div style={{
      gridColumn: "1 / span 2", borderTop: `1px solid ${tokens.ink}22`, paddingTop: 24,
      fontSize: 20, color: tokens.ink, opacity: 0.55, fontStyle: "italic",
    }}>
      No specialist writes <code style={{ fontFamily: "ui-monospace, monospace" }}>position: absolute</code>.
      Content goes in. Frames come out.
    </div>
  </AbsoluteFill>
);

// ───────────────────────────────────────────────────────────────
// Examples of the recipes in use. Written in plain content only.
// ───────────────────────────────────────────────────────────────

const StatRecipe: React.FC = () => (
  <StatFrameRecipe
    eyebrow="Indigenous fighter capability"
    stats={[
      { value: "Two", label: "Carriers · commissioned" },
      { value: "Zero", label: "Indigenous jets flying off them" },
    ]}
    source="Ministry of Defence · 2025"
  />
);

const QuoteRecipe: React.FC = () => (
  <QuoteFrameRecipe
    eyebrow="Official projection"
    quote="Tejas Mk2 naval variant operational by 2032, contingent on engine integration."
    attribution="HAL · Ministry of Defence · 2025"
  />
);

const ChapterRecipe: React.FC = () => (
  <ChapterFrameRecipe
    eyebrow="Chapter one · naval aviation"
    lead="Two carriers commissioned. Neither of them flies an Indian-built fighter."
    kicker="The carrier with no plane."
  />
);

const Root: React.FC = () => (
  <>
    <Composition id="Index"          component={Index}          width={tokens.canvas.w} height={tokens.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="StatRecipe"     component={StatRecipe}     width={tokens.canvas.w} height={tokens.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="QuoteRecipe"    component={QuoteRecipe}    width={tokens.canvas.w} height={tokens.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="ChapterRecipe"  component={ChapterRecipe}  width={tokens.canvas.w} height={tokens.canvas.h} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
