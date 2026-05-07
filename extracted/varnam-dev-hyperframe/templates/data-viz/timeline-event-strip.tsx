import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { C, ease, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

export interface TimelineEvent {
  /** Date string (e.g. "1971", "MAR 2023", "12 APR") */
  date: string;
  /** Event label (e.g. "SIMLA AGREEMENT SIGNED") */
  label: string;
  /**
   * "threat" = red dot (adversary action, escalation).
   * "capability" = gold dot (India action, positive development).
   * Default: "capability".
   */
  type?: "threat" | "capability";
  /** Optional short annotation below label (e.g. "Pakistan recognises Bangladesh") */
  annotation?: string;
}

interface TimelineEventStripProps extends BaseProps {
  /** Array of events to display left-to-right */
  events: TimelineEvent[];
  /** Chart title above the timeline */
  title?: string;
  /** Source citation */
  source?: string;
  /** Channel badge text. Default: "#SWARAJYA" */
  badge?: string;
  /**
   * Frame when the first event appears. Default: 0.
   * Events stagger left-to-right over 120 frames total.
   * Per spec: "builds left-to-right over 120 frames".
   */
  at?: number;
  /**
   * Total frames allocated for the build sequence. Default: 120.
   */
  buildFrames?: number;
}

/**
 * TimelineEventStrip — Horizontal building timeline of events.
 *
 * Events appear left-to-right in sequence over 120 frames (spec).
 * Each node: gold dot (capability) or red dot (threat) + date + label.
 * Horizontal connector line grows between nodes as they build.
 *
 * Canvas: #192841 (channel canvas — navy).
 * Font: Bebas Neue for dates, DM Sans for labels.
 * Motion: spring entrance per node, soft fade-in for text (channel rule).
 *
 * Suitable for: historical sequences, treaty chronologies, escalation ladders.
 */
export const TimelineEventStrip: React.FC<TimelineEventStripProps> = ({
  events,
  title,
  source,
  badge = "#SWARAJYA",
  at = 0,
  buildFrames = 120,
}) => {
  const frame = useCurrentFrame();

  // Swarajya palette
  const canvas = "#192841";
  const gold = "#D4A264";
  const red = "#D8323E";
  const textPrimary = "#F5F2EA";
  const textDim = "#A0A8B4";
  const canvasDark = "#0F1E38";

  // Safe area — sized for 960×540 catalog canvas
  const safeH = 48;
  const safeV = 28;

  const n = events.length;
  // Stagger interval: distribute 120 build frames across n events
  // Each event gets buildFrames / n frames of lead time
  const staggerInterval = n > 1 ? buildFrames / n : buildFrames;

  // Timeline layout — centered vertically in the lower two-thirds
  // Title takes top third (~200px), timeline is in middle band
  const timelineY = title ? 370 : 300;  // y of the connector line — 960×540 canvas
  const dotRadius = 10;                  // gold/red node dot radius
  const dotDiameter = dotRadius * 2;

  // Usable width: 960 - 2*48 = 864px
  const usableW = 864;
  // Distribute nodes evenly
  const nodeSpacing = n > 1 ? usableW / (n - 1) : usableW / 2;
  const firstNodeX = safeH;

  // Connector line: grows from left as events are revealed
  // Full width = usableW, grows at the pace of event reveals
  const lineGrowthPct = (eventIndex: number) => {
    if (n <= 1) return 1;
    return eventIndex / (n - 1);
  };

  // Title soft fade-in
  const titleOpacity = interpolate(frame, [at + 2, at + 20], [0, 1], C);
  const ruleW = interpolate(frame, [at + 10, at + 28], [0, 140], { ...C, easing: ease });

  // Source fades in after all events
  const allDone = at + buildFrames + 20;
  const sourceOpacity = interpolate(frame, [allDone, allDone + 18], [0, 1], C);
  const badgeOpacity = interpolate(frame, [at, at + 12], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: canvas }}>
      {/* Subtle gradient at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 200,
          background: `linear-gradient(to top, ${canvasDark}, transparent)`,
          pointerEvents: "none",
        }}
      />

      {/* Channel badge — top-right */}
      <div
        style={{
          position: "absolute",
          top: safeV,
          right: safeH,
          backgroundColor: red,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 6,
          paddingBottom: 6,
          opacity: badgeOpacity,
        }}
      >
        <span
          style={{
            fontFamily: condensed,
            fontSize: 28,
            color: textPrimary,
            letterSpacing: "0.12em",
          }}
        >
          {badge}
        </span>
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: safeH,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily: condensed,
              fontSize: 48,
              color: textPrimary,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: ruleW,
              height: 2,
              backgroundColor: gold,
              marginTop: 10,
            }}
          />
        </div>
      )}

      {/* ── Connector line — grows left to right as events build ── */}
      {n > 1 && (() => {
        // Find how many events have started appearing
        let lastRevealedIndex = -1;
        for (let i = 0; i < n; i++) {
          const nodeAt = at + i * staggerInterval;
          if (frame >= nodeAt) lastRevealedIndex = i;
        }
        if (lastRevealedIndex < 0) return null;

        // Line goes from node 0 to lastRevealedIndex, with partial progress on the next
        const nextI = lastRevealedIndex + 1;
        const nextNodeAt = at + nextI * staggerInterval;
        const prevNodeAt = at + lastRevealedIndex * staggerInterval;
        const partialPct = nextI < n
          ? interpolate(frame, [prevNodeAt, nextNodeAt], [0, 1], C)
          : 1;
        const lineEndX = lastRevealedIndex < n - 1
          ? firstNodeX + lastRevealedIndex * nodeSpacing + partialPct * nodeSpacing
          : firstNodeX + (n - 1) * nodeSpacing;
        const lineWidth = lineEndX - firstNodeX;

        return (
          <div
            style={{
              position: "absolute",
              top: timelineY - 1,
              left: firstNodeX,
              width: lineWidth,
              height: 2,
              backgroundColor: textDim,
              opacity: 0.5,
            }}
          />
        );
      })()}

      {/* ── Event nodes ── */}
      {events.map((ev, i) => {
        const nodeAt = at + i * staggerInterval;
        const nodeF = Math.max(0, frame - nodeAt);
        const dotColor = ev.type === "threat" ? red : gold;

        // Spring entrance for the dot
        const dotSpring = spring({
          frame: nodeF,
          fps: FPS,
          config: { damping: 16, stiffness: 220, mass: 0.5 },
        });
        const dotScale = dotSpring;
        const dotOpacity = interpolate(nodeF, [0, 8], [0, 1], C);

        // Soft fade-in for text (channel rule)
        const textOpacity = interpolate(frame, [nodeAt + 6, nodeAt + 22], [0, 1], C);

        const nodeX = firstNodeX + i * nodeSpacing;
        // Alternate above/below timeline to avoid label crowding
        const isAbove = i % 2 === 0;

        return (
          <div key={i}>
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                top: timelineY - dotRadius,
                left: nodeX - dotRadius,
                width: dotDiameter,
                height: dotDiameter,
                borderRadius: "50%",
                backgroundColor: dotColor,
                transform: `scale(${dotScale})`,
                opacity: dotOpacity,
                // Outer ring
                boxShadow: `0 0 0 3px ${canvas}, 0 0 0 5px ${dotColor}40`,
              }}
            />

            {/* Vertical connector to label */}
            <div
              style={{
                position: "absolute",
                left: nodeX,
                top: isAbove ? timelineY - dotRadius - 32 : timelineY + dotRadius,
                width: 1,
                height: 32,
                backgroundColor: dotColor,
                opacity: dotOpacity * 0.4,
              }}
            />

            {/* Date + label block — above or below the line */}
            <div
              style={{
                position: "absolute",
                left: Math.max(safeH, Math.min(nodeX - 60, 960 - safeH - 120)),
                top: isAbove ? timelineY - dotRadius - 32 - 70 : timelineY + dotRadius + 32,
                width: 120,
                opacity: textOpacity,
                textAlign: "center" as const,
              }}
            >
              {/* Date */}
              <div
                style={{
                  fontFamily: condensed,
                  fontSize: 22,
                  color: dotColor,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                }}
              >
                {ev.date}
              </div>
              {/* Label */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: textPrimary,
                  lineHeight: 1.25,
                  marginTop: 4,
                }}
              >
                {ev.label}
              </div>
              {/* Annotation */}
              {ev.annotation && (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 12,
                    color: textDim,
                    lineHeight: 1.3,
                    marginTop: 4,
                    opacity: 0.8,
                  }}
                >
                  {ev.annotation}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: safeV + 8,
            left: safeH,
            opacity: sourceOpacity,
            fontFamily: sans,
            fontSize: 28,
            color: textDim,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const defaultProps: TimelineEventStripProps = {
  events: [
    { date: "1971", label: "SIMLA AGREEMENT", type: "capability", annotation: "India & Pakistan" },
    { date: "1998", label: "POKHRAN-II", type: "capability", annotation: "Nuclear declaration" },
    { date: "2003", label: "CEASEFIRE LINE", type: "threat", annotation: "Violations begin" },
    { date: "2016", label: "SURGICAL STRIKES", type: "capability" },
    { date: "2019", label: "BALAKOT", type: "capability" },
    { date: "2023", label: "ESCALATION SPIKE", type: "threat", annotation: "72 violations recorded" },
  ],
  title: "THE ESCALATION LADDER",
  source: "Ministry of Defence Annual Report",
  badge: "#SWARAJYA",
  at: 0,
  buildFrames: 120,
};

export const demo = {
  compositionId: "dataviz-timeline-event-strip",
  props: {
    events: [
      { date: "1971", label: "SIMLA AGREEMENT", type: "capability", annotation: "India & Pakistan" },
      { date: "1998", label: "POKHRAN-II", type: "capability", annotation: "Nuclear declaration" },
      { date: "2003", label: "CEASEFIRE LINE", type: "threat", annotation: "Violations begin" },
      { date: "2016", label: "SURGICAL STRIKES", type: "capability" },
      { date: "2019", label: "BALAKOT", type: "capability" },
      { date: "2023", label: "ESCALATION SPIKE", type: "threat", annotation: "72 violations" },
    ],
    title: "THE ESCALATION LADDER", source: "Ministry of Defence Annual Report",
    badge: "#SWARAJYA", at: 15, buildFrames: 120,
  },
  durationInFrames: 210,
};
