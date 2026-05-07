import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, dimTo, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ListBuildProps extends BaseProps {
  items: string[];
  title?: string;
  at?: number;
}

/** Stagger between items in frames */
const STAGGER = 22;

/**
 * ListBuild — Numbered list (1-5 items) where each item springs in from left
 * with stagger. Numbers in large serif terracotta, text in sans. Current item
 * is full opacity, previous items dim to 0.3. Builds anticipation.
 */
export const ListBuild: React.FC<ListBuildProps> = ({
  items,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const titleAt = at + 4;
  const firstItemAt = at + (title ? 26 : 10);
  const accentW = lineGrow(frame, at + 2, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Terracotta accent line top */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          width: `${accentW}%`,
          maxWidth: 100,
          height: 3.5,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Content container */}
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
          paddingRight: 100,
        }}
      >
        {/* Title */}
        {title && (
          <div
            style={{
              ...reveal(frame, titleAt),
              fontFamily: serif,
              fontSize: 64,
              color: P.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 56,
            }}
          >
            {title}
          </div>
        )}

        {/* List items */}
        {items.slice(0, 5).map((item, i) => {
          const itemAt = firstItemAt + i * STAGGER;
          const nextItemAt = firstItemAt + (i + 1) * STAGGER;
          const isLast = i === items.length - 1 || i === 4;

          // Spring entrance from left
          const slideProgress = frame >= itemAt
            ? spring({
                frame: frame - itemAt,
                fps: FPS,
                config: { damping: 14, mass: 1.0, stiffness: 110 },
              })
            : 0;

          const slideX = interpolate(slideProgress, [0, 1], [-60, 0], C);
          const itemOpacity = interpolate(slideProgress, [0, 0.3], [0, 1], C);

          // Dim previous items when next one enters
          const dim = !isLast && frame >= nextItemAt
            ? dimTo(frame, nextItemAt, 0.3, 10)
            : 1;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 28,
                marginBottom: i < items.length - 1 ? 36 : 0,
                opacity: itemOpacity * dim,
                transform: `translateX(${slideX}px)`,
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 72,
                  color: P.terracotta,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  flexShrink: 0,
                  minWidth: 70,
                }}
              >
                {i + 1}
              </span>

              {/* Item text */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 40,
                  fontWeight: 500,
                  color: P.text,
                  lineHeight: 1.35,
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 10, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-list-build",
  props: {
    items: ["Cost arbitrage", "Talent depth", "Time zone coverage", "Innovation", "Ownership"],
    title: "WHY INDIA",
    at: 15,
  },
  durationInFrames: 180,
};
