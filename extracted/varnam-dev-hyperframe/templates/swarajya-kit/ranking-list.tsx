/**
 * RankingList — Numbered list up to 8 items.
 * Rank in red, label bold white, value right-aligned mute.
 * Rows fade in staggered.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface RankingListProps {
  title: string;
  items: Array<{ label: string; value: string }>;
  durationInFrames: number;
}

export const RankingList: React.FC<RankingListProps> = ({ title, items, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: SK.bg.navy, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: SK.safe.sideMargin, paddingRight: SK.safe.sideMargin }}>
      <div style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: SK.text.white, marginBottom: 40, alignSelf: "flex-start", maxWidth: SK.safe.columnWidth }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: SK.safe.columnWidth }}>
        {items.slice(0, 8).map((item, i) => {
          const rowOp = fadeIn(frame, 12 + i * 8, SK.motion.fadeFrames);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 32, opacity: rowOp, padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: 48, color: SK.accent.red, width: 60, flexShrink: 0, textAlign: "right", lineHeight: 1 }}>{i + 1}</span>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: SK.size.sub, color: SK.text.white, flex: 1, lineHeight: 1.2 }}>{item.label}</span>
              <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: SK.size.body, color: SK.text.mute, whiteSpace: "nowrap" }}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default RankingList;

export const demo = {
  compositionId: "sk-ranking-list",
  durationInFrames: 150,
  props: {
    title: "Defence PSUs by revenue",
    items: [
      { label: "ISRO", value: "₹1.2L cr" },
      { label: "HAL", value: "₹80,000 cr" },
      { label: "BEL", value: "₹45,000 cr" },
      { label: "DRDO", value: "₹23,000 cr" },
      { label: "OFB", value: "₹18,000 cr" },
    ],
    durationInFrames: 150,
  },
};
