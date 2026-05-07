/**
 * MapCallout — Regional outline with a labeled pin.
 * Accepts a raw SVG path string; falls back to a rounded rect.
 * White outline 2px, near-transparent fill. Red pin at fractional (x,y).
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope } from "./_anim";

const { fontFamily: inter } = loadInter();

export interface MapCalloutProps {
  regionSvgPath?: string;
  pinX: number; // 0–1 fraction of MAP_W
  pinY: number; // 0–1 fraction of MAP_H
  pinLabel: string;
  pinSubline?: string;
  durationInFrames: number;
  bg?: "navy" | "black";
}

const W = 640, H = 520, R = 8, STEM = 20;

export const MapCallout: React.FC<MapCalloutProps> = ({
  regionSvgPath, pinX, pinY, pinLabel, pinSubline, durationInFrames, bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const px = pinX * W;
  const py = pinY * H;

  return (
    <AbsoluteFill style={{
      backgroundColor: bg === "navy" ? SK.bg.navy : SK.bg.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: fadeEnvelope(frame, durationInFrames),
    }}>
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", top: 0, left: 0 }}>
          {regionSvgPath
            ? <path d={regionSvgPath} stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.04)" />
            : <rect x={60} y={60} width={W - 120} height={H - 120} rx={24} ry={24}
                stroke="white" strokeWidth={2} fill="rgba(255,255,255,0.04)" />
          }
          <line x1={px} y1={py} x2={px} y2={py + STEM} stroke={SK.accent.red} strokeWidth={2} />
          <circle cx={px} cy={py} r={R} fill={SK.accent.red} />
        </svg>

        {/* Label sits right of the pin circle */}
        <div style={{
          position: "absolute", left: px + R + 8, top: py - 14,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <span style={{ fontFamily: inter, fontWeight: SK.weight.bold, fontSize: 24,
            color: SK.text.white, whiteSpace: "nowrap" }}>
            {pinLabel}
          </span>
          {pinSubline && (
            <span style={{ fontFamily: inter, fontWeight: SK.weight.medium, fontSize: 18,
              color: SK.text.mute, whiteSpace: "nowrap" }}>
              {pinSubline}
            </span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default MapCallout;

export const demo = {
  compositionId: "sk-map-callout",
  durationInFrames: 120,
  props: {
    regionSvgPath:
      "M126,110L498,110L522,136L500,188L520,246L486,312L412,372L266,392L156,342L112,256L126,110Z",
    pinX: 0.55,
    pinY: 0.45,
    pinLabel: "Jammu & Kashmir",
    pinSubline: "36 sites targeted",
    durationInFrames: 120,
    bg: "navy",
  } satisfies MapCalloutProps,
};
