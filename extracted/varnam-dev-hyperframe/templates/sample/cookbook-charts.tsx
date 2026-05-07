/**
 * cookbook-charts.tsx — five chart recipes built on the same system.
 *
 * Each chart is an atom that owns its own internal layout. Recipes drop
 * the chart into a Canvas body slot alongside eyebrow / title / source.
 *
 * Callsite contract: content only. No coordinates, no sizes, no colors.
 *
 *   for id in Ranked Dumbbell Slope Waffle Scatter; do
 *     npx remotion still sample/cookbook-charts.tsx $id out/ck-$id.png
 *   done
 */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: FR } = loadFraunces();

// ─── Tokens + atoms (mirror cookbook.tsx; would import in production) ───

const T = {
  bg: "#F2EDE7", coral: "#DC7070", ink: "#202020",
  font: { body: PT, display: FR },
  size: { eyebrow: 40, body: 40, headline: 64, caption: 28, tick: 22 },
  canvas: { w: 1920, h: 1080, margin: 120, reserveBottom: 80 },
  space: { xs: 12, s: 24, m: 40, l: 64, xl: 96 },
  lim: { eyebrow: 48, title: 68, sub: 80, label: 32, source: 60 },
};

const check = (s: string | undefined, max: number, where: string) => {
  if (s && s.length > max) throw new Error(`[${where}] ${s.length}/${max}: "${s}"`);
};

const Eyebrow: React.FC<{ children: string }> = ({ children }) => {
  check(children, T.lim.eyebrow, "Eyebrow");
  return <div style={{
    fontFamily: T.font.body, fontSize: T.size.eyebrow, letterSpacing: 6,
    textTransform: "uppercase", color: T.ink, opacity: 0.5, lineHeight: 1.2,
  }}>{children}</div>;
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

// ─── Canvas ────────────────────────────────────────────────────

type CanvasSlots = {
  // Running head (eyebrow + rule) is OPT-IN. Use only at chapter breaks
  // or context shifts. A chart's own title is almost always enough.
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  chart: React.ReactNode;
  source?: React.ReactNode;
};

const SwarajyaPage: React.FC<{ slots: CanvasSlots }> = ({ slots }) => (
  <AbsoluteFill style={{
    background: T.bg,
    padding: `${T.canvas.margin}px ${T.canvas.margin}px ${T.canvas.reserveBottom}px`,
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    rowGap: T.space.l,
  }}>
    <div style={{ display: "flex", flexDirection: "column", gap: T.space.s }}>
      {slots.eyebrow ? (
        <>
          {slots.eyebrow}
          <Rule />
        </>
      ) : null}
      {slots.title}
    </div>
    <div style={{ minHeight: 0, display: "flex" }}>{slots.chart}</div>
    <div style={{ textAlign: "right" }}>{slots.source}</div>
  </AbsoluteFill>
);

// ─── Chart atoms ───────────────────────────────────────────────

// 1. RankedBar
const RankedBar: React.FC<{
  data: { name: string; value: number; highlight?: boolean }[];
  valueFormat?: (v: number) => string;
}> = ({ data, valueFormat = (v) => String(v) }) => {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((d) => d.value));
  const LABEL_COL = 300;
  const VALUE_COL = 140;
  return (
    <div style={{
      flex: 1, display: "grid",
      gridTemplateRows: `repeat(${sorted.length}, 1fr)`,
      rowGap: T.space.xs, fontFamily: T.font.body,
    }}>
      {sorted.map((d) => {
        check(d.name, 24, "RankedBar.name");
        const pct = d.value / max;
        return (
          <div key={d.name} style={{
            display: "grid",
            gridTemplateColumns: `${LABEL_COL}px 1fr ${VALUE_COL}px`,
            alignItems: "center", gap: T.space.m,
          }}>
            <div style={{
              textAlign: "right", fontSize: 30,
              color: T.ink, opacity: d.highlight ? 1 : 0.6,
              fontWeight: d.highlight ? 700 : 400,
            }}>{d.name}</div>
            <div style={{
              height: 28, width: `${pct * 100}%`,
              background: d.highlight ? T.coral : T.ink,
              opacity: d.highlight ? 1 : 0.25,
            }} />
            <div style={{
              fontSize: 30,
              color: d.highlight ? T.coral : T.ink,
              opacity: d.highlight ? 1 : 0.7,
              fontWeight: d.highlight ? 700 : 400,
            }}>{valueFormat(d.value)}</div>
          </div>
        );
      })}
    </div>
  );
};

// 2. Dumbbell
const Dumbbell: React.FC<{
  rows: { label: string; from: number; to: number; dim?: boolean }[];
  axisMax: number;
  fromLabel: string;
  toLabel: string;
}> = ({ rows, axisMax, fromLabel, toLabel }) => {
  const LABEL_COL = 320;
  return (
    <div style={{
      flex: 1, display: "grid",
      gridTemplateColumns: `${LABEL_COL}px 1fr`,
      gridTemplateRows: "auto 1fr auto",
      rowGap: T.space.s, columnGap: T.space.m, fontFamily: T.font.body,
    }}>
      {/* legend row */}
      <div />
      <div style={{ display: "flex", gap: T.space.l, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            width: 16, height: 16, border: `2px solid ${T.ink}`,
            borderRadius: 16, background: T.bg,
          }} />
          <span style={{ fontSize: 24, opacity: 0.7 }}>{fromLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 16, height: 16, background: T.coral, borderRadius: 16 }} />
          <span style={{ fontSize: 24, color: T.coral, fontWeight: 700 }}>{toLabel}</span>
        </div>
      </div>
      {/* row grid */}
      <div style={{
        gridColumn: "1", gridRow: "2",
        display: "grid", gridTemplateRows: `repeat(${rows.length}, 1fr)`,
        rowGap: T.space.xs,
      }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            fontSize: 26, color: T.ink,
            opacity: r.dim ? 0.45 : 0.85, fontStyle: r.dim ? "italic" : "normal",
          }}>{r.label}</div>
        ))}
      </div>
      <div style={{
        gridColumn: "2", gridRow: "2", position: "relative",
      }}>
        {/* ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} style={{
            position: "absolute", left: `${t * 100}%`, top: 0, bottom: 0,
            width: 1, background: T.ink, opacity: 0.08,
          }} />
        ))}
        <div style={{
          display: "grid", gridTemplateRows: `repeat(${rows.length}, 1fr)`,
          rowGap: T.space.xs, height: "100%",
        }}>
          {rows.map((r) => {
            const a = (r.from / axisMax) * 100;
            const b = (r.to / axisMax) * 100;
            const left = Math.min(a, b);
            const width = Math.abs(b - a);
            return (
              <div key={r.label} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{
                  position: "absolute", left: `${left}%`, width: `${width}%`,
                  height: 2, background: T.ink, opacity: 0.25,
                }} />
                <div style={{
                  position: "absolute", left: `calc(${a}% - 10px)`,
                  width: 20, height: 20, borderRadius: 20,
                  border: `2px solid ${T.ink}`, background: T.bg,
                }} />
                <div style={{
                  position: "absolute", left: `calc(${b}% - 10px)`,
                  width: 20, height: 20, borderRadius: 20,
                  background: T.coral,
                }} />
              </div>
            );
          })}
        </div>
      </div>
      {/* axis labels */}
      <div />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} style={{ fontSize: 22, opacity: 0.4 }}>
            {Math.round(t * axisMax)}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Slope (two-column)
const Slope: React.FC<{
  items: { label: string; left: number; right: number; accent?: boolean }[];
  leftLabel: string;
  rightLabel: string;
  domain: [number, number];
}> = ({ items, leftLabel, rightLabel, domain }) => {
  const [dMin, dMax] = domain;
  const y = (v: number) => 100 * (1 - (v - dMin) / (dMax - dMin));
  return (
    <div style={{
      flex: 1, display: "grid",
      gridTemplateColumns: "1fr 520px 1fr",
      columnGap: T.space.m, fontFamily: T.font.body,
    }}>
      <div style={{ textAlign: "right", fontSize: 24, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase" }}>
        {leftLabel}
      </div>
      <div />
      <div style={{ fontSize: 24, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase" }}>
        {rightLabel}
      </div>

      <div style={{ position: "relative" }}>
        {items.map((it) => (
          <div key={it.label} style={{
            position: "absolute", top: `${y(it.left)}%`,
            right: 0, transform: "translateY(-50%)",
            fontSize: 28, color: it.accent ? T.coral : T.ink,
            opacity: it.accent ? 1 : 0.65, fontWeight: it.accent ? 700 : 400,
          }}>{it.left}</div>
        ))}
      </div>

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ overflow: "visible" }}>
        {items.map((it) => (
          <line key={it.label}
            x1={0} y1={y(it.left)}
            x2={100} y2={y(it.right)}
            stroke={it.accent ? T.coral : T.ink}
            strokeOpacity={it.accent ? 1 : 0.3}
            strokeWidth={it.accent ? 0.6 : 0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {items.map((it) => (
          <React.Fragment key={it.label + "dots"}>
            <circle cx={0} cy={y(it.left)} r={1.2}
              fill={it.accent ? T.coral : T.ink} opacity={it.accent ? 1 : 0.4}
              vectorEffect="non-scaling-stroke" />
            <circle cx={100} cy={y(it.right)} r={1.2}
              fill={it.accent ? T.coral : T.ink} opacity={it.accent ? 1 : 0.4}
              vectorEffect="non-scaling-stroke" />
          </React.Fragment>
        ))}
      </svg>

      <div style={{ position: "relative" }}>
        {items.map((it) => (
          <div key={it.label} style={{
            position: "absolute", top: `${y(it.right)}%`,
            left: 0, transform: "translateY(-50%)",
            display: "flex", alignItems: "center", gap: T.space.s,
          }}>
            <div style={{
              fontSize: 28, color: it.accent ? T.coral : T.ink,
              opacity: it.accent ? 1 : 0.65, fontWeight: it.accent ? 700 : 400,
            }}>{it.right}</div>
            <div style={{
              fontSize: 24, color: it.accent ? T.coral : T.ink,
              opacity: it.accent ? 1 : 0.7, fontWeight: it.accent ? 700 : 400,
            }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Waffle
const Waffle: React.FC<{
  fillPct: number; fillLabel: string; emptyLabel: string;
}> = ({ fillPct, fillLabel, emptyLabel }) => {
  const ROWS = 10, COLS = 10;
  const total = ROWS * COLS;
  const filled = Math.round((fillPct / 100) * total);
  return (
    <div style={{
      flex: 1, display: "grid",
      gridTemplateColumns: "auto 1fr", columnGap: T.space.xl,
      alignItems: "center", fontFamily: T.font.body,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 42px)`,
        gridTemplateRows: `repeat(${ROWS}, 42px)`,
        gap: 6,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          // Fill from bottom-left
          const row = ROWS - 1 - Math.floor(i / COLS);
          const col = i % COLS;
          const position = row * COLS + col;
          const isFilled = position < filled;
          return (
            <div key={i} style={{
              background: isFilled ? T.coral : T.ink,
              opacity: isFilled ? 1 : 0.18,
            }} />
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: T.space.l }}>
        <div>
          <div style={{
            fontFamily: T.font.display, fontWeight: 700, fontSize: 160,
            color: T.coral, lineHeight: 1, letterSpacing: -4,
          }}>{fillPct}</div>
          <div style={{
            marginTop: 8, fontSize: 28, color: T.coral, maxWidth: 520,
          }}>{fillLabel}</div>
        </div>
        <div>
          <div style={{
            fontFamily: T.font.display, fontWeight: 700, fontSize: 120,
            color: T.ink, opacity: 0.5, lineHeight: 1, letterSpacing: -3,
          }}>{100 - fillPct}</div>
          <div style={{
            marginTop: 8, fontSize: 28, color: T.ink, opacity: 0.55, maxWidth: 520,
          }}>{emptyLabel}</div>
        </div>
      </div>
    </div>
  );
};

// 5. Scatter
const Scatter: React.FC<{
  points: { name: string; x: number; y: number; accent?: boolean }[];
  xDomain: [number, number];
  yDomain: [number, number];
  xAxisLabel: string;
  yAxisLabel: string;
  xTicks: { v: number; label: string }[];
  yTicks: { v: number; label: string }[];
  reference?: { y: number; label: string };
}> = ({ points, xDomain, yDomain, xAxisLabel, yAxisLabel, xTicks, yTicks, reference }) => {
  const [xMin, xMax] = xDomain;
  const [yMin, yMax] = yDomain;
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * 100;
  const py = (y: number) => 100 * (1 - (y - yMin) / (yMax - yMin));
  return (
    <div style={{
      flex: 1, display: "grid",
      gridTemplateColumns: "120px 1fr",
      gridTemplateRows: "1fr 60px",
      fontFamily: T.font.body, gap: T.space.s,
    }}>
      {/* y-axis */}
      <div style={{ position: "relative" }}>
        {yTicks.map((t) => (
          <div key={t.v} style={{
            position: "absolute", right: 16, top: `${py(t.v)}%`,
            transform: "translateY(-50%)", fontSize: 22, opacity: 0.5,
          }}>{t.label}</div>
        ))}
      </div>
      {/* plot */}
      <div style={{ position: "relative" }}>
        {/* axes */}
        <div style={{
          position: "absolute", left: 0, bottom: 0, width: "100%", height: 1,
          background: T.ink, opacity: 0.25,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 1,
          background: T.ink, opacity: 0.25,
        }} />
        {reference && (
          <>
            <div style={{
              position: "absolute", left: 0, right: 0, top: `${py(reference.y)}%`,
              borderTop: `1px dashed ${T.ink}`, opacity: 0.25,
            }} />
            <div style={{
              position: "absolute", left: 12, top: `calc(${py(reference.y)}% - 28px)`,
              fontSize: 22, opacity: 0.5, fontStyle: "italic",
            }}>{reference.label}</div>
          </>
        )}
        {points.map((p) => {
          check(p.name, 24, "Scatter.name");
          const isA = p.accent;
          return (
            <React.Fragment key={p.name}>
              <div style={{
                position: "absolute",
                left: `${px(p.x)}%`, top: `${py(p.y)}%`,
                transform: "translate(-50%,-50%)",
                width: isA ? 26 : 16, height: isA ? 26 : 16,
                borderRadius: "50%",
                background: isA ? T.coral : T.ink,
                opacity: isA ? 1 : 0.55,
              }} />
              <div style={{
                position: "absolute",
                left: `calc(${px(p.x)}% + ${isA ? 22 : 14}px)`,
                top: `calc(${py(p.y)}% - 12px)`,
                fontSize: isA ? 28 : 22,
                color: isA ? T.coral : T.ink,
                opacity: isA ? 1 : 0.7,
                fontWeight: isA ? 700 : 400, whiteSpace: "nowrap",
              }}>{p.name}</div>
            </React.Fragment>
          );
        })}
      </div>
      {/* x-axis label row */}
      <div style={{
        textAlign: "right", paddingRight: 16,
        fontSize: 22, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase",
      }}>{yAxisLabel}</div>
      <div style={{ position: "relative" }}>
        {xTicks.map((t) => (
          <div key={t.v} style={{
            position: "absolute", left: `${px(t.v)}%`,
            transform: "translateX(-50%)", fontSize: 22, opacity: 0.5,
          }}>{t.label}</div>
        ))}
        <div style={{
          position: "absolute", right: 0, bottom: 0,
          fontSize: 22, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase",
        }}>{xAxisLabel}</div>
      </div>
    </div>
  );
};

// ─── Recipes ────────────────────────────────────────────────────

const RankedRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>India ranks sixth among fighter fleets.</Title>
      <Sub>Operational squadron count by nation · 2024</Sub>
    </>,
    chart: <RankedBar
      data={[
        { name: "United States",  value: 75 },
        { name: "China",          value: 68 },
        { name: "Russia",         value: 54 },
        { name: "France",         value: 38 },
        { name: "United Kingdom", value: 32 },
        { name: "India",          value: 31, highlight: true },
      ]}
    />,
    source: <Source>IISS Military Balance · 2024</Source>,
  }} />
);

const DumbbellRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>What is sanctioned. What is flying.</Title>
      <Sub>Squadron strength by aircraft type · 2024</Sub>
    </>,
    chart: <Dumbbell
      axisMax={16}
      fromLabel="Sanctioned"
      toLabel="Actual"
      rows={[
        { label: "Sukhoi-30 MKI", from: 14, to: 12 },
        { label: "Tejas Mk1/1A",  from: 6,  to: 2 },
        { label: "Jaguar",        from: 6,  to: 4 },
        { label: "MiG-29",        from: 3,  to: 3 },
        { label: "Rafale",        from: 2,  to: 2 },
        { label: "MiG-21",        from: 6,  to: 0, dim: true },
      ]}
    />,
    source: <Source>IAF · 2024</Source>,
  }} />
);

const SlopeRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Every programme slipped.</Title>
      <Sub>Planned first-flight year versus actual or current projection</Sub>
    </>,
    chart: <Slope
      leftLabel="Planned"
      rightLabel="Actual"
      domain={[1950, 2040]}
      items={[
        { label: "HF-24 Marut",   left: 1955, right: 1967 },
        { label: "Tejas Mk1",     left: 1994, right: 2016 },
        { label: "Tejas Mk1A",    left: 2016, right: 2025 },
        { label: "Tejas Mk2",     left: 2022, right: 2032, accent: true },
        { label: "AMCA",          left: 2025, right: 2036 },
      ]}
    />,
    source: <Source>HAL / MoD · 2025</Source>,
  }} />
);

const WaffleRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Twenty-two of every hundred are ours.</Title>
      <Sub>Share of front-line combat aircraft designed in India · illustrative</Sub>
    </>,
    chart: <Waffle
      fillPct={22}
      fillLabel="designed and built in India — Tejas and HJT lineage"
      emptyLabel="imported airframes: Sukhoi, Rafale, Mirage, MiG, Jaguar"
    />,
    source: <Source>MoD public order books · 2025</Source>,
  }} />
);

const ScatterRecipe: React.FC = () => (
  <SwarajyaPage slots={{
    title: <>
      <Title>Big economy. Borrowed air force.</Title>
      <Sub>GDP vs indigenous share of front-line combat aircraft</Sub>
    </>,
    chart: <Scatter
      xDomain={[0, 30]}
      yDomain={[0, 100]}
      xAxisLabel="GDP (USD trillion)"
      yAxisLabel="indigenous share"
      xTicks={[{ v: 0, label: "0" }, { v: 15, label: "$15T" }, { v: 30, label: "$30T" }]}
      yTicks={[{ v: 0, label: "0%" }, { v: 50, label: "50%" }, { v: 100, label: "100%" }]}
      reference={{ y: 50, label: "50% indigenous" }}
      points={[
        { name: "United States", x: 27.4, y: 96 },
        { name: "China",         x: 17.8, y: 88 },
        { name: "France",        x: 3.0,  y: 92 },
        { name: "UK",            x: 3.4,  y: 74 },
        { name: "Russia",        x: 2.0,  y: 99 },
        { name: "South Korea",   x: 1.7,  y: 42 },
        { name: "Turkey",        x: 1.1,  y: 38 },
        { name: "India",         x: 3.7,  y: 22, accent: true },
      ]}
    />,
    source: <Source>IMF · IISS · 2024</Source>,
  }} />
);

const Root: React.FC = () => (
  <>
    <Composition id="Ranked"   component={RankedRecipe}   width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Dumbbell" component={DumbbellRecipe} width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Slope"    component={SlopeRecipe}    width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Waffle"   component={WaffleRecipe}   width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
    <Composition id="Scatter"  component={ScatterRecipe}  width={T.canvas.w} height={T.canvas.h} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
