import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EllipsisPunchlineProps extends BaseProps {
  punchline: string;
  sublabel?: string;
  /** Frame when punchline slams in (default: 55) */
  punchAt?: number;
  at?: number;
}

/** Timing between dots in frames */
const DOT_INTERVAL = 14;
const DOT_SIZE = 80;

/**
 * EllipsisPunchline — Three dots appear in sequence with dramatic timing
 * (dot... dot... dot...). Each dot is an 80px terracotta circle. After a pause,
 * they fade and the punchline word SLAMS in with overshoot scale.
 * Large serif. Comic timing encoded in frames.
 */
export const EllipsisPunchline: React.FC<EllipsisPunchlineProps> = ({
  punchline,
  sublabel,
  punchAt = 55,
  at = 0,
  palette,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(palette);
  const t = frame - at;

  // Three dots with staggered timing
  const dots = [0, 1, 2].map((i) => {
    const dotAt = 8 + i * DOT_INTERVAL;
    const dotT = t - dotAt;

    // Each dot springs in
    const dotScale = dotT >= 0
      ? spring({
          frame: dotT,
          fps: FPS,
          config: { damping: 10, mass: 0.8, stiffness: 160 },
        })
      : 0;

    // Dots fade out before punchline
    const fadeOutStart = punchAt - 12;
    const dotOpacity = dotT >= 0
      ? interpolate(t, [dotAt, dotAt + 6, fadeOutStart, fadeOutStart + 8], [0, 1, 1, 0], C)
      : 0;

    return { dotScale, dotOpacity };
  });

  // Punchline slam
  const punchT = t - punchAt;
  const punchScale = punchT >= 0
    ? interpolate(punchT, [0, 3, 6, 12], [1.6, 0.94, 1.04, 1.0], C)
    : 0;
  const punchOpacity = interpolate(punchT, [0, 3], [0, 1], C);
  const punchRotation = punchT >= 0
    ? interpolate(punchT, [0, 3, 8], [-3, 0.5, 0], C)
    : 0;

  // Screen shake on punchline impact
  const shakeX = punchT >= 1 && punchT < 6
    ? (punchT % 2 === 0 ? -6 : 6) * interpolate(punchT, [1, 6], [1, 0], C)
    : 0;
  const shakeY = punchT >= 1 && punchT < 6
    ? (punchT % 2 === 0 ? 4 : -4) * interpolate(punchT, [1, 6], [1, 0], C)
    : 0;

  // Sublabel reveal
  const sublabelReveal = reveal(frame, at + punchAt + 18, 14);

  // Background flash on punch
  const bgFlash = punchT >= 0 && punchT <= 8
    ? interpolate(punchT, [0, 2, 8], [0, 0.06, 0], C)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* Background terracotta flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: CP.terracotta,
          opacity: bgFlash,
          pointerEvents: "none",
        }}
      />

      {/* Content with shake */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {/* Three dots — centered horizontally */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: 40,
            alignItems: "center",
          }}
        >
          {dots.map((dot, i) => (
            <div
              key={i}
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: "50%",
                backgroundColor: CP.terracotta,
                transform: `scale(${dot.dotScale})`,
                opacity: dot.dotOpacity,
              }}
            />
          ))}
        </div>

        {/* Punchline — replaces dots */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: `translateY(-50%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              color: CP.text,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              textAlign: "center",
              opacity: punchOpacity,
              transform: `scale(${punchScale}) rotate(${punchRotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {punchline}
          </div>

          {/* Sublabel */}
          {sublabel && (
            <div
              style={{
                ...sublabelReveal,
                fontFamily: sans,
                fontSize: 32,
                fontWeight: 500,
                color: CP.sub,
                marginTop: 28,
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              {sublabel}
            </div>
          )}
        </div>

        {/* Terracotta accent line — appears with punchline */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 120px)",
            width: `${lineGrow(frame, at + punchAt + 6, 18)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: CP.terracotta,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 6, 26)}%`,
          maxWidth: 180,
          height: 1,
          backgroundColor: CP.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-ellipsis-punchline",
  props: {
    punchline: "INDIA",
    sublabel: "The answer was always India",
    punchAt: 50,
    at: 15,
  },
  durationInFrames: 180,
};
