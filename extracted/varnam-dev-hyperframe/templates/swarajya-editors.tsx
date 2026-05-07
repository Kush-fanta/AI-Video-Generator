/**
 * swarajya-editors.tsx — Same argument, five editorial hands.
 * Argument: India has two carriers and no indigenous jet.
 *
 * Render:
 *   for id in Minimalist Infographer Essayist Polemicist Archivist; do
 *     npx remotion still swarajya-editors.tsx $id out/ed-$id.png
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
  lineHeight: 1.35,
};
const LABEL: React.CSSProperties = {
  ...BODY,
  letterSpacing: 6,
  textTransform: "uppercase",
};

// ───────── 1. Minimalist ─────────
// One number. That's the piece.
const Minimalist: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Indigenous carrier jets
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: 340,
        fontFamily: FR,
        fontWeight: 700,
        fontSize: 560,
        lineHeight: 1,
        letterSpacing: -20,
        color: CORAL,
      }}
    >
      Zero.
    </div>
    <div style={{ position: "absolute", left: 120, bottom: 180, ...BODY, opacity: 0.6 }}>
      Two carriers in service.
    </div>
  </AbsoluteFill>
);

// ───────── 2. Infographer ─────────
// The chart is the argument.
const Infographer: React.FC = () => {
  const PLOT = { x0: 240, y0: 440, x1: 1680, y1: 780 };
  const xMin = 2013, xMax = 2032, yMin = -0.4, yMax = 2.6;
  const sx = (x: number) => PLOT.x0 + ((x - xMin) / (xMax - xMin)) * (PLOT.x1 - PLOT.x0);
  const sy = (y: number) => PLOT.y1 - ((y - yMin) / (yMax - yMin)) * (PLOT.y1 - PLOT.y0);
  const carriers = [
    { x: 2013, y: 1 }, { x: 2022, y: 1 }, { x: 2022, y: 2 }, { x: 2032, y: 2 },
  ];
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x)} ${sy(d.y)}`).join(" ");
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
        Carriers · 2013 – 2032
      </div>
      <div
        style={{
          position: "absolute",
          left: 120, top: 240, width: 1680, height: 1,
          background: INK, opacity: 0.15,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={toPath(carriers)} fill="none" stroke={CORAL} strokeWidth={3} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", left: sx(2025), top: sy(2) - 56,
        ...BODY, fontStyle: "italic", color: CORAL,
      }}>
        Two carriers.
      </div>
      <div style={{
        position: "absolute", left: sx(2018), top: sy(1) + 24,
        ...BODY, fontStyle: "italic", color: CORAL,
      }}>
        One carrier.
      </div>
      <div style={{
        position: "absolute", left: 120, top: sy(-0.2) + 40,
        ...BODY, fontSize: 32, opacity: 0.6,
      }}>
        Indigenous jets flying off them: zero.
      </div>
      <div style={{
        position: "absolute", right: 120, bottom: 80, ...BODY, opacity: 0.5, fontSize: 28,
      }}>
        Ministry of Defence · 2025
      </div>
    </AbsoluteFill>
  );
};

// ───────── 3. Essayist ─────────
// Paragraph. One coral clause.
const Essayist: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Notebook · on sovereignty
    </div>
    <div
      style={{
        position: "absolute",
        left: 240,
        right: 240,
        top: 320,
        fontFamily: PT,
        fontSize: 48,
        lineHeight: 1.5,
        color: INK,
        fontWeight: 400,
      }}
    >
      A nation can weld the hull, pour the deck, raise the mast, commission
      the ship twice over — and still hand the last decision of war{" "}
      <span style={{ color: CORAL, fontFamily: FR, fontWeight: 700, fontStyle: "italic" }}>
        to someone else's engine.
      </span>
    </div>
    <div style={{
      position: "absolute", left: 240, top: 820, ...BODY, fontSize: 28, opacity: 0.5,
    }}>
      — The Carrier With No Plane, 2026
    </div>
  </AbsoluteFill>
);

// ───────── 4. Polemicist ─────────
// A cover. A question. A demand.
const Polemicist: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 180,
        width: 4,
        height: 720,
        background: CORAL,
      }}
    />
    <div style={{ position: "absolute", left: 200, top: 180, ...LABEL, opacity: 0.5 }}>
      A question for the republic
    </div>
    <div
      style={{
        position: "absolute",
        left: 200,
        right: 160,
        top: 300,
        fontFamily: FR,
        fontWeight: 700,
        fontSize: 180,
        lineHeight: 0.98,
        letterSpacing: -6,
        color: INK,
      }}
    >
      Whose plane
      <br />
      flies off
      <br />
      <span style={{ color: CORAL }}>our carrier?</span>
    </div>
  </AbsoluteFill>
);

// ───────── 5. Archivist ─────────
// Dateline, quotation, source — documentary mode.
const Archivist: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily: PT }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Cochin Shipyard · 02 Sep 2022
    </div>
    <div
      style={{
        position: "absolute",
        left: 120, top: 240, width: 1680, height: 1,
        background: INK, opacity: 0.15,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 320,
        ...BODY,
        fontSize: 36,
        opacity: 0.5,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      File 014 / Carrier Aviation
    </div>
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: 420,
        fontFamily: PT,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1.15,
        color: INK,
      }}
    >
      "Indigenous naval fighter — not before 2032."
    </div>
    <div style={{
      position: "absolute", left: 120, top: 700, ...BODY, opacity: 0.6,
    }}>
      HAL · Ministry of Defence projection
    </div>
    <div style={{
      position: "absolute", left: 120, top: 760, ...BODY, opacity: 0.6,
    }}>
      Commissioned carriers at date of filing: <span style={{ color: CORAL, fontWeight: 700 }}>two.</span>
    </div>
    <div style={{
      position: "absolute", right: 120, bottom: 80, ...BODY, opacity: 0.5, fontSize: 28,
    }}>
      Filed 2025
    </div>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="Minimalist"  component={Minimalist}  width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Infographer" component={Infographer} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Essayist"    component={Essayist}    width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Polemicist"  component={Polemicist}  width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Archivist"   component={Archivist}   width={W} height={H} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
