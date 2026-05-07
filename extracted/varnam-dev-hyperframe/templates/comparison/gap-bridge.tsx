import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface GapBridgeProps extends BaseProps {
  fromValue: string;
  fromLabel: string;
  toValue: string;
  toLabel: string;
  gapLabel?: string;
  at?: number;
}

/**
 * GapBridge — Two cliff-like blocks on left and right with a gap.
 * A bridge (terracotta line) grows from left to right to connect them.
 * Left cliff shows "from" value, right cliff shows "to" value.
 * The gap distance is labeled below the bridge.
 */
export const GapBridge: React.FC<GapBridgeProps> = ({
  fromValue,
  fromLabel,
  toValue,
  toLabel,
  gapLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Left cliff entrance
  const leftCliff = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const leftY = interpolate(leftCliff, [0, 1], [100, 0], C);

  // Right cliff entrance (staggered)
  const rightCliff = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const rightY = interpolate(rightCliff, [0, 1], [100, 0], C);

  // Bridge grows from left to right
  const bridgeProgress = lineGrow(frame, at + 16, 30);

  // Gap label fade in after bridge completes
  const gapLabelEntrance = spring({
    frame: Math.max(0, f - 36),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });

  // Layout constants
  const cliffWidth = 320;
  const cliffHeight = 500;
  const gapWidth = 360;
  const cliffTop = 700;
  const leftCliffX = 60;
  const rightCliffX = 1080 - 60 - cliffWidth;
  const bridgeY = cliffTop + 40;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left cliff */}
      <div
        style={{
          position: "absolute",
          top: cliffTop,
          left: leftCliffX,
          width: cliffWidth,
          height: cliffHeight,
          backgroundColor: P.sub,
          borderRadius: "12px 12px 0 0",
          transform: `translateY(${leftY}px)`,
          opacity: leftCliff,
        }}
      >
        {/* From value */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 0,
            width: cliffWidth,
            textAlign: "center",
            ...reveal(frame, at + 4),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              color: P.text,
              lineHeight: 1.0,
            }}
          >
            {fromValue}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.muted,
              marginTop: 12,
              lineHeight: 1.3,
            }}
          >
            {fromLabel}
          </div>
        </div>

        {/* Cliff surface texture — horizontal lines */}
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((frac, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${frac * 100}%`,
              left: 20,
              width: cliffWidth - 40,
              height: 2,
              backgroundColor: P.dark,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Right cliff */}
      <div
        style={{
          position: "absolute",
          top: cliffTop,
          left: rightCliffX,
          width: cliffWidth,
          height: cliffHeight,
          backgroundColor: P.sub,
          borderRadius: "12px 12px 0 0",
          transform: `translateY(${rightY}px)`,
          opacity: rightCliff,
        }}
      >
        {/* To value */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 0,
            width: cliffWidth,
            textAlign: "center",
            ...reveal(frame, at + 8),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              color: P.terracotta,
              lineHeight: 1.0,
            }}
          >
            {toValue}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.muted,
              marginTop: 12,
              lineHeight: 1.3,
            }}
          >
            {toLabel}
          </div>
        </div>

        {/* Cliff surface texture */}
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((frac, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${frac * 100}%`,
              left: 20,
              width: cliffWidth - 40,
              height: 2,
              backgroundColor: P.dark,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Bridge — terracotta line growing left to right */}
      <div
        style={{
          position: "absolute",
          top: bridgeY,
          left: leftCliffX + cliffWidth,
          width: `${(bridgeProgress / 100) * gapWidth}px`,
          height: 6,
          backgroundColor: P.terracotta,
          borderRadius: 3,
        }}
      />

      {/* Bridge support dots at endpoints */}
      <div
        style={{
          position: "absolute",
          top: bridgeY - 6,
          left: leftCliffX + cliffWidth - 9,
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          opacity: bridgeProgress > 5 ? 1 : 0,
        }}
      />
      {bridgeProgress > 95 && (
        <div
          style={{
            position: "absolute",
            top: bridgeY - 6,
            left: rightCliffX - 9,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
          }}
        />
      )}

      {/* Gap label below bridge */}
      {gapLabel && (
        <div
          style={{
            position: "absolute",
            top: bridgeY + 40,
            left: leftCliffX + cliffWidth,
            width: gapWidth,
            textAlign: "center",
            opacity: gapLabelEntrance,
            transform: `translateY(${interpolate(gapLabelEntrance, [0, 1], [16, 0], C)}px)`,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 48,
              color: P.terracotta,
              lineHeight: 1.0,
            }}
          >
            {gapLabel}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-gap-bridge",
  props: {
    fromValue: "$30B",
    fromLabel: "2015",
    toValue: "$100B",
    toLabel: "2024",
    gapLabel: "3.3x growth",
    at: 15,
  },
  durationInFrames: 180,
};
