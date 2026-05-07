import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface StatStripProps extends BaseProps {
  /** Background image — always required */
  image: ImageRef;
  /** Hero stat */
  value: string;
  /** Unit/label */
  unit: string;
  /** Supporting line */
  body?: string;
  /** Channel badge */
  badge?: string;
  /** Strip position: "bottom" (default) or "top" */
  stripPosition?: "bottom" | "top";
  at?: number;
}

/**
 * StatStrip — hero number in a translucent strip bar overlaid on a full-bleed image.
 * The stat lives INSIDE the image, not beside it. For when you want the photo
 * to dominate but need a data callout anchored to it.
 *
 * Think: dramatic wide shot of empty factory + "85.6%" strip at bottom.
 */
export const StatStrip: React.FC<StatStripProps> = ({
  image,
  value,
  unit,
  body,
  badge,
  stripPosition = "bottom",
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 6, 1.02, 1.07);

  // Strip slides up from bottom (or down from top)
  const stripSpring = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 20, stiffness: 60, mass: 1.3 },
  });
  const stripY = stripPosition === "bottom"
    ? interpolate(stripSpring, [0, 1], [120, 0], C)
    : interpolate(stripSpring, [0, 1], [-120, 0], C);
  const stripOpacity = interpolate(frame, [at + 8, at + 16], [0, 1], C);

  // Value slam
  const valueSpring = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 16, stiffness: 90, mass: 1.0 },
  });
  const valueScale = interpolate(valueSpring, [0, 1], [1.3, 1.0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Full-bleed image */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        overflow: "hidden",
      }}>
        <Img src={staticFile(image)} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${imgScale})`, opacity: 0.85,
        }} />
      </div>

      {/* Gradient behind strip */}
      <div style={{
        position: "absolute",
        [stripPosition]: 0,
        left: 0, width: "100%", height: "35%",
        background: stripPosition === "bottom"
          ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
      }} />

      {/* Stat strip */}
      <div style={{
        position: "absolute",
        [stripPosition]: 48,
        left: 0, width: "100%",
        display: "flex", alignItems: "center", gap: 40,
        padding: "0 80px",
        transform: `translateY(${stripY}px)`,
        opacity: stripOpacity,
        zIndex: 2,
      }}>
        {/* Value with slam */}
        <div style={{ transform: `scale(${valueScale})`, transformOrigin: "left center" }}>
          <span style={{
            fontFamily: condensed, fontSize: 140, lineHeight: 0.85,
            color: CP.terracotta, letterSpacing: "0.02em",
          }}>{value}</span>
        </div>

        {/* Unit + body */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: sans, fontSize: 24, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: CP.text, opacity: 0.9,
          }}>{unit}</div>
          {body && (
            <div style={{
              ...reveal(frame, at + 22),
              fontFamily: sans, fontSize: 24, lineHeight: 1.4,
              color: CP.sub, marginTop: 6, maxWidth: 600,
            }}>{body}</div>
          )}
        </div>

        {/* Red accent bar */}
        <div style={{
          position: "absolute", [stripPosition === "bottom" ? "top" : "bottom"]: -16,
          left: 80, width: 56, height: 3,
          backgroundColor: CP.mauve, borderRadius: 1.5,
          opacity: interpolate(frame, [at + 18, at + 26], [0, 1], C),
        }} />
      </div>

      {badge && (
        <div style={{
          position: "absolute", top: 40, right: 48,
          ...reveal(frame, at + 2),
          backgroundColor: CP.mauve, padding: "8px 16px", fontFamily: sans,
          fontSize: 20, fontWeight: 700, letterSpacing: "0.08em", color: CP.text, zIndex: 4,
        }}>{badge}</div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-stat-strip",
  "props": {
    "image": "demo.png",
    "value": "85.6",
    "unit": "PERCENT",
    "body": "The strip sits inside the image instead of stealing the frame.",
    "badge": "#SWARAJYA",
    "stripPosition": "bottom",
    "at": 15
  },
  "durationInFrames": 150
};
