import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LeaderboardRow {
  rank: number;
  name: string;
  value: number;
  maxValue: number;
  color?: string;
}

interface LeaderboardProps extends BaseProps {
  rows: LeaderboardRow[];
  /** Hero heading — displayed large at top-center before bars stagger in */
  categoryLabel?: string;
  unit?: string;
  source?: string;
  at?: number;
}

const BAR_COLORS = [P.terracotta, P.sage, P.slate, P.mauve, P.muted, P.light];

/**
 * Leaderboard — Bar-race style ranked rows with animated bar widths.
 * categoryLabel is now a HERO element: 80px serif, top-center, spring reveal.
 * Bars stagger in below the hero heading.
 * Bars grow from left using spring physics. Staggered row reveal.
 */
export const Leaderboard: React.FC<LeaderboardProps> = ({
  rows,
  categoryLabel,
  unit,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const sorted = [...rows].sort((a, b) => a.rank - b.rank);
  const stagger = 10;
  const maxItems = Math.min(sorted.length, 8);

  // Hero heading springs in
  const heroSpring = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: { damping: 20, stiffness: 60, mass: 1.0 },
  });
  const heroOpacity = interpolate(heroSpring, [0, 1], [0, 1], C);
  const heroY = interpolate(heroSpring, [0, 1], [24, 0], C);

  // Bars begin appearing after the hero has mostly settled (20 frames in)
  const barsStartAt = at + 20;

  // Bar dimensions — full available horizontal space
  // 1920 - paddingLeft(100) - rank(60+20) - name(220+0) - paddingRight(100)
  const barMaxWidth = 1920 - 100 - 100 - 80 - 220 - 100;
  const barH = maxItems <= 5 ? 32 : maxItems <= 7 ? 26 : 22;
  const rowH = barH + 44;

  const globalMax = Math.max(...sorted.map((r) => r.maxValue), 1);

  // Estimate top offset so rows are vertically centered below the hero heading
  // Hero heading zone: ~240px (120px label + eyebrow + accent) + gap
  const topOffset = 280;
  const totalRowsHeight = maxItems * rowH;
  const availableHeight = 1080 - topOffset - 80; // bottom padding 80
  const rowsTop = topOffset + Math.max(0, (availableHeight - totalRowsHeight) / 2);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Hero category heading — full hero treatment: 120px serif, terracotta accent word, commanding */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingLeft: 100,
            opacity: heroOpacity,
            transform: `translateY(${heroY}px)`,
          }}
        >
          {/* Eyebrow — small uppercase category tag */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.terracotta,
              marginBottom: 12,
              opacity: interpolate(heroSpring, [0, 1], [0, 1], C),
            }}
          >
            RANKED
          </div>

          {/* Main hero heading — 120px, two-tone */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: P.text,
              textAlign: "left",
              maxWidth: 900,
            }}
          >
            {categoryLabel}
          </div>

          {/* Unit + terracotta accent bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16 }}>
            <div
              style={{
                width: interpolate(frame, [at + 8, at + 36], [0, 120], {
                  ...C,
                  easing: (t) => 1 - Math.pow(1 - t, 3),
                }),
                height: 4,
                backgroundColor: P.terracotta,
                borderRadius: 2,
              }}
            />
            {unit && (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: P.muted,
                  opacity: interpolate(frame, [at + 20, at + 40], [0, 1], C),
                }}
              >
                {unit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rows */}
      <div
        style={{
          position: "absolute",
          top: rowsTop,
          left: 100,
          right: 100,
        }}
      >
        {sorted.slice(0, maxItems).map((row, i) => {
          const rowAt = barsStartAt + i * stagger;
          const barColor = row.color ?? BAR_COLORS[i % BAR_COLORS.length];

          const barProgress = spring({
            frame: Math.max(0, frame - rowAt - 4),
            fps: FPS,
            config: { damping: 12, stiffness: 70, mass: 0.8 },
          });

          const barWidth = (row.value / globalMax) * barMaxWidth * barProgress;

          return (
            <div
              key={row.rank}
              style={{
                ...reveal(frame, rowAt),
                display: "flex",
                alignItems: "center",
                height: rowH,
                marginBottom: 4,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 48,
                  color: i === 0 ? P.terracotta : P.muted,
                  width: 60,
                  flexShrink: 0,
                  textAlign: "right",
                  marginRight: 20,
                  lineHeight: 1,
                }}
              >
                {row.rank}
              </div>

              {/* Name */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 600,
                  color: P.text,
                  width: 220,
                  flexShrink: 0,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {row.name}
              </div>

              {/* Bar + value */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Bar track */}
                <div
                  style={{
                    width: barMaxWidth,
                    height: barH,
                    backgroundColor: `${P.light}44`,
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: barWidth,
                      height: "100%",
                      backgroundColor: barColor,
                      borderRadius: 4,
                    }}
                  />
                </div>

                {/* Value label — right of bar */}
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 22,
                    fontWeight: 700,
                    color: P.sub,
                    marginLeft: 16,
                    opacity: interpolate(
                      frame,
                      [rowAt + 10, rowAt + 20],
                      [0, 1],
                      C
                    ),
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 100,
            ...reveal(frame, barsStartAt + maxItems * stagger + 12),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
