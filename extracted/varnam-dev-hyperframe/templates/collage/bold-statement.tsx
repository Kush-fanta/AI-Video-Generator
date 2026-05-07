import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { C, ease } from "../shared/primitives";

const { fontFamily: oswald } = loadFont();

interface BoldStatementProps {
  /** The statement text */
  text: string;
  /** Font size in px (default 48) */
  fontSize?: number;
  /** Text color (default black) */
  color?: string;
  /** Rotation in degrees (default -5) — negative tilts left */
  rotation?: number;
  /** Position as percentage of canvas */
  x?: number;
  y?: number;
  /** Text transform */
  textTransform?: "uppercase" | "none";
  /** Letter spacing in em */
  letterSpacing?: string;
  /** Max width in px */
  maxWidth?: number;
  /** Frame to start animation */
  at?: number;
  /** Z-index */
  zIndex?: number;
  /** Optional background band behind text */
  bandColor?: string;
  /** Band padding in px */
  bandPadding?: number;
}

/**
 * Bold condensed typography for collage layouts. Oswald (condensed sans-serif)
 * for that vintage poster/propaganda feel. Can be rotated and placed anywhere.
 * Optional colored band behind text for placement on busy backgrounds.
 *
 * Animation: hard stamp with slight overshoot — not soft, not gentle.
 */
export const BoldStatement: React.FC<BoldStatementProps> = ({
  text,
  fontSize = 48,
  color = "#1A1A1A",
  rotation = -5,
  x = 50,
  y = 50,
  textTransform = "uppercase",
  letterSpacing = "0.08em",
  maxWidth = 800,
  at = 0,
  zIndex = 5,
  bandColor,
  bandPadding = 12,
}) => {
  const frame = useCurrentFrame();

  // Hard stamp entrance
  const scale = interpolate(
    frame,
    [at, at + 4, at + 8, at + 12],
    [1.2, 0.96, 1.03, 1.0],
    C,
  );
  const opacity = interpolate(frame, [at, at + 3], [0, 1], C);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        zIndex,
        pointerEvents: "none",
      }}
    >
      {bandColor && (
        <div
          style={{
            position: "absolute",
            inset: -bandPadding,
            backgroundColor: bandColor,
            zIndex: -1,
          }}
        />
      )}
      <div
        style={{
          fontFamily: oswald,
          fontSize,
          fontWeight: 700,
          color,
          textTransform,
          letterSpacing,
          lineHeight: 1.1,
          maxWidth,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};
