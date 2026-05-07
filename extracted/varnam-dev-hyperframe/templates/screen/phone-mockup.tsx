import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface PhoneMockupProps extends BaseProps {
  /** Main content text rendered inside the phone screen */
  content: string;
  /** Optional headline above the content inside the screen */
  headline?: string;
  /** Category label displayed top-left (eyebrow tag) */
  label?: string;
  /** Editorial headline displayed in right column */
  subtitle?: string;
  /** Frame when element appears */
  at?: number;
}

/** Spring-based reveal: fade + translateY with spring physics (no linear entrances) */
const springReveal = (frame: number, at: number, fps: number) => {
  const progress = spring({ frame, fps, from: 0, to: 1, delay: at, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
  };
};

/**
 * Smartphone mockup with notch/dynamic island, status bar, and rounded bezel.
 * Content renders inside the screen area styled as a news app.
 * Phone is rendered entirely with CSS — no images.
 *
 * Layout: 1920×1080 landscape. Phone left ~40%, editorial right ~50%.
 * Vertical hairline divider separates phone from editorial column.
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  content,
  headline,
  label,
  subtitle,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const accentWidth = lineGrow(frame, at + 16, 28);
  // Subtle content scroll
  const scrollY = interpolate(f, [30, FPS * 4], [0, 60], C);

  // Canvas: 1920×1080 (landscape 16:9)
  // Phone left column ~40%, editorial right column ~50%, gutter between
  const PHONE_W = 380;
  const BEZEL = 10;
  const CORNER = 52;
  const PHONE_H = 820;
  const PHONE_LEFT = 140;
  const PHONE_TOP = 100;

  // Right column starts after phone + gutter
  const DIVIDER_X = PHONE_LEFT + PHONE_W + BEZEL * 2 + 80;
  const EDITORIAL_LEFT = DIVIDER_X + 60;
  const EDITORIAL_RIGHT = 120; // right margin

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label top-left */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: PHONE_LEFT,
            ...springReveal(frame, at + 2, FPS),
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.muted,
            zIndex: 3,
          }}
        >
          {label}
        </div>
      )}

      {/* Phone device — left column */}
      <div
        style={{
          position: "absolute",
          top: PHONE_TOP,
          left: PHONE_LEFT,
          ...springReveal(frame, at + 4, FPS),
        }}
      >
        {/* Outer bezel */}
        <div
          style={{
            width: PHONE_W + BEZEL * 2,
            height: PHONE_H + BEZEL * 2,
            borderRadius: CORNER + BEZEL,
            backgroundColor: "#1A1A1A",
            padding: BEZEL,
            boxShadow:
              "0 20px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Screen area */}
          <div
            style={{
              width: PHONE_W,
              height: PHONE_H,
              borderRadius: CORNER,
              backgroundColor: "#F5F5F7",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                width: 120,
                height: 34,
                borderRadius: 20,
                backgroundColor: "#1A1A1A",
                zIndex: 10,
              }}
            />

            {/* Status bar — 58px to clear dynamic island */}
            <div
              style={{
                height: 58,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "0 24px 6px",
                fontSize: 20,
                fontFamily: sans,
                fontWeight: 600,
                color: "#1A1A1A",
              }}
            >
              <span>9:41</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {/* Signal bars */}
                <svg width="16" height="12" viewBox="0 0 16 12">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#1A1A1A" />
                  <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#1A1A1A" />
                  <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#1A1A1A" />
                  <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#1A1A1A" opacity="0.3" />
                </svg>
                {/* Battery */}
                <svg width="24" height="12" viewBox="0 0 24 12">
                  <rect x="0" y="1" width="20" height="10" rx="2" stroke="#1A1A1A" strokeWidth="1" fill="none" />
                  <rect x="2" y="3" width="14" height="6" rx="1" fill="#1A1A1A" />
                  <rect x="21" y="4" width="2" height="4" rx="1" fill="#1A1A1A" opacity="0.4" />
                </svg>
              </div>
            </div>

            {/* News app nav bar */}
            <div
              style={{
                height: 48,
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #E5E5EA",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: 16,
                paddingRight: 16,
              }}
            >
              {/* Hamburger icon */}
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <rect y="0" width="20" height="2" rx="1" fill="#1A1A1A" />
                <rect y="7" width="20" height="2" rx="1" fill="#1A1A1A" />
                <rect y="14" width="20" height="2" rx="1" fill="#1A1A1A" />
              </svg>
              {/* App logo wordmark */}
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 20,
                  color: "#1A1A1A",
                  letterSpacing: "0.02em",
                }}
              >
                IndiaPill
              </span>
              {/* Search icon */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="#1A1A1A" strokeWidth="1.6" />
                <path d="M13 13 L18 18" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>

            {/* Screen content — scrolls */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                height: PHONE_H - 58 - 48,
              }}
            >
              <div
                style={{
                  transform: `translateY(-${scrollY}px)`,
                  backgroundColor: "#FFFFFF",
                }}
              >
                {/* Article category tag */}
                <div
                  style={{
                    padding: "16px 20px 6px",
                    fontFamily: sans,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: P.terracotta,
                  }}
                >
                  Economy
                </div>

                {/* Headline */}
                {headline && (
                  <div
                    style={{
                      padding: "0 20px 12px",
                      fontFamily: serif,
                      fontSize: 24,
                      lineHeight: 1.25,
                      color: "#1A1A1A",
                      fontWeight: 400,
                    }}
                  >
                    {headline}
                  </div>
                )}

                {/* Terracotta rule */}
                <div
                  style={{
                    margin: "0 20px 14px",
                    width: 36,
                    height: 2,
                    backgroundColor: P.terracotta,
                    borderRadius: 1,
                  }}
                />

                {/* Author / byline row */}
                <div
                  style={{
                    padding: "0 20px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: P.slate,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: sans,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    IP
                  </div>
                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: 20,
                      color: "#888",
                    }}
                  >
                    IndiaPill · Apr 8, 2026
                  </span>
                </div>

                {/* Body */}
                <div
                  style={{
                    padding: "0 20px 32px",
                    fontFamily: sans,
                    fontSize: 20,
                    lineHeight: 1.75,
                    color: "#333",
                  }}
                >
                  {content}
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 134,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#1A1A1A",
                opacity: 0.2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Vertical hairline divider — between phone and editorial */}
      <div
        style={{
          position: "absolute",
          top: PHONE_TOP + 40,
          left: DIVIDER_X,
          width: 1,
          height: `${lineGrow(frame, at + 20, 18)}%`,
          maxHeight: PHONE_H - 80,
          backgroundColor: P.light,
          opacity: 0.7,
        }}
      />

      {/* Editorial column — right of phone, vertically centred */}
      <div
        style={{
          position: "absolute",
          top: PHONE_TOP + 60,
          left: EDITORIAL_LEFT,
          right: EDITORIAL_RIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: PHONE_H - 120,
        }}
      >
        {subtitle && (
          <div style={springReveal(frame, at + 10, FPS)}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 72,
                lineHeight: 1.15,
                color: P.text,
                letterSpacing: "-0.02em",
              }}
            >
              {subtitle}
            </div>
          </div>
        )}

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-phone-mockup",
  props: {
    content: "The page opens with a clean summary, then moves into the key numbers, then lands on the action item the audience should remember.",
    headline: "Market update",
    label: "REPORT",
    subtitle: "What changed this week"
  },
  durationInFrames: 210,
};
