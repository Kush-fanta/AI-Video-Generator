import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, ease, lineGrow } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ZoomThroughProps extends BaseProps {
  words: string[];
  stagger?: number;
  at?: number;
}

/**
 * ZoomThrough — Text starts very large and far away (scaled up, blurred),
 * then zooms past the camera (scale rapidly decreases). Feels like flying
 * through text. Multiple words in sequence, each zooming through.
 * Fast, kinetic.
 */
export const ZoomThrough: React.FC<ZoomThroughProps> = ({
  words,
  stagger = 18,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Each word has 3 phases:
  // 1. Approach: scale 8 -> 1, blurry -> clear, opacity 0 -> 1
  // 2. Hold: scale 1, clear, opacity 1 (brief)
  // 3. Fly past: scale 1 -> 0.1, clear -> blurry, opacity 1 -> 0

  const APPROACH_DUR = 10;
  const HOLD_DUR = 4;
  const FLYBY_DUR = 8;
  const TOTAL_PER_WORD = APPROACH_DUR + HOLD_DUR + FLYBY_DUR;

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Speed lines — diagonal streaks for motion feel */}
      {Array.from({ length: 6 }, (_, i) => {
        const lineAt = i * 5 + 3;
        const lineT = t - lineAt;
        if (lineT < 0 || lineT > 30) return null;

        const lineOpacity = interpolate(lineT, [0, 5, 25, 30], [0, 0.15, 0.15, 0], C);
        const yPos = 300 + i * 240;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: yPos,
              height: 1,
              backgroundColor: P.muted,
              opacity: lineOpacity,
              transform: `scaleX(${interpolate(lineT, [0, 15], [0.3, 1], C)})`,
              transformOrigin: i % 2 === 0 ? "left" : "right",
            }}
          />
        );
      })}

      {/* Words zooming through */}
      {words.map((word, i) => {
        const wordStart = i * stagger;
        const wt = t - wordStart;

        if (wt < -5 || wt > TOTAL_PER_WORD + 5) return null;

        // Scale: massive -> normal -> tiny
        let scale: number;
        let opacity: number;
        let blur: number;

        if (wt < APPROACH_DUR) {
          // Approaching
          const p = interpolate(wt, [0, APPROACH_DUR], [0, 1], C);
          const easedP = ease(p);
          scale = interpolate(easedP, [0, 1], [8, 1], C);
          opacity = interpolate(easedP, [0, 0.4, 1], [0, 0.5, 1], C);
          blur = interpolate(easedP, [0, 1], [12, 0], C);
        } else if (wt < APPROACH_DUR + HOLD_DUR) {
          // Holding
          scale = 1;
          opacity = 1;
          blur = 0;
        } else {
          // Flying past
          const p = interpolate(
            wt,
            [APPROACH_DUR + HOLD_DUR, TOTAL_PER_WORD],
            [0, 1],
            C,
          );
          const easedP = p * p; // ease in — accelerates away
          scale = interpolate(easedP, [0, 1], [1, 0.05], C);
          opacity = interpolate(easedP, [0, 0.5, 1], [1, 0.6, 0], C);
          blur = interpolate(easedP, [0, 1], [0, 8], C);
        }

        // Z-depth perspective shift
        const perspY = wt < APPROACH_DUR
          ? interpolate(wt, [0, APPROACH_DUR], [-40, 0], C)
          : wt > APPROACH_DUR + HOLD_DUR
            ? interpolate(wt, [APPROACH_DUR + HOLD_DUR, TOTAL_PER_WORD], [0, 60], C)
            : 0;

        // Alternate colors for variety
        const color = i % 3 === 0 ? P.terracotta : i % 3 === 1 ? P.bg : P.sage;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity,
              transform: `scale(${scale}) translateY(${perspY}px)`,
              filter: `blur(${blur}px)`,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 140,
                fontWeight: 400,
                color,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {word}
            </span>
          </div>
        );
      })}

      {/* Terracotta crosshair at center — subtle focus point */}
      <div
        style={{
          position: "absolute",
          left: 540 - 15,
          top: 960 - 1,
          width: 30,
          height: 2,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [2, 10], [0, 0.2], C),
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 1,
          top: 960 - 15,
          width: 2,
          height: 30,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [2, 10], [0, 0.2], C),
          borderRadius: 1,
        }}
      />

      {/* Word counter — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 100,
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 500,
          color: P.muted,
          letterSpacing: "0.08em",
          opacity: interpolate(t, [8, 20], [0, 0.4], C),
        }}
      >
        {Math.min(
          words.length,
          Math.max(0, Math.floor(t / stagger) + 1),
        )}{" "}
        / {words.length}
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 100,
          width: `${lineGrow(frame, at + 6, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.sub,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-zoom-through",
  props: {
    words: ["Cost", "Scale", "Talent", "Innovation"],
    at: 15,
  },
  durationInFrames: 180,
};
