import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, lineGrow, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

interface StackedStat {
  value: string;
  label: string;
  /** Highlight as negative/threat in red */
  negative?: boolean;
}

export interface StackedStatBuildProps extends BaseProps {
  /** Image on the left strip (25%) */
  image: ImageRef;
  /** Title at top */
  title: string;
  /** 3-5 stats, revealed sequentially */
  stats: StackedStat[];
  /** Category label */
  categoryLabel?: string;
  /** Badge */
  badge?: string;
  /** Source */
  source?: string;
  at?: number;
}

/**
 * StackedStatBuild — Vertical stack of stats with image strip on left.
 *
 * Narrow image strip (25%) with Ken Burns on the left.
 * Stats stack vertically on the right (75%), each sliding in from below
 * with spring physics, staggered. Gold numbers for positive, red for negative.
 * Red rules separate each stat.
 *
 * For progressive reveals: "Each decade made it worse..."
 */
export const StackedStatBuild: React.FC<StackedStatBuildProps> = ({
  image,
  title,
  stats,
  categoryLabel,
  badge,
  source,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 7);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* LEFT — Image strip (25%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "25%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
          }}
        />
        {/* Gold accent line at right edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 4,
            height: "100%",
            backgroundColor: CP.terracotta,
            opacity: 0.7,
          }}
        />
      </div>

      {/* RIGHT — Stats panel (75%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "75%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "54px 96px 54px 72px",
        }}
      >
        {/* Category label */}
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
              marginBottom: 8,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: condensed,
            fontSize: 72,
            color: CP.text,
            letterSpacing: "0.02em",
            lineHeight: 0.95,
            marginBottom: 36,
          }}
        >
          {title}
        </div>

        {/* Stats */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          {stats.map((stat, i) => {
            const entrySpring = spring({
              frame: Math.max(0, f - 18 - i * 14),
              fps: FPS,
              config: { damping: 16, stiffness: 80, mass: 1.0 },
            });

            const valueColor = stat.negative ? CP.mauve : CP.terracotta;

            return (
              <div key={i}>
                {/* Divider above (skip first) */}
                {i > 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: 1,
                      backgroundColor: `${CP.sub}22`,
                      marginBottom: 16,
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 24,
                    opacity: entrySpring,
                    transform: `translateY(${(1 - entrySpring) * 20}px)`,
                    marginBottom: 12,
                  }}
                >
                  {/* Value */}
                  <div
                    style={{
                      fontFamily: condensed,
                      fontSize: 88,
                      color: valueColor,
                      lineHeight: 0.9,
                      minWidth: 200,
                    }}
                  >
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 26,
                      fontWeight: 500,
                      color: CP.sub,
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 96,
            fontFamily: sans,
            fontSize: 18,
            color: CP.muted,
            ...reveal(frame, at + 60),
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
  "compositionId": "imgcomp-stacked-stat-build",
  "props": {
    "image": "demo-engineers.png",
    "title": "Capability Stack",
    "stats": [
      {
        "value": "1,850",
        "label": "GCCs in India"
      },
      {
        "value": "28%",
        "label": "Global STEM workforce",
        "negative": true
      },
      {
        "value": "$100B",
        "label": "IT services industry"
      }
    ],
    "categoryLabel": "THE LADDER",
    "badge": "#SWARAJYA",
    "source": "NASSCOM 2024",
    "at": 15
  },
  "durationInFrames": 180
};
