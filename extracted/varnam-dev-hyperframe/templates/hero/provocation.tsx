import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ProvocationProps extends BaseProps {
  question: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Question mark huge in background (ghost), provocative question text centered.
 * For rhetorical openings. The "?" looms behind as a visual anchor,
 * question text snaps in over it.
 */
export const Provocation: React.FC<ProvocationProps> = ({
  question,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const ghostOpacity = interpolate(frame, [at + 2, at + 16], [0, 0.06], C);
  const textOpacity = interpolate(frame, [at + 8, at + 14], [0, 1], C);
  const textScale = interpolate(frame, [at + 8, at + 14], [1.05, 1.0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Ghost question mark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: serif,
          fontSize: 800,
          lineHeight: 0.8,
          color: P.bg,
          opacity: ghostOpacity,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        ?
      </div>

      {/* Category label */}
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

      {/* Question text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          padding: "0 120px",
          zIndex: 2,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            fontFamily: serif,
            fontSize: 72,
            lineHeight: 1.15,
            color: P.bg,
            textAlign: "center",
            letterSpacing: "-0.02em",
            maxWidth: 880,
          }}
        >
          {question}
        </div>
      </div>

      {/* Terracotta dot — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          ...reveal(frame, at + 20),
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-provocation",
  "props": {
    "question": "What happens when the back office starts thinking?",
    "categoryLabel": "THE QUESTION",
    "at": 15
  },
  "durationInFrames": 150
};
