import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ToggleStateProps extends BaseProps {
  before: string;
  after: string;
  toggleAt?: number;
  at?: number;
}

/**
 * ToggleState — Large toggle switch metaphor.
 * Shows "before" state, then the toggle physically slides with spring physics,
 * revealing the "after" state. Track is P.light, knob is terracotta.
 */
export const ToggleState: React.FC<ToggleStateProps> = ({
  before,
  after,
  toggleAt = 30,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Toggle entrance
  const entranceScale = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  // Toggle slide animation — fires at toggleAt
  const toggleProgress = spring({
    frame: Math.max(0, f - toggleAt),
    fps: FPS,
    config: { damping: 12, stiffness: 90, mass: 1.0 },
  });

  // Knob position: slides from left to right inside the track
  const trackWidth = 400;
  const trackHeight = 120;
  const knobSize = 96;
  const knobPadding = 12;
  const knobX = interpolate(
    toggleProgress,
    [0, 1],
    [knobPadding, trackWidth - knobSize - knobPadding],
    C,
  );

  // Track color transition
  const trackBg = toggleProgress > 0.5 ? P.terracotta : P.light;
  const trackOpacity = interpolate(toggleProgress, [0.4, 0.6], [1, 1], C);

  // Text crossfade
  const beforeOpacity = interpolate(toggleProgress, [0, 0.4], [1, 0.2], C);
  const afterOpacity = interpolate(toggleProgress, [0.5, 1], [0, 1], C);

  // After text spring scale
  const afterScale = spring({
    frame: Math.max(0, f - toggleAt - 8),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.9 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${entranceScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 80,
        }}
      >
        {/* BEFORE label */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: P.muted,
            ...reveal(frame, at + 4),
          }}
        >
          BEFORE
        </div>

        {/* Before text */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            color: P.muted,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 800,
            ...reveal(frame, at + 8),
            opacity: beforeOpacity,
          }}
        >
          {before}
        </div>

        {/* Toggle track */}
        <div
          style={{
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: trackBg,
            position: "relative",
            ...reveal(frame, at + 12),
            opacity: trackOpacity,
          }}
        >
          {/* Knob */}
          <div
            style={{
              position: "absolute",
              top: knobPadding,
              left: knobX,
              width: knobSize,
              height: knobSize,
              borderRadius: "50%",
              backgroundColor: toggleProgress > 0.5 ? "#fff" : P.terracotta,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* AFTER label */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: toggleProgress > 0.5 ? P.terracotta : P.muted,
            opacity: afterOpacity,
          }}
        >
          AFTER
        </div>

        {/* After text */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            color: P.text,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 800,
            fontWeight: 400,
            opacity: afterOpacity,
            transform: `scale(${afterScale})`,
          }}
        >
          {after}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-toggle-state",
  props: {
    before: "Outsourcing",
    after: "In-house innovation",
    toggleAt: 45,
    at: 15,
  },
  durationInFrames: 180,
};
