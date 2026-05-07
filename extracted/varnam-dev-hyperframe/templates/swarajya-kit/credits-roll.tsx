import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

loadInter();

export interface CreditEntry { role: string; name: string; }

export interface CreditsRollProps {
  credits: CreditEntry[];
  durationInFrames: number;
}

const ITEM_H = 68;
const ENTRY_GAP = 48;

export const CreditsRoll: React.FC<CreditsRollProps> = ({ credits, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const totalH = credits.length * (ITEM_H + ENTRY_GAP);
  const speed = totalH / Math.max(durationInFrames - 24, 1);
  const scrollY = -(frame * speed) + 1080;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: SK.bg.black, fontFamily: SK.font.sans, opacity, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${scrollY}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: ENTRY_GAP, paddingTop: 40 }}>
        {credits.map((credit, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 20, color: SK.text.mute, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {credit.role}
            </span>
            <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: 28, color: SK.text.white }}>
              {credit.name}
            </span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to bottom, #000000 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, #000000 0%, transparent 100%)", pointerEvents: "none" }} />
    </div>
  );
};

export default CreditsRoll;

export const demo = {
  compositionId: "sk-credits-roll",
  durationInFrames: 180,
  props: {
    credits: [
      { role: "Producer", name: "Swarajya Media" },
      { role: "Research", name: "Arvind Nair" },
      { role: "Script", name: "Priya Sharma" },
      { role: "Motion Design", name: "Vikram Das" },
      { role: "Voiceover", name: "Aditya Mehta" },
    ],
    durationInFrames: 180,
  },
};
