import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface VerdictOverlayProps extends BaseProps {
  /** Background image — cinematic, desaturated */
  image: ImageRef;
  /** The verdict line — short, punchy */
  verdict: string;
  /** Optional source/attribution below */
  attribution?: string;
  /** Channel badge */
  badge?: string;
  at?: number;
}

/**
 * Verdict overlay — Mode 2 editorial serif.
 * Full-bleed darkened image. Single powerful line in large Playfair Display,
 * centered. Fades in slowly with scale settle. For closing beats:
 * "It wasn't fate.", "Still pointing down.", etc.
 */
export const VerdictOverlay: React.FC<VerdictOverlayProps> = ({
  image,
  verdict,
  attribution,
  badge,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 8, 1.0, 1.04);

  // Verdict entrance: slow spring, heavier than normal
  const verdictSpring = spring({
    frame: Math.max(0, f - 10),
    fps: FPS,
    config: { damping: 28, stiffness: 40, mass: 2.0 },
  });
  const verdictScale = interpolate(verdictSpring, [0, 1], [1.08, 1.0], C);
  const verdictOpacity = interpolate(frame, [at + 10, at + 30], [0, 1], C);

  const attrOpacity = interpolate(frame, [at + 35, at + 50], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Background image — very dark */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        overflow: "hidden",
      }}>
        <Img src={staticFile(image)} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${imgScale})`, opacity: 0.2,
        }} />
      </div>

      {/* Verdict text — centered */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        zIndex: 2,
      }}>
        <div style={{
          fontFamily: serif, fontSize: 88, fontWeight: 700, lineHeight: 1.15,
          color: CP.text, textAlign: "center", maxWidth: 1200, padding: "0 100px",
          opacity: verdictOpacity,
          transform: `scale(${verdictScale})`,
        }}>
          {verdict}
        </div>

        {attribution && (
          <div style={{
            fontFamily: sans, fontSize: 22, letterSpacing: "0.12em",
            textTransform: "uppercase", color: CP.muted, marginTop: 32,
            opacity: attrOpacity,
          }}>
            {attribution}
          </div>
        )}
      </div>

      {badge && (
        <div style={{
          position: "absolute", top: 40, right: 48,
          opacity: interpolate(frame, [at + 2, at + 10], [0, 1], C),
          backgroundColor: CP.mauve, padding: "8px 16px", fontFamily: sans,
          fontSize: 20, fontWeight: 700, letterSpacing: "0.08em", color: CP.text, zIndex: 4,
        }}>{badge}</div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-verdict-overlay",
  "props": {
    "image": "demo.png",
    "verdict": "It was never inevitable.",
    "attribution": "Editorial verdict",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 150
};
