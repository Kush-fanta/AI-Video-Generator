import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { MughalArch, PaisleyBorder } from "../shared/indian/patterns";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TimelineEvent {
  /** Year or date string */
  date: string;
  /** Event description */
  event: string;
}

interface DynastyTimelineProps extends BaseProps {
  /** Timeline events, displayed top to bottom */
  events: TimelineEvent[];
  /** Optional title */
  title?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Vertical timeline with MughalArch markers at each node. Dates in large serif,
 * events in sans. PaisleyBorder on left edge. Staggered reveal top to bottom.
 */
export const DynastyTimeline: React.FC<DynastyTimelineProps> = ({
  events,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const lineHeight = interpolate(frame, [at + 8, at + 50], [0, 100], { ...C, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Paisley border left edge */}
      <PaisleyBorder color={MUGHAL.gold} opacity={0.12} side="left" at={at} />

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 160,
            zIndex: 3,
          }}
        >
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: serif,
              fontSize: 36,
              color: MUGHAL.ivory,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 60,
              height: 2,
              backgroundColor: MUGHAL.gold,
              marginTop: 12,
              opacity: interpolate(frame, [at + 4, at + 12], [0, 1], C),
            }}
          />
        </div>
      )}

      {/* Timeline vertical line */}
      <div
        style={{
          position: "absolute",
          top: title ? 120 : 60,
          left: 220,
          width: 1.5,
          height: `${lineHeight * 0.7}%`,
          backgroundColor: MUGHAL.gold,
          opacity: 0.25,
          zIndex: 1,
        }}
      />

      {/* Events */}
      <div
        style={{
          position: "absolute",
          top: title ? 130 : 70,
          left: 160,
          right: 100,
          zIndex: 2,
        }}
      >
        {events.map((ev, i) => {
          const delay = at + 10 + i * 14;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: 36,
                ...reveal(frame, delay),
              }}
            >
              {/* Arch marker */}
              <div style={{ width: 44, height: 52, flexShrink: 0, marginRight: 24, marginTop: -4 }}>
                <MughalArch
                  color={MUGHAL.gold}
                  at={delay}
                  strokeWidth={1.5}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* Date + event */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 34,
                    color: MUGHAL.gold,
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {ev.date}
                </div>
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 18,
                    color: MUGHAL.ivory,
                    opacity: 0.65,
                    lineHeight: 1.5,
                    marginTop: 8,
                    maxWidth: 600,
                  }}
                >
                  {ev.event}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
