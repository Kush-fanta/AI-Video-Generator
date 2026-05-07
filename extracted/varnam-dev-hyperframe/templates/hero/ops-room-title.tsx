import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { C, ease, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

export interface OpsRoomTitleProps extends BaseProps {
  /**
   * Bold ALL CAPS title — the main ops brief heading.
   * Font: Bebas Neue. Size: 160–200px per config title_size.
   * (e.g. "OPERATION SINDHU RAKSHA")
   */
  title: string;
  /**
   * Subtitle in DM Sans below the red rule.
   * (e.g. "HOW INDIA BUILT A NAVAL CORDON THE WORLD DIDN'T SEE COMING")
   */
  subtitle?: string;
  /**
   * Episode or chapter context label top-left (e.g. "EPISODE 04 | SERIES: NAVAL DOCTRINE")
   */
  episodeLabel?: string;
  /**
   * Channel badge. Default: "#SWARAJYA"
   */
  badge?: string;
  /**
   * Frame when animation starts. Default: 0.
   */
  at?: number;
}

/**
 * OpsRoomTitle — Military ops brief opening title card.
 *
 * Canvas: #1A1A1A (canvas_dark — maximum contrast, Mode 1 infographic style).
 * Layout:
 *   - Episode label top-left (DM Sans, dim)
 *   - "#SWARAJYA" badge top-right (built-in, red box)
 *   - Bold Bebas Neue ALL CAPS title, vertically centered, left-aligned
 *   - 4px red horizontal rule below title (the signature tactical line)
 *   - Subtitle in DM Sans below the rule
 *
 * Motion: soft fade-in only (channel rule — no slide, no pop).
 * Title uses hero_number_slam spring for scale entrance:
 *   entry_scale_from: 1.25, entry_frames: 6 (per config motion primitive)
 *
 * The title font floor is 160px (config title_size lower bound).
 */
export const OpsRoomTitle: React.FC<OpsRoomTitleProps> = ({
  title,
  subtitle,
  episodeLabel,
  badge = "#SWARAJYA",
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Swarajya palette
  const canvasDark = "#1A1A1A";
  const red = "#D8323E";
  const gold = "#D4A264";
  const textPrimary = "#F5F2EA";
  const textDim = "#A0A8B4";
  const navy = "#192841";

  // Safe area — sized for 960×540 catalog canvas
  const safeH = 48;
  const safeV = 32;

  // ── Motion: hero_number_slam spring ──
  // entry_scale_from: 1.25, entry_frames: 6
  const titleSpringF = Math.max(0, frame - (at + 8));
  const titleSpring = spring({
    frame: titleSpringF,
    fps: FPS,
    config: { damping: 14, stiffness: 200, mass: 0.8 },
  });
  // Scale: 1.25 → 1.0 over spring
  const titleScale = interpolate(titleSpring, [0, 1], [1.25, 1.0], C);
  // Soft fade-in for the title (channel rule)
  const titleOpacity = interpolate(frame, [at + 6, at + 24], [0, 1], C);

  // Red rule grows from left
  const ruleW = interpolate(frame, [at + 20, at + 38], [0, 864], { ...C, easing: ease });

  // Subtitle fades in after rule
  const subtitleOpacity = interpolate(frame, [at + 34, at + 52], [0, 1], C);

  // Episode label top-left
  const epOpacity = interpolate(frame, [at + 2, at + 18], [0, 1], C);

  // Badge top-right
  const badgeOpacity = interpolate(frame, [at, at + 12], [0, 1], C);

  // Corner grid lines — tactical ops room aesthetic, thin dim lines
  const cornerOpacity = interpolate(frame, [at + 14, at + 28], [0, 0.18], C);

  return (
    <AbsoluteFill style={{ backgroundColor: canvasDark }}>
      {/* Tactical grid lines — horizontal at 1/3 and 2/3 — very faint */}
      {[0.33, 0.67].map((frac, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${frac * 100}%`,
            left: safeH,
            right: safeH,
            height: 1,
            backgroundColor: textDim,
            opacity: cornerOpacity,
          }}
        />
      ))}

      {/* Vertical accent line — left edge, full height */}
      <div
        style={{
          position: "absolute",
          top: safeV,
          bottom: safeV,
          left: safeH - 24,
          width: 3,
          backgroundColor: gold,
          opacity: interpolate(frame, [at + 4, at + 16], [0, 0.6], C),
        }}
      />

      {/* Episode label — top-left, capped so badge doesn't overlap */}
      {episodeLabel && (
        <div
          style={{
            position: "absolute",
            top: safeV,
            left: safeH,
            right: safeH + 240,
            overflow: "hidden",
            whiteSpace: "nowrap" as const,
            opacity: epOpacity,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 600,
              color: textDim,
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
            }}
          >
            {episodeLabel}
          </span>
        </div>
      )}

      {/* Channel badge — top-right, red box, built-in */}
      <div
        style={{
          position: "absolute",
          top: safeV,
          right: safeH,
          backgroundColor: red,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 8,
          paddingBottom: 8,
          opacity: badgeOpacity,
        }}
      >
        <span
          style={{
            fontFamily: condensed,
            fontSize: 32,
            color: textPrimary,
            letterSpacing: "0.14em",
          }}
        >
          {badge}
        </span>
      </div>

      {/* ── Main title block ── */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: safeH,
          right: safeH,
        }}
      >
        {/* Title — Bebas Neue, ALL CAPS, 72px */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              fontFamily: condensed,
              fontSize: 72,
              fontWeight: 900,
              color: textPrimary,
              lineHeight: 0.95,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            {title}
          </div>
        </div>

        {/* Red horizontal rule */}
        <div
          style={{
            width: ruleW,
            height: 3,
            backgroundColor: red,
            marginTop: 16,
            marginBottom: 16,
          }}
        />

        {/* Subtitle — DM Sans, 28px */}
        {subtitle && (
          <div style={{ opacity: subtitleOpacity }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 28,
                fontWeight: 400,
                color: textDim,
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              {subtitle}
            </div>
          </div>
        )}
      </div>

      {/* Bottom chrome — frame number / run stamp aesthetic */}
      <div
        style={{
          position: "absolute",
          bottom: safeV,
          left: safeH,
          right: safeH,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: interpolate(frame, [at + 28, at + 44], [0, 0.4], C),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            color: textDim,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
          }}
        >
          CLASSIFIED / DOCUMENTARY USE ONLY
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            border: `2px solid ${gold}`,
            borderRadius: "50%",
            opacity: 0.4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const defaultProps: OpsRoomTitleProps = {
  title: "OPERATION SINDHU RAKSHA",
  subtitle: "HOW INDIA BUILT A NAVAL CORDON THE WORLD DIDN'T SEE COMING",
  episodeLabel: "EPISODE 04 | SERIES: NAVAL DOCTRINE",
  badge: "#SWARAJYA",
  at: 0,
};

export const demo = {
  compositionId: "hero-ops-room-title",
  props: {
    title: "OPERATION SINDHU RAKSHA",
    subtitle: "HOW INDIA BUILT A NAVAL CORDON THE WORLD DIDN'T SEE COMING",
    episodeLabel: "EPISODE 04 | SERIES: NAVAL DOCTRINE",
    badge: "#SWARAJYA", at: 15,
  },
  durationInFrames: 180,
};
