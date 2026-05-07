import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BounceWordProps extends BaseProps {
  word: string;
  label?: string;
  at?: number;
}

/**
 * BounceWord — A word drops from above and bounces on a baseline with
 * realistic physics (decreasing bounce height). The word has weight and mass.
 * Sans bold for impact. Baseline is a terracotta line.
 */
export const BounceWord: React.FC<BounceWordProps> = ({
  word,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Baseline position
  const BASELINE_Y = 1100;
  const DROP_FROM = -200;

  // Custom bounce physics — multi-stage bounce with decreasing height
  // Each bounce: [startFrame, peakFrame, landFrame]
  const GRAVITY = 1.8;
  const BOUNCE_DAMPING = 0.45; // each bounce is 45% of previous height
  const INITIAL_HEIGHT = BASELINE_Y - DROP_FROM;

  // Calculate Y position with bouncing physics
  const getBounceY = (frame: number): number => {
    if (frame < 0) return DROP_FROM;

    // First drop — accelerating (gravity)
    const firstDropDuration = 14;
    if (frame <= firstDropDuration) {
      const progress = frame / firstDropDuration;
      // Ease in quad for gravity feel
      const gravityEase = progress * progress;
      return interpolate(gravityEase, [0, 1], [DROP_FROM, BASELINE_Y], C);
    }

    // Bounces
    let elapsed = frame - firstDropDuration;
    let bounceHeight = INITIAL_HEIGHT * BOUNCE_DAMPING;
    let bounceDur = 10;

    for (let bounce = 0; bounce < 5; bounce++) {
      if (elapsed <= bounceDur) {
        const halfDur = bounceDur / 2;
        if (elapsed <= halfDur) {
          // Going up
          const progress = elapsed / halfDur;
          const upEase = 1 - (1 - progress) * (1 - progress); // ease out
          return BASELINE_Y - bounceHeight * upEase;
        } else {
          // Coming down
          const progress = (elapsed - halfDur) / halfDur;
          const downEase = progress * progress; // ease in
          return BASELINE_Y - bounceHeight * (1 - downEase);
        }
      }
      elapsed -= bounceDur;
      bounceHeight *= BOUNCE_DAMPING;
      bounceDur = Math.max(4, bounceDur * 0.7);
    }

    return BASELINE_Y;
  };

  const wordY = getBounceY(t);

  // Squash/stretch on impact — word compresses horizontally and expands vertically
  const distFromBaseline = Math.abs(BASELINE_Y - wordY);
  const isNearBaseline = distFromBaseline < 30 && t > 10;
  const squashFactor = isNearBaseline
    ? interpolate(distFromBaseline, [0, 30], [0.15, 0], C)
    : 0;

  const scaleX = 1 + squashFactor * 0.8; // wider on impact
  const scaleY = 1 - squashFactor * 0.3; // shorter on impact

  // Word opacity
  const opacity = interpolate(t, [0, 3], [0, 1], C);

  // Baseline terracotta line — grows on impact
  const baselineWidth = spring({
    frame: Math.max(0, t - 12),
    fps: FPS,
    config: { damping: 16, mass: 1, stiffness: 100 },
  });

  // Impact flash — subtle terracotta glow on first landing
  const impactFlash =
    t >= 14 && t <= 20
      ? interpolate(t, [14, 17, 20], [0, 0.3, 0], C)
      : 0;

  // Label enters after bounce settles
  const labelReveal = reveal(frame, at + 35, 14);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Impact flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: P.terracotta,
          opacity: impactFlash,
          pointerEvents: "none",
        }}
      />

      {/* The bouncing word */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: wordY,
          transform: `translateY(-100%) scaleX(${scaleX}) scaleY(${scaleY})`,
          transformOrigin: "center bottom",
          opacity,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: 120,
            fontWeight: 800,
            color: P.text,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {word}
        </span>
      </div>

      {/* Terracotta baseline */}
      <div
        style={{
          position: "absolute",
          top: BASELINE_Y,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(baselineWidth, [0, 1], [0, 600], C),
          height: 4,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Small impact particles — dots that scatter on first landing */}
      {t >= 14 &&
        t <= 30 &&
        [
          { dx: -80, dy: -20, delay: 0 },
          { dx: 60, dy: -35, delay: 1 },
          { dx: -40, dy: -50, delay: 2 },
          { dx: 90, dy: -15, delay: 1 },
        ].map((particle, i) => {
          const pT = t - 14 - particle.delay;
          if (pT < 0) return null;
          const pOpacity = interpolate(pT, [0, 12], [0.6, 0], C);
          const pX = 540 + interpolate(pT, [0, 12], [0, particle.dx], C);
          const pY = BASELINE_Y + interpolate(pT, [0, 12], [0, particle.dy], C);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pX,
                top: pY,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: P.terracotta,
                opacity: pOpacity,
              }}
            />
          );
        })}

      {/* Label below baseline */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: BASELINE_Y + 40,
            left: 0,
            right: 0,
            textAlign: "center",
            ...labelReveal,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 500,
              color: P.muted,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 8, 30)}%`,
          maxWidth: 180,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-bounce-word",
  props: {
    word: "IMPACT",
    label: "When the numbers land",
    at: 15,
  },
  durationInFrames: 180,
};
