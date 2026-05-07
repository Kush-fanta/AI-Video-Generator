import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CurtainPullProps extends BaseProps {
  content: string;
  sublabel?: string;
  revealAt?: number;
  at?: number;
}

/**
 * CurtainPull — Two dark panels covering left and right halves slide apart
 * with spring physics to reveal a large serif statement on cream bg.
 * Subtle vertical texture lines on the curtain panels.
 */
export const CurtainPull: React.FC<CurtainPullProps> = ({
  content,
  sublabel,
  revealAt = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Spring-driven curtain slide: each panel moves from center to offscreen
  const pullProgress = f >= revealAt
    ? spring({
        frame: f - revealAt,
        fps,
        config: { damping: 16, stiffness: 60, mass: 1.1 },
        from: 0,
        to: 1,
      })
    : 0;

  // Left panel slides from 0% to -100% of its width
  const leftX = interpolate(pullProgress, [0, 1], [0, -100]);
  // Right panel slides from 0% to +100%
  const rightX = interpolate(pullProgress, [0, 1], [0, 100]);

  // Content fades in slightly after curtains begin opening
  const contentAt = revealAt + 12;
  const contentOpacity = interpolate(f, [contentAt, contentAt + 15], [0, 1], C);
  const contentScale = f >= contentAt
    ? spring({
        frame: f - contentAt,
        fps,
        config: { damping: 14, stiffness: 80, mass: 0.9 },
        from: 0.96,
        to: 1.0,
      })
    : 0.96;

  // Accent line below content
  const accentWidth = lineGrow(frame, at + contentAt + 8, 25);

  // Generate vertical texture lines for curtain panels
  const textureLines = Array.from({ length: 12 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Content behind curtains — centered serif statement */}
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

        {/* Terracotta accent */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 200,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {sublabel && (
          <div
            style={{
              ...reveal(frame, at + contentAt + 18),
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

      {/* Left curtain panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          backgroundColor: P.dark,
          transform: `translateX(${leftX}%)`,
          overflow: "hidden",
        }}
      >
        {/* Vertical texture lines */}
        {textureLines.map((i) => (
          <div
            key={`l-${i}`}
            style={{
              position: "absolute",
              top: 0,
              left: `${(i + 1) * (100 / (textureLines.length + 1))}%`,
              width: 1,
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>

      {/* Right curtain panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          backgroundColor: P.dark,
          transform: `translateX(${rightX}%)`,
          overflow: "hidden",
        }}
      >
        {textureLines.map((i) => (
          <div
            key={`r-${i}`}
            style={{
              position: "absolute",
              top: 0,
              left: `${(i + 1) * (100 / (textureLines.length + 1))}%`,
              width: 1,
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-curtain-pull",
  props: {
    content: "$100 Billion",
    sublabel: "India GCC Revenue, 2024",
    revealAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
