import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import type { Palette } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ThenNowColumnsProps extends BaseProps {
  thenDate: string;
  thenContent: string;
  nowDate: string;
  nowContent: string;
  at?: number;
  palette?: Partial<Palette>;
}

/**
 * ThenNowColumns — Two columns side by side.
 * Left column: "THEN" header with date, content in muted serif.
 * Right column: "NOW" header with date, content in bold terracotta sans.
 * Vertical divider (terracotta line) separates them.
 * Columns slide in from their respective sides.
 */
export const ThenNowColumns: React.FC<ThenNowColumnsProps> = ({
  thenDate,
  thenContent,
  nowDate,
  nowContent,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Left column slides in from left
  const leftSlide = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 70, mass: 1.0 },
  });
  const leftX = interpolate(leftSlide, [0, 1], [-300, 0], C);

  // Right column slides in from right (staggered)
  const rightSlide = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 16, stiffness: 70, mass: 1.0 },
  });
  const rightX = interpolate(rightSlide, [0, 1], [300, 0], C);

  // Vertical divider grows from center
  const dividerHeight = lineGrow(frame, at + 6, 25);

  const colWidth = 420;
  const contentTop = 600;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg, overflow: "hidden" }}>
      {/* LEFT COLUMN — THEN */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          left: 60,
          width: colWidth,
          transform: `translateX(${leftX}px)`,
          opacity: leftSlide,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: pal.muted,
            ...reveal(frame, at + 2),
          }}
        >
          THEN
        </div>

        {/* Date */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 500,
            color: pal.light,
            marginTop: 12,
            letterSpacing: "0.04em",
            ...reveal(frame, at + 6),
          }}
        >
          {thenDate}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: pal.muted,
            marginTop: 28,
            marginBottom: 36,
            opacity: leftSlide,
          }}
        />

        {/* Content */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 44,
            color: pal.muted,
            lineHeight: 1.35,
            ...reveal(frame, at + 12),
          }}
        >
          {thenContent}
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          position: "absolute",
          top: contentTop - 40,
          left: 540,
          width: 3,
          height: `${(dividerHeight / 100) * 800}px`,
          backgroundColor: pal.terracotta,
          borderRadius: 2,
          transformOrigin: "top center",
        }}
      />

      {/* RIGHT COLUMN — NOW */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          right: 60,
          width: colWidth,
          transform: `translateX(${rightX}px)`,
          opacity: rightSlide,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: pal.terracotta,
            ...reveal(frame, at + 4),
          }}
        >
          NOW
        </div>

        {/* Date */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 500,
            color: pal.sub,
            marginTop: 12,
            letterSpacing: "0.04em",
            ...reveal(frame, at + 8),
          }}
        >
          {nowDate}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: pal.terracotta,
            marginTop: 28,
            marginBottom: 36,
            opacity: rightSlide,
          }}
        />

        {/* Content */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            fontWeight: 700,
            color: pal.text,
            lineHeight: 1.35,
            ...reveal(frame, at + 16),
          }}
        >
          {nowContent}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-then-now-columns",
  props: {
    thenDate: "2005",
    thenContent: "Back-office support, data entry, call centres",
    nowDate: "2024",
    nowContent: "AI research, product engineering, global P&L ownership",
    at: 15,
  },
  durationInFrames: 180,
};
