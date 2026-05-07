import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SocialPostCardProps extends BaseProps {
  /** Display name */
  username: string;
  /** Handle with @ */
  handle: string;
  /** Post body text */
  text: string;
  /** Number of likes */
  likes?: number;
  /** Number of reposts */
  reposts?: number;
  /** Number of replies */
  replies?: number;
  /** Verified badge */
  verified?: boolean;
  /** Timestamp string shown below the post text */
  timestamp?: string;
  /** Frame when element appears */
  at?: number;
}

/** Format numbers like 12.4K */
const fmtNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

/**
 * X/Twitter style post card — dark mode.
 * Avatar circle (Twitter blue), display name + verified badge, @handle in gray,
 * post text in white, engagement row (replies, reposts, likes).
 * Right column shows like count as large serif stat + @handle as secondary text.
 */
export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  username,
  handle,
  text,
  likes = 0,
  reposts = 0,
  replies = 0,
  verified = true,
  timestamp = "4:30 PM · Apr 8, 2026",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - at);

  // Card scales in with spring
  const cardScale = f >= 0
    ? spring({ frame: f, fps, config: { damping: 14, stiffness: 100, mass: 0.9 }, from: 0.96, to: 1.0 })
    : 0.96;
  const cardOpacity = interpolate(frame, [at, at + 8], [0, 1], C);

  // Engagement numbers count up
  const engageAt = at + 40;
  const engageProgress = interpolate(frame, [engageAt, engageAt + 20], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>

      {/* Post card — pushed left so right column has real space */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 160,
          transform: `translateY(-50%) scale(${cardScale})`,
          opacity: cardOpacity,
          width: 620,
        }}
      >
        {/* Card container */}
        <div
          style={{
            backgroundColor: "#16181C",
            borderRadius: 20,
            padding: "32px 32px 24px",
            border: "1px solid #2F3336",
          }}
        >
          {/* Header row: avatar + name + handle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {/* Avatar circle — Twitter blue, not Varnam terracotta */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "#1D9BF0",
                marginRight: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#E7E9EA",
                  }}
                >
                  {username}
                </span>

                {/* Verified badge */}
                {verified && (
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
                    <path d="M9.5 14.5L6.5 11.5L7.5 10.5L9.5 12.5L14.5 7.5L15.5 8.5L9.5 14.5Z" fill="#FFFFFF" />
                  </svg>
                )}
              </div>

              <span
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: "#71767B",
                }}
              >
                {handle}
              </span>
            </div>
          </div>

          {/* Post text */}
          <div
            style={{
              ...reveal(frame, at + 10),
              fontFamily: sans,
              fontSize: 22,
              lineHeight: 1.55,
              color: "#E7E9EA",
              marginBottom: 24,
              letterSpacing: "0.01em",
            }}
          >
            {text}
          </div>

          {/* Timestamp line */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: "#71767B",
              marginBottom: 18,
            }}
          >
            {timestamp}
          </div>

          {/* Engagement row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              ...reveal(frame, engageAt),
            }}
          >
            {/* Replies — speech bubble icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 2 2 Q 2 0 4 0 L 20 0 Q 22 0 22 2 L 22 13 Q 22 15 20 15 L 8 15 L 4 19 L 4 15 Q 2 15 2 13 Z"
                  stroke="#71767B"
                  strokeWidth="1.4"
                  fill="none"
                  transform="scale(1.04) translate(0, 2)"
                />
              </svg>
              <span style={{ fontFamily: sans, fontSize: 20, color: "#71767B" }}>
                {fmtNum(Math.round(replies * engageProgress))}
              </span>
            </div>

            {/* Reposts */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 7H17L14 4M17 17H7L10 20" stroke="#00BA7C" strokeWidth="1.8" fill="none" />
              </svg>
              <span style={{ fontFamily: sans, fontSize: 20, color: "#00BA7C" }}>
                {fmtNum(Math.round(reposts * engageProgress))}
              </span>
            </div>

            {/* Likes */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                  fill="#F91880"
                />
              </svg>
              <span style={{ fontFamily: sans, fontSize: 20, color: "#F91880" }}>
                {fmtNum(Math.round(likes * engageProgress))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right editorial column */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 440,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 48,
          paddingRight: 64,
        }}
      >
        {/* Large serif like count */}
        <div style={reveal(frame, at + 14)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1.0,
              color: "#E7E9EA",
              letterSpacing: "-0.03em",
            }}
          >
            {fmtNum(likes)}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#71767B",
              marginTop: 6,
            }}
          >
            Likes
          </div>
        </div>

        {/* @handle as secondary */}
        <div
          style={{
            ...reveal(frame, at + 28),
            fontFamily: sans,
            fontSize: 20,
            lineHeight: 1.5,
            color: "#71767B",
            marginTop: 16,
            maxWidth: 320,
          }}
        >
          {handle} · {fmtNum(reposts)} reposts
        </div>
      </div>

    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-social-post-card",
  props: {
    username: "Varnam",
    handle: "@varnam",
    text: "The best motion systems are quiet when they need to be loud.",
    likes: 12400,
    reposts: 840,
    replies: 122,
    verified: true,
    timestamp: "4:30 PM · Apr 8, 2026"
  },
  durationInFrames: 210,
};
