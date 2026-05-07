import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

interface TimelineEvent {
  year: string;
  label: string;
  sublabel?: string;
  /** Mark as the inflection point (red instead of gold) */
  isInflection?: boolean;
}

export interface TimelineStripProps extends BaseProps {
  /** Background image — never bare canvas */
  image: ImageRef;
  /** Title (e.g. "THE ESCALATION LADDER") */
  title: string;
  /** Category label */
  categoryLabel?: string;
  /** Events along the timeline */
  events: TimelineEvent[];
  /** Badge */
  badge?: string;
  /** Image dim level */
  imageDim?: number;
  /** Source citation */
  source?: string;
  at?: number;
}

/**
 * TimelineStrip — Horizontal timeline with event markers on darkened image.
 *
 * Gold dots for events, red for inflection points. Events stagger in with spring.
 * Title at top in condensed sans. Timeline runs across the lower third.
 * Full-bleed image backing — never bare canvas.
 *
 * For frames like: "1971 Simla Agreement → 2003 Ceasefire violations → 2019 Balakot"
 */
export const TimelineStrip: React.FC<TimelineStripProps> = ({
  image,
  title,
  categoryLabel,
  events,
  badge,
  imageDim = 0.3,
  source,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 7);

  const trackY = 600;
  const trackLeft = 96;
  const trackRight = 1920 - 96;
  const trackWidth = trackRight - trackLeft;
  const segmentWidth = events.length > 1 ? trackWidth / (events.length - 1) : 0;

  // Track line draws in
  const trackGrow = spring({
    frame: Math.max(0, f - 18),
    fps: FPS,
    config: { damping: 22, stiffness: 40, mass: 1.5 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: CP.dark }}>
      {/* Image backing */}
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${imgScale})`,
          opacity: imageDim,
          position: "absolute",
        }}
      />

      {/* Top content */}
      <div style={{ position: "absolute", top: 54, left: 96, right: 96 }}>
        {categoryLabel && (
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CP.terracotta,
              marginBottom: 12,
            }}
          >
            {categoryLabel}
          </div>
        )}

        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: condensed,
            fontSize: 108,
            color: CP.text,
            letterSpacing: "0.02em",
            lineHeight: 0.95,
          }}
        >
          {title}
        </div>
      </div>

      {/* Timeline track */}
      <div
        style={{
          position: "absolute",
          top: trackY,
          left: trackLeft,
          width: trackWidth * trackGrow,
          height: 3,
          backgroundColor: CP.sub,
          opacity: 0.4,
        }}
      />

      {/* Events */}
      {events.map((event, i) => {
        const x = trackLeft + i * segmentWidth;
        const eventSpring = spring({
          frame: Math.max(0, f - 24 - i * 12),
          fps: FPS,
          config: { damping: 14, stiffness: 100, mass: 0.8 },
        });
        const dotColor = event.isInflection ? CP.mauve : CP.terracotta;

        return (
          <div key={i}>
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                top: trackY - 7,
                left: x - 7,
                width: 17,
                height: 17,
                borderRadius: "50%",
                backgroundColor: dotColor,
                transform: `scale(${eventSpring})`,
                boxShadow: `0 0 12px ${dotColor}44`,
              }}
            />

            {/* Vertical connector */}
            <div
              style={{
                position: "absolute",
                top: trackY + 14,
                left: x,
                width: 1,
                height: 20 * eventSpring,
                backgroundColor: `${dotColor}66`,
              }}
            />

            {/* Year */}
            <div
              style={{
                position: "absolute",
                top: trackY + 40,
                left: x,
                transform: "translateX(-50%)",
                fontFamily: condensed,
                fontSize: 56,
                color: dotColor,
                opacity: eventSpring,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {event.year}
            </div>

            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: trackY + 102,
                left: x,
                transform: "translateX(-50%)",
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 700,
                color: CP.text,
                opacity: eventSpring,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              {event.label}
            </div>

            {/* Sublabel */}
            {event.sublabel && (
              <div
                style={{
                  position: "absolute",
                  top: trackY + 130,
                  left: x,
                  transform: "translateX(-50%)",
                  fontFamily: sans,
                  fontSize: 18,
                  color: CP.sub,
                  opacity: eventSpring,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {event.sublabel}
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
            bottom: 32,
            left: 96,
            fontFamily: sans,
            fontSize: 18,
            color: CP.muted,
            ...reveal(frame, at + 50),
          }}
        >
          {source}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            ...reveal(frame, at + 2),
            backgroundColor: CP.mauve,
            padding: "8px 16px",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: CP.text,
            zIndex: 4,
          }}
        >
          {badge}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-timeline-strip",
  "props": {
    "image": "demo.png",
    "title": "THE ESCALATION LADDER",
    "categoryLabel": "TIMELINE",
    "events": [
      {
        "year": "1971",
        "label": "Simla Agreement"
      },
      {
        "year": "2003",
        "label": "Ceasefire",
        "sublabel": "Temporary calm"
      },
      {
        "year": "2019",
        "label": "Balakot",
        "isInflection": true
      }
    ],
    "badge": "#SWARAJYA",
    "source": "Historical records",
    "imageDim": 0.3,
    "at": 15
  },
  "durationInFrames": 180
};
