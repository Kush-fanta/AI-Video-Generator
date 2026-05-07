import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface TimelineHeroProps extends BaseProps {
  year: string;
  event: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Year number HUGE (200px+), event description below.
 * The year IS the visual. Ghost year fills backdrop.
 * For historical anchoring moments.
 */
export const TimelineHero: React.FC<TimelineHeroProps> = ({
  year,
  event,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const heroScale = overshootScale(frame, at + 4);
  const ghostOpacity = interpolate(frame, [at + 6, at + 22], [0, 0.04], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost year — massive backdrop */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: -60,
          transform: "translateY(-50%)",
          fontFamily: serif,
          fontSize: 700,
          lineHeight: 0.8,
          color: P.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.06em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {year}
      </div>

      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Main content — left aligned */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        {/* Year */}
        <div
          style={{
            ...reveal(frame, at + 4),
            transform: `scale(${heroScale})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 220,
              lineHeight: 0.9,
              color: P.text,
              letterSpacing: "-0.04em",
            }}
          >
            {year}
          </div>
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 12, 20)}%`,
            maxWidth: 100,
            height: 3.5,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {/* Event description */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 32,
            lineHeight: 1.4,
            color: P.sub,
            marginTop: 20,
            maxWidth: 540,
            fontWeight: 500,
          }}
        >
          {event}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-timeline-hero",
  "props": {
    "year": "1991",
    "event": "India opens its economy to the world",
    "categoryLabel": "THE TURNING POINT",
    "at": 15
  },
  "durationInFrames": 150
};
