import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StackCollapseProps extends BaseProps {
  /** Lines to stack then collapse */
  lines: string[];
  /** Frame when lines start appearing */
  at?: number;
  /** Frame when collapse happens */
  collapseAt?: number;
  /** Spacing between lines in expanded state (px, default 28) */
  spacing?: number;
}

/**
 * Multiple lines stacked with generous spacing, then COLLAPSE into a single
 * tight block. Compression = urgency. Lines slide together with hard snap,
 * slight overshoot on the squeeze, background darkens slightly.
 */
export const StackCollapse: React.FC<StackCollapseProps> = ({
  lines,
  at = 0,
  collapseAt = 60,
  spacing = 28,
}) => {
  const frame = useCurrentFrame();

  // Each line enters staggered
  const stagger = 10;

  // Collapse animation: spacing goes from full to 0
  const collapseProgress = interpolate(
    frame, [collapseAt, collapseAt + 8], [0, 1], C
  );
  const currentSpacing = spacing * (1 - collapseProgress);

  // Scale slam on collapse
  const scale = frame < collapseAt
    ? 1
    : interpolate(frame, [collapseAt, collapseAt + 4, collapseAt + 8, collapseAt + 12], [1, 1.06, 0.98, 1.0], C);

  // Shake
  const shakeX = frame >= collapseAt && frame < collapseAt + 5
    ? (frame % 2 === 0 ? -4 : 4) : 0;

  // BG darkens on collapse
  const bgDark = interpolate(frame, [collapseAt, collapseAt + 10], [0, 0.06], C);

  return (
    <AbsoluteFill style={{
      backgroundColor: `rgb(${237 - bgDark * 80}, ${234 - bgDark * 80}, ${228 - bgDark * 80})`,
    }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale}) translateX(${shakeX}px)`,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              ...reveal(frame, at + i * stagger),
              fontFamily: i === lines.length - 1 ? serif : sans,
              fontSize: i === lines.length - 1 ? 80 : 56,
              fontWeight: i === lines.length - 1 ? 400 : 700,
              color: frame >= collapseAt ? P.terracotta : P.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: currentSpacing,
              textAlign: "center" as const,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-stack-collapse",
  props: { lines: ["Customer Support", "Data Entry", "Payroll Processing", "Ticket Routing", "Email Handling"], at: 15 },
  durationInFrames: 180,
};
