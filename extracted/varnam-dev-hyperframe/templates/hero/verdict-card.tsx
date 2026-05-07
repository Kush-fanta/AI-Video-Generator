import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface VerdictCardProps extends BaseProps {
  verdict: string;
  context?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Dark bg, large verdict text in terracotta with stamp-rotation entry (-8deg → 0deg).
 * For conclusions/judgments. Hard snap rotation with no spring — just clamps.
 */
export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  context,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [at + 4, at + 12], [-8, 0], C);
  const opacity = interpolate(frame, [at + 4, at + 10], [0, 1], C);
  const scale = interpolate(frame, [at + 4, at + 12], [1.08, 1.0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Category label top-left */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Verdict text — stamp entry */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          right: 100,
          transform: `translateY(-50%) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: "left center",
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.05,
            color: P.terracotta,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          {verdict}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 14, 20)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            opacity: 0.5,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {/* Context */}
        {context && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 28,
              lineHeight: 1.5,
              color: P.light,
              marginTop: 20,
              maxWidth: 600,
              fontWeight: 400,
            }}
          >
            {context}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-verdict-card",
  "props": {
    "verdict": "Not Guilty",
    "context": "The evidence never supported the original claim.",
    "categoryLabel": "THE VERDICT",
    "at": 15
  },
  "durationInFrames": 150
};
