import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface AdvantageCheckProps extends BaseProps {
  features: Array<{ name: string; a: boolean; b: boolean }>;
  labelA: string;
  labelB: string;
  at?: number;
}

/**
 * AdvantageCheck — Checklist-style comparison.
 * Multiple rows with feature name and two columns (A / B).
 * Checkmarks (sage) and X marks (mauve) fill in with stagger.
 * Column with more checks is highlighted.
 */
export const AdvantageCheck: React.FC<AdvantageCheckProps> = ({
  features,
  labelA,
  labelB,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Count wins
  const scoreA = features.filter((ft) => ft.a).length;
  const scoreB = features.filter((ft) => ft.b).length;
  const winnerIsA = scoreA >= scoreB;

  // Header entrance
  const headerScale = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });

  const rowHeight = 110;
  const topStart = 480;
  const leftCol = 100;
  const featureCol = 220;
  const colACenter = 780;
  const colBCenter = 960;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Column headers */}
      <div
        style={{
          position: "absolute",
          top: topStart - 100,
          left: 0,
          width: 1080,
          transform: `scale(${headerScale})`,
          transformOrigin: "center",
        }}
      >
        {/* Feature column header */}
        <div
          style={{
            position: "absolute",
            left: leftCol,
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          Feature
        </div>
        {/* Label A */}
        <div
          style={{
            position: "absolute",
            left: colACenter - 60,
            width: 120,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: winnerIsA ? P.terracotta : P.sub,
          }}
        >
          {labelA}
        </div>
        {/* Label B */}
        <div
          style={{
            position: "absolute",
            left: colBCenter - 60,
            width: 120,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: !winnerIsA ? P.terracotta : P.sub,
          }}
        >
          {labelB}
        </div>
      </div>

      {/* Divider under headers */}
      <div
        style={{
          position: "absolute",
          top: topStart - 20,
          left: leftCol,
          width: 880,
          height: 2,
          backgroundColor: P.light,
          ...reveal(frame, at + 4),
        }}
      />

      {/* Feature rows */}
      {features.map((feature, i) => {
        const rowDelay = at + 8 + i * 6;
        const rowF = Math.max(0, frame - rowDelay);

        // Row entrance
        const rowEntrance = spring({
          frame: rowF,
          fps: FPS,
          config: { damping: 16, stiffness: 100, mass: 0.6 },
        });

        // Check/X scale for A and B (staggered)
        const markAScale = spring({
          frame: Math.max(0, rowF - 4),
          fps: FPS,
          config: { damping: 10, stiffness: 140, mass: 0.4 },
        });
        const markBScale = spring({
          frame: Math.max(0, rowF - 8),
          fps: FPS,
          config: { damping: 10, stiffness: 140, mass: 0.4 },
        });

        const rowY = topStart + i * rowHeight;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: rowY,
              left: 0,
              width: 1080,
              height: rowHeight,
              opacity: rowEntrance,
              transform: `translateY(${interpolate(rowEntrance, [0, 1], [20, 0], C)}px)`,
            }}
          >
            {/* Feature name */}
            <div
              style={{
                position: "absolute",
                left: leftCol,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: serif,
                fontSize: 40,
                color: P.text,
                maxWidth: 500,
                lineHeight: 1.2,
              }}
            >
              {feature.name}
            </div>

            {/* Column A mark */}
            <div
              style={{
                position: "absolute",
                left: colACenter - 24,
                top: "50%",
                transform: `translateY(-50%) scale(${markAScale})`,
                fontFamily: sans,
                fontSize: 48,
                fontWeight: 700,
                color: feature.a ? P.sage : P.mauve,
              }}
            >
              {feature.a ? "\u2713" : "\u2717"}
            </div>

            {/* Column B mark */}
            <div
              style={{
                position: "absolute",
                left: colBCenter - 24,
                top: "50%",
                transform: `translateY(-50%) scale(${markBScale})`,
                fontFamily: sans,
                fontSize: 48,
                fontWeight: 700,
                color: feature.b ? P.sage : P.mauve,
              }}
            >
              {feature.b ? "\u2713" : "\u2717"}
            </div>

            {/* Row separator */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: leftCol,
                width: 880,
                height: 1,
                backgroundColor: P.light,
                opacity: 0.5,
              }}
            />
          </div>
        );
      })}

      {/* Score summary at bottom */}
      <div
        style={{
          position: "absolute",
          top: topStart + features.length * rowHeight + 40,
          left: 0,
          width: 1080,
          ...reveal(frame, at + 8 + features.length * 6 + 6),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: colACenter - 40,
            width: 80,
            textAlign: "center",
            fontFamily: serif,
            fontSize: 64,
            color: winnerIsA ? P.terracotta : P.muted,
          }}
        >
          {scoreA}
        </div>
        <div
          style={{
            position: "absolute",
            left: colBCenter - 40,
            width: 80,
            textAlign: "center",
            fontFamily: serif,
            fontSize: 64,
            color: !winnerIsA ? P.terracotta : P.muted,
          }}
        >
          {scoreB}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-advantage-check",
  props: {
    features: [{ name: "Cost efficiency", a: true, b: true }, { name: "Talent depth", a: false, b: true }, { name: "Innovation", a: false, b: true }, { name: "Scale", a: true, b: true }],
    labelA: "Outsourcing",
    labelB: "GCC Model",
    at: 15,
  },
  durationInFrames: 180,
};
