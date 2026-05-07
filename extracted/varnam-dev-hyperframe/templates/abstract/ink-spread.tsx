import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface InkSpreadProps extends BaseProps {
  /** Main text — appears in negative as ink fills */
  text: string;
  /** Optional sublabel below the main text */
  sublabel?: string;
  /** Frame when ink begins spreading (default 15) */
  spreadAt?: number;
  /** Frame offset */
  at?: number;
}

/**
 * InkSpread — A circle of dark ink expands from center using spring physics.
 * Text appears in negative (light on dark) as the ink reaches full coverage.
 * The ink circle overshoots slightly before settling. Sublabel fades in
 * after the main text. Dramatic, bold, high-impact.
 */
export const InkSpread: React.FC<InkSpreadProps> = ({
  text,
  sublabel,
  spreadAt = 15,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - at;

  // Ink spread — spring-driven scale from 0 to fill the screen
  // Need enough scale to cover 1080x1920 from center: diagonal ~2203px
  // Circle diameter needs to be ~2400px to cover all corners
  const maxRadius = 1250;
  const spreadProgress = t >= spreadAt
    ? spring({
        frame: t - spreadAt,
        fps,
        config: { damping: 14, stiffness: 60, mass: 1.0 },
      })
    : 0;

  const inkScale = interpolate(spreadProgress, [0, 1], [0, 1], C);

  // Ink ripple — secondary ring that follows the main spread
  const rippleDelay = 8;
  const rippleProgress = t >= spreadAt + rippleDelay
    ? spring({
        frame: t - spreadAt - rippleDelay,
        fps,
        config: { damping: 20, stiffness: 40, mass: 0.8 },
      })
    : 0;

  // Text appears once ink is mostly covering the screen
  const textThreshold = 0.6;
  const textVisible = spreadProgress > textThreshold;
  const textOpacity = interpolate(spreadProgress, [textThreshold, 0.85], [0, 1], C);
  const textScale = textVisible
    ? spring({
        frame: Math.max(0, Math.round((spreadProgress - textThreshold) * 60)),
        fps,
        config: { damping: 12, stiffness: 80, mass: 0.9 },
        from: 1.08,
        to: 1.0,
      })
    : 1.08;

  // Sublabel — appears after text settles
  const sublabelAt = spreadAt + 45;

  // Subtle pulse on the ink blob — breathing after it settles
  const settledPulse = spreadProgress > 0.95
    ? interpolate(
        Math.sin((t / FPS) * Math.PI * 0.5),
        [-1, 1],
        [0.98, 1.02],
      )
    : 1;

  // Pre-spread: small dot hint
  const dotHintOpacity = interpolate(t, [0, 8, spreadAt], [0, 0.6, 0], C);
  const dotHintScale = interpolate(t, [0, 8], [0.3, 1], { ...C, easing: ease });

  // Edge texture — irregular border on the ink circle
  // Use multiple overlapping circles for organic edge
  const edgeCircles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const offsetX = Math.cos(angle) * maxRadius * 0.04;
    const offsetY = Math.sin(angle) * maxRadius * 0.04;
    const sizeVariation = 0.95 + Math.sin(i * 2.3) * 0.08;
    return { offsetX, offsetY, sizeVariation };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Pre-spread dot hint */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: P.dark,
          transform: `translate(-50%, -50%) scale(${dotHintScale})`,
          opacity: dotHintOpacity,
        }}
      />

      {/* Ink spread — main dark circle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: maxRadius * 2,
          height: maxRadius * 2,
          transform: `translate(-50%, -50%) scale(${inkScale * settledPulse})`,
          transformOrigin: "center center",
        }}
      >
        {/* Main circle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: P.dark,
          }}
        />

        {/* Edge texture circles — organic border */}
        {edgeCircles.map((ec, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${ec.offsetX}px)`,
              top: `calc(50% + ${ec.offsetY}px)`,
              width: `${ec.sizeVariation * 100}%`,
              height: `${ec.sizeVariation * 100}%`,
              borderRadius: "50%",
              backgroundColor: P.dark,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Ripple ring — follows the ink */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: maxRadius * 2 + 40,
          height: maxRadius * 2 + 40,
          borderRadius: "50%",
          border: `2px solid ${P.muted}`,
          transform: `translate(-50%, -50%) scale(${rippleProgress * inkScale})`,
          opacity: interpolate(rippleProgress, [0.5, 1], [0.3, 0], C),
          pointerEvents: "none",
        }}
      />

      {/* Text — negative/inverted on the dark ink */}
      {textVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 110,
              lineHeight: 1.1,
              color: P.bg,
              textAlign: "center",
              maxWidth: 900,
              padding: "0 80px",
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>

          {/* Accent line below text */}
          <div
            style={{
              width: interpolate(
                t,
                [spreadAt + 35, spreadAt + 55],
                [0, 200],
                { ...C, easing: ease },
              ),
              height: 3,
              backgroundColor: P.terracotta,
              marginTop: 32,
              borderRadius: 2,
              opacity: interpolate(t, [spreadAt + 35, spreadAt + 45], [0, 0.9], C),
            }}
          />

          {/* Sublabel */}
          {sublabel && (
            <div
              style={{
                ...reveal(frame, sublabelAt),
                fontFamily: sans,
                fontSize: 28,
                color: P.muted,
                marginTop: 24,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "abs-ink-spread",
  props: {
    text: "Impact",
    sublabel: "When everything changes",
    spreadAt: 20,
    at: 15,
  },
  durationInFrames: 180,
};
