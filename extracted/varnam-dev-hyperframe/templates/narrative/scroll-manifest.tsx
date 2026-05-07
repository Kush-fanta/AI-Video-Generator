import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ScrollManifestProps extends BaseProps {
  /** List items to scroll through */
  items: string[];
  /** Frame to start scrolling */
  at?: number;
  /** Total scroll duration in frames (default 120) */
  scrollDuration?: number;
  /** Optional title above the list */
  title?: string;
}

const ITEM_HEIGHT = 72;
const CENTER_OFFSET = 540; // vertical center of 1080p

/**
 * Long list that scrolls vertically (auto). Items highlighted as they pass center —
 * active item is terracotta + serif + larger, others dim. For lists, timelines, inventories.
 * Thin progress line on the right tracks scroll position.
 */
export const ScrollManifest: React.FC<ScrollManifestProps> = ({
  items,
  at = 0,
  scrollDuration = 120,
  title,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - at;

  // Scroll position: which item index is at center
  const scrollProgress = interpolate(rel, [0, scrollDuration], [0, items.length - 1], C);
  const activeIndex = Math.round(scrollProgress);

  // Y offset for the list container
  const scrollY = -scrollProgress * ITEM_HEIGHT;

  const opacity = interpolate(rel, [0, 8], [0, 1], C);

  // Progress bar on right
  const progressPct = interpolate(rel, [0, scrollDuration], [0, 100], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
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

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 120,
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            color: P.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            opacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Progress track — right edge */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 160,
          bottom: 160,
          width: 3,
          backgroundColor: P.light,
          borderRadius: 2,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 3,
            height: `${progressPct}%`,
            backgroundColor: P.terracotta,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Scrolling list */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          overflow: "hidden",
          opacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: CENTER_OFFSET,
            transform: `translateY(${scrollY}px)`,
          }}
        >
          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const distance = Math.abs(i - scrollProgress);
            const itemOpacity = interpolate(distance, [0, 2, 4], [1, 0.4, 0.15], C);

            return (
              <div
                key={i}
                style={{
                  height: ITEM_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: isActive ? serif : sans,
                  fontSize: isActive ? 64 : 42,
                  fontWeight: isActive ? 400 : 700,
                  color: isActive ? P.terracotta : P.text,
                  opacity: itemOpacity,
                  letterSpacing: isActive ? "-0.02em" : "-0.01em",
                  paddingLeft: isActive ? 0 : 8,
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center indicator line */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: CENTER_OFFSET - 2,
          width: 12,
          height: 4,
          backgroundColor: P.terracotta,
          borderRadius: 2,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-scroll-manifest",
  props: { items: ["Cost arbitrage", "Talent depth", "Time zone coverage", "Innovation capability", "Strategic ownership"], title: "THE PILLARS", at: 15 },
  durationInFrames: 180,
};
