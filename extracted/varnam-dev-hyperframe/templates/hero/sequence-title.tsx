import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SequenceTitleProps extends BaseProps {
  number: number;
  total: number;
  subtitle: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * "Part 1 of 4" style. Number huge, subtitle small.
 * For serialized/chaptered content. Number punches in with overshoot,
 * "of N" and subtitle follow.
 */
export const SequenceTitle: React.FC<SequenceTitleProps> = ({
  number,
  total,
  subtitle,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const numScale = overshootScale(frame, at + 4);
  const ghostOpacity = interpolate(frame, [at + 6, at + 20], [0, 0.04], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost number */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: -20,
          transform: "translateY(-50%)",
          fontFamily: serif,
          fontSize: 600,
          lineHeight: 0.8,
          color: P.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.06em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {number}
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

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        {/* Number row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <div
            style={{
              ...reveal(frame, at + 4),
              transform: `scale(${numScale})`,
              transformOrigin: "left baseline",
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 200,
                lineHeight: 0.9,
                color: P.terracotta,
                letterSpacing: "-0.04em",
              }}
            >
              {number}
            </div>
          </div>

          <div style={reveal(frame, at + 12)}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 36,
                color: P.muted,
                fontWeight: 500,
              }}
            >
              of {total}
            </div>
          </div>
        </div>

        {/* Accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 14, 18)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            ...reveal(frame, at + 20),
            fontFamily: sans,
            fontSize: 32,
            lineHeight: 1.4,
            color: P.sub,
            marginTop: 18,
            maxWidth: 500,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-sequence-title",
  "props": {
    "number": 2,
    "total": 5,
    "subtitle": "The Mechanism",
    "categoryLabel": "CHAPTER",
    "at": 15
  },
  "durationInFrames": 120
};
