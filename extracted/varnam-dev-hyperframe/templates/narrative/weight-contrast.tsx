import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface WeightContrastProps extends BaseProps {
  primary: { value: string; label: string };
  secondary: { value: string; label: string };
  at?: number;
}

/**
 * Two competing stats/facts. One LARGE and bold (the important one),
 * one small and muted. Visual weight communicates hierarchy.
 * Left-aligned vertical stack.
 */
export const WeightContrast: React.FC<WeightContrastProps> = ({
  primary,
  secondary,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
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
          paddingLeft: 100,
          paddingRight: 120,
        }}
      >
        {/* Primary — the dominant stat */}
        <div style={reveal(frame, at + 6)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              fontWeight: 400,
              color: P.text,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {primary.value}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 32,
              fontWeight: 500,
              color: P.sub,
              marginTop: 12,
              letterSpacing: "0.02em",
            }}
          >
            {primary.label}
          </div>
        </div>

        {/* Terracotta accent dash */}
        <div
          style={{
            width: `${lineGrow(frame, at + 18, 20)}%`,
            maxWidth: 48,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginTop: 56,
            marginBottom: 56,
          }}
        />

        {/* Secondary — the lesser stat, muted and small */}
        <div style={reveal(frame, at + 26)}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 44,
              fontWeight: 500,
              color: P.muted,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {secondary.value}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 400,
              color: P.muted,
              marginTop: 8,
              opacity: 0.7,
            }}
          >
            {secondary.label}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-weight-contrast",
  props: {
    primary: {
      value: "72%",
      label: "of the room moved on the first line"
    },
    secondary: {
      value: "4 slides",
      label: "were enough to make the case"
    }
  },
  durationInFrames: 180,
};
