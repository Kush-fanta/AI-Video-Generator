/**
 * swarajya-dataviz.tsx — Modern data viz. No eyebrow + rule header.
 * Cream / coral / ink, PT Serif + Fraunces.
 *
 *   for id in BarRanked Dumbbell Slope SmallMultiples Waffle Scatter; do
 *     npx remotion still swarajya-dataviz.tsx $id out/dv-$id.png
 *   done
 */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: FR } = loadFraunces();

const BG = "#F2EDE7";
const CORAL = "#DC7070";
const INK = "#202020";
const W = 1920;
const H = 1080;

const BODY: React.CSSProperties = { fontFamily: PT, fontWeight: 400, fontSize: 40, color: INK, lineHeight: 1.35 };

// ─── 1. Ranked horizontal bars ───
// Story integrated left, bars carry the proof.
const BarRanked: React.FC = () => {
  const data = [
    { name: "United States", val: 75,   note: "" },
    { name: "China",         val: 68,   note: "" },
    { name: "Russia",        val: 54,   note: "" },
    { name: "India",         val: 31,   note: "sanctioned: 42", accent: true },
    { name: "France",        val: 38,   note: "" },
    { name: "United Kingdom",val: 32,   note: "" },
  ].sort((a, b) => b.val - a.val);

  const max = 80;
  const BAR_X = 780;
  const BAR_W = 900;
  const ROW_H = 84;
  const TOP = 300;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 120, top: 180, width: 600,
        fontFamily: FR, fontWeight: 700, fontSize: 80, lineHeight: 1.05,
        color: INK,
      }}>
        Fighter squadrons, by nation.
      </div>
      <div style={{
        position: "absolute", left: 120, top: 400, width: 580,
        ...BODY, fontSize: 32, opacity: 0.7,
      }}>
        India's air force operates thirty-one squadrons against a sanctioned
        strength of forty-two — <span style={{ color: CORAL, fontWeight: 700 }}>eleven short</span>.
      </div>

      {data.map((d, i) => {
        const y = TOP + i * ROW_H;
        const w = (d.val / max) * BAR_W;
        const isIndia = d.accent;
        return (
          <React.Fragment key={d.name}>
            <div style={{
              position: "absolute", left: BAR_X - 280, top: y + 12, width: 260, textAlign: "right",
              ...BODY, fontSize: 28, color: INK, opacity: isIndia ? 1 : 0.6,
              fontWeight: isIndia ? 700 : 400,
            }}>
              {d.name}
            </div>
            <div style={{
              position: "absolute", left: BAR_X, top: y + 14,
              width: w, height: 32,
              background: isIndia ? CORAL : INK,
              opacity: isIndia ? 1 : 0.25,
            }} />
            <div style={{
              position: "absolute", left: BAR_X + w + 16, top: y + 12,
              ...BODY, fontSize: 28,
              color: isIndia ? CORAL : INK,
              opacity: isIndia ? 1 : 0.7,
              fontWeight: isIndia ? 700 : 400,
            }}>
              {d.val}
            </div>
            {d.note && (
              <div style={{
                position: "absolute", left: BAR_X + w + 80, top: y + 16,
                ...BODY, fontSize: 22, fontStyle: "italic", opacity: 0.5,
              }}>
                {d.note}
              </div>
            )}
          </React.Fragment>
        );
      })}
      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        IISS Military Balance · 2024
      </div>
    </AbsoluteFill>
  );
};

// ─── 2. Dumbbell (sanctioned vs actual) ───
const Dumbbell: React.FC = () => {
  const rows = [
    { label: "Sukhoi-30 MKI",   from: 14, to: 12 },
    { label: "Tejas Mk1/1A",    from: 6,  to: 2  },
    { label: "Mirage-2000",     from: 3,  to: 3  },
    { label: "Jaguar",          from: 6,  to: 4  },
    { label: "MiG-29",          from: 3,  to: 3  },
    { label: "MiG-21 (retired)",from: 6,  to: 0,  retire: true },
    { label: "Rafale",          from: 2,  to: 2  },
    { label: "Reserves",        from: 2,  to: 5  },
  ];

  const L = 520;
  const R = 1780;
  const W_SC = R - L;
  const max = 16;
  const sx = (v: number) => L + (v / max) * W_SC;
  const ROW_H = 66;
  const TOP = 260;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 120, top: 120, width: 1680,
        fontFamily: FR, fontWeight: 700, fontSize: 72, color: INK,
      }}>
        What's sanctioned, what's flying.
      </div>
      <div style={{
        position: "absolute", left: 120, top: 220, width: 1680,
        ...BODY, fontSize: 28, opacity: 0.6,
      }}>
        Indian Air Force · squadron strength by platform
      </div>

      {/* axis ticks */}
      {[0, 4, 8, 12, 16].map(v => (
        <React.Fragment key={v}>
          <div style={{
            position: "absolute", left: sx(v) - 0.5, top: TOP - 8, width: 1, height: ROW_H * rows.length + 8,
            background: INK, opacity: 0.08,
          }} />
          <div style={{
            position: "absolute", left: sx(v) - 16, top: TOP + ROW_H * rows.length + 16,
            ...BODY, fontSize: 22, opacity: 0.4,
          }}>
            {v}
          </div>
        </React.Fragment>
      ))}

      {rows.map((r, i) => {
        const y = TOP + i * ROW_H + ROW_H / 2;
        const a = sx(r.from);
        const b = sx(r.to);
        const left = Math.min(a, b);
        const width = Math.abs(b - a);
        return (
          <React.Fragment key={r.label}>
            <div style={{
              position: "absolute", left: 120, top: y - 18, width: 380, textAlign: "right",
              ...BODY, fontSize: 28, color: INK,
              opacity: r.retire ? 0.4 : 0.85,
              fontStyle: r.retire ? "italic" : "normal",
            }}>
              {r.label}
            </div>
            {/* connecting segment */}
            <div style={{
              position: "absolute", left, top: y - 1, width, height: 2,
              background: INK, opacity: 0.25,
            }} />
            {/* sanctioned dot (ink outline) */}
            <div style={{
              position: "absolute", left: a - 10, top: y - 10, width: 20, height: 20,
              border: `2px solid ${INK}`, borderRadius: 20, background: BG,
            }} />
            {/* actual dot (coral filled) */}
            <div style={{
              position: "absolute", left: b - 10, top: y - 10, width: 20, height: 20,
              background: CORAL, borderRadius: 20,
            }} />
          </React.Fragment>
        );
      })}

      {/* inline legend, integrated */}
      <div style={{
        position: "absolute", left: 520, top: TOP - 80, ...BODY, fontSize: 24,
      }}>
        <span style={{
          display: "inline-block", width: 16, height: 16, border: `2px solid ${INK}`,
          borderRadius: 16, verticalAlign: "middle", marginRight: 10, background: BG,
        }} />
        <span style={{ opacity: 0.7 }}>Sanctioned</span>
        <span style={{ marginLeft: 32 }}>
          <span style={{
            display: "inline-block", width: 16, height: 16, background: CORAL,
            borderRadius: 16, verticalAlign: "middle", marginRight: 10,
          }} />
          <span style={{ color: CORAL, fontWeight: 700 }}>Actual</span>
        </span>
      </div>

      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        IAF · 2024
      </div>
    </AbsoluteFill>
  );
};

// ─── 3. Slope chart — projected vs actual indigenous jet delivery dates ───
const Slope: React.FC = () => {
  const programs = [
    { name: "HF-24 Marut",     plan: 1955, real: 1967 },
    { name: "LCA Tejas Mk1",   plan: 1994, real: 2016 },
    { name: "Tejas Mk1A",      plan: 2016, real: 2025, pending: true },
    { name: "Tejas Mk2",       plan: 2022, real: 2032, pending: true, accent: true },
    { name: "AMCA",            plan: 2025, real: 2036, pending: true },
  ];

  const YEAR_L = 1950;
  const YEAR_R = 2040;
  const X_PLAN = 520;
  const X_REAL = 1560;
  const sx = (y: number, col: "plan" | "real") => {
    const t = (y - YEAR_L) / (YEAR_R - YEAR_L);
    return (col === "plan" ? X_PLAN : X_REAL) + 0 * t;
  };
  const sy = (y: number) => {
    const t = (y - YEAR_L) / (YEAR_R - YEAR_L);
    return 280 + t * 620;
  };

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 120, top: 120, width: 1680,
        fontFamily: FR, fontWeight: 700, fontSize: 72, color: INK,
      }}>
        Every Indian fighter programme has slipped.
      </div>
      <div style={{
        position: "absolute", left: 120, top: 220, ...BODY, fontSize: 28, opacity: 0.6,
      }}>
        Planned first-flight year → actual (or current projection)
      </div>

      {/* column headers */}
      <div style={{
        position: "absolute", left: X_PLAN - 80, top: 240, width: 160, textAlign: "center",
        ...BODY, fontSize: 22, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase",
      }}>
        Planned
      </div>
      <div style={{
        position: "absolute", left: X_REAL - 80, top: 240, width: 160, textAlign: "center",
        ...BODY, fontSize: 22, opacity: 0.4, letterSpacing: 3, textTransform: "uppercase",
      }}>
        Actual / projected
      </div>

      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {programs.map(p => {
          const stroke = p.accent ? CORAL : INK;
          const opacity = p.accent ? 1 : 0.3;
          const sw = p.accent ? 3 : 2;
          const dash = p.pending ? "6 8" : undefined;
          return (
            <line
              key={p.name}
              x1={X_PLAN} y1={sy(p.plan)}
              x2={X_REAL} y2={sy(p.real)}
              stroke={stroke}
              strokeOpacity={opacity}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
          );
        })}
        {programs.map(p => (
          <React.Fragment key={p.name + "dots"}>
            <circle cx={X_PLAN} cy={sy(p.plan)} r={8} fill={p.accent ? CORAL : INK} opacity={p.accent ? 1 : 0.4} />
            <circle cx={X_REAL} cy={sy(p.real)} r={8} fill={p.accent ? CORAL : INK} opacity={p.accent ? 1 : 0.4} />
          </React.Fragment>
        ))}
      </svg>

      {programs.map(p => (
        <React.Fragment key={p.name + "labels"}>
          {/* name (between columns) */}
          <div style={{
            position: "absolute",
            left: (X_PLAN + X_REAL) / 2 - 140, width: 280, textAlign: "center",
            top: (sy(p.plan) + sy(p.real)) / 2 - 34,
            ...BODY, fontSize: 26,
            color: p.accent ? CORAL : INK,
            opacity: p.accent ? 1 : 0.75,
            fontWeight: p.accent ? 700 : 400,
          }}>
            {p.name}
          </div>
          {/* plan year */}
          <div style={{
            position: "absolute", left: X_PLAN - 120, top: sy(p.plan) - 14, width: 80, textAlign: "right",
            ...BODY, fontSize: 26, opacity: p.accent ? 1 : 0.6,
            color: p.accent ? CORAL : INK,
            fontWeight: p.accent ? 700 : 400,
          }}>
            {p.plan}
          </div>
          {/* real year */}
          <div style={{
            position: "absolute", left: X_REAL + 40, top: sy(p.real) - 14, width: 140,
            ...BODY, fontSize: 26, opacity: p.accent ? 1 : 0.6,
            color: p.accent ? CORAL : INK,
            fontWeight: p.accent ? 700 : 400,
          }}>
            {p.real}{p.pending ? "*" : ""}
          </div>
        </React.Fragment>
      ))}

      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        * projection, as of 2025  ·  HAL / MoD
      </div>
    </AbsoluteFill>
  );
};

// ─── 4. Small multiples — four nations, carrier-to-jet ratio ───
const SmallMultiples: React.FC = () => {
  const nations = [
    { name: "United States", carriers: 11, jets: 11, pop: "F/A-18E, F-35C" },
    { name: "China",         carriers: 3,  jets: 3,  pop: "J-15, J-35" },
    { name: "United Kingdom",carriers: 2,  jets: 2,  pop: "F-35B" },
    { name: "India",         carriers: 2,  jets: 0,  pop: "(imported Rafale-M)", accent: true },
  ];

  const COLS = 4;
  const CELL_W = 400;
  const GAP = 40;
  const TOTAL_W = COLS * CELL_W + (COLS - 1) * GAP;
  const LEFT_START = (W - TOTAL_W) / 2;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 140, textAlign: "center",
        fontFamily: FR, fontWeight: 700, fontSize: 72, color: INK,
      }}>
        Who flies indigenous off their own deck?
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 240, textAlign: "center",
        ...BODY, fontSize: 28, opacity: 0.55,
      }}>
        Carriers in service · indigenous carrier-capable jets
      </div>

      {nations.map((n, i) => {
        const x = LEFT_START + i * (CELL_W + GAP);
        const isIndia = n.accent;
        return (
          <React.Fragment key={n.name}>
            <div style={{
              position: "absolute", left: x, top: 400, width: CELL_W, textAlign: "center",
              ...BODY, fontSize: 24, opacity: 0.6, letterSpacing: 3, textTransform: "uppercase",
              color: isIndia ? CORAL : INK,
              fontWeight: isIndia ? 700 : 400,
            }}>
              {n.name}
            </div>

            {/* carriers row of units */}
            <div style={{ position: "absolute", left: x, top: 480, width: CELL_W, textAlign: "center" }}>
              {Array.from({ length: n.carriers }).map((_, k) => (
                <span key={k} style={{
                  display: "inline-block", width: 28, height: 28, marginRight: 8,
                  background: INK, borderRadius: 4, opacity: 0.8,
                }} />
              ))}
            </div>
            <div style={{
              position: "absolute", left: x, top: 530, width: CELL_W, textAlign: "center",
              ...BODY, fontSize: 22, opacity: 0.5, fontStyle: "italic",
            }}>
              {n.carriers} carrier{n.carriers === 1 ? "" : "s"}
            </div>

            {/* jets row of units */}
            <div style={{ position: "absolute", left: x, top: 620, width: CELL_W, textAlign: "center" }}>
              {n.jets === 0 ? (
                <span style={{
                  display: "inline-block", width: 28, height: 28, borderRadius: 4,
                  border: `2px dashed ${INK}`, opacity: 0.3,
                }} />
              ) : (
                Array.from({ length: n.jets }).map((_, k) => (
                  <span key={k} style={{
                    display: "inline-block", width: 28, height: 28, marginRight: 8,
                    background: isIndia ? CORAL : CORAL, opacity: isIndia ? 1 : 1,
                    borderRadius: 4,
                  }} />
                ))
              )}
            </div>
            <div style={{
              position: "absolute", left: x, top: 670, width: CELL_W, textAlign: "center",
              ...BODY, fontSize: 22, opacity: 0.5, fontStyle: "italic",
              color: isIndia ? CORAL : INK,
              fontWeight: isIndia ? 700 : 400,
            }}>
              {n.jets === 0 ? "none indigenous" : `${n.jets} type${n.jets === 1 ? "" : "s"}`}
            </div>

            {/* typeline */}
            <div style={{
              position: "absolute", left: x, top: 760, width: CELL_W, textAlign: "center",
              ...BODY, fontSize: 24, opacity: 0.7,
              color: isIndia ? CORAL : INK,
            }}>
              {n.pop}
            </div>
          </React.Fragment>
        );
      })}

      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        IISS · service press offices · 2025
      </div>
    </AbsoluteFill>
  );
};

// ─── 5. Waffle (unit chart) ───
const Waffle: React.FC = () => {
  const ROWS = 10;
  const COLS = 10;
  const total = 100;
  const imported = 78; // illustrative
  const indigenous = 22;

  const CELL = 42;
  const GAP = 6;
  const START_X = 120;
  const START_Y = 320;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 120, top: 140, width: 1680,
        fontFamily: FR, fontWeight: 700, fontSize: 72, color: INK,
      }}>
        Seventy-eight of every hundred combat aircraft flew in by sea.
      </div>
      <div style={{
        position: "absolute", left: 120, top: 240, ...BODY, fontSize: 28, opacity: 0.6,
      }}>
        Share of IAF front-line fleet by origin of airframe · illustrative
      </div>

      {Array.from({ length: ROWS * COLS }).map((_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const isImported = i < imported;
        return (
          <div key={i} style={{
            position: "absolute",
            left: START_X + c * (CELL + GAP),
            top: START_Y + r * (CELL + GAP),
            width: CELL, height: CELL,
            background: isImported ? INK : CORAL,
            opacity: isImported ? 0.2 : 1,
          }} />
        );
      })}

      <div style={{
        position: "absolute", left: 720, top: START_Y,
        fontFamily: FR, fontWeight: 700, fontSize: 240, color: INK, opacity: 0.2, lineHeight: 1,
        letterSpacing: -8,
      }}>
        78
      </div>
      <div style={{
        position: "absolute", left: 720, top: START_Y + 260,
        ...BODY, fontSize: 28, color: INK, opacity: 0.6, width: 600,
      }}>
        platforms in service today that were designed somewhere else.
      </div>

      <div style={{
        position: "absolute", left: 720, top: START_Y + 420,
        fontFamily: FR, fontWeight: 700, fontSize: 160, color: CORAL, lineHeight: 1,
        letterSpacing: -6,
      }}>
        22
      </div>
      <div style={{
        position: "absolute", left: 720, top: START_Y + 600,
        ...BODY, fontSize: 28, color: CORAL, width: 600,
      }}>
        designed here. Every one of them, a Tejas or an HJT.
      </div>

      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        Figures illustrative · MoD public order books
      </div>
    </AbsoluteFill>
  );
};

// ─── 6. Scatter with annotation ───
const Scatter: React.FC = () => {
  // GDP (trillion USD) vs % of combat aircraft that is indigenous
  const pts = [
    { name: "United States", gdp: 27.4, ind: 96 },
    { name: "China",         gdp: 17.8, ind: 88 },
    { name: "France",        gdp: 3.0,  ind: 92 },
    { name: "UK",            gdp: 3.4,  ind: 74 },
    { name: "Russia",        gdp: 2.0,  ind: 99 },
    { name: "South Korea",   gdp: 1.7,  ind: 42 },
    { name: "Turkey",        gdp: 1.1,  ind: 38 },
    { name: "India",         gdp: 3.7,  ind: 22, accent: true },
  ];

  const PLOT = { x0: 320, y0: 280, x1: 1680, y1: 880 };
  const xMin = 0, xMax = 30;
  const yMin = 0, yMax = 100;
  const sx = (x: number) => PLOT.x0 + ((x - xMin) / (xMax - xMin)) * (PLOT.x1 - PLOT.x0);
  const sy = (y: number) => PLOT.y1 - ((y - yMin) / (yMax - yMin)) * (PLOT.y1 - PLOT.y0);

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
      <div style={{
        position: "absolute", left: 120, top: 120, width: 1680,
        fontFamily: FR, fontWeight: 700, fontSize: 72, color: INK,
      }}>
        Big economy. Borrowed air force.
      </div>
      <div style={{
        position: "absolute", left: 120, top: 220, ...BODY, fontSize: 28, opacity: 0.6,
      }}>
        GDP · indigenous share of front-line combat aircraft
      </div>

      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* axes */}
        <line x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x1} y2={PLOT.y1} stroke={INK} strokeOpacity={0.2} strokeWidth={1} />
        <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={PLOT.y1} stroke={INK} strokeOpacity={0.2} strokeWidth={1} />
        {/* dotted 50% reference */}
        <line
          x1={PLOT.x0} y1={sy(50)} x2={PLOT.x1} y2={sy(50)}
          stroke={INK} strokeOpacity={0.15} strokeWidth={1} strokeDasharray="4 6"
        />
        {/* annotation arrow from India to label */}
      </svg>

      {/* axis labels */}
      <div style={{
        position: "absolute", left: PLOT.x0, top: PLOT.y1 + 16, ...BODY, fontSize: 22, opacity: 0.5,
      }}>
        0
      </div>
      <div style={{
        position: "absolute", left: PLOT.x1 - 80, top: PLOT.y1 + 16, ...BODY, fontSize: 22, opacity: 0.5,
      }}>
        $30T
      </div>
      <div style={{
        position: "absolute", left: PLOT.x0 - 70, top: PLOT.y0 - 12, ...BODY, fontSize: 22, opacity: 0.5,
      }}>
        100%
      </div>
      <div style={{
        position: "absolute", left: PLOT.x0 - 40, top: PLOT.y1 - 12, ...BODY, fontSize: 22, opacity: 0.5,
      }}>
        0%
      </div>
      <div style={{
        position: "absolute", left: PLOT.x0 + 12, top: sy(50) - 28, ...BODY, fontSize: 20, opacity: 0.4, fontStyle: "italic",
      }}>
        50% indigenous
      </div>

      {/* points */}
      {pts.map(p => {
        const isIndia = p.accent;
        return (
          <React.Fragment key={p.name}>
            <div style={{
              position: "absolute",
              left: sx(p.gdp) - (isIndia ? 14 : 9),
              top: sy(p.ind) - (isIndia ? 14 : 9),
              width: isIndia ? 28 : 18,
              height: isIndia ? 28 : 18,
              borderRadius: "50%",
              background: isIndia ? CORAL : INK,
              opacity: isIndia ? 1 : 0.55,
            }} />
            <div style={{
              position: "absolute",
              left: sx(p.gdp) + (isIndia ? 24 : 16),
              top: sy(p.ind) - 12,
              ...BODY, fontSize: isIndia ? 28 : 22,
              color: isIndia ? CORAL : INK,
              opacity: isIndia ? 1 : 0.65,
              fontWeight: isIndia ? 700 : 400,
            }}>
              {p.name}
            </div>
          </React.Fragment>
        );
      })}

      <div style={{
        position: "absolute", right: 120, bottom: 60, ...BODY, fontSize: 22, opacity: 0.4,
      }}>
        IMF · IISS · 2024
      </div>
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="BarRanked"      component={BarRanked}      width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Dumbbell"       component={Dumbbell}       width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Slope"          component={Slope}          width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="SmallMultiples" component={SmallMultiples} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Waffle"         component={Waffle}         width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Scatter"        component={Scatter}        width={W} height={H} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
