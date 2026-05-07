import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface Notification {
  title: string;
  preview: string;
  app?: string;
  color?: string;
}

export interface NotificationStackProps extends BaseProps {
  /** Array of push notifications */
  notifications: Notification[];
  /** Frame when element appears */
  at?: number;
}

const CARD_HEIGHT = 140;
const CARD_GAP = 18;
const STAGGER = 20;

/**
 * Push notifications stacking from the top. Each notification is a card
 * with icon placeholder (colored circle), title, and preview text.
 * 3-5 notifications. Each slides in from top with spring. Stack pushes down.
 * Last one can be highlighted.
 * Canvas: 1080×1920 portrait.
 */
export const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const DEFAULT_COLORS = [P.terracotta, P.sage, P.slate, P.mauve, P.muted];

  /** Per-notification entrance */
  const notifReveal = (i: number) => {
    const start = i * STAGGER;
    const progress = spring({
      frame: Math.max(0, f - start),
      fps: FPS,
      config: { damping: 14, stiffness: 120, mass: 0.8 },
      from: 0,
      to: 1,
    });
    const visible = f >= start;
    return {
      opacity: visible ? progress : 0,
      transform: `translateY(${visible ? interpolate(progress, [0, 1], [-60, 0]) : -60}px)`,
    };
  };

  /** Dim earlier cards when a new one arrives */
  const cardDim = (i: number) => {
    const nextStart = (i + 1) * STAGGER;
    if (i >= notifications.length - 1) return 1;
    if (f < nextStart) return 1;
    return interpolate(
      f,
      [nextStart, nextStart + 10],
      [1, 0.7],
      C,
    );
  };

  /** Last notification gets a highlight */
  const isLast = (i: number) => i === notifications.length - 1;

  // Time display
  const timeStr = "now";

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 48px 12px",
          ...reveal(frame, at),
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 600,
            color: P.text,
          }}
        >
          9:41
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <svg width="18" height="14" viewBox="0 0 18 14">
            <rect x="0" y="9" width="3.5" height="5" rx="0.5" fill={P.text} />
            <rect x="5" y="6" width="3.5" height="8" rx="0.5" fill={P.text} />
            <rect x="10" y="3" width="3.5" height="11" rx="0.5" fill={P.text} />
            <rect x="15" y="0" width="3" height="14" rx="0.5" fill={P.text} opacity="0.3" />
          </svg>
          <svg width="26" height="14" viewBox="0 0 26 14">
            <rect x="0" y="1" width="22" height="12" rx="2.5" stroke={P.text} strokeWidth="1.2" fill="none" />
            <rect x="2" y="3" width="16" height="8" rx="1.5" fill={P.sage} />
            <rect x="23" y="4" width="2.5" height="5" rx="1" fill={P.text} opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Lock icon + date header */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          textAlign: "center",
          ...reveal(frame, at + 4),
        }}
      >
        {/* Lock icon */}
        <svg
          width="24"
          height="30"
          viewBox="0 0 24 30"
          fill="none"
          style={{ display: "block", margin: "0 auto 12px" }}
        >
          <rect x="4" y="12" width="16" height="15" rx="3" fill={P.muted} />
          <path
            d="M8 12V8a4 4 0 0 1 8 0v4"
            stroke={P.muted}
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            color: P.text,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          9:41
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 24,
            color: P.sub,
            marginTop: 8,
          }}
        >
          Wednesday, April 9
        </div>
      </div>

      {/* Notification stack */}
      <div
        style={{
          position: "absolute",
          top: 460,
          left: 40,
          right: 40,
          display: "flex",
          flexDirection: "column",
          gap: CARD_GAP,
        }}
      >
        {notifications.map((notif, i) => {
          const iconColor = notif.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const highlighted = isLast(i);

          return (
            <div
              key={i}
              style={{
                ...notifReveal(i),
                opacity: (notifReveal(i).opacity as number) * cardDim(i),
              }}
            >
              <div
                style={{
                  backgroundColor: highlighted
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(24px)",
                  borderRadius: 20,
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  minHeight: CARD_HEIGHT,
                  border: highlighted
                    ? `2px solid ${P.terracotta}`
                    : "1px solid rgba(200,194,182,0.4)",
                  boxShadow: highlighted
                    ? `0 8px 32px rgba(193,122,72,0.15)`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* App icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: iconColor,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: sans,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  {(notif.app || notif.title).charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  {/* App name + time */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        color: P.muted,
                      }}
                    >
                      {notif.app || "App"}
                    </span>
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 20,
                        color: P.muted,
                      }}
                    >
                      {timeStr}
                    </span>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 26,
                      fontWeight: 700,
                      color: P.text,
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {notif.title}
                  </div>

                  {/* Preview */}
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 22,
                      color: P.sub,
                      lineHeight: 1.35,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {notif.preview}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 140,
          height: 5,
          borderRadius: 3,
          backgroundColor: P.text,
          opacity: 0.15,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-notification-stack",
  props: {
    notifications: [{ title: "Bloomberg", preview: "GCC revenue hits $100B", color: "#C17A48" }, { title: "NASSCOM", preview: "400 GCCs added in 5 years" }, { title: "ET", preview: "Bangalore: world GCC capital" }],
    at: 15,
  },
  durationInFrames: 180,
};
