import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { C, ease } from "../shared/primitives";

const { fontFamily: sans } = loadFont();

interface BillboardLabelProps {
  /** Label text */
  text: string;
  /** Position as percentage of canvas */
  x?: number;
  y?: number;
  /** Background color (default white) */
  bgColor?: string;
  /** Text color (default near-black) */
  textColor?: string;
  /** Font size */
  fontSize?: number;
  /** Padding horizontal */
  paddingX?: number;
  /** Padding vertical */
  paddingY?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Optional subtle perspective tilt for 3D feel */
  perspective?: boolean;
  /** Frame to start */
  at?: number;
  /** Z-index */
  zIndex?: number;
}

/**
 * White rectangular label/billboard — placed on buildings or anywhere in the scene.
 * Think: the "IT SECTOR" sign on a building. Clean, high-contrast, reads instantly.
 *
 * Animation: slams in with overshoot scale — like slapping a sticker on.
 */
export const BillboardLabel: React.FC<BillboardLabelProps> = ({
  text,
  x = 50,
  y = 50,
  bgColor = "#FFFFFF",
  textColor = "#1A1A1A",
  fontSize = 32,
  paddingX = 28,
  paddingY = 14,
  rotation = 0,
  perspective = false,
  at = 0,
  zIndex = 6,
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [at, at + 4, at + 8, at + 12],
    [1.3, 0.95, 1.04, 1.0],
    C,
  );
  const opacity = interpolate(frame, [at, at + 3], [0, 1], C);

  const perspectiveTransform = perspective
    ? "perspective(800px) rotateY(-3deg) rotateX(2deg)"
    : "";

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) ${perspectiveTransform}`,
        opacity,
        zIndex,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          padding: `${paddingY}px ${paddingX}px`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize,
            fontWeight: 800,
            color: textColor,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
