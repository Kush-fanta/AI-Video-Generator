import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FootnotePopProps extends BaseProps {
  mainText: string;
  footnoteNumber: number;
  footnoteText: string;
  popAt?: number;
  at?: number;
}

/**
 * FootnotePop — Main text with a superscript number. After a beat,
 * a footnote box springs up from the bottom with the explanation.
 * The footnote has a matching number and thin top border.
 * Portrait 1080x1920.
 */
export const FootnotePop: React.FC<FootnotePopProps> = ({
  mainText,
  footnoteNumber,
  footnoteText,
  popAt,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Main text reveals first
  const textReveal = reveal(frame, at);

  // Footnote pops after a beat (or at explicit popAt)
  const footnoteStart = popAt ?? 36;
  const fnF = Math.max(0, f - footnoteStart);

  const fnSpring = spring({
    frame: fnF,
    fps: FPS,
    config: { damping: 12, stiffness: 100, mass: 0.7 },
  });
  const fnOpacity = interpolate(fnF, [0, 10], [0, 1], C);

  // Top border grows on the footnote box
  const borderGrow = lineGrow(frame, at + footnoteStart + 8, 20);

  // Superscript pulse when footnote appears
  const supPulse = interpolate(fnF, [0, 6, 14], [1, 1.25, 1], C);
  const supColor = interpolate(fnF, [0, 8], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main text — upper area */}
      <div
        style={{
          position: "absolute",
          top: 500,
          left: 80,
          right: 80,
          ...textReveal,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 68,
            lineHeight: 1.35,
            color: P.text,
            letterSpacing: "-0.01em",
          }}
        >
          {mainText}
          <sup
            style={{
              fontFamily: sans,
              fontSize: 32,
              fontWeight: 700,
              color: supColor > 0.5 ? P.terracotta : P.muted,
              marginLeft: 6,
              position: "relative",
              top: -28,
              display: "inline-block",
              transform: `scale(${supPulse})`,
              transformOrigin: "bottom left",
              transition: "color 0.1s",
            }}
          >
            {footnoteNumber}
          </sup>
        </div>
      </div>

      {/* Footnote box — springs up from bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 80,
          right: 80,
          opacity: fnOpacity,
          transform: `translateY(${interpolate(fnSpring, [0, 1], [60, 0], C)}px)`,
        }}
      >
        {/* Top border — grows left to right */}
        <div
          style={{
            width: `${borderGrow}%`,
            height: 2,
            backgroundColor: P.light,
            borderRadius: 1,
            marginBottom: 28,
          }}
        />

        {/* Footnote content */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          {/* Number badge */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 700,
              color: P.bg,
              backgroundColor: P.terracotta,
              width: 48,
              height: 48,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {footnoteNumber}
          </div>

          {/* Footnote text */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 42,
              fontWeight: 500,
              lineHeight: 1.4,
              color: P.sub,
              letterSpacing: "-0.01em",
              flex: 1,
            }}
          >
            {footnoteText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-footnote-pop",
  props: {
    mainText: "GCC revenue reached $100 billion in 2024.",
    footnoteNumber: 1,
    footnoteText: "Source: NASSCOM annual report",
    popAt: 35,
    at: 15,
  },
  durationInFrames: 180,
};
