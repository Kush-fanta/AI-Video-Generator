import { AbsoluteFill, useCurrentFrame, interpolate, interpolateColors } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ColorShiftProps extends BaseProps {
  /** The contemplative word or short phrase */
  phrase: string;
  /** Optional small label above phrase */
  label?: string;
  /** Start color (default P.bg) */
  fromColor?: string;
  /** End color (default P.dark) */
  toColor?: string;
  /** Frame to begin transition */
  at?: number;
  /** Duration frames for full color shift */
  duration?: number;
}

/**
 * ColorShift — Atmospheric mood transition.
 * Background smoothly morphs between two colors. A single contemplative
 * word sits center-left, its color inverting to maintain contrast.
 * Thin horizontal rules drift in opacity. Grain-like noise overlay via
 * radial gradient. Minimal, cinematic, breathing.
 */
export const ColorShift: React.FC<ColorShiftProps> = ({
  phrase,
  label,
  fromColor = P.bg,
  toColor = P.dark,
  at = 0,
  duration = 90,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // Main color transition progress (eased)
  const rawProg = interpolate(t, [0, duration], [0, 1], C);
  const prog = ease(rawProg);

  // Background color
  const bgColor = interpolateColors(prog, [0, 1], [fromColor, toColor]);

  // Text color — inverse for contrast
  const textColor = interpolateColors(prog, [0, 1], [P.text, P.bg]);
  const mutedColor = interpolateColors(prog, [0, 1], [P.muted, P.light]);

  // Phrase entrance: fade in early, slight upward drift
  const phraseOpacity = interpolate(t, [8, 26], [0, 1], C);
  const phraseY = interpolate(t, [8, 26], [20, 0], { ...C, easing: ease });

  // Label entrance
  const labelOpacity = interpolate(t, [0, 16], [0, 1], C);

  // Horizontal rule — grows, then subtly pulses opacity
  const ruleWidth = interpolate(t, [14, 50], [0, 320], { ...C, easing: ease });
  const rulePulse = interpolate(
    Math.sin((t / FPS) * Math.PI * 0.6),
    [-1, 1],
    [0.2, 0.5],
  );

  // Vertical accent line on left edge
  const accentHeight = interpolate(t, [4, 40], [0, 400], { ...C, easing: ease });
  const accentColor = interpolateColors(prog, [0, 1], [P.terracotta, P.terracotta]);
  const accentOpacity = interpolate(prog, [0, 0.8, 1], [0.8, 0.5, 0.3], C);

  // Subtle vignette darkens edges as bg shifts
  const vignetteOpacity = interpolate(prog, [0, 1], [0, 0.35], C);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Radial vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)",
          opacity: vignetteOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Left vertical terracotta accent */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          width: 3,
          height: accentHeight,
          transform: "translateY(-50%)",
          backgroundColor: accentColor,
          opacity: accentOpacity,
          borderRadius: 2,
        }}
      />

      {/* Label — small caps above phrase */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 780,
            opacity: labelOpacity,
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: mutedColor,
          }}
        >
          {label}
        </div>
      )}

      {/* Main phrase — left-aligned, vertically centered */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: label ? 830 : 860,
          opacity: phraseOpacity,
          transform: `translateY(${phraseY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.15,
            color: textColor,
            letterSpacing: "-0.02em",
            maxWidth: 840,
          }}
        >
          {phrase}
        </div>
      </div>

      {/* Horizontal rule below phrase */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: label ? 970 : 990,
          width: ruleWidth,
          height: 1,
          backgroundColor: mutedColor,
          opacity: rulePulse,
        }}
      />

      {/* Bottom-right frame counter — subtle editorial touch */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 80,
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: "0.12em",
          color: mutedColor,
          opacity: interpolate(t, [20, 36], [0, 0.4], C),
        }}
      >
        {String(Math.floor(t / FPS)).padStart(2, "0")}:
        {String(t % FPS).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
