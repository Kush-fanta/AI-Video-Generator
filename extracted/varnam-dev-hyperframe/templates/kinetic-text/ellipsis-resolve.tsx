import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface EllipsisResolveProps extends BaseProps {
  punchline: string;
  sublabel?: string;
  resolveAt?: number;
  at?: number;
}

/**
 * EllipsisResolve — Three dots appear one by one ("...") building suspense.
 * Then they fade and the actual punchline word SLAMS in large with overshoot
 * scale. The dots are in muted color, the punchline in terracotta.
 * Comedic/dramatic timing.
 */
export const EllipsisResolve: React.FC<EllipsisResolveProps> = ({
  punchline,
  sublabel,
  resolveAt = 36,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Dot timing — each dot appears with a suspenseful pause
  const DOT_STAGGER = 10; // frames between dots
  const dots = [0, 1, 2];

  const isResolved = t >= resolveAt;
  const resolveT = Math.max(0, t - resolveAt);

  // Punchline entrance — aggressive spring with overshoot
  const punchSpring = spring({
    frame: resolveT,
    fps: FPS,
    config: {
      damping: 8,
      mass: 1.8,
      stiffness: 160,
    },
  });

  // Punchline scale: starts oversized, springs to rest
  const punchScale = interpolate(
    punchSpring,
    [0, 0.4, 0.65, 0.85, 1],
    [0.3, 1.25, 0.92, 1.04, 1],
    C,
  );

  // Punchline opacity
  const punchOpacity = interpolate(punchSpring, [0, 0.15], [0, 1], C);

  // Dots fade out when punchline arrives
  const dotsFadeOut = isResolved
    ? interpolate(resolveT, [0, 8], [1, 0], C)
    : 1;

  // Camera shake on punchline impact
  const shakeIntensity = isResolved
    ? interpolate(resolveT, [0, 4, 12], [0, 10, 0], C)
    : 0;
  const shakeX = Math.sin(resolveT * 4.5) * shakeIntensity;
  const shakeY = Math.cos(resolveT * 5.8) * shakeIntensity * 0.6;

  // Impact flash
  const flashOpacity =
    resolveT > 0 && resolveT < 6
      ? interpolate(resolveT, [0, 2, 6], [0, 0.15, 0], C)
      : 0;

  // Sublabel entrance — after punchline settles
  const sublabelReveal = reveal(frame, at + resolveAt + 18, 14);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.bg,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Impact flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: P.terracotta,
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Ellipsis dots — centered, suspenseful */}
      {!isResolved && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            opacity: dotsFadeOut,
          }}
        >
          {dots.map((dotIndex) => {
            const dotAt = dotIndex * DOT_STAGGER;
            const dotVisible = t >= dotAt;

            // Each dot springs in
            const dotSpring = spring({
              frame: Math.max(0, t - dotAt),
              fps: FPS,
              config: { damping: 12, mass: 0.8, stiffness: 200 },
            });

            // Pulsing while waiting — dots breathe
            const breathe = dotVisible
              ? 1 + Math.sin((t - dotAt) * 0.15) * 0.08
              : 0;

            return (
              <div
                key={dotIndex}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: P.muted,
                  opacity: dotVisible ? interpolate(dotSpring, [0, 0.3], [0, 1], C) : 0,
                  transform: `scale(${dotSpring * breathe})`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Dots fading out during resolve */}
      {isResolved && dotsFadeOut > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            opacity: dotsFadeOut,
          }}
        >
          {dots.map((dotIndex) => (
            <div
              key={dotIndex}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: P.muted,
                // Dots scatter slightly as they fade
                transform: `translate(${(dotIndex - 1) * resolveT * 3}px, ${-resolveT * 2}px)`,
              }}
            />
          ))}
        </div>
      )}

      {/* PUNCHLINE — the big reveal */}
      {isResolved && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: punchOpacity,
            transform: `scale(${punchScale})`,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 120,
              fontWeight: 400,
              color: P.terracotta,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textAlign: "center",
              padding: "0 80px",
            }}
          >
            {punchline}
          </span>

          {/* Terracotta accent line */}
          <div
            style={{
              width: interpolate(punchSpring, [0, 1], [0, 140], C),
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              marginTop: 24,
              opacity: 0.5,
            }}
          />

          {/* Sublabel */}
          {sublabel && (
            <div
              style={{
                ...sublabelReveal,
                fontFamily: sans,
                fontSize: 28,
                fontWeight: 500,
                color: P.sub,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 24,
                textAlign: "center",
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      )}

      {/* Top-left accent dot */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [4, 14], [0, 0.6], C),
        }}
      />

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 6, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-ellipsis-resolve",
  props: {
    punchline: "$100B",
    sublabel: "That's the number",
    at: 15,
  },
  durationInFrames: 180,
};
