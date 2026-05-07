import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface OverlapVennProps extends BaseProps {
  leftLabel: string;
  rightLabel: string;
  overlapLabel: string;
  at?: number;
}

/**
 * OverlapVenn — Two circles (terracotta + slate, 25% opacity) that slide together.
 * Left circle label, right circle label, overlap zone gets a third label.
 * Circles are 400px diameter.
 */
export const OverlapVenn: React.FC<OverlapVennProps> = ({
  leftLabel,
  rightLabel,
  overlapLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const diameter = 400;
  const centerY = 900;
  const finalOverlap = 120; // px of overlap between circles
  const totalWidth = diameter * 2 - finalOverlap;
  const startLeft = (1080 - totalWidth) / 2;

  // Circles start further apart and slide together
  const slideProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 12, stiffness: 50, mass: 1.4 },
  });

  // Extra spread at start
  const spread = 160;
  const leftCircleX = startLeft + interpolate(slideProgress, [0, 1], [-spread, 0], C);
  const rightCircleX = startLeft + diameter - finalOverlap + interpolate(slideProgress, [0, 1], [spread, 0], C);

  // Circle scale entrance
  const leftScale = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const rightScale = spring({
    frame: Math.max(0, f - 4),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  // Overlap label entrance (after circles meet)
  const overlapEntrance = spring({
    frame: Math.max(0, f - 24),
    fps: FPS,
    config: { damping: 12, stiffness: 120, mass: 0.5 },
  });

  // Circle label entrances
  const leftLabelEntrance = spring({
    frame: Math.max(0, f - 10),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const rightLabelEntrance = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left circle */}
      <div
        style={{
          position: "absolute",
          top: centerY - diameter / 2,
          left: leftCircleX,
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          opacity: 0.25,
          transform: `scale(${leftScale})`,
          transformOrigin: "center center",
        }}
      />

      {/* Right circle */}
      <div
        style={{
          position: "absolute",
          top: centerY - diameter / 2,
          left: rightCircleX,
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          backgroundColor: P.slate,
          opacity: 0.25,
          transform: `scale(${rightScale})`,
          transformOrigin: "center center",
        }}
      />

      {/* Left circle label */}
      <div
        style={{
          position: "absolute",
          top: centerY - 24,
          left: leftCircleX + 30,
          width: diameter - finalOverlap - 30,
          textAlign: "center",
          opacity: leftLabelEntrance,
          transform: `translateY(${interpolate(leftLabelEntrance, [0, 1], [16, 0], C)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 44,
            color: P.terracotta,
            lineHeight: 1.2,
          }}
        >
          {leftLabel}
        </div>
      </div>

      {/* Right circle label */}
      <div
        style={{
          position: "absolute",
          top: centerY - 24,
          left: rightCircleX + finalOverlap,
          width: diameter - finalOverlap - 30,
          textAlign: "center",
          opacity: rightLabelEntrance,
          transform: `translateY(${interpolate(rightLabelEntrance, [0, 1], [16, 0], C)}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 44,
            color: P.slate,
            lineHeight: 1.2,
          }}
        >
          {rightLabel}
        </div>
      </div>

      {/* Overlap label */}
      <div
        style={{
          position: "absolute",
          top: centerY + diameter / 2 + 40,
          left: "50%",
          transform: `translateX(-50%) scale(${overlapEntrance})`,
          transformOrigin: "top center",
        }}
      >
        {/* Connecting line from overlap zone */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            width: 2,
            height: 36,
            backgroundColor: P.text,
            opacity: overlapEntrance * 0.4,
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            color: P.text,
            textAlign: "center",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
          }}
        >
          {overlapLabel}
        </div>
      </div>

      {/* Labels above circles */}
      <div
        style={{
          ...reveal(frame, at + 2),
          position: "absolute",
          top: centerY - diameter / 2 - 100,
          left: leftCircleX,
          width: diameter,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        A
      </div>
      <div
        style={{
          ...reveal(frame, at + 4),
          position: "absolute",
          top: centerY - diameter / 2 - 100,
          left: rightCircleX,
          width: diameter,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        B
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-overlap-venn",
  props: {
    leftLabel: "Engineering",
    rightLabel: "Business",
    overlapLabel: "GCC Leaders",
    at: 15,
  },
  durationInFrames: 180,
};
