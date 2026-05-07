import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ScratchCardProps extends BaseProps {
  hiddenValue: string;
  label: string;
  scratchAt?: number;
  at?: number;
}

/**
 * ScratchCard — A gray overlay covers a value like a lottery scratch card.
 * The overlay scratches away left-to-right via clipPath animation,
 * revealing the hidden content in large terracotta serif. Fun, tactile feel.
 */
export const ScratchCard: React.FC<ScratchCardProps> = ({
  hiddenValue,
  label,
  scratchAt = 25,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Label fades in first
  const labelReveal = reveal(frame, at + 5);

  // Scratch progress — spring-driven for satisfying acceleration
  const scratchProgress = f >= scratchAt
    ? spring({
        frame: f - scratchAt,
        fps,
        config: { damping: 20, stiffness: 50, mass: 1.0 },
        from: 0,
        to: 1,
      })
    : 0;

  // ClipPath: scratch overlay from right to left (insetted from right side)
  // Overlay visible area shrinks as scratch progresses
  const overlayClip = `inset(0 ${scratchProgress * 100}% 0 0)`;

  // Hidden value opacity — starts showing once scratch begins
  const valueOpacity = interpolate(f, [scratchAt, scratchAt + 8], [0, 1], C);

  // Scale pop when fully revealed
  const valueScale = f >= scratchAt + 10
    ? spring({
        frame: f - scratchAt - 10,
        fps,
        config: { damping: 12, stiffness: 100, mass: 0.8 },
        from: 1.06,
        to: 1.0,
      })
    : 1.0;

  // Scratch particles — small rects that fly off as the scratch happens
  const particles = Array.from({ length: 8 }, (_, i) => {
    const particleAt = scratchAt + i * 3;
    const pf = f - particleAt;
    if (pf < 0 || pf > 20) return null;
    const px = 200 + i * 80;
    const py = 920 + (i % 3 - 1) * 40;
    const drift = interpolate(pf, [0, 20], [0, 60 + i * 15], C);
    const pOpacity = interpolate(pf, [0, 5, 20], [0, 0.6, 0], C);
    const size = 6 + (i % 3) * 4;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: px,
          top: py,
          width: size,
          height: size,
          backgroundColor: P.light,
          borderRadius: 2,
          opacity: pOpacity,
          transform: `translate(${drift}px, ${-drift * 0.8}px) rotate(${pf * 12}deg)`,
        }}
      />
    );
  });

  // Scratch card dimensions
  const cardW = 860;
  const cardH = 260;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Label above the card */}
      <div
        style={{
          position: "absolute",
          top: 700,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          ...labelReveal,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            color: P.sub,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </div>
      </div>

      {/* Card area — centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%)`,
          width: cardW,
          height: cardH,
        }}
      >
        {/* Hidden value (always rendered, revealed by scratch) */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: valueOpacity,
            transform: `scale(${valueScale})`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 108,
              color: P.terracotta,
              letterSpacing: "-0.02em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {hiddenValue}
          </div>
        </div>

        {/* Gray scratch overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: P.light,
            borderRadius: 16,
            clipPath: overlayClip,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Scratch texture — crosshatch pattern */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: "absolute",
                top: `${i * 5 + 2}%`,
                left: 0,
                width: "100%",
                height: 1,
                backgroundColor: "rgba(0,0,0,0.04)",
              }}
            />
          ))}
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              color: P.muted,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
            }}
          >
            SCRATCH TO REVEAL
          </div>
        </div>
      </div>

      {/* Scratch particles */}
      {particles}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-scratch-card",
  props: {
    hiddenValue: "1,850",
    label: "GCCs in India",
    scratchAt: 25,
    at: 15,
  },
  durationInFrames: 180,
};
