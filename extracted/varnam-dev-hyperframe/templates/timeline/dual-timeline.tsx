import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TrackEvent {
  year: string;
  title: string;
}

interface Track {
  label: string;
  events: TrackEvent[];
}

interface DualTimelineProps extends BaseProps {
  trackA: Track;
  trackB: Track;
  categoryLabel?: string;
  source?: string;
  at?: number;
}

/**
 * DualTimeline — Two parallel horizontal timelines advancing together.
 * Track A (top, e.g. "Policy") and Track B (bottom, e.g. "Outcome")
 * with events on each track connected by vertical dashed lines showing
 * cause-and-effect relationships. Events appear with spring physics
 * as time advances left to right.
 *
 * Overlap prevention: event cards alternate above/below their track line
 * so dense timelines never collide. Odd-indexed cards shift further from
 * the track than even-indexed cards.
 */
export const DualTimeline: React.FC<DualTimelineProps> = ({
  trackA,
  trackB,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Canvas: 1920x1080 (landscape 16:9)
  const trackLeft = 120;
  const trackWidth = 1680; // 120 + 1680 + 120 = 1920px
  // Vertical: tracks centered in 1080px height
  // Track A at 380px, Track B at 700px — 320px gap for cards
  const trackAY = 380;
  const trackBY = 700;
  const trackHeight = 4;
  const gapY = trackBY - trackAY;

  // Minimum horizontal gap between card centers to prevent collision
  const CARD_W = 200;
  const MIN_GAP = CARD_W + 32; // 232px minimum centre-to-centre

  // Determine max events for spacing
  const maxEvents = Math.max(trackA.events.length, trackB.events.length);
  const rawSpacing = trackWidth / (maxEvents + 1);
  // Clamp so cards don't crowd — if fewer events, let them breathe
  const eventSpacing = Math.max(rawSpacing, MIN_GAP);
  const stagger = 25;

  // Track draw progress
  const drawProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 25, stiffness: 35, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 120,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.muted,
            zIndex: 10,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Track A label */}
      <div
        style={{
          position: "absolute",
          top: trackAY - 56,
          left: 120,
          ...reveal(frame, at + 4),
          fontFamily: sans,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: P.sage,
        }}
      >
        {trackA.label}
      </div>

      {/* Track B label */}
      <div
        style={{
          position: "absolute",
          top: trackBY + 16,
          left: 120,
          ...reveal(frame, at + 6),
          fontFamily: sans,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: P.terracotta,
        }}
      >
        {trackB.label}
      </div>

      {/* Track A background */}
      <div
        style={{
          position: "absolute",
          top: trackAY,
          left: trackLeft,
          width: trackWidth,
          height: trackHeight,
          backgroundColor: P.light,
          borderRadius: trackHeight / 2,
        }}
      />

      {/* Track A fill */}
      <div
        style={{
          position: "absolute",
          top: trackAY,
          left: trackLeft,
          width: trackWidth * drawProgress,
          height: trackHeight,
          backgroundColor: P.sage,
          borderRadius: trackHeight / 2,
        }}
      />

      {/* Track B background */}
      <div
        style={{
          position: "absolute",
          top: trackBY,
          left: trackLeft,
          width: trackWidth,
          height: trackHeight,
          backgroundColor: P.light,
          borderRadius: trackHeight / 2,
        }}
      />

      {/* Track B fill */}
      <div
        style={{
          position: "absolute",
          top: trackBY,
          left: trackLeft,
          width: trackWidth * drawProgress,
          height: trackHeight,
          backgroundColor: P.terracotta,
          borderRadius: trackHeight / 2,
        }}
      />

      {/* Track A events */}
      {trackA.events.map((evt, i) => {
        const x = trackLeft + eventSpacing * (i + 1);
        const eventPos = (x - trackLeft) / trackWidth;
        const reached = drawProgress >= eventPos;
        const eventAt = at + 10 + i * stagger;
        const eventF = Math.max(0, frame - eventAt);

        const pop = reached
          ? spring({
              frame: eventF,
              fps: FPS,
              config: { damping: 10, stiffness: 110, mass: 0.4 },
            })
          : 0;

        // Alternate card position above Track A: even go further up, odd closer
        // Track A at 380px; cards at ~180 or ~260 — within canvas
        const cardOffsetY = i % 2 === 0 ? -200 : -120;

        return (
          <div key={`a-${i}`}>
            {/* Marker */}
            <div
              style={{
                position: "absolute",
                top: trackAY + trackHeight / 2 - 7 * pop,
                left: x - 7 * pop,
                width: 14 * pop,
                height: 14 * pop,
                borderRadius: "50%",
                backgroundColor: P.sage,
                border: `2px solid ${P.bg}`,
              }}
            />

            {/* Event card — alternates above track A to avoid collision */}
            {reached && (
              <div
                style={{
                  position: "absolute",
                  top: trackAY + cardOffsetY,
                  left: x,
                  transform: `translateX(-50%) translateY(${interpolate(pop, [0, 1], [16, 0], C)}px)`,
                  opacity: pop,
                  textAlign: "center",
                  width: CARD_W,
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 40,
                    fontWeight: 700,
                    color: P.muted,
                    marginBottom: 6,
                  }}
                >
                  {evt.year}
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 44,
                    color: P.text,
                    lineHeight: 1.2,
                  }}
                >
                  {evt.title}
                </div>
              </div>
            )}

            {/* Connecting vertical line to Track B — if matching event exists */}
            {reached && i < trackB.events.length && (
              <div
                style={{
                  position: "absolute",
                  top: trackAY + trackHeight + 4,
                  left: x,
                  width: 1,
                  height: `${interpolate(pop, [0, 1], [0, gapY - trackHeight - 8], C)}px`,
                  borderLeft: `2px dashed ${P.light}`,
                  opacity: pop * 0.5,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Track B events */}
      {trackB.events.map((evt, i) => {
        const x = trackLeft + eventSpacing * (i + 1);
        const eventPos = (x - trackLeft) / trackWidth;
        const reached = drawProgress >= eventPos;
        // Track B events appear slightly after Track A
        const eventAt = at + 18 + i * stagger;
        const eventF = Math.max(0, frame - eventAt);

        const pop = reached
          ? spring({
              frame: eventF,
              fps: FPS,
              config: { damping: 10, stiffness: 110, mass: 0.4 },
            })
          : 0;

        // Alternate card position below Track B to avoid collision
        // Track B at 700px; cards at ~720 or ~800 — within 1080 canvas
        const cardOffsetY = i % 2 === 0 ? 20 : 100;

        return (
          <div key={`b-${i}`}>
            {/* Marker */}
            <div
              style={{
                position: "absolute",
                top: trackBY + trackHeight / 2 - 7 * pop,
                left: x - 7 * pop,
                width: 14 * pop,
                height: 14 * pop,
                borderRadius: "50%",
                backgroundColor: P.terracotta,
                border: `2px solid ${P.bg}`,
              }}
            />

            {/* Event card — alternates below track B to avoid collision */}
            {reached && (
              <div
                style={{
                  position: "absolute",
                  top: trackBY + trackHeight + cardOffsetY,
                  left: x,
                  transform: `translateX(-50%) translateY(${interpolate(pop, [0, 1], [16, 0], C)}px)`,
                  opacity: pop,
                  textAlign: "center",
                  width: CARD_W,
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 40,
                    fontWeight: 700,
                    color: P.terracotta,
                    marginBottom: 6,
                  }}
                >
                  {evt.year}
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 44,
                    color: P.text,
                    lineHeight: 1.2,
                  }}
                >
                  {evt.title}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 120,
            ...reveal(frame, at + maxEvents * stagger + 20),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
            zIndex: 10,
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Decorative horizontal rule at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: trackLeft,
          width: `${lineGrow(frame, at + 20, 30)}%`,
          maxWidth: 240,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};
