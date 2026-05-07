import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SearchResultProps extends BaseProps {
  /** Search query that types into the bar */
  query: string;
  /** Result title — displayed as blue link */
  title: string;
  /** URL shown below the title */
  url: string;
  /** Snippet text below the URL */
  snippet: string;
  /** Frame when element appears */
  at?: number;
}

/**
 * Google-style search result page. Search bar at top with query typing in.
 * Below: blue link title (slate color), green URL, snippet text.
 * Result card springs in after query completes.
 * Clean white cards on light gray bg.
 * Canvas: 1080×1920 portrait.
 */
export const SearchResult: React.FC<SearchResultProps> = ({
  query,
  title,
  url,
  snippet,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Query typewriter
  const charsPerFrame = 1.2;
  const queryChars = Math.min(
    Math.floor(f * charsPerFrame),
    query.length,
  );
  const typedQuery = query.slice(0, queryChars);
  const queryDone = queryChars >= query.length;
  const queryDoneFrame = Math.ceil(query.length / charsPerFrame);

  // Cursor blink
  const showCursor = frame % 30 < 15;

  // Result card entrance — after query finishes
  const resultDelay = queryDoneFrame + 12;
  const resultProgress = spring({
    frame: Math.max(0, f - resultDelay),
    fps: FPS,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
    from: 0,
    to: 1,
  });
  const resultVisible = f >= resultDelay;

  // Google-esque logo colors for dots
  const dotColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

  return (
    <AbsoluteFill style={{ backgroundColor: "#F2F2F2" }}>
      {/* Search header bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          padding: "60px 56px 32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          ...reveal(frame, at),
        }}
      >
        {/* Logo dots row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
          }}
        >
          {dotColors.map((c, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: c,
              }}
            />
          ))}
        </div>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            border: `2px solid ${P.light}`,
            borderRadius: 32,
            padding: "18px 28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Search icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 16, flexShrink: 0 }}
          >
            <circle cx="10" cy="10" r="7" stroke={P.muted} strokeWidth="2" />
            <path
              d="M15 15L21 21"
              stroke={P.muted}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.text,
              flex: 1,
            }}
          >
            {typedQuery}
            {!queryDone && showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 28,
                  backgroundColor: P.slate,
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                }}
              />
            )}
          </span>

          {/* Microphone icon */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: P.light,
              flexShrink: 0,
              marginLeft: 12,
            }}
          />
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 24,
            paddingLeft: 8,
          }}
        >
          {["All", "Images", "News", "Videos"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? P.slate : P.muted,
                paddingBottom: 10,
                borderBottom: i === 0 ? `3px solid ${P.slate}` : "none",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Results count */}
      {resultVisible && (
        <div
          style={{
            position: "absolute",
            top: 310,
            left: 72,
            opacity: resultProgress,
            fontFamily: sans,
            fontSize: 20,
            color: P.muted,
          }}
        >
          About 2,340,000 results (0.42 seconds)
        </div>
      )}

      {/* Result card */}
      {resultVisible && (
        <div
          style={{
            position: "absolute",
            top: 370,
            left: 56,
            right: 56,
            opacity: resultProgress,
            transform: `translateY(${interpolate(resultProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: "36px 40px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* URL breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {/* Favicon placeholder */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: P.sage,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  color: P.sage,
                }}
              >
                {url}
              </span>
            </div>

            {/* Title — link style */}
            <div
              style={{
                fontFamily: serif,
                fontSize: 40,
                lineHeight: 1.2,
                color: P.slate,
                marginBottom: 14,
              }}
            >
              {title}
            </div>

            {/* Snippet */}
            <div
              style={{
                fontFamily: sans,
                fontSize: 24,
                lineHeight: 1.55,
                color: P.sub,
              }}
            >
              {snippet}
            </div>
          </div>

          {/* Highlighted border accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 4,
              height: `${lineGrow(frame, at + resultDelay + 6, 20)}%`,
              backgroundColor: P.terracotta,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Additional faded results below — visual depth */}
      {resultVisible && (
        <div
          style={{
            position: "absolute",
            top: 680,
            left: 56,
            right: 56,
            opacity: interpolate(resultProgress, [0.4, 1], [0, 0.3], C),
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: "28px 40px",
                marginBottom: 16,
                boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: 20,
                  backgroundColor: P.light,
                  borderRadius: 4,
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  width: "80%",
                  height: 16,
                  backgroundColor: P.light,
                  borderRadius: 4,
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-search-result",
  props: {
    query: "India GCC revenue 2024",
    title: "India GCC Revenue Crosses $100B",
    url: "nasscom.in/gcc-report",
    snippet: "1,850 centres employing over 2 million professionals.",
    at: 15,
  },
  durationInFrames: 180,
};
