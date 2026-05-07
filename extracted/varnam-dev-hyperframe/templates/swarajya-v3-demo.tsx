/**
 * swarajya-v3-demo.tsx — Matte cream / coral PT Serif identity.
 *
 * Spec tokens:
 *   background: #F2EDE7
 *   headline:   PT Serif Bold 80px #DC7070
 *   body:       PT Serif Regular 40px #202020
 *   photo border: #DC7070
 *
 * Render:
 *   npx remotion still swarajya-v3-demo.tsx Chapter  out/v3-chapter.png
 *   npx remotion still swarajya-v3-demo.tsx StatDual out/v3-stat-dual.png
 *   npx remotion still swarajya-v3-demo.tsx Verdict  out/v3-verdict.png
 *   npx remotion still swarajya-v3-demo.tsx Evidence out/v3-evidence.png
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

// Tokens
const HEADLINE: React.CSSProperties = {
  fontFamily: PT,
  fontWeight: 700,
  fontSize: 80,
  color: CORAL,
  lineHeight: 1.1,
};

const BODY: React.CSSProperties = {
  fontFamily: PT,
  fontWeight: 400,
  fontSize: 40,
  color: INK,
  lineHeight: 1.3,
};

const LABEL: React.CSSProperties = {
  ...BODY,
  letterSpacing: 6,
  textTransform: "uppercase",
};

// ───────────────────────────── Chapter ─────────────────────────────

const Chapter: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Naval Aviation · 2026
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 240,
        width: 1680,
        height: 1,
        background: INK,
        opacity: 0.15,
      }}
    />
    <div style={{ position: "absolute", left: 120, top: 360, ...BODY, color: INK }}>
      Chapter one
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 440,
        ...HEADLINE,
        fontFamily: FR,
      }}
    >
      The carrier with no plane.
    </div>
  </AbsoluteFill>
);

// ───────────────────────────── Stat Frame ─────────────────────────────

const StatDual: React.FC = () => {
  const cell = (value: string, label: string, leftPct: number) => (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}
    >
      <div style={{ ...HEADLINE, fontSize: 80 }}>{value}</div>
      <div style={{ ...LABEL, opacity: 0.9, marginTop: 24 }}>{label}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 160,
          ...LABEL,
          opacity: 0.5,
        }}
      >
        Indigenous fighter capability
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 240,
          width: 1680,
          height: 1,
          background: INK,
          opacity: 0.15,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 1.5,
          height: 240,
          background: INK,
          opacity: 0.2,
        }}
      />
      {cell("Two", "Carriers · commissioned", 28)}
      {cell("Zero", "Indigenous jets · flying off them", 72)}
      <div style={{ position: "absolute", left: 120, bottom: 200, ...BODY, opacity: 0.5 }}>
        Ministry of Defence · 2025
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── Evidence ─────────────────────────────

const Evidence: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 320,
        width: 3,
        height: 440,
        background: CORAL,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 180,
        top: 340,
        right: 400,
        ...BODY,
        fontSize: 48,
        lineHeight: 1.4,
        color: INK,
      }}
    >
      Tejas Mk2 naval variant operational by 2032, contingent on engine
      integration.
    </div>
    <div
      style={{
        position: "absolute",
        left: 180,
        top: 620,
        ...BODY,
        fontSize: 28,
        opacity: 0.5,
      }}
    >
      HAL · Ministry of Defence · 2025
    </div>
  </AbsoluteFill>
);

// ───────────────────────────── Verdict ─────────────────────────────

const Verdict: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 160,
        ...LABEL,
        opacity: 0.5,
      }}
    >
      The question
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 240,
        width: 1680,
        height: 1,
        background: INK,
        opacity: 0.15,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 380,
        ...HEADLINE,
        color: INK,
      }}
    >
      Can you call it yours
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 500,
        ...HEADLINE,
        fontFamily: FR,
        fontStyle: "italic",
      }}
    >
      if the plane isn't?
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 700,
        ...BODY,
        opacity: 0.7,
      }}
    >
      The steel is ours. The sovereignty isn't.
    </div>
  </AbsoluteFill>
);

// ───────────────────────────── Bengal Curve (line chart) ─────────────────────────────

const BengalCurve: React.FC = () => {
  // IAF squadron strength, 2001–2024. Declining.
  const data = [
    { x: 2001, y: 39 },
    { x: 2004, y: 39 },
    { x: 2007, y: 38 },
    { x: 2010, y: 36 },
    { x: 2013, y: 34 },
    { x: 2016, y: 33 },
    { x: 2019, y: 32 },
    { x: 2022, y: 31 },
    { x: 2024, y: 31 },
  ];

  const PLOT = { x0: 240, y0: 520, x1: 1680, y1: 860 };
  const xMin = 2001;
  const xMax = 2024;
  const yMin = 28;
  const yMax = 42;
  const sx = (x: number) => PLOT.x0 + ((x - xMin) / (xMax - xMin)) * (PLOT.x1 - PLOT.x0);
  const sy = (y: number) => PLOT.y1 - ((y - yMin) / (yMax - yMin)) * (PLOT.y1 - PLOT.y0);

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x)} ${sy(d.y)}`)
    .join(" ");

  const first = data[0];
  const last = data[data.length - 1];

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
        Indian Air Force · squadrons
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 240,
          width: 1680,
          height: 1,
          background: INK,
          opacity: 0.15,
        }}
      />
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {/* axis — minimal, only the baseline */}
        <line
          x1={PLOT.x0}
          y1={PLOT.y1}
          x2={PLOT.x1}
          y2={PLOT.y1}
          stroke={INK}
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        {/* curve */}
        <path
          d={path}
          fill="none"
          stroke={CORAL}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* endpoints */}
        <circle
          cx={sx(first.x)}
          cy={sy(first.y)}
          r={14}
          fill={BG}
          stroke={CORAL}
          strokeWidth={3}
        />
        <circle
          cx={sx(last.x)}
          cy={sy(last.y)}
          r={14}
          fill={BG}
          stroke={CORAL}
          strokeWidth={3}
        />
      </svg>

      {/* endpoint labels */}
      <div
        style={{
          position: "absolute",
          left: sx(first.x) - 60,
          top: sy(first.y) - 110,
          ...BODY,
          fontWeight: 700,
          color: CORAL,
        }}
      >
        39
      </div>
      <div
        style={{
          position: "absolute",
          left: sx(first.x) - 70,
          top: sy(first.y) - 60,
          ...BODY,
          fontSize: 28,
          color: INK,
          opacity: 0.5,
        }}
      >
        2001
      </div>
      <div
        style={{
          position: "absolute",
          left: sx(last.x) - 40,
          top: sy(last.y) - 110,
          ...BODY,
          fontWeight: 700,
          color: CORAL,
        }}
      >
        31
      </div>
      <div
        style={{
          position: "absolute",
          left: sx(last.x) - 50,
          top: sy(last.y) + 30,
          ...BODY,
          fontSize: 28,
          color: INK,
          opacity: 0.5,
        }}
      >
        2024
      </div>

      <div style={{ position: "absolute", right: 120, bottom: 80, ...BODY, opacity: 0.5, fontSize: 28 }}>
        IISS Military Balance · 2024
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── Floating Data Lines ─────────────────────────────

const DataLines: React.FC = () => {
  // Two trajectories, 2013–2032.
  // Carriers commissioned: step function — 1 in 2013, 2 in 2022.
  // Indigenous naval jets: flat at 0 until 2032.
  const carriers = [
    { x: 2013, y: 1 },
    { x: 2022, y: 1 },
    { x: 2022, y: 2 },
    { x: 2032, y: 2 },
  ];

  const PLOT = { x0: 240, y0: 440, x1: 1680, y1: 780 };
  const xMin = 2013;
  const xMax = 2032;
  const yMin = -0.4;
  const yMax = 2.6;
  const sx = (x: number) => PLOT.x0 + ((x - xMin) / (xMax - xMin)) * (PLOT.x1 - PLOT.x0);
  const sy = (y: number) => PLOT.y1 - ((y - yMin) / (yMax - yMin)) * (PLOT.y1 - PLOT.y0);
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x)} ${sy(d.y)}`).join(" ");

  const marker = (year: number, label: string, sublabel: string) => (
    <>
      <div
        style={{
          position: "absolute",
          left: sx(year),
          top: PLOT.y1 + 10,
          width: 1,
          height: 16,
          background: INK,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: sx(year) - 140,
          top: PLOT.y1 + 40,
          width: 280,
          textAlign: "center",
          ...BODY,
          fontSize: 28,
          color: INK,
          opacity: 0.7,
          lineHeight: 1.2,
        }}
      >
        {label}
        <div style={{ opacity: 0.6, fontSize: 22, marginTop: 4 }}>{sublabel}</div>
      </div>
    </>
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
        Carrier readiness · 2013 – 2032
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 240,
          width: 1680,
          height: 1,
          background: INK,
          opacity: 0.15,
        }}
      />
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {/* Carriers — coral solid */}
        <path
          d={toPath(carriers)}
          fill="none"
          stroke={CORAL}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      </svg>

      {/* inline label on the line */}
      <div
        style={{
          position: "absolute",
          left: sx(2017),
          top: sy(1) - 56,
          ...BODY,
          fontStyle: "italic",
          color: CORAL,
        }}
      >
        Carriers commissioned
      </div>

      {marker(2013, "Vikramaditya", "")}
      {marker(2022, "Vikrant", "")}

      <div style={{ position: "absolute", right: 120, bottom: 80, ...BODY, opacity: 0.5, fontSize: 28 }}>
        HAL · Ministry of Defence · 2025
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────── Register ─────────────────────────────

const Root: React.FC = () => (
  <>
    <Composition id="Chapter" component={Chapter} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="StatDual" component={StatDual} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Evidence" component={Evidence} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Verdict" component={Verdict} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="BengalCurve" component={BengalCurve} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="DataLines" component={DataLines} width={W} height={H} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
