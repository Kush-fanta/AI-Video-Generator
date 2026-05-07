import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, dimTo, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface PivotReframeProps extends BaseProps {
  before: string;
  after: string;
  pivotAt?: number;
  at?: number;
}

/**
 * "But actually..." pivot moment. First statement appears in serif P.sub,
 * then dims. Terracotta accent line draws across, and the reframe appears
 * below in terracotta bold — the real insight.
 */
export const PivotReframe: React.FC<PivotReframeProps> = ({
  before,
  after,
  pivotAt = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const beforeDim = dimTo(frame, at + pivotAt, 0.3, 14);
  const lineW = lineGrow(frame, at + pivotAt - 4, 22);

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
        {/* Before statement */}
        <div
          style={{
            ...reveal(frame, at + 6),
            opacity: (reveal(frame, at + 6).opacity as number) * beforeDim,
            fontFamily: serif,
            fontSize: 52,
            lineHeight: 1.4,
            color: P.sub,
            maxWidth: 780,
            letterSpacing: "-0.01em",
          }}
        >
          {before}
        </div>

        {/* Terracotta accent line — the pivot */}
        <div
          style={{
            width: `${lineW}%`,
            maxWidth: 360,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginTop: 52,
            marginBottom: 52,
          }}
        />

        {/* After statement — the reframe */}
        <div
          style={{
            ...reveal(frame, at + pivotAt + 6),
            fontFamily: sans,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.35,
            color: P.terracotta,
            maxWidth: 780,
            letterSpacing: "-0.02em",
          }}
        >
          {after}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-pivot-reframe",
  props: {
    before: "We thought speed was the goal.",
    after: "Reliability was the goal all along.",
    pivotAt: 40
  },
  durationInFrames: 180,
};
