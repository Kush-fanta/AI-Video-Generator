import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

interface BarEntry {
  label: string;
  value: number;
  displayValue: string;
  color?: "accent" | "threat";
}

export interface ThreatGapBarProps extends BaseProps {
  /** Background image — never bare canvas */
  image: ImageRef;
  /** Title above bars (e.g. "THE CAPABILITY DEFICIT") */
  title: string;
  /** Category label above title */
  categoryLabel?: string;
  /** Two bars to compare */
  bars: [BarEntry, BarEntry];
  /** Source citation */
  source?: string;
  /** Badge top-right */
  badge?: string;
  /** Image dim level (default 0.25) */
  imageDim?: number;
  at?: number;
}

/**
 * ThreatGapBar — Two horizontal bars on darkened image showing capability comparison.
 *
 * Full-bleed image backing (never bare canvas). Title in condensed sans.
 * Bars grow from left with spring physics. Gold = positive/capability,
 * Red = threat/adversary. Values slam in at bar tips.
 *
 * For frames like: "China threat range vs India intercept range"
 */
export const ThreatGapBar: React.FC<ThreatGapBarProps> = ({
  image,
  title,
  categoryLabel,
  bars,
  source,
  badge,
  imageDim = 0.25,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 7);
  const maxVal = Math.max(bars[0].value, bars[1].value);

  const barGrow = (index: number) =>
    spring({
      frame: Math.max(0, f - 20 - index * 15),
      fps: FPS,
      config: { damping: 18, stiffness: 60, mass: 1.2 },
    });

  const barWidth = (entry: BarEntry, index: number) =>
    (entry.value / maxVal) * 100 * barGrow(index);

  const barColor = (entry: BarEntry) =>
    entry.color === "threat" ? CP.mauve : CP.terracotta;

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

      {/* Content overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "54px 96px",
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
              marginBottom: 12,
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
            fontSize: 96,
            color: CP.text,
            letterSpacing: "0.02em",
            lineHeight: 0.95,
            marginBottom: 64,
          }}
        >
          {title}
        </div>

        {/* Bars */}
        {bars.map((entry, i) => (
          <div
            key={i}
            style={{
              marginBottom: i === 0 ? 48 : 0,
              ...reveal(frame, at + 14 + i * 10),
            }}
          >
            {/* Bar label */}
            <div
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: CP.sub,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: barColor(entry),
                }}
              />
              {entry.label}
            </div>

            {/* Bar track */}
            <div
              style={{
                position: "relative",
                height: 56,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {/* Bar fill */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${barWidth(entry, i)}%`,
                  backgroundColor: barColor(entry),
                  borderRadius: 4,
                }}
              />

              {/* Value label at bar tip */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${barWidth(entry, i)}%`,
                  transform: "translate(12px, -50%)",
                  fontFamily: condensed,
                  fontSize: 36,
                  color: CP.text,
                  opacity: barGrow(i) > 0.8 ? 1 : 0,
                  whiteSpace: "nowrap",
                }}
              >
                {entry.displayValue}
              </div>
            </div>
          </div>
        ))}
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
            ...reveal(frame, at + 40),
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
  "compositionId": "imgcomp-threat-gap-bar",
  "props": {
    "image": "demo.png",
    "title": "THE CAPABILITY DEFICIT",
    "categoryLabel": "COMPARISON",
    "bars": [
      {
        "label": "China threat range",
        "value": 85,
        "displayValue": "3,500 KM",
        "color": "threat"
      },
      {
        "label": "India intercept range",
        "value": 40,
        "displayValue": "1,200 KM",
        "color": "accent"
      }
    ],
    "source": "IISS Military Balance 2024",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 180
};
