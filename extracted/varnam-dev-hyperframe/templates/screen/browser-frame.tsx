import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface StatItem {
  label: string;
  value: string;
}

export interface BrowserFrameProps extends BaseProps {
  /** URL shown in the address bar */
  url: string;
  /** Tab label — falls back to url if omitted */
  tabLabel?: string;
  /** Large headline inside the browser viewport — shown at 56px serif */
  headline: string;
  /**
   * Optional: 2–4 key stats shown below the headline as large scannable numbers.
   * If provided, replaces the long excerpt with big-number stat cards.
   * Recommended: max 3 stats for readability.
   */
  stats?: StatItem[];
  /**
   * Short excerpt (1–2 sentences max, ~120 chars). Shown only when stats absent.
   * Keep it short — this renders at 28px minimum.
   */
  excerpt?: string;
  /** Pull-quote shown in the right editorial column */
  pullQuote?: string;
  /** Secondary context line below the pull-quote */
  subtitle?: string;
  /** Frame when element appears */
  at?: number;
}

/**
 * Webpage inside a realistic browser chrome frame.
 * macOS-style window controls, tab strip, URL bar with back/forward chevrons.
 * Inside the viewport: a large headline + short excerpt — readable at any size.
 * Editorial pull-quote occupies the right column.
 */
export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  url,
  tabLabel,
  headline,
  stats,
  excerpt,
  pullQuote,
  subtitle,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Content scrolls upward gently — just enough to imply a live page
  const scrollY = interpolate(f, [20, FPS * 5], [0, 60], C);
  const accentWidth = lineGrow(frame, at + 16, 28);

  // Right column quote — prefer explicit pullQuote, then derive from excerpt/headline
  const rightQuote =
    pullQuote ??
    (excerpt
      ? excerpt.length > 120 ? excerpt.slice(0, 120).trimEnd() + "…" : excerpt
      : headline);

  const displayTab = tabLabel ?? url;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Browser window — centered, editorial offset left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          right: 360,
          bottom: 80,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow:
            "0 12px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          backgroundColor: "#FFFFFF",
          ...reveal(frame, at + 4),
        }}
      >
        {/* Tab strip row */}
        <div
          style={{
            height: 40,
            backgroundColor: "#E8E8E8",
            display: "flex",
            alignItems: "flex-end",
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <div
            style={{
              height: 32,
              minWidth: 220,
              maxWidth: 300,
              backgroundColor: "#FFFFFF",
              borderRadius: "6px 6px 0 0",
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              paddingRight: 16,
              gap: 8,
              boxShadow: "0 -1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* Favicon circle */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: P.terracotta,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: "#333",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayTab}
            </span>
          </div>
        </div>

        {/* Toolbar / address bar row */}
        <div
          style={{
            height: 48,
            backgroundColor: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 16,
            borderBottom: "1px solid #E0E0E0",
          }}
        >
          {/* Window controls — red / yellow / green */}
          <div style={{ display: "flex", gap: 8, marginRight: 16 }}>
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: "#FF5F57",
              }}
            />
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: "#FFBD2E",
              }}
            />
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: "#28C840",
              }}
            />
          </div>

          {/* Back / forward chevrons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginRight: 14,
              alignItems: "center",
            }}
          >
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
              <path
                d="M8 4 L3 10 L8 16"
                stroke="#AAAAAA"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
              <path
                d="M2 4 L7 10 L2 16"
                stroke="#AAAAAA"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                padding: "6px 20px",
                maxWidth: 500,
                width: "70%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #E0E0E0",
              }}
            >
              {/* Lock icon */}
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <rect x="2" y="6" width="8" height="7" rx="1.5" fill="#888" />
                <path
                  d="M4 6V4a2 2 0 0 1 4 0v2"
                  stroke="#888"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: "#555",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {url}
              </span>
            </div>
          </div>
        </div>

        {/* Browser viewport */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: "calc(100% - 88px)",
          }}
        >
          <div
            style={{
              transform: `translateY(-${scrollY}px)`,
              padding: "48px 56px 72px",
            }}
          >
            {/* Page headline — 56px, instantly readable */}
            <div
              style={{
                fontFamily: serif,
                fontSize: 56,
                lineHeight: 1.1,
                color: "#1A1A1A",
                marginBottom: 20,
                fontWeight: 400,
                maxWidth: 660,
              }}
            >
              {headline}
            </div>

            {/* Thin terracotta separator */}
            <div
              style={{
                width: 48,
                height: 3,
                backgroundColor: P.terracotta,
                marginBottom: 32,
                borderRadius: 1,
              }}
            />

            {/* Stats OR short excerpt — stats preferred for scannability */}
            {stats && stats.length > 0 ? (
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      minWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 64,
                        fontWeight: 700,
                        color: P.terracotta,
                        lineHeight: 1.0,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 22,
                        fontWeight: 500,
                        color: "#666",
                        lineHeight: 1.3,
                        maxWidth: 180,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : excerpt ? (
              /* Short excerpt — max 120 chars, 28px minimum */
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 28,
                  lineHeight: 1.6,
                  color: "#444",
                  maxWidth: 640,
                }}
              >
                {excerpt.length > 200 ? excerpt.slice(0, 200).trimEnd() + "…" : excerpt}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right editorial column — pull-quote + accent + subtitle */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 320,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 24,
          paddingRight: 56,
        }}
      >
        <div style={reveal(frame, at + 12)}>
          {/* Opening quote mark */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 0.6,
              color: P.terracotta,
              marginBottom: 12,
              opacity: 0.7,
            }}
          >
            "
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 28,
              lineHeight: 1.35,
              color: P.text,
              letterSpacing: "-0.01em",
            }}
          >
            {rightQuote}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 24),
              fontFamily: sans,
              fontSize: 20,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 20,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Decorative vertical hairline between browser and right column */}
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 336,
          width: 1,
          height: 200,
          backgroundColor: P.light,
          opacity: lineGrow(frame, at + 20, 18) / 100,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-browser-frame",
  props: {
    url: "example.com/report",
    tabLabel: "Report",
    headline: "A headline worth scanning at a glance",
    stats: [
      {
        label: "Lift in retention",
        value: "18%"
      },
      {
        label: "Pages read",
        value: "4.2K"
      },
      {
        label: "Signals confirmed",
        value: "92"
      }
    ],
    subtitle: "Source: internal review"
  },
  durationInFrames: 180,
};
