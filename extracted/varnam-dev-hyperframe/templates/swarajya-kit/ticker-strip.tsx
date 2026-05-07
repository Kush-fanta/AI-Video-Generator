/**
 * TickerStrip — Horizontal data bar at top or bottom of frame.
 * Full-width dark bar, 72px tall. Static snapshot of 3–6 label:value items
 * separated by red bullet dots. No scrolling. Layers over other content.
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: interFamily } = loadInter();

export interface TickerStripProps {
  items: Array<{ label: string; value: string }>;
  position?: "top" | "bottom";
  durationInFrames: number;
}

export const TickerStrip: React.FC<TickerStripProps> = ({
  items,
  position = "bottom",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames);

  const barHeight = 72;
  const positionStyle =
    position === "bottom"
      ? { bottom: 0, top: "auto" }
      : { top: 0, bottom: "auto" };

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          paddingLeft: SK.safe.sideMargin,
          paddingRight: SK.safe.sideMargin,
          gap: 0,
          ...positionStyle,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              flexShrink: 0,
            }}
          >
            {/* Separator bullet (not before first item) */}
            {i > 0 && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: SK.accent.red,
                  margin: "0 20px",
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontFamily: interFamily,
                fontWeight: SK.weight.medium,
                fontSize: 20,
                color: SK.text.white,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: SK.text.mute }}>{item.label}: </span>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default TickerStrip;

export const demo = {
  compositionId: "sk-ticker-strip",
  durationInFrames: 120,
  props: {
    items: [
      { label: "Missiles intercepted", value: "2,100+" },
      { label: "Cost per intercept", value: "$2M+" },
      { label: "Drone cost", value: "~$20K" },
      { label: "Differential", value: "100x" },
    ],
    position: "bottom",
    durationInFrames: 120,
  } satisfies TickerStripProps,
};
