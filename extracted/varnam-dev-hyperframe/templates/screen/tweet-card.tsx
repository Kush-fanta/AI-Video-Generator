import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface TweetCardProps extends BaseProps {
  /** Display name */
  name: string;
  /** Handle with @ */
  handle: string;
  /** Tweet body text */
  text: string;
  /** Number of likes */
  likes?: number;
  /** Number of retweets */
  retweets?: number;
  /** Number of replies */
  replies?: number;
  /** Date string */
  date?: string;
  /** Frame when element appears */
  at?: number;
}

/** Format numbers: 1200 -> 1.2K */
const fmtNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

/**
 * Tweet-style card on cream background. Profile area (circle + name + handle).
 * Tweet text. Below: engagement metrics that count up with odometer feel.
 * Timestamp. Card springs in.
 * Canvas: 1080×1920 portrait.
 */
export const TweetCard: React.FC<TweetCardProps> = ({
  name,
  handle,
  text,
  likes = 0,
  retweets = 0,
  replies = 0,
  date = "Apr 9, 2026",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Card spring entrance
  const cardProgress = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
    from: 0,
    to: 1,
  });
  const cardScale = interpolate(cardProgress, [0, 1], [0.95, 1.0]);
  const cardOpacity = cardProgress;

  // Engagement counter animation — odometer count-up
  const engageStart = 35;
  const engageProgress = interpolate(f, [engageStart, engageStart + 30], [0, 1], C);

  /** Animated count value */
  const animCount = (target: number) => {
    const current = Math.round(target * engageProgress);
    return fmtNum(current);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 56,
          right: 56,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          padding: "44px 44px 36px",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
        }}
      >
        {/* Header: avatar + name + handle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: P.terracotta,
              marginRight: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 28,
                  fontWeight: 700,
                  color: P.text,
                }}
              >
                {name}
              </span>
              {/* Verified badge */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="11" fill={P.slate} />
                <path
                  d="M9 14L6.5 11.5L7.5 10.5L9 12L14 7L15 8L9 14Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <span
              style={{
                fontFamily: sans,
                fontSize: 22,
                color: P.muted,
              }}
            >
              {handle}
            </span>
          </div>

          {/* Platform icon placeholder — bird shape */}
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <path
              d="M27 1C25.8 1.8 24.5 2.4 23.1 2.7C22.3 1.8 21.1 1.2 19.7 1.2C17.1 1.2 15 3.3 15 5.9C15 6.3 15 6.7 15.1 7C10.5 6.8 6.4 4.8 3.5 1.7C3 2.5 2.7 3.4 2.7 4.4C2.7 6.3 3.7 8 5.2 8.9C4.2 8.9 3.3 8.6 2.5 8.2V8.2C2.5 10.5 4.1 12.5 6.3 12.9C5.5 13.1 4.7 13.2 3.8 13.1C4.4 15 6.2 16.4 8.3 16.4C6.6 17.7 4.5 18.5 2.2 18.5C1.8 18.5 1.4 18.5 1 18.4C3.2 19.9 5.8 20.7 8.5 20.7C19.7 20.7 25.8 13.2 25.8 6.6V5.9C26.8 5.2 27.6 4.3 27.3 3.3C26.5 3.8 25.6 4.2 24.7 4.3C25.6 3.7 26.4 2.8 26.8 1.7"
              stroke={P.muted}
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </div>

        {/* Tweet text */}
        <div
          style={{
            ...reveal(frame, at + 10),
            fontFamily: sans,
            fontSize: 32,
            lineHeight: 1.5,
            color: P.text,
            marginBottom: 28,
          }}
        >
          {text}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            color: P.muted,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: `1px solid ${P.light}`,
            ...reveal(frame, at + 16),
          }}
        >
          {date}
        </div>

        {/* Engagement metrics */}
        <div
          style={{
            display: "flex",
            gap: 48,
            ...reveal(frame, at + engageStart),
          }}
        >
          {/* Replies */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 2Q2 0 4 0H20Q22 0 22 2V13Q22 15 20 15H8L4 19V15Q2 15 2 13Z"
                stroke={P.muted}
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontFamily: sans,
                fontSize: 24,
                fontWeight: 600,
                color: P.sub,
                fontVariantNumeric: "tabular-nums",
                minWidth: 48,
              }}
            >
              {animCount(replies)}
            </span>
          </div>

          {/* Retweets */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 7H17L14 4M17 17H7L10 20"
                stroke={P.sage}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontFamily: sans,
                fontSize: 24,
                fontWeight: 600,
                color: P.sage,
                fontVariantNumeric: "tabular-nums",
                minWidth: 48,
              }}
            >
              {animCount(retweets)}
            </span>
          </div>

          {/* Likes */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                fill={P.terracotta}
              />
            </svg>
            <span
              style={{
                fontFamily: sans,
                fontSize: 24,
                fontWeight: 600,
                color: P.terracotta,
                fontVariantNumeric: "tabular-nums",
                minWidth: 48,
              }}
            >
              {animCount(likes)}
            </span>
          </div>
        </div>
      </div>

      {/* Large editorial stat below card */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 72,
          right: 72,
          ...reveal(frame, at + 50),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.0,
            color: P.terracotta,
            letterSpacing: "-0.03em",
          }}
        >
          {fmtNum(likes)}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: P.muted,
            marginTop: 8,
          }}
        >
          Likes
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 56, 24)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 16,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-tweet-card",
  props: {
    name: "NASSCOM",
    handle: "@nasscom",
    text: "India GCC sector crosses $100B. 1,850 centres. 2M+ professionals.",
    likes: 4200,
    retweets: 1800,
    replies: 340,
    date: "Apr 2024",
    at: 15,
  },
  durationInFrames: 180,
};
