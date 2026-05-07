/**
 * BarChartH — Horizontal bar chart, up to 6 bars.
 * Labels left, bars grow left-to-right, value labels right of bar.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK, type SKPaletteName, resolveSKPalette } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface BarChartHProps {
  title: string;
  items: Array<{ label: string; value: number; highlight?: boolean }>;
  unit?: string;
  palette?: SKPaletteName;
  durationInFrames: number;
  /**
   * barStaggerFrames: frames between each bar's draw start.
   * Default: 3 (≈100ms). Pass a larger value (e.g. 18 ≈ 600ms) for a visually
   * distinct sequential reveal (e.g. "WB first, TN second" per storyboard spec).
   */
  barStaggerFrames?: number;
}

const LABEL_W = 220;
const BAR_MAX_W = 700;
const BAR_H = 52;

export const BarChartH: React.FC<BarChartHProps> = ({
  title,
  items,
  unit,
  palette,
  durationInFrames,
  barStaggerFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const maxVal = Math.max(...items.map((i) => i.value));
  const theme = resolveSKPalette(palette);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin }}>
      <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: theme.text, marginBottom: 48, alignSelf: "flex-start", maxWidth: SK.safe.columnWidth }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: LABEL_W + 24 + BAR_MAX_W + 80 }}>
        {items.slice(0, 6).map((item, i) => {
          const p = interpolate(frame, [12 + i * barStaggerFrames, 32 + i * barStaggerFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barW = (item.value / maxVal) * BAR_MAX_W * p;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 22, color: theme.text, width: LABEL_W, flexShrink: 0, textAlign: "right" }}>{item.label}</span>
              <div style={{ width: barW, height: BAR_H, backgroundColor: item.highlight ? theme.accent : theme.chartNeutral, borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: 28, color: theme.text, whiteSpace: "nowrap" }}>{item.value}{unit ? ` ${unit}` : ""}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default BarChartH;

export const demo = {
  compositionId: "sk-bar-chart-h",
  durationInFrames: 150,
  props: {
    title: "Defence exports ($ bn)",
    items: [
      { label: "India", value: 89, highlight: true },
      { label: "China", value: 45 },
      { label: "USA", value: 34 },
      { label: "UK", value: 12 },
    ],
    unit: "$bn",
    palette: "default",
    durationInFrames: 150,
  },
};
