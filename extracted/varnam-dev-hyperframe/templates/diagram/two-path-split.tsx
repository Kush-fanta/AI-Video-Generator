import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PathData {
  label: string;
  value?: string;
  description?: string;
}

export interface TwoPathSplitProps extends BaseProps {
  input: string;
  pathA: PathData;
  pathB: PathData;
  source?: string;
  at?: number;
}

/**
 * TwoPathSplit — Minimal fork diagram. The fork IS the visual.
 * Stem rises from center-bottom → fork point → two diverging lines → labels.
 * Input label sits above the fork point.
 * Path labels: large serif, right of each branch endpoint.
 * No cards. No dividers. No decoration. Just the fork.
 */
export const TwoPathSplit: React.FC<TwoPathSplitProps> = ({
  input,
  pathA,
  pathB,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Geometry — all coordinates on 1920×1080 canvas
  const forkX = 960;
  const forkY = 580;
  const stemTopY = 240; // where the stem starts (above fork)
  const branchEndY = 840;
  const branchSpreadX = 340; // horizontal distance from fork to branch end

  // Left branch endpoint
  const leftX = forkX - branchSpreadX;
  const leftY = branchEndY;
  // Right branch endpoint
  const rightX = forkX + branchSpreadX;
  const rightY = branchEndY;

  // Animation timing
  const stemAt = at + 6;
  const forkAt = stemAt + 18;
  const leftAt = forkAt + 8;
  const rightAt = forkAt + 14;
  const labelsAt = rightAt + 20;

  // Spring progress values
  const stemProgress = spring({ frame: Math.max(0, frame - stemAt), fps: FPS, config: { damping: 16, stiffness: 70, mass: 0.7 } });
  const leftProgress = spring({ frame: Math.max(0, frame - leftAt), fps: FPS, config: { damping: 14, stiffness: 80, mass: 0.6 } });
  const rightProgress = spring({ frame: Math.max(0, frame - rightAt), fps: FPS, config: { damping: 14, stiffness: 80, mass: 0.6 } });

  // Stem: draws from stemTopY down to forkY
  const stemLen = forkY - stemTopY;
  const stemDrawn = stemLen * stemProgress;

  // Branch lines: draws from forkY toward endpoints
  const leftLen = Math.hypot(leftX - forkX, leftY - forkY);
  const rightLen = Math.hypot(rightX - forkX, rightY - forkY);
  const leftDrawn = leftLen * leftProgress;
  const rightDrawn = rightLen * rightProgress;

  // Input label
  const inputSpring = spring({ frame: Math.max(0, frame - at), fps: FPS, config: { damping: 14, stiffness: 90, mass: 0.5 } });

  // Path label springs
  const labelSpringA = spring({ frame: Math.max(0, frame - labelsAt), fps: FPS, config: { damping: 13, stiffness: 85, mass: 0.5 } });
  const labelSpringB = spring({ frame: Math.max(0, frame - (labelsAt + 10)), fps: FPS, config: { damping: 13, stiffness: 85, mass: 0.5 } });

  // Fork dot
  const dotSpring = spring({ frame: Math.max(0, frame - forkAt), fps: FPS, config: { damping: 12, stiffness: 120, mass: 0.4 } });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* SVG fork lines */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {/* Stem — vertical line from input down to fork point */}
        <line
          x1={forkX}
          y1={stemTopY + stemLen - stemDrawn}
          x2={forkX}
          y2={forkY}
          stroke={P.text}
          strokeWidth={2}
          strokeLinecap="square"
          opacity={stemProgress > 0 ? 1 : 0}
        />

        {/* Left branch — diagonal from fork to left endpoint */}
        {leftProgress > 0 && (() => {
          const dx = leftX - forkX;
          const dy = leftY - forkY;
          const nx = dx / leftLen;
          const ny = dy / leftLen;
          return (
            <line
              x1={forkX}
              y1={forkY}
              x2={forkX + nx * leftDrawn}
              y2={forkY + ny * leftDrawn}
              stroke={P.text}
              strokeWidth={2}
              strokeLinecap="square"
            />
          );
        })()}

        {/* Right branch — diagonal from fork to right endpoint */}
        {rightProgress > 0 && (() => {
          const dx = rightX - forkX;
          const dy = rightY - forkY;
          const nx = dx / rightLen;
          const ny = dy / rightLen;
          return (
            <line
              x1={forkX}
              y1={forkY}
              x2={forkX + nx * rightDrawn}
              y2={forkY + ny * rightDrawn}
              stroke={P.text}
              strokeWidth={2}
              strokeLinecap="square"
            />
          );
        })()}

        {/* Fork dot — terracotta filled circle at junction */}
        <circle
          cx={forkX}
          cy={forkY}
          r={8 * dotSpring}
          fill={P.terracotta}
          opacity={interpolate(dotSpring, [0, 0.3], [0, 1], C)}
        />
      </svg>

      {/* Input label — above stem top, centered */}
      <div
        style={{
          position: "absolute",
          top: stemTopY - 80,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(inputSpring, [0, 1], [0, 1], C),
          transform: `translateY(${interpolate(inputSpring, [0, 1], [16, 0], C)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: P.text,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {input}
        </div>
      </div>

      {/* Path A label — left of left endpoint */}
      <div
        style={{
          position: "absolute",
          left: leftX - 360,
          top: leftY - 60,
          width: 340,
          textAlign: "right",
          opacity: interpolate(labelSpringA, [0, 0.25], [0, 1], C),
          transform: `translateX(${interpolate(labelSpringA, [0, 1], [-20, 0], C)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: P.text,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {pathA.label}
        </div>
        {pathA.value && (
          <div style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: P.terracotta,
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}>
            {pathA.value}
          </div>
        )}
        {pathA.description && (
          <div style={{
            fontFamily: sans,
            fontSize: 22,
            color: P.sub,
            lineHeight: 1.5,
          }}>
            {pathA.description}
          </div>
        )}
      </div>

      {/* Path B label — right of right endpoint */}
      <div
        style={{
          position: "absolute",
          left: rightX + 20,
          top: rightY - 60,
          width: 340,
          textAlign: "left",
          opacity: interpolate(labelSpringB, [0, 0.25], [0, 1], C),
          transform: `translateX(${interpolate(labelSpringB, [0, 1], [20, 0], C)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: P.text,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {pathB.label}
        </div>
        {pathB.value && (
          <div style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: P.terracotta,
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}>
            {pathB.value}
          </div>
        )}
        {pathB.description && (
          <div style={{
            fontFamily: sans,
            fontSize: 22,
            color: P.sub,
            lineHeight: 1.5,
          }}>
            {pathB.description}
          </div>
        )}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 80,
            opacity: interpolate(frame, [labelsAt + 24, labelsAt + 42], [0, 1], C),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-two-path-split",
  props: {
    "input": "Traffic arrives",
    "pathA": {
      "label": "Route A",
      "value": "Fast",
      "description": "Fewer checks, less friction."
    },
    "pathB": {
      "label": "Route B",
      "value": "Safe",
      "description": "More checks, more certainty."
    },
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
