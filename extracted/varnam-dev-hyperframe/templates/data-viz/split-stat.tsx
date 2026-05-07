import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SplitStatProps extends BaseProps {
  left: { value: string; label: string };
  right: { value: string; label: string };
  /** Which side wins — "left" | "right". Winner gets terracotta. */
  winner?: "left" | "right";
  dividerText?: string;
  source?: string;
  at?: number;
}

/**
 * SplitStat — Two big numbers side by side with a vs divider.
 * Winner in terracotta, loser in muted. Hard comparison.
 * Numbers LAND with overshoot — no polite fading.
 */
export const SplitStat: React.FC<SplitStatProps> = ({
  left,
  right,
  winner = "left",
  dividerText = "vs",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const leftScale = overshootScale(frame, at + 6);
  const rightScale = overshootScale(frame, at + 14);
  const accentW = lineGrow(frame, at + 24, 20);

  const leftColor = winner === "left" ? P.terracotta : P.muted;
  const rightColor = winner === "right" ? P.terracotta : P.muted;

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
          gap: 60,
        }}
      >
        {/* Left stat */}
        <div style={{ textAlign: "center", width: 520 }}>
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: serif,
              fontSize: 220,
              lineHeight: 0.9,
              color: leftColor,
              letterSpacing: "-0.03em",
              transform: `scale(${leftScale})`,
              transformOrigin: "center bottom",
            }}
          >
            {left.value}
          </div>
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 20,
            }}
          >
            {left.label}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            ...reveal(frame, at + 10),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 3,
              height: 120,
              backgroundColor: P.light,
            }}
          />
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 700,
              color: P.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {dividerText}
          </div>
          <div
            style={{
              width: 3,
              height: 120,
              backgroundColor: P.light,
            }}
          />
        </div>

        {/* Right stat */}
        <div style={{ textAlign: "center", width: 520 }}>
          <div
            style={{
              ...reveal(frame, at + 12),
              fontFamily: serif,
              fontSize: 220,
              lineHeight: 0.9,
              color: rightColor,
              letterSpacing: "-0.03em",
              transform: `scale(${rightScale})`,
              transformOrigin: "center bottom",
            }}
          >
            {right.value}
          </div>
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 20,
            }}
          >
            {right.label}
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${accentW}%`,
          maxWidth: 200,
          height: 4,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 34),
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
  compositionId: "dataviz-split-stat",
  props: {
    "left": {
      "value": "12.4M",
      "label": "Revenue"
    },
    "right": {
      "value": "8.1M",
      "label": "Cost"
    },
    "winner": "left",
    "dividerText": "NET",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
