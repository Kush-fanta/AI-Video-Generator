import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TugOfWarProps extends BaseProps {
  leftForce: { label: string; value: number };
  rightForce: { label: string; value: number };
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * TugOfWar — Horizontal rope with a center marker.
 * Two forces pull from each side. The rope shifts toward the stronger side
 * with spring physics. Winner side text is larger.
 */
export const TugOfWar: React.FC<TugOfWarProps> = ({
  leftForce,
  rightForce,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  const total = leftForce.value + rightForce.value;
  const balance = total > 0
    ? (rightForce.value - leftForce.value) / total
    : 0;

  // Rope entrance
  const ropeEntrance = spring({
    frame: f,
    fps: FPS,
    config: { damping: 18, stiffness: 60, mass: 1.0 },
  });

  // Tug shift with spring — the rope marker shifts
  const tugShift = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 8, stiffness: 40, mass: 2.0 },
  });
  // Maximum shift is 180px either direction
  const markerOffset = interpolate(tugShift, [0, 1], [0, balance * 180], C);

  // Label entrances
  const leftLabelScale = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });
  const rightLabelScale = spring({
    frame: Math.max(0, f - 10),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });

  const leftWins = leftForce.value >= rightForce.value;
  const ropeY = 960;
  const ropeWidth = 800;
  const ropeLeft = (1080 - ropeWidth) / 2;
  const markerSize = 40;

  // Rope sag calculation — a gentle catenary
  const sagPoints = (() => {
    const points: string[] = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = ropeLeft + t * ropeWidth + markerOffset * t;
      // Subtle sag in the middle
      const sag = Math.sin(t * Math.PI) * 20;
      const y = ropeY + sag;
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Rope */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: ropeEntrance,
        }}
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
      >
        {/* Rope line */}
        <polyline
          points={sagPoints}
          fill="none"
          stroke={pal.sub}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Tension marks — small diagonal dashes on rope */}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => {
          const x = ropeLeft + t * ropeWidth + markerOffset * t;
          const sag = Math.sin(t * Math.PI) * 20;
          const y = ropeY + sag;
          return (
            <line
              key={i}
              x1={x - 4}
              y1={y - 12}
              x2={x + 4}
              y2={y + 12}
              stroke={pal.light}
              strokeWidth={2}
            />
          );
        })}
      </svg>

      {/* Center marker */}
      <div
        style={{
          position: "absolute",
          top: ropeY - markerSize / 2,
          left: 540 + markerOffset - markerSize / 2,
          width: markerSize,
          height: markerSize,
          borderRadius: "50%",
          backgroundColor: pal.terracotta,
          border: `3px solid ${pal.bg}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          opacity: ropeEntrance,
          zIndex: 5,
        }}
      />

      {/* Center line (static reference) */}
      <div
        style={{
          position: "absolute",
          top: ropeY - 60,
          left: 538,
          width: 4,
          height: 120,
          backgroundColor: pal.light,
          opacity: 0.4,
          borderRadius: 2,
        }}
      />

      {/* Left force */}
      <div
        style={{
          position: "absolute",
          top: ropeY - 340,
          left: 60,
          width: 400,
          textAlign: "center",
          transform: `scale(${leftLabelScale})`,
          transformOrigin: "center bottom",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: leftWins ? 80 : 56,
            color: leftWins ? pal.terracotta : pal.muted,
            lineHeight: 1.0,
          }}
        >
          {leftForce.label}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: leftWins ? pal.text : pal.muted,
            marginTop: 16,
          }}
        >
          {leftForce.value}
        </div>
        {/* Arrow pointing right */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 48,
            color: pal.light,
            marginTop: 20,
          }}
        >
          {"\u2192"}
        </div>
      </div>

      {/* Right force */}
      <div
        style={{
          position: "absolute",
          top: ropeY - 340,
          right: 60,
          width: 400,
          textAlign: "center",
          transform: `scale(${rightLabelScale})`,
          transformOrigin: "center bottom",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: !leftWins ? 80 : 56,
            color: !leftWins ? pal.terracotta : pal.muted,
            lineHeight: 1.0,
          }}
        >
          {rightForce.label}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: !leftWins ? pal.text : pal.muted,
            marginTop: 16,
          }}
        >
          {rightForce.value}
        </div>
        {/* Arrow pointing left */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 48,
            color: pal.light,
            marginTop: 20,
          }}
        >
          {"\u2190"}
        </div>
      </div>

      {/* Winner indicator below rope */}
      <div
        style={{
          ...reveal(frame, at + 28),
          position: "absolute",
          top: ropeY + 100,
          left: 0,
          width: 1080,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: pal.terracotta,
        }}
      >
        {leftWins ? leftForce.label : rightForce.label} wins
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-tug-of-war",
  props: {
    leftForce: { label: "Legacy IT", value: 35 },
    rightForce: { label: "GCC Innovation", value: 72 },
    at: 15,
  },
  durationInFrames: 180,
};
