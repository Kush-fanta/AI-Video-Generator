import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ParadoxFrameProps extends BaseProps {
  statementA: string;
  statementB: string;
  at?: number;
}

/**
 * ParadoxFrame — Two contradicting statements on screen simultaneously,
 * creating tension. Statement A top-left in serif, Statement B bottom-right
 * in serif. A diagonal terracotta line separates them. Both have equal
 * visual weight. The contradiction IS the point.
 */
export const ParadoxFrame: React.FC<ParadoxFrameProps> = ({
  statementA,
  statementB,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Statement A fades up from top-left
  const aProgress = t >= 0
    ? spring({ frame: t, fps: FPS, config: { damping: 16, mass: 1.0, stiffness: 100 } })
    : 0;
  const aSlideY = interpolate(aProgress, [0, 1], [30, 0], C);
  const aOpacity = interpolate(aProgress, [0, 0.4], [0, 1], C);

  // Statement B enters later
  const bDelay = 20;
  const bT = t - bDelay;
  const bProgress = bT >= 0
    ? spring({ frame: bT, fps: FPS, config: { damping: 16, mass: 1.0, stiffness: 100 } })
    : 0;
  const bSlideY = interpolate(bProgress, [0, 1], [-30, 0], C);
  const bOpacity = interpolate(bProgress, [0, 0.4], [0, 1], C);

  // Diagonal line draws after both statements are visible
  const lineDelay = 30;
  const lineT = t - lineDelay;
  const lineProgress = lineT >= 0
    ? interpolate(lineT, [0, 20], [0, 1], { ...C, easing: ease })
    : 0;

  // "VS" or tension marker at center
  const vsOpacity = interpolate(t, [38, 46], [0, 1], C);
  const vsScale = t >= 38
    ? spring({ frame: t - 38, fps: FPS, config: { damping: 12, mass: 0.8, stiffness: 160 } })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Statement A — top-left quadrant */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          right: 200,
          opacity: aOpacity,
          transform: `translateY(${aSlideY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: P.muted,
            marginBottom: 20,
          }}
        >
          A
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 56,
            color: P.text,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 700,
          }}
        >
          {statementA}
        </div>
      </div>

      {/* Diagonal terracotta line — from top-right to bottom-left */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <line
          x1="920"
          y1="480"
          x2="160"
          y2="1440"
          stroke={P.terracotta}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - lineProgress)}
          opacity={0.7}
        />
      </svg>

      {/* VS marker at diagonal center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          opacity: vsOpacity,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 800,
              color: P.bg,
              letterSpacing: "0.05em",
            }}
          >
            VS
          </span>
        </div>
      </div>

      {/* Statement B — bottom-right quadrant */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          right: 80,
          left: 200,
          textAlign: "right",
          opacity: bOpacity,
          transform: `translateY(${bSlideY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: P.muted,
            marginBottom: 20,
          }}
        >
          B
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 56,
            color: P.text,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 700,
            marginLeft: "auto",
          }}
        >
          {statementB}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 6, 28)}%`,
          maxWidth: 160,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-paradox-frame",
  props: {
    statementA: "India was the cheapest option",
    statementB: "India became the best option",
    at: 15,
  },
  durationInFrames: 180,
};
