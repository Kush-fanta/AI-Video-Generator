/**
 * cookbook-charts-2.tsx — five more chart recipes.
 *
 * Architectural rule applied: axis furniture lives in grid tracks around the
 * plot, not in `position: absolute`. The plot interior is the only place
 * coordinate math is allowed — and it uses SVG viewBox, not hand-placed px.
 *
 *   for id in Area Stack Bullet Heatmap Lollipop; do
 *     npx remotion still sample/cookbook-charts-2.tsx $id out/ck2-$id.png
 *   done
 */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: FR } = loadFraunces();

const T = {
  bg: "#F2EDE7", coral: "#DC7070", ink: "#202020",
  font: { body: PT, display: FR },
  size: { eyebrow: 40, body: 40, headline: 64, caption: 28, tick: 22 },
  canvas: { w: 1920, h: 1080, margin: 90, reserveBottom: 70 },
  space: { xs: 12, s: 24, m: 40, l: 64, xl: 96 },
  lim: { eyebrow: 48, title: 68, sub: 80, label: 32, source: 60 },
};

const check = (s: string | undefined, max: number, where: string) => {
  if (s && s.length > max) throw new Error(`[${where}] ${s.length}/${max}: "${s}"`);
};

const Rule: React.FC = () => (
  <div style={{ height: 1, background: T.ink, opacity: 0.15 }} />
);
const Title: React.FC<{ children: string }> = ({ children }) => {
  check(children, T.lim.title, "Title");
  return <div style={{
    fontFamily: T.font.display, fontWeight: 700, fontSize: T.size.headline,
    color: T.ink, lineHeight: 1.06, letterSpacing: -1,
  }}>{children}</div>;
};
const Sub: React.FC<{ children: string }> = ({ children }) => {
  check(children, T.lim.sub, "Sub");
  return <div style={{
    fontFamily: T.font.body, fontSize: 32, color: T.ink, opacity: 0.6,
    lineHeight: 1.3,
  }}>{children}</div>;
};
const Source: React.FC<{ children: string }> = ({ children }) => {
  check(children, T.lim.source, "Source");
  return <div style={{
    fontFamily: T.font.body, fontSize: T.size.caption, color: T.ink, opacity: 0.5,
  }}>{children}</div>;
};

type CanvasSlots = {
  title?: React.ReactNode;
  chart: React.ReactNode;
  source?: React.ReactNode;
};

const SwarajyaPage: React.FC<{ slots: CanvasSlots }> = ({ slots }) => (
  <AbsoluteFill style={{
    background: T.bg,
    padding: `${T.canvas.margin}px ${T.canvas.margin}px ${T.canvas.reserveBottom}px`,
    display: "grid",
    gridTemplateRows: "auto minmax(0,1fr) auto",
    rowGap: T.space.m,
  }}>
    <div style={{ display: "flex", flexDirection: "column", gap: T.space.s }}>
      {slots.title}
    </div>
    <div style={{ minHeight: 0, display: "flex" }}>{slots.chart}</div>
    <div style={{ textAlign: "right" }}>{slots.source}</div>
  </AbsoluteFill>
);

// ─── Shared plot chrome ─────────────────────────────────────────
// PlotFrame: y-ticks column + plot + corner label + x-ticks row.
// Axis text lives in grid tracks, never on top of the plot.

type Tick = { v: number; label: string };

const PlotFrame: React.FC<{
  xTicks: Tick[]; yTicks: Tick[];
  xMin: number; xMax: number; yMin: number; yMax: number;
  xLabel?: string; yLabel?: string;
  children: (ctx: { px: (x: number) => number; py: (y: number) => number }) => React.ReactNode;
}> = ({ xTicks, yTicks, xMin, xMax, yMin, yMax, xLabel, yLabel, children }) => {
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * 100;
  const py = (y: number) => 100 * (1 - (y - yMin) / (yMax - yMin));
  return (
    <div style={{
      flex: 1, minHeight: 0, fontFamily: T.font.body, display: "grid",
      gridTemplateColumns: "140px 1fr",
      gridTemplateRows: "minmax(0, 1fr) 44px 28px",
      columnGap: T.space.s, rowGap: T.space.xs,
    }}>
      {/* y-ticks column */}
      <div style={{ position: "relative", minHeight: 0 }}>
        {yTicks.map((t) => (
          <div key={t.v} style={{
            position: "absolute", right: 0, top: `${py(t.v)}%`,
            transform: "translateY(-50%)",
            fontSize: T.size.tick, opacity: 0.5,
          }}>{t.label}</div>
        ))}
      </div>
      {/* plot */}
      <div style={{ position: "relative", minHeight: 0, minWidth: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          borderLeft: `1px solid ${T.ink}33`,
          borderBottom: `1px solid ${T.ink}33`,
        }} />
        {children({ px, py })}
      </div>
      {/* y-axis label (corner) */}
      <div style={{
        fontSize: 20, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase",
        textAlign: "right", alignSelf: "start", paddingTop: 6,
      }}>{yLabel ?? ""}</div>
      {/* x-ticks row */}
      <div style={{ position: "relative" }}>
        {xTicks.map((t) => (
          <div key={t.v} style={{
            position: "absolute", left: `${px(t.v)}%`,
            transform: "translateX(-50%)",
            fontSize: T.size.tick, opacity: 0.5,
          }}>{t.label}</div>
        ))}
      </div>
      <div />
      <div style={{
        fontSize: 20, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase",
        textAlign: "right",
      }}>{xLabel ?? ""}</div>
    </div>
  );
};

// ─── 1. Area + line timeline ────────────────────────────────────
const Area: React.FC<{
  series: { year: number; value: number }[];
  target?: { value: number; label: string };
  xDomain: [number, number]; yDomain: [number, number];
  xTicks: Tick[]; yTicks: Tick[];
  yLabel?: string;
}> = ({ series, target, xDomain, yDomain, xTicks, yTicks, yLabel }) => {
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;
  return (
    <PlotFrame
      xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}
      xTicks={xTicks} yTicks={yTicks} yLabel={yLabel}
    >
      {({ px, py }) => {
        const pts = series.map(s => `${px(s.year)},${py(s.value)}`).join(" ");
        const area = `${px(series[0].year)},100 ${pts} ${px(series[series.length-1].year)},100`;
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <polygon points={area} fill={T.coral} fillOpacity={0.18} />
            <polyline points={pts} fill="none"
              stroke={T.coral} strokeWidth={0.7}
              vectorEffect="non-scaling-stroke" />
            {target && (
              <line x1={0} x2={100} y1={py(target.value)} y2={py(target.value)}
                stroke={T.ink} strokeOpacity={0.35} strokeDasharray="2 2"
                strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
            )}
            {series.map((s) => (
              <circle key={s.year} cx={px(s.year)} cy={py(s.value)} r={1}
                fill={T.coral} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        );
      }}
    </PlotFrame>
  );
};

// ─── 2. Horizontal stacked bar (budget composition) ─────────────
const Stack: React.FC<{
  rows: { label: string; segments: { name: string; value: number; accent?: boolean }[] }[];
  total: number;
  unit: string;
}> = ({ rows, total, unit }) => {
  const LABEL = 220;
  return (
    <div style={{
      flex: 1, minHeight: 0, fontFamily: T.font.body, display: "grid",
      gridTemplateColumns: `${LABEL}px 1fr`,
      gridAutoRows: "1fr", rowGap: T.space.s, columnGap: T.space.m,
      alignItems: "center",
    }}>
      {rows.map((r) => {
        return (
          <React.Fragment key={r.label}>
            <div style={{ textAlign: "right", fontSize: 28, color: T.ink, opacity: 0.8 }}>
              {r.label}
            </div>
            <div style={{ display: "flex", height: 96, width: "100%", gap: 2 }}>
              {r.segments.map((s) => {
                const pct = (s.value / total) * 100;
                return (
                  <div key={s.name} style={{
                    width: `${pct}%`,
                    background: s.accent ? T.coral : "rgba(32,32,32,0.18)",
                    display: "flex", alignItems: "center",
                    paddingLeft: 14, color: s.accent ? "#F2EDE7" : T.ink,
                    fontSize: 22, fontWeight: s.accent ? 700 : 400,
                    overflow: "hidden", whiteSpace: "nowrap",
                  }}>
                    {pct >= 8 ? `${s.name} · ${s.value}${unit}` : ""}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── 3. Bullet chart (target vs actual) ─────────────────────────
// Each row normalises against its own target. The axis is "percent of target
// delivered" — so 100% is the promised number, regardless of absolute scale.
const Bullet: React.FC<{
  rows: { label: string; actual: number; target: number; unit: string }[];
}> = ({ rows }) => {
  const LABEL = 280;
  const AXIS_MAX = 110; // breathing room past 100%
  return (
    <div style={{
      flex: 1, minHeight: 0, fontFamily: T.font.body, display: "grid",
      gridTemplateColumns: `${LABEL}px 1fr`,
      gridAutoRows: "1fr", rowGap: T.space.m, columnGap: T.space.m,
      alignItems: "center",
    }}>
      {rows.map((r) => {
        const deliveredPct = (r.actual / r.target) * 100;
        const w = (v: number) => Math.min(v, AXIS_MAX) / AXIS_MAX * 100;
        return (
          <React.Fragment key={r.label}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, color: T.ink, opacity: 0.85 }}>{r.label}</div>
              <div style={{ fontSize: 22, color: T.ink, opacity: 0.45, marginTop: 4 }}>
                {r.actual}{r.unit} of {r.target}{r.unit} promised
              </div>
            </div>
            <div style={{ position: "relative", height: 64 }}>
              {/* full scale (0-100% of target) */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${w(100)}%`, background: "rgba(32,32,32,0.10)",
              }} />
              {/* actual delivered */}
              <div style={{
                position: "absolute", left: 0, top: 14, bottom: 14,
                width: `${w(deliveredPct)}%`, background: T.coral,
              }} />
              {/* target marker at 100% */}
              <div style={{
                position: "absolute", left: `${w(100)}%`,
                top: -4, bottom: -4, width: 3, background: T.ink,
                transform: "translateX(-50%)",
              }} />
              {/* percent readout */}
              <div style={{
                position: "absolute", left: `calc(${w(Math.max(deliveredPct, 8))}% + 12px)`,
                top: "50%", transform: "translateY(-50%)",
                fontSize: 22, color: T.coral, fontWeight: 700, whiteSpace: "nowrap",
              }}>{Math.round(deliveredPct)}%</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── 4. Heatmap (program × year status) ─────────────────────────
const Heatmap: React.FC<{
  rows: { label: string; cells: ("none" | "plan" | "delay" | "ship")[] }[];
  cols: string[];
}> = ({ rows, cols }) => {
  const LABEL = 280;
  const palette: Record<string, { bg: string; op: number }> = {
    none:  { bg: T.ink,   op: 0.06 },
    plan:  { bg: T.ink,   op: 0.22 },
    delay: { bg: T.ink,   op: 0.5  },
    ship:  { bg: T.coral, op: 1    },
  };
  return (
    <div style={{
      flex: 1, fontFamily: T.font.body, display: "grid",
      gridTemplateColumns: `${LABEL}px 1fr`,
      gridTemplateRows: "40px 1fr 64px",
      rowGap: T.space.s, columnGap: T.space.m,
    }}>
      <div />
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
        fontSize: 20, opacity: 0.5,
      }}>
        {cols.map((c) => (
          <div key={c} style={{ textAlign: "center" }}>{c}</div>
        ))}
      </div>

      <div style={{
        display: "grid", gridAutoRows: "1fr", rowGap: 4,
        alignContent: "stretch",
      }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            fontSize: 26, color: T.ink, opacity: 0.8,
          }}>{r.label}</div>
        ))}
      </div>
      <div style={{
        display: "grid", gridAutoRows: "1fr", rowGap: 4,
      }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
            gap: 4,
          }}>
            {r.cells.map((c, i) => {
              const p = palette[c];
              return <div key={i} style={{ background: p.bg, opacity: p.op }} />;
            })}
          </div>
        ))}
      </div>

      {/* legend */}
      <div />
      <div style={{ display: "flex", gap: T.space.l, alignItems: "center", paddingTop: T.space.s }}>
        {(["plan", "delay", "ship"] as const).map((k) => {
          const label = k === "plan" ? "planned" : k === "delay" ? "delayed" : "delivered";
          const p = palette[k];
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 22, height: 22, background: p.bg, opacity: p.op }} />
              <span style={{ fontSize: 22, opacity: 0.6 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 5. Lollipop (ranked single value) ──────────────────────────
const Lollipop: React.FC<{
  items: { name: string; value: number; accent?: boolean }[];
  axisMax: number;
  unit: string;
}> = ({ items, axisMax, unit }) => {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const LABEL = 340;
  const VAL = 160;
  return (
    <div style={{
      flex: 1, fontFamily: T.font.body, display: "grid",
      gridTemplateColumns: `${LABEL}px 1fr ${VAL}px`,
      gridAutoRows: "1fr", rowGap: T.space.s, columnGap: T.space.m,
      alignItems: "center",
    }}>
      {sorted.map((d) => {
        const pct = (d.value / axisMax) * 100;
        return (
          <React.Fragment key={d.name}>
            <div style={{
              textAlign: "right", fontSize: 28,
              color: T.ink, opacity: d.accent ? 1 : 0.7,
              fontWeight: d.accent ? 700 : 400,
            }}>{d.name}</div>
            <div style={{ position: "relative", height: 28 }}>
              <div style={{
                position: "absolute", left: 0, top: "50%",
                width: `${pct}%`, height: 2,
                background: d.accent ? T.coral : T.ink,
                opacity: d.accent ? 1 : 0.3,
                transform: "translateY(-50%)",
              }} />
              <div style={{
                position: "absolute", left: `${pct}%`, top: "50%",
                width: d.accent ? 22 : 16, height: d.accent ? 22 : 16,
                borderRadius: "50%",
                background: d.accent ? T.coral : T.ink,
                opacity: d.accent ? 1 : 0.55,
                transform: "translate(-50%,-50%)",
              }} />
            </div>
            <div style={{
              fontSize: 28,
              color: d.accent ? T.coral : T.ink,
              opacity: d.accent ? 1 : 0.7,
              fontWeight: d.accent ? 700 : 400,
            }}>{d.value}{unit}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Recipes ────────────────────────────────────────────────────

const AreaRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>The defence R&D share kept shrinking.</Title>
      <Sub>R&D as a share of India's defence budget · 2010 to 2024</Sub>
    </>,
    chart: <Area
      xDomain={[2010, 2024]} yDomain={[0, 10]}
      xTicks={[
        { v: 2010, label: "2010" }, { v: 2014, label: "2014" },
        { v: 2018, label: "2018" }, { v: 2022, label: "2022" },
        { v: 2024, label: "2024" },
      ]}
      yTicks={[
        { v: 0, label: "0%" }, { v: 5, label: "5%" }, { v: 10, label: "10%" },
      ]}
      yLabel=""
      target={{ value: 8, label: "target 8%" }}
      series={[
        { year: 2010, value: 7.4 }, { year: 2012, value: 7.1 },
        { year: 2014, value: 6.2 }, { year: 2016, value: 5.8 },
        { year: 2018, value: 5.3 }, { year: 2020, value: 4.6 },
        { year: 2022, value: 4.1 }, { year: 2024, value: 3.9 },
      ]}
    />,
    source: <Source>MoD budget papers · 2024</Source>,
  }} />
);

const StackRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Where the defence rupee goes.</Title>
      <Sub>Share of capital outlay by head · FY 2024–25</Sub>
    </>,
    chart: <Stack
      unit="%" total={100}
      rows={[
        { label: "Army",     segments: [
          { name: "Salary",  value: 52 },
          { name: "Capital", value: 18, accent: true },
          { name: "Stores",  value: 20 },
          { name: "Works",   value: 10 },
        ]},
        { label: "Navy",     segments: [
          { name: "Salary",  value: 35 },
          { name: "Capital", value: 42, accent: true },
          { name: "Stores",  value: 16 },
          { name: "Works",   value: 7 },
        ]},
        { label: "Air Force",segments: [
          { name: "Salary",  value: 30 },
          { name: "Capital", value: 48, accent: true },
          { name: "Stores",  value: 16 },
          { name: "Works",   value: 6 },
        ]},
        { label: "DRDO",     segments: [
          { name: "Salary",  value: 46 },
          { name: "Capital", value: 14, accent: true },
          { name: "Stores",  value: 34 },
          { name: "Works",   value: 6 },
        ]},
      ]}
    />,
    source: <Source>MoD · demand for grants · 2024</Source>,
  }} />
);

const BulletRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Delivered against what was promised.</Title>
      <Sub>Actual handover vs sanctioned target · selected programmes</Sub>
    </>,
    chart: <Bullet
      rows={[
        { label: "Tejas Mk1A · airframes",  actual: 12,  target: 40,  unit: "" },
        { label: "K9 Vajra · SP howitzers", actual: 100, target: 100, unit: "" },
        { label: "Arjun Mk1A · tanks",      actual: 4,   target: 118, unit: "" },
        { label: "Submarines · P-75",       actual: 5,   target: 6,   unit: "" },
      ]}
    />,
    source: <Source>PIB · MoD releases · 2024</Source>,
  }} />
);

const HeatmapRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>A decade of slipped milestones.</Title>
      <Sub>Programme status by year · planned · delayed · delivered</Sub>
    </>,
    chart: <Heatmap
      cols={["'15","'16","'17","'18","'19","'20","'21","'22","'23","'24"]}
      rows={[
        { label: "Tejas Mk1A",  cells: ["plan","plan","plan","plan","delay","delay","delay","delay","delay","ship"] },
        { label: "Tejas Mk2",   cells: ["none","none","plan","plan","plan","plan","delay","delay","delay","delay"] },
        { label: "AMCA",        cells: ["none","none","none","plan","plan","plan","plan","delay","delay","delay"] },
        { label: "Arjun Mk1A",  cells: ["none","plan","plan","plan","plan","delay","delay","delay","ship","ship"] },
        { label: "Rafale",      cells: ["none","plan","plan","plan","plan","ship","ship","ship","ship","ship"] },
        { label: "S-400",       cells: ["none","none","plan","plan","plan","plan","delay","ship","ship","ship"] },
      ]}
    />,
    source: <Source>MoD · open-source trackers · 2024</Source>,
  }} />
);

const LollipopRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Years from sanction to first flight.</Title>
      <Sub>Indigenous combat aircraft programmes · development lag</Sub>
    </>,
    chart: <Lollipop
      axisMax={35} unit=" yrs"
      items={[
        { name: "HF-24 Marut",  value: 12 },
        { name: "Tejas Mk1",    value: 22 },
        { name: "Tejas Mk1A",   value: 9 },
        { name: "Tejas Mk2",    value: 14, accent: true },
        { name: "AMCA (proj.)", value: 15 },
        { name: "Rafale (FR)",  value: 6 },
        { name: "F-35 (US)",    value: 11 },
      ]}
    />,
    source: <Source>HAL · DRDO · Dassault · Lockheed · 2024</Source>,
  }} />
);

const Root: React.FC = () => (
  <>
    <Composition id="Area"     component={AreaRecipe}     width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Stack"    component={StackRecipe}    width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Bullet"   component={BulletRecipe}   width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Heatmap"  component={HeatmapRecipe}  width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Lollipop" component={LollipopRecipe} width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
