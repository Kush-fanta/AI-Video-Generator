import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, dimTo, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ProgressiveBuildProps extends BaseProps {
  points: string[];
  title?: string;
  stagger?: number;
  at?: number;
}

/**
 * Points appear one at a time, staggered. Each point has a terracotta number
 * and sans text. Previous points dim when a new one arrives. Builds an argument.
 */
export const ProgressiveBuild: React.FC<ProgressiveBuildProps> = ({
  points,
  title,
  stagger = 28,
  at = 0,
  palette,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(palette);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
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
        {/* Optional title */}
        {title && (
          <div
            style={{
              ...reveal(frame, at),
              fontFamily: serif,
              fontSize: 44,
              color: CP.text,
              marginBottom: 56,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
        )}

        {/* Points */}
        {points.map((point, i) => {
          const pointAt = at + 12 + i * stagger;
          const nextAt = at + 12 + (i + 1) * stagger;
          const isLast = i === points.length - 1;

          // Dim when next point arrives
          const dim = isLast ? 1 : dimTo(frame, nextAt, 0.35, 12);

          return (
            <div
              key={i}
              style={{
                ...reveal(frame, pointAt),
                opacity: (reveal(frame, pointAt).opacity as number) * dim,
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                marginBottom: 40,
              }}
            >
              {/* Terracotta number */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 32,
                  fontWeight: 700,
                  color: CP.terracotta,
                  minWidth: 40,
                  lineHeight: 1.5,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Point text */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 42,
                  fontWeight: 500,
                  color: CP.text,
                  lineHeight: 1.45,
                  maxWidth: 720,
                }}
              >
                {point}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-progressive-build",
  props: {
    title: "Three things moved the room.",
    points: [
      "The data got smaller and clearer.",
      "The copy stopped arguing with the frame.",
      "The decision became obvious."
    ],
    stagger: 28
  },
  durationInFrames: 180,
};
