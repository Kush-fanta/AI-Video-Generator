import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface QuoteAttributionProps {
  quote: string;
  name: string;
  title?: string;
  durationInFrames: number;
}

export const QuoteAttribution: React.FC<QuoteAttributionProps> = ({ quote, name, title, durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const quoteOpacity = fadeIn(frame, 0, SK.motion.fadeFrames);
  const attrOpacity = fadeIn(frame, 18, SK.motion.fadeFrames);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: SK.bg.navy, fontFamily: SK.font.sans, opacity, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: -20, left: SK.safe.sideMargin - 20, fontFamily: SK.font.sans, fontWeight: SK.weight.black, fontSize: 200, color: "rgba(215,69,69,0.25)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>
        "
      </span>
      <div style={{ maxWidth: 1100, display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: `0 ${SK.safe.sideMargin}px` }}>
        <p style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 40, color: SK.text.white, lineHeight: 1.5, textAlign: "center", margin: 0, opacity: quoteOpacity }}>
          {quote}
        </p>
        <div style={{ width: 60, height: 2, backgroundColor: SK.accent.red, opacity: attrOpacity }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: attrOpacity }}>
          <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.bold, fontSize: 28, color: SK.text.white }}>{name}</span>
          {title && (
            <span style={{ fontFamily: SK.font.sans, fontWeight: SK.weight.medium, fontSize: 20, color: SK.text.mute }}>{title}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteAttribution;

export const demo = {
  compositionId: "sk-quote-attribution",
  durationInFrames: 150,
  props: { quote: "India's defence sector is no longer a buyer. It is becoming an exporter.", name: "Rajnath Singh", title: "Defence Minister", durationInFrames: 150 },
};
