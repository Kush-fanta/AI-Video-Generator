import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, overshootScale } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

const C_CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface DualStatCompareProps extends BaseProps {
  /** Left stat value */
  leftValue: string;
  /** Left label */
  leftLabel: string;
  /** Right stat value */
  rightValue: string;
  /** Right label */
  rightLabel: string;
  /** What the comparison shows (e.g. "Per capita income as % of national average") */
  comparisonLabel?: string;
  /** Is right side worse/declining? Colors it red. Default true. */
  rightIsDecline?: boolean;
  /** Channel badge */
  badge?: string;
  at?: number;
}

/**
 * Side-by-side stat comparison. Left = before/better, Right = after/worse.
 * Vertical divider in center. Both sides have visual weight.
 * For comparisons like "127.5 → 83.7" or "60 vs 4" or "64% vs 233%".
 */
export const DualStatCompare: React.FC<DualStatCompareProps> = ({
  leftValue,
  leftLabel,
  rightValue,
  rightLabel,
  comparisonLabel,
  rightIsDecline = true,
  badge,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(paletteOverride);

  const leftScale = overshootScale(frame, at + 6);
  const rightScale = overshootScale(frame, at + 14);
  const dividerH = lineGrow(frame, at + 10, 22);
  const arrowOpacity = interpolate(frame, [at + 20, at + 30], [0, 0.6], C_CLAMP);

  const leftColor = CP.terracotta; // gold = positive/before
  const rightColor = rightIsDecline ? CP.mauve : CP.terracotta; // red = decline, gold = growth

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* Left stat */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "48%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 4),
            transform: `scale(${leftScale})`,
            transformOrigin: "center",
          }}
        >
          <div
            style={{
              fontFamily: condensed,
              fontSize: 180,
              lineHeight: 0.85,
              color: leftColor,
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            {leftValue}
          </div>
        </div>
        <div
          style={{
            ...reveal(frame, at + 14),
            fontFamily: sans,
            fontSize: 24,
            color: CP.sub,
            marginTop: 16,
            textAlign: "center",
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          {leftLabel}
        </div>
      </div>

      {/* Center divider + arrow */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "49%",
          width: 2,
          height: `${dividerH * 0.5}%`,
          backgroundColor: CP.light,
          opacity: 0.3,
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "46.5%",
          width: "7%",
          textAlign: "center",
          transform: "translateY(-50%)",
          fontFamily: condensed,
          fontSize: 48,
          color: CP.sub,
          opacity: arrowOpacity,
          zIndex: 3,
        }}
      >
        →
      </div>

      {/* Right stat */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "48%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 12),
            transform: `scale(${rightScale})`,
            transformOrigin: "center",
          }}
        >
          <div
            style={{
              fontFamily: condensed,
              fontSize: 180,
              lineHeight: 0.85,
              color: rightColor,
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            {rightValue}
          </div>
        </div>
        <div
          style={{
            ...reveal(frame, at + 22),
            fontFamily: sans,
            fontSize: 24,
            color: CP.sub,
            marginTop: 16,
            textAlign: "center",
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          {rightLabel}
        </div>
      </div>

      {/* Comparison label — bottom center */}
      {comparisonLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            width: "100%",
            textAlign: "center",
            ...reveal(frame, at + 26),
            fontFamily: sans,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: CP.muted,
          }}
        >
          {comparisonLabel}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            ...reveal(frame, at + 2),
            backgroundColor: CP.mauve,
            padding: "8px 16px",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: CP.text,
            zIndex: 4,
          }}
        >
          {badge}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-dual-stat-compare",
  "props": {
    "leftValue": "60",
    "leftLabel": "Before",
    "rightValue": "4",
    "rightLabel": "After",
    "comparisonLabel": "Per capita debt load",
    "rightIsDecline": true,
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 150
};
