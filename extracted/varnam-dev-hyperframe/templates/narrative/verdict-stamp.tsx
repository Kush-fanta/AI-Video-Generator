import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface VerdictStampProps extends BaseProps {
  /** The verdict word or phrase */
  text: string;
  /** Optional smaller context line above */
  context?: string;
  /** Frame to stamp */
  at?: number;
  /** Stamp color (default terracotta) */
  color?: string;
  palette?: Partial<typeof P>;
}

/**
 * Text rotates in from -15deg, scales from 1.4, lands with a hard stop.
 * Red/terracotta. Like a rubber stamp on a document. Slight screen shake on
 * impact. Border appears around text after landing.
 */
export const VerdictStamp: React.FC<VerdictStampProps> = ({
  text,
  context,
  at = 0,
  color,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const rel = frame - at;
  const stampColor = color ?? pal.terracotta;

  // Stamp animation: 6-frame hard snap
  const scale = interpolate(rel, [0, 3, 6], [1.4, 0.97, 1.0], C);
  const rotation = interpolate(rel, [0, 3, 6], [-15, 1, 0], C);
  const opacity = interpolate(rel, [0, 2], [0, 1], C);

  // Screen shake on impact
  const shakeX = rel >= 2 && rel < 6 ? (rel % 2 === 0 ? -5 : 5) : 0;
  const shakeY = rel >= 2 && rel < 6 ? (rel % 2 === 0 ? 3 : -3) : 0;

  // Border appears after stamp lands
  const borderOpacity = interpolate(rel, [8, 14], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: stampColor,
          borderRadius: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {/* Context line */}
        {context && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 700,
              color: pal.muted,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              marginBottom: 20,
              opacity: interpolate(rel, [-10, 0], [0, 1], C),
            }}
          >
            {context}
          </div>
        )}

        {/* Stamp text */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            fontWeight: 400,
            color: stampColor,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textTransform: "uppercase" as const,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            opacity,
            padding: "20px 48px",
            border: `5px solid ${stampColor}`,
            borderRadius: 8,
            borderColor: `rgba(193, 122, 72, ${borderOpacity})`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-verdict-stamp",
  props: { text: "CONFIRMED", context: "India crosses $100B in GCC revenue", at: 15 },
  durationInFrames: 180,
};
