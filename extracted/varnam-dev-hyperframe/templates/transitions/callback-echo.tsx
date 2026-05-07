import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CallbackEchoProps extends BaseProps {
  /** Type of ghost element in background */
  echoType: "bar" | "text" | "shape";
  /** Value for the echo — percentage for bar, text string, or ignored for shape */
  echoValue?: string | number;
  /** New headline overlaying the echo */
  headline: string;
  /** Optional keyword highlight in terracotta */
  keyword?: string;
  /** Frame when elements appear (default 0) */
  at?: number;
}

/**
 * CallbackEcho — "remember this? now look at THIS."
 * Ghost of an earlier element in background at low opacity.
 * New content overlays in front with spring entrance.
 *
 * Echo character:
 * - "text" type: three staggered echo copies converge from large scale
 *   (250%) down to 100% — zoom-to-settle feel with spring physics.
 * - "bar" type: bar expands from 0 with spring, fades to ghost opacity.
 * - "shape" type: circle scales in from 0 with spring overshoot.
 *
 * Headline enters with spring (mass gives it weight), not linear slide.
 */
export const CallbackEcho: React.FC<CallbackEchoProps> = ({
  echoType,
  echoValue,
  headline,
  keyword,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Headline enters with spring — settles into place, not slides
  const headlineAt = at + 12;
  const headlineF = Math.max(0, frame - headlineAt);
  const headlineSpring = spring({
    frame: headlineF,
    fps: FPS,
    config: { damping: 22, stiffness: 90, mass: 1.4 },
  });
  const headlineY = interpolate(headlineSpring, [0, 1], [40, 0], C);
  const headlineOpacity = interpolate(frame, [headlineAt, headlineAt + 10], [0, 1], C);

  // Render the ghost echo based on type
  const renderEcho = () => {
    switch (echoType) {
      case "bar": {
        const barPct = typeof echoValue === "number" ? echoValue : 65;
        // Bar spring-expands then settles at ghost opacity
        const barSpring = spring({
          frame: f,
          fps: FPS,
          config: { damping: 18, stiffness: 50, mass: 1.2 },
        });
        const barWidth = barSpring * barPct;
        return (
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: 120,
              width: `${barWidth}%`,
              maxWidth: 1200,
              height: 64,
              backgroundColor: P.terracotta,
              borderRadius: 4,
              opacity: interpolate(frame, [at, at + 20], [0, 0.1], C),
              transformOrigin: "left center",
            }}
          />
        );
      }

      case "text": {
        const echoText = typeof echoValue === "string" ? echoValue : "";
        // Five echo copies: staggered 4 frames apart, each starts at 300% scale
        // and spring-scales down to 100% as it fades to ghost opacity
        return (
          <>
            {[0, 4, 8, 12, 16].map((delay, idx) => {
              const echoF = Math.max(0, f - delay);
              const scaleSpring = spring({
                frame: echoF,
                fps: FPS,
                config: { damping: 14, stiffness: 45, mass: 1.1 },
              });
              // Scale from 3.0 → 1.0 — bigger arrival punch
              const scale = interpolate(scaleSpring, [0, 1], [3.0, 1.0], C);
              // Alternating terracotta tint on odd copies for visual depth
              const color = idx % 2 === 1 ? P.terracotta : P.text;
              const maxOpacity = 0.1 - idx * 0.015;
              const opacity = interpolate(
                frame,
                [at + delay, at + delay + 16],
                [0, Math.max(0.01, maxOpacity)],
                C,
              );
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: "center center",
                    fontFamily: serif,
                    fontSize: 200,
                    lineHeight: 1,
                    color,
                    opacity,
                    letterSpacing: "-0.04em",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {echoText}
                </div>
              );
            })}
          </>
        );
      }

      case "shape": {
        // Concentric ripple rings — each ring staggered 6 frames, scales from 0 with spring
        return (
          <>
            {[0, 6, 12, 18].map((delay, idx) => {
              const ringF = Math.max(0, f - delay);
              const ringSpring = spring({
                frame: ringF,
                fps: FPS,
                config: { damping: 10, stiffness: 60, mass: 0.7 + idx * 0.2 },
              });
              const baseSize = 200 + idx * 90;
              const ringOpacity = interpolate(
                frame,
                [at + delay, at + delay + 12, at + delay + 40],
                [0, 0.14 - idx * 0.025, 0.04],
                C
              );
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    top: "38%",
                    right: "12%",
                    width: baseSize,
                    height: baseSize,
                    borderRadius: "50%",
                    border: `${idx === 0 ? 3 : 2}px solid ${idx % 2 === 0 ? P.terracotta : P.text}`,
                    opacity: ringOpacity,
                    transform: `translate(50%, -50%) scale(${ringSpring})`,
                    transformOrigin: "center center",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost echo — background layer */}
      {renderEcho()}

      {/* New content — foreground */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 120,
          zIndex: 2,
        }}
      >
        {/* Headline — spring entrance, settles with weight */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            lineHeight: 1.1,
            color: P.text,
            maxWidth: 900,
            letterSpacing: "-0.02em",
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px) scale(${interpolate(headlineSpring, [0, 0.6, 1], [0.94, 1.02, 1.0], C)})`,
            transformOrigin: "left center",
          }}
        >
          {keyword
            ? headline.split(keyword).reduce<React.ReactNode[]>((parts, segment, i) => {
                if (i > 0) {
                  parts.push(
                    <span key={`kw-${i}`} style={{ color: P.terracotta }}>
                      {keyword}
                    </span>,
                  );
                }
                parts.push(<span key={`seg-${i}`}>{segment}</span>);
                return parts;
              }, [])
            : headline}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${lineGrow(frame, headlineAt + 8, 24)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Subtle diagonal line — connecting past to present */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 100,
          width: `${lineGrow(frame, at + 6, 30)}%`,
          maxWidth: 300,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.3,
          transform: "rotate(-2deg)",
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-callback-echo",
  props: {
    echoType: "text",
    echoValue: "Conversion",
    headline: "Now keep the signal.",
    keyword: "signal"
  },
  durationInFrames: 180,
};
