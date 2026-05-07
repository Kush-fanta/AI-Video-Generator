/**
 * ComparisonTable — 2-column comparison table.
 * Column A header red, column B header white. Up to 5 rows fade staggered.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface ComparisonTableProps {
  headerA: string;
  headerB: string;
  rows: Array<{ label: string; a: string; b: string }>;
  durationInFrames: number;
}

const COL_W = 280;

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ headerA, headerB, rows, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: SK.bg.navy, opacity, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin }}>
      <div style={{ width: "100%", maxWidth: SK.safe.columnWidth }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", paddingBottom: 16, borderBottom: `2px solid ${SK.accent.red}` }}>
          <span style={{ flex: 1 }} />
          <span style={{ width: COL_W, fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.body, color: SK.accent.red, textAlign: "center" }}>{headerA}</span>
          <span style={{ width: COL_W, fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.body, color: SK.text.white, textAlign: "center" }}>{headerB}</span>
        </div>
        {/* Rows */}
        {rows.slice(0, 5).map((row, i) => {
          const rowOp = fadeIn(frame, 12 + i * 6, SK.motion.fadeFrames);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.15)", opacity: rowOp }}>
              <span style={{ flex: 1, fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: SK.text.mute }}>{row.label}</span>
              <span style={{ width: COL_W, fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.body, color: SK.accent.red, textAlign: "center" }}>{row.a}</span>
              <span style={{ width: COL_W, fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.body, color: SK.text.white, textAlign: "center" }}>{row.b}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default ComparisonTable;

export const demo = {
  compositionId: "sk-comparison-table",
  durationInFrames: 150,
  props: {
    headerA: "India",
    headerB: "China",
    rows: [
      { label: "GDP growth", a: "6.5%", b: "4.6%" },
      { label: "Defence budget", a: "$83bn", b: "$225bn" },
      { label: "Exports", a: "$435bn", b: "$3.4T" },
      { label: "Inflation", a: "4.7%", b: "2.3%" },
    ],
    durationInFrames: 150,
  },
};
