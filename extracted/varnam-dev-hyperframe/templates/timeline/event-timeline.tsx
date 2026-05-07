import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TimelineEvent {
  year: string;
  title: string;
  description?: string;
}

interface EventTimelineProps extends BaseProps {
  events: TimelineEvent[];
  categoryLabel?: string;
  source?: string;
  at?: number;
}

/**
 * EventTimeline — Horizontal scrolling timeline with event markers.
 * Camera pans left-to-right across a wide container. Events spring in
 * with cards as the timeline reaches them. Terracotta for the event
 * marker closest to viewport center, slate for others. Track line draws
 * linearly tied to panProgress for deterministic timing.
 */
export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const CONTAINER_W = 2400;
  const viewportWidth = 1920;
  const trackY = 620;
  const trackHeight = 4;
  const eventSpacing = CONTAINER_W / (events.length + 1);

  // Camera pans across the full container over the duration
  const panProgress = interpolate(f, [0, 180], [0, 1], C);
  const translateX = interpolate(panProgress, [0, 1], [0, -(CONTAINER_W - viewportWidth)], C);

  // Track draws linearly tied to panProgress — deterministic
  const trackDrawn = interpolate(panProgress, [0, 1], [0, CONTAINER_W], C);

  // Current camera center in container space
  const cameraCenter = viewportWidth / 2 - translateX;

  // Determine which event marker is closest to the viewport center
  const eventXPositions = events.map((_, i) => eventSpacing * (i + 1));
  const activeIndex = eventXPositions.reduce((closest, x, i) => {
    return Math.abs(x - cameraCenter) < Math.abs(eventXPositions[closest] - cameraCenter)
      ? i
      : closest;
  }, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* Category label — fixed position */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 20,
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

      {/* Scrolling container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: CONTAINER_W,
          height: "100%",
          transform: `translateX(${translateX}px)`,
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: "absolute",
            top: trackY,
            left: 100,
            width: CONTAINER_W - 200,
            height: trackHeight,
            backgroundColor: P.light,
            borderRadius: trackHeight / 2,
          }}
        />

        {/* Track fill — linear progress tied to panProgress */}
        <div
          style={{
            position: "absolute",
            top: trackY,
            left: 100,
            width: Math.min(trackDrawn - 100, CONTAINER_W - 200),
            height: trackHeight,
            backgroundColor: P.slate,
            borderRadius: trackHeight / 2,
          }}
        />

        {/* Event markers and cards */}
        {events.map((evt, i) => {
          const x = eventSpacing * (i + 1);
          const eventPosition = (x - 100) / (CONTAINER_W - 200);
          const reached = trackDrawn >= x;

          // Stagger appearance relative to when track reaches the event
          const eventAt = at + Math.round(eventPosition * 160) + 10;
          const cardF = Math.max(0, frame - eventAt);

          const markerPop = reached
            ? spring({
                frame: cardF,
                fps: FPS,
                config: { damping: 10, stiffness: 120, mass: 0.4 },
              })
            : 0;

          const cardSlide = reached
            ? spring({
                frame: Math.max(0, cardF - 4),
                fps: FPS,
                config: { damping: 14, stiffness: 80, mass: 0.6 },
              })
            : 0;

          // Active event is whichever marker is closest to viewport center
          const isActive = i === activeIndex;
          const markerColor = isActive ? P.terracotta : P.slate;
          const isAbove = i % 2 === 0;

          return (
            <div key={i}>
              {/* Marker dot */}
              <div
                style={{
                  position: "absolute",
                  top: trackY + trackHeight / 2 - 8 * markerPop,
                  left: x - 8 * markerPop,
                  width: 16 * markerPop,
                  height: 16 * markerPop,
                  borderRadius: "50%",
                  backgroundColor: markerColor,
                  border: `2px solid ${P.bg}`,
                  boxShadow: isActive ? `0 0 0 4px ${P.terracotta}33` : "none",
                }}
              />

              {/* Connector line — 90px tall */}
              {reached && (
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: isAbove ? trackY - 98 : trackY + trackHeight + 8,
                    width: 1,
                    height: 90,
                    backgroundColor: P.light,
                    opacity: cardSlide,
                  }}
                />
              )}

              {/* Event card — 330px wide, using freed upper space */}
              {reached && (
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: isAbove ? trackY - 330 : trackY + trackHeight + 102,
                    transform: `translateX(-50%) translateY(${interpolate(cardSlide, [0, 1], [20, 0], C)}px)`,
                    opacity: cardSlide,
                    width: 330,
                    padding: "20px 24px",
                    backgroundColor: P.bg,
                    borderRadius: 12,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    border: `1px solid ${isActive ? P.terracotta + "44" : P.light}`,
                  }}
                >
                  {/* Year */}
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 24,
                      fontWeight: 700,
                      color: isActive ? P.terracotta : P.muted,
                      marginBottom: 8,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {evt.year}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 64,
                      color: P.text,
                      lineHeight: 1.15,
                      marginBottom: evt.description ? 8 : 0,
                    }}
                  >
                    {evt.title}
                  </div>

                  {/* Description */}
                  {evt.description && (
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 20,
                        color: P.sub,
                        lineHeight: 1.4,
                      }}
                    >
                      {evt.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Source — fixed bottom-left */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 30),
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

      {/* Decorative bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          width: `${lineGrow(frame, at + 20, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
};
