import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

interface StatCell {
  value: string;
  label: string;
  /** Optional: highlight this cell's value in accent vs default text */
  accent?: boolean;
  /** Red highlight for negative/threat data */
  negative?: boolean;
}

export interface StatGridProps extends BaseProps {
  /** Background image — never bare canvas */
  image: ImageRef;
  /** Title above grid */
  title: string;
  /** 2-4 stat cells */
  stats: StatCell[];
  /** Category label */
  categoryLabel?: string;
  /** Badge */
  badge?: string;
  /** Source */
  source?: string;
  /** Image dim level */
  imageDim?: number;
  at?: number;
}

/**
 * StatGrid — 2x2 grid of stats overlaid on darkened image.
 *
 * Each cell: hero number + label, separated by subtle dividers.
 * Numbers slam in with spring overshoot, staggered.
 * Gold = positive/accent, Red = negative/threat.
 *
 * For multi-stat frames: "4 stats that tell the Bengal story"
 */
export const StatGrid: React.FC<StatGridProps> = ({
  image,
  title,
  stats,
  categoryLabel,
  badge,
  source,
  imageDim = 0.2,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 7);
  const cols = stats.length <= 2 ? stats.length : 2;
  const rows = Math.ceil(stats.length / cols);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.dark }}>
      {/* Image backing */}
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${imgScale})`,
          opacity: imageDim,
          position: "absolute",
        }}
      />

      {/* Dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Title area */}
      <div
        style={{
          position: "absolute",
          top: 54,
          left: 96,
          right: 96,
        }}
      >
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
              marginBottom: 12,
            }}
          >
            {categoryLabel}
          </div>
        )}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: condensed,
            fontSize: 84,
            color: CP.text,
            letterSpacing: "0.02em",
            lineHeight: 0.95,
          }}
        >
          {title}
        </div>
      </div>

      {/* Stat grid */}
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 96,
          right: 96,
          bottom: 100,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 0,
        }}
      >
        {stats.map((stat, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);

          const slamScale = spring({
            frame: Math.max(0, f - 20 - i * 10),
            fps: FPS,
            config: { damping: 12, stiffness: 120, mass: 0.8 },
          });

          const valueColor = stat.negative
            ? CP.mauve
            : stat.accent
              ? CP.terracotta
              : CP.text;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                opacity: slamScale,
              }}
            >
              {/* Vertical divider (left edge, skip first column) */}
              {col > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "15%",
                    left: 0,
                    width: 1,
                    height: "70%",
                    backgroundColor: `${CP.sub}33`,
                  }}
                />
              )}

              {/* Horizontal divider (top edge, skip first row) */}
              {row > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10%",
                    width: "80%",
                    height: 1,
                    backgroundColor: `${CP.sub}33`,
                  }}
                />
              )}

              {/* Value */}
              <div
                style={{
                  fontFamily: condensed,
                  fontSize: 120,
                  color: valueColor,
                  lineHeight: 0.9,
                  transform: `scale(${0.9 + slamScale * 0.1})`,
                }}
              >
                {stat.value}
              </div>

              {/* Label */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: CP.sub,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {stat.label}
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
            bottom: 32,
            left: 96,
            fontFamily: sans,
            fontSize: 18,
            color: CP.muted,
            ...reveal(frame, at + 50),
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
  "compositionId": "imgcomp-stat-grid",
  "props": {
    "image": "demo.png",
    "title": "Capability Snapshots",
    "stats": [
      {
        "value": "1,850",
        "label": "GCCs"
      },
      {
        "value": "28%",
        "label": "STEM workforce",
        "accent": true
      },
      {
        "value": "$100B",
        "label": "Industry size"
      },
      {
        "value": "47%",
        "label": "YoY AI hiring",
        "negative": true
      }
    ],
    "categoryLabel": "OVERVIEW",
    "badge": "#SWARAJYA",
    "source": "NASSCOM 2024",
    "imageDim": 0.25,
    "at": 15
  },
  "durationInFrames": 180
};
