import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DeltaArrowProps extends BaseProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** "up" = growth (sage), "down" = decline (terracotta) */
  direction?: "up" | "down";
  /** Change text shown on the arrow, e.g. "+340%" */
  changeText?: string;
  source?: string;
  at?: number;
}

/**
 * DeltaArrow — Before number -> arrow -> after number. The arrow is big,
 * bold, directional. The change IS the visual. Hard snaps throughout.
 */
export const DeltaArrow: React.FC<DeltaArrowProps> = ({
  before,
  after,
  beforeLabel,
  afterLabel,
  direction = "up",
  changeText,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const beforeScale = overshootScale(frame, at + 6);
  const arrowScale = overshootScale(frame, at + 18);
  const afterScale = overshootScale(frame, at + 28);

  const arrowColor = direction === "up" ? P.sage : P.terracotta;

  // Arrow slides in
  const arrowSlide = interpolate(f, [14, 20], [40, 0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          display: "flex",
          alignItems: "center",
          gap: 50,
        }}
      >
        {/* Before */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: serif,
              fontSize: 180,
              lineHeight: 0.9,
              color: P.muted,
              letterSpacing: "-0.03em",
              transform: `scale(${beforeScale})`,
              transformOrigin: "center bottom",
            }}
          >
            {before}
          </div>
          {beforeLabel && (
            <div
              style={{
                ...reveal(frame, at + 12),
                fontFamily: sans,
                fontSize: 24,
                color: P.sub,
                marginTop: 16,
              }}
            >
              {beforeLabel}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div
          style={{
            ...reveal(frame, at + 14),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transform: `translateX(${arrowSlide}px) scale(${arrowScale})`,
          }}
        >
          <svg width={160} height={100} viewBox="0 0 160 100">
            {/* Arrow body */}
            <line
              x1={10}
              y1={50}
              x2={120}
              y2={50}
              stroke={arrowColor}
              strokeWidth={8}
              strokeLinecap="round"
            />
            {/* Arrow head */}
            <polyline
              points={
                direction === "up"
                  ? "100,80 140,50 100,20"
                  : "100,20 140,50 100,80"
              }
              fill="none"
              stroke={arrowColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Change text */}
          {changeText && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 36,
                fontWeight: 800,
                color: arrowColor,
                letterSpacing: "-0.02em",
              }}
            >
              {changeText}
            </div>
          )}
        </div>

        {/* After */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              ...reveal(frame, at + 24),
              fontFamily: serif,
              fontSize: 180,
              lineHeight: 0.9,
              color: P.text,
              letterSpacing: "-0.03em",
              transform: `scale(${afterScale})`,
              transformOrigin: "center bottom",
            }}
          >
            {after}
          </div>
          {afterLabel && (
            <div
              style={{
                ...reveal(frame, at + 32),
                fontFamily: sans,
                fontSize: 24,
                color: P.sub,
                marginTop: 16,
              }}
            >
              {afterLabel}
            </div>
          )}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 42),
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-delta-arrow",
  props: {
    "before": "120",
    "after": "155",
    "beforeLabel": "Q1",
    "afterLabel": "Q2",
    "direction": "up",
    "changeText": "+29%",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
