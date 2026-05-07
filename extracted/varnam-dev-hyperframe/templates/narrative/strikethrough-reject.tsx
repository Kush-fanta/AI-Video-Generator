import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StrikethroughRejectProps extends BaseProps {
  rejected: string;
  corrected: string;
  strikeAt?: number;
  at?: number;
}

/**
 * "Not X, but Y" pattern. A statement appears, then a strikethrough line
 * draws through it. The corrected statement appears below in terracotta.
 */
export const StrikethroughReject: React.FC<StrikethroughRejectProps> = ({
  rejected,
  corrected,
  strikeAt = 36,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Strikethrough line progress
  const strikeW = lineGrow(frame, at + strikeAt, 18);

  // Dim the rejected text after strike
  const rejectedDim = interpolate(
    frame,
    [at + strikeAt, at + strikeAt + 18],
    [1, 0.4],
    C,
  );

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
        {/* Rejected statement with strikethrough */}
        <div
          style={{
            ...reveal(frame, at + 6),
            position: "relative",
            display: "inline-block",
            alignSelf: "flex-start",
            maxWidth: 780,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 52,
              lineHeight: 1.4,
              color: P.sub,
              opacity: rejectedDim,
              letterSpacing: "-0.01em",
            }}
          >
            {rejected}
          </span>

          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "54%",
              width: `${strikeW}%`,
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              transformOrigin: "left center",
            }}
          />
        </div>

        {/* Spacing */}
        <div style={{ height: 56 }} />

        {/* Corrected statement */}
        <div
          style={{
            ...reveal(frame, at + strikeAt + 12),
            fontFamily: sans,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.35,
            color: P.terracotta,
            maxWidth: 780,
            letterSpacing: "-0.02em",
          }}
        >
          {corrected}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-strikethrough-reject",
  props: {
    rejected: "Add more until it feels important.",
    corrected: "Remove everything that is not the point.",
    strikeAt: 36
  },
  durationInFrames: 180,
};
