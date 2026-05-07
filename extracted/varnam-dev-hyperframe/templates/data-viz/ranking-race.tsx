import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P, type Palette } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RankingEntry {
  label: string;
  /** Values at each keyframe — bars resize/reorder over time */
  values: number[];
  color?: string;
}

export interface RankingRaceProps extends BaseProps {
  entries: RankingEntry[];
  /** Labels for each keyframe (e.g. years) */
  keyframes: string[];
  headline?: string;
  source?: string;
  at?: number;
  palette?: Partial<Palette>;
}

/**
 * RankingRace — Horizontal bars that reorder and resize over time.
 * Bar chart race format. Labels follow their bars.
 * Each keyframe transition snaps — no lazy glide.
 */
export const RankingRace: React.FC<RankingRaceProps> = ({
  entries,
  keyframes,
  headline,
  source,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const BAR_H = 56;
  const BAR_GAP = 12;
  const MAX_W = 800;
  const FRAMES_PER_KF = 30;

  // Current keyframe index (float for interpolation)
  const kfProgress = interpolate(
    f,
    [12, 12 + (keyframes.length - 1) * FRAMES_PER_KF],
    [0, keyframes.length - 1],
    C,
  );
  const kfIndex = Math.floor(kfProgress);
  const kfFrac = kfProgress - kfIndex;
  const nextKf = Math.min(kfIndex + 1, keyframes.length - 1);

  // Current keyframe label
  const currentLabel = keyframes[Math.round(kfProgress)] || keyframes[0];

  // Interpolate values for each entry
  const currentValues = entries.map((e) => {
    const v0 = e.values[kfIndex] ?? 0;
    const v1 = e.values[nextKf] ?? v0;
    return v0 + (v1 - v0) * kfFrac;
  });

  // Sort by value descending for ranking
  const maxVal = Math.max(...currentValues, 1);
  const sorted = entries
    .map((e, i) => ({ ...e, currentValue: currentValues[i], originalIndex: i }))
    .sort((a, b) => b.currentValue - a.currentValue);

  const barColors = [pal.terracotta, pal.sage, pal.slate, pal.mauve, pal.muted];

  // Initial entrance
  const entered = interpolate(f, [6, 10], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            ...reveal(frame, at + 4),
            position: "absolute",
            top: 50,
            left: 120,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: pal.muted,
            textTransform: "uppercase",
          }}
        >
          {headline}
        </div>
      )}

      {/* Current keyframe label — big */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 120,
          fontFamily: serif,
          fontSize: 96,
          color: pal.light,
          letterSpacing: "-0.02em",
          opacity: entered,
        }}
      >
        {currentLabel}
      </div>

      {/* Bars */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 120,
          right: 120,
          opacity: entered,
        }}
      >
        {sorted.map((entry, rank) => {
          const barW = (entry.currentValue / maxVal) * MAX_W;
          const color =
            entry.color || barColors[entry.originalIndex % barColors.length];

          return (
            <div
              key={entry.originalIndex}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: BAR_GAP,
                height: BAR_H,
              }}
            >
              {/* Label */}
              <div
                style={{
                  width: 180,
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 700,
                  color: pal.text,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.label}
              </div>

              {/* Bar */}
              <div
                style={{
                  width: barW,
                  height: BAR_H,
                  backgroundColor: color,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 16,
                  minWidth: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: pal.bg,
                    whiteSpace: "nowrap",
                  }}
                >
                  {Math.round(entry.currentValue)}
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
            ...reveal(frame, at + 10 + keyframes.length * FRAMES_PER_KF),
            position: "absolute",
            bottom: 50,
            left: 120,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: pal.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-ranking-race",
  props: {
    "entries": [
      {
        "label": "India",
        "values": [
          22,
          28,
          31
        ]
      },
      {
        "label": "US",
        "values": [
          26,
          24,
          21
        ]
      },
      {
        "label": "UK",
        "values": [
          18,
          20,
          24
        ]
      }
    ],
    "keyframes": [
      "2021",
      "2022",
      "2023"
    ],
    "headline": "Market share race",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
