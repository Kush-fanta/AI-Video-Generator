import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FogLiftProps extends BaseProps {
  content: string;
  sublabel?: string;
  clearAt?: number;
  at?: number;
}

// Fog layer configuration — each at different speeds for parallax
const FOG_LAYERS = [
  { y: 0, opacity: 0.95, speed: 1.0, blur: 60, height: "100%" },
  { y: 100, opacity: 0.7, speed: 1.4, blur: 40, height: "80%" },
  { y: 200, opacity: 0.5, speed: 1.8, blur: 30, height: "60%" },
  { y: 300, opacity: 0.4, speed: 2.2, blur: 50, height: "50%" },
  { y: -100, opacity: 0.6, speed: 1.6, blur: 45, height: "70%" },
  { y: 400, opacity: 0.35, speed: 2.6, blur: 35, height: "40%" },
];

/**
 * FogLift — Multiple semi-transparent white/cream layers simulating fog
 * drift upward and fade out at different speeds (parallax), gradually
 * revealing centered serif text. Ethereal, atmospheric.
 */
export const FogLift: React.FC<FogLiftProps> = ({
  content,
  sublabel,
  clearAt = 15,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Fog lift progress — spring for organic deceleration
  const liftProgress = f >= clearAt
    ? spring({
        frame: f - clearAt,
        fps,
        config: { damping: 22, stiffness: 30, mass: 1.5 },
        from: 0,
        to: 1,
      })
    : 0;

  // Content opacity — emerges from fog
  const contentOpacity = interpolate(liftProgress, [0.2, 0.7], [0, 1], C);

  // Content scale — very subtle breathe in
  const contentScale = f >= clearAt + 10
    ? spring({
        frame: f - clearAt - 10,
        fps,
        config: { damping: 18, stiffness: 60, mass: 0.9 },
        from: 0.97,
        to: 1.0,
      })
    : 0.97;

  // Accent line after fog clears
  const accentWidth = lineGrow(frame, at + clearAt + 30, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Content layer — behind fog */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.1,
            color: P.text,
            textAlign: "center",
            maxWidth: 860,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {content}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 180,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {sublabel && (
          <div
            style={{
              ...reveal(frame, at + clearAt + 35),
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 24,
              textAlign: "center",
              maxWidth: 700,
              letterSpacing: "0.02em",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>

      {/* Fog layers — parallax drift upward */}
      {FOG_LAYERS.map((layer, i) => {
        // Each layer drifts up at its own speed
        const drift = liftProgress * layer.speed * 800;
        // Each layer fades out at its own rate
        const fogOpacity = interpolate(
          liftProgress,
          [0, 0.4 / layer.speed, 0.8 / layer.speed],
          [layer.opacity, layer.opacity * 0.5, 0],
          C,
        );

        // Pre-clear: gentle ambient drift
        const ambientDrift = interpolate(f, [0, 300], [0, layer.speed * 30], C);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -60,
              right: -60,
              top: layer.y,
              height: layer.height,
              opacity: fogOpacity,
              transform: `translateY(${-drift - ambientDrift}px)`,
              filter: `blur(${layer.blur}px)`,
              pointerEvents: "none" as const,
            }}
          >
            {/* Fog shape — large gradient blobs */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `radial-gradient(ellipse at ${30 + i * 10}% ${50 + i * 5}%, rgba(237,234,228,0.9) 0%, rgba(200,194,182,0.4) 50%, transparent 80%)`,
              }}
            />
            {/* Secondary blob for organic shape */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: `${20 + i * 12}%`,
                width: "60%",
                height: "60%",
                background: `radial-gradient(ellipse, rgba(237,234,228,0.7) 0%, transparent 70%)`,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-fog-lift",
  props: {
    content: "The Future is Already Here",
    sublabel: "Just not evenly distributed",
    clearAt: 20,
    at: 15,
  },
  durationInFrames: 180,
};
