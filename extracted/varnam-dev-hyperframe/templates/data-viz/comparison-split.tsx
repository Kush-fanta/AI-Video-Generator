import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface SideData {
  label: string;
  value: string;
  /** 0–100 bar height percentage */
  barPercent: number;
  subtitle?: string;
}

export interface ComparisonSplitProps extends BaseProps {
  left: SideData;
  right: SideData;
  headline?: string;
  source?: string;
  at?: number;
}

/**
 * ComparisonSplit — Two vertical bars side by side with a thin divider.
 * Left side: slate/mauve (old/worse). Right side: terracotta (new/better).
 * Bars spring-animate their heights. Numbers float above each bar.
 */
export const ComparisonSplit: React.FC<ComparisonSplitProps> = ({
  left,
  right,
  headline,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const barMaxHeight = 680;
  const barWidth = 160;
  const barBottom = 1380;
  const leftBarX = 260;
  const rightBarX = 640;
  const dividerX = (leftBarX + barWidth + rightBarX) / 2;

  // Spring for left bar
  const leftF = Math.max(0, frame - (at + 12));
  const leftSpring = spring({
    frame: leftF,
    fps: FPS,
    config: { damping: 20, stiffness: 90, mass: 1 },
  });
  const leftHeight = leftSpring * (left.barPercent / 100) * barMaxHeight;

  // Spring for right bar (staggered)
  const rightF = Math.max(0, frame - (at + 24));
  const rightSpring = spring({
    frame: rightF,
    fps: FPS,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });
  const rightHeight = rightSpring * (right.barPercent / 100) * barMaxHeight;

  // Number scales
  const leftNumScale = overshootScale(frame, at + 20);
  const rightNumScale = overshootScale(frame, at + 32);

  // Divider grows from center
  const dividerProgress = lineGrow(frame, at + 8, 30);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 80,
            right: 80,
            ...reveal(frame, at + 2),
            fontFamily: serif,
            fontSize: 52,
            color: P.text,
            lineHeight: 1.18,
          }}
        >
          {headline}
        </div>
      )}

      {/* Left bar */}
      <div
        style={{
          position: "absolute",
          left: leftBarX,
          bottom: 1920 - barBottom,
          width: barWidth,
          height: leftHeight,
          backgroundColor: P.slate,
          borderRadius: "8px 8px 0 0",
        }}
      />

      {/* Left value above bar */}
      <div
        style={{
          position: "absolute",
          left: leftBarX,
          top: barBottom - leftHeight - 100,
          width: barWidth,
          textAlign: "center",
          ...reveal(frame, at + 18),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: P.text,
            lineHeight: 1,
            transform: `scale(${leftNumScale})`,
            transformOrigin: "center bottom",
          }}
        >
          {left.value}
        </div>
      </div>

      {/* Left label below bar */}
      <div
        style={{
          position: "absolute",
          left: leftBarX - 20,
          top: barBottom + 24,
          width: barWidth + 40,
          textAlign: "center",
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: P.sub,
            lineHeight: 1.3,
          }}
        >
          {left.label}
        </div>
        {left.subtitle && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: P.muted,
              marginTop: 6,
            }}
          >
            {left.subtitle}
          </div>
        )}
      </div>

      {/* Vertical divider */}
      <div
        style={{
          position: "absolute",
          left: dividerX,
          top: `${50 - dividerProgress / 2}%`,
          width: 1.5,
          height: `${dividerProgress}%`,
          backgroundColor: P.light,
        }}
      />

      {/* Right bar */}
      <div
        style={{
          position: "absolute",
          left: rightBarX,
          bottom: 1920 - barBottom,
          width: barWidth,
          height: rightHeight,
          backgroundColor: P.terracotta,
          borderRadius: "8px 8px 0 0",
        }}
      />

      {/* Right value above bar */}
      <div
        style={{
          position: "absolute",
          left: rightBarX,
          top: barBottom - rightHeight - 100,
          width: barWidth,
          textAlign: "center",
          ...reveal(frame, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: P.terracotta,
            lineHeight: 1,
            transform: `scale(${rightNumScale})`,
            transformOrigin: "center bottom",
          }}
        >
          {right.value}
        </div>
      </div>

      {/* Right label below bar */}
      <div
        style={{
          position: "absolute",
          left: rightBarX - 20,
          top: barBottom + 24,
          width: barWidth + 40,
          textAlign: "center",
          ...reveal(frame, at + 26),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: P.sub,
            lineHeight: 1.3,
          }}
        >
          {right.label}
        </div>
        {right.subtitle && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: P.muted,
              marginTop: 6,
            }}
          >
            {right.subtitle}
          </div>
        )}
      </div>

      {/* Baseline */}
      <div
        style={{
          position: "absolute",
          left: leftBarX - 40,
          top: barBottom,
          width: rightBarX + barWidth - leftBarX + 80,
          height: 1.5,
          backgroundColor: P.dark,
          opacity: interpolate(frame, [at + 6, at + 14], [0, 0.15], C),
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            ...reveal(frame, at + 40),
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
  compositionId: "dataviz-comparison-split",
  props: {
    "left": {
      "label": "Before",
      "value": "38%",
      "barPercent": 38,
      "subtitle": "Manual"
    },
    "right": {
      "label": "After",
      "value": "71%",
      "barPercent": 71,
      "subtitle": "Automated"
    },
    "headline": "Conversion lift",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
