import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ScrollEvent {
  date: string;
  title: string;
  description?: string;
}

interface VerticalScrollProps extends BaseProps {
  events: ScrollEvent[];
  category?: string;
  source?: string;
  at?: number;
}

/**
 * VerticalScroll — Portrait 1080×1920 vertical timeline.
 * Left column: dates. Vertical spine with terracotta dots.
 * Right column: event titles + descriptions.
 * Events reveal top-to-bottom with stagger as the timeline
 * scrolls the content area upward. Previous events dim.
 */
export const VerticalScroll: React.FC<VerticalScrollProps> = ({
  events,
  category = "TIMELINE",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const count = events.length;
  const stagger = 28;
  const eventSpacing = 300;
  const spineX = 260;
  const dateLeft = 100;
  const contentLeft = 300;
  const startY = 260;
  const visibleHeight = 1500;

  const totalHeight = count * eventSpacing;
  const maxScroll = Math.max(0, totalHeight - visibleHeight);
  const scrollProgress = interpolate(
    frame, [at + 20, at + 20 + count * stagger], [0, 1], C
  );
  const scrollY = -maxScroll * scrollProgress;

  // Spine grows
  const spineGrow = lineGrow(frame, at + 8, count * stagger + 10);
  const spineHeight = (spineGrow / 100) * totalHeight;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* Category */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: dateLeft,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
          zIndex: 10,
        }}
      >
        {category}
      </div>

      {/* Scrolling container */}
      <div
        style={{
          position: "absolute",
          top: startY + scrollY,
          left: 0,
          width: 1080,
          height: totalHeight,
        }}
      >
        {/* Vertical spine line */}
        <div
          style={{
            position: "absolute",
            left: spineX - 1,
            top: 20,
            width: 2,
            height: spineHeight,
            backgroundColor: P.light,
          }}
        />

        {/* Events */}
        {events.map((evt, i) => {
          const eventAt = at + 14 + i * stagger;
          const y = i * eventSpacing;

          const enterSpring = spring({
            frame: Math.max(0, frame - eventAt),
            fps: FPS,
            config: { damping: 14, stiffness: 80, mass: 0.5 },
          });

          const dotScale = spring({
            frame: Math.max(0, frame - eventAt),
            fps: FPS,
            config: { damping: 10, stiffness: 130, mass: 0.4 },
          });

          // Dim older events
          const isLatest = i >= Math.floor(
            Math.max(0, frame - (at + 14)) / stagger
          );
          const dimOpacity = isLatest
            ? interpolate(enterSpring, [0, 1], [0, 1], C)
            : interpolate(frame,
                [eventAt, eventAt + 12, eventAt + stagger * 2, eventAt + stagger * 2 + 10],
                [0, 1, 1, 0.35], C
              );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                width: 1080,
                opacity: dimOpacity,
                transform: `translateY(${interpolate(enterSpring, [0, 1], [20, 0], C)}px)`,
              }}
            >
              {/* Date — left of spine */}
              <div
                style={{
                  position: "absolute",
                  left: dateLeft,
                  top: 4,
                  width: spineX - dateLeft - 30,
                  textAlign: "right",
                  fontFamily: sans,
                  fontSize: 26,
                  fontWeight: 700,
                  color: P.terracotta,
                  letterSpacing: "0.02em",
                }}
              >
                {evt.date}
              </div>

              {/* Spine dot */}
              <div
                style={{
                  position: "absolute",
                  left: spineX - 7,
                  top: 6,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: P.terracotta,
                  border: `2px solid ${P.bg}`,
                  transform: `scale(${dotScale})`,
                  boxShadow: `0 0 0 3px ${P.terracotta}22`,
                }}
              />

              {/* Content — right of spine */}
              <div
                style={{
                  position: "absolute",
                  left: contentLeft,
                  top: 0,
                  right: 100,
                }}
              >
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 40,
                    color: P.text,
                    lineHeight: 1.2,
                    marginBottom: 10,
                  }}
                >
                  {evt.title}
                </div>

                {evt.description && (
                  <div
                    style={{
                      ...reveal(frame, eventAt + 8),
                      fontFamily: sans,
                      fontSize: 26,
                      color: P.sub,
                      lineHeight: 1.5,
                      maxWidth: 640,
                    }}
                  >
                    {evt.description}
                  </div>
                )}

                {/* Subtle accent line */}
                <div
                  style={{
                    width: `${lineGrow(frame, eventAt + 6, 16)}%`,
                    maxWidth: 50,
                    height: 2,
                    backgroundColor: P.terracotta,
                    borderRadius: 1,
                    marginTop: 14,
                    opacity: 0.45,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 140,
          background: `linear-gradient(${P.bg}, transparent)`,
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1080,
          height: 140,
          background: `linear-gradient(transparent, ${P.bg})`,
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: dateLeft,
            ...reveal(frame, at + count * stagger + 25),
            fontFamily: sans,
            fontSize: 22,
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
    </AbsoluteFill>
  );
};
