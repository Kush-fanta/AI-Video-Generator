import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface SplitImageStatRevealProps extends BaseProps {
  image: ImageRef;
  value: string;
  unit: string;
  body: string;
  imageLabel?: string;
  imageSublabel?: string;
  categoryLabel?: string;
  badge?: string;
  accentWords?: string[];
  /** "left" = image slides in from left. "right" = panel pushes in from right. "both" = simultaneous. */
  revealDirection?: "left" | "right" | "both";
  at?: number;
}

/**
 * SplitImageStat with animated entrance — image panel slides in from edge,
 * stat panel pushes in from opposite side. Spring physics for weight.
 */
export const SplitImageStatReveal: React.FC<SplitImageStatRevealProps> = ({
  image,
  value,
  unit,
  body,
  imageLabel,
  imageSublabel,
  categoryLabel,
  badge,
  accentWords = [],
  revealDirection = "both",
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(Math.max(0, f - 12), FPS * 6);
  const ruleWidth = lineGrow(frame, at + 24, 22);

  // Image panel spring — slides in from left
  const imgSpring = spring({ frame: f, fps: FPS, config: { damping: 22, stiffness: 60, mass: 1.4 } });
  const imgX = revealDirection === "right" ? 0
    : interpolate(imgSpring, [0, 1], [-960, 0], C);

  // Stat panel spring — slides in from right
  const statSpring = spring({ frame: Math.max(0, f - (revealDirection === "both" ? 4 : 0)), fps: FPS, config: { damping: 20, stiffness: 70, mass: 1.2 } });
  const statX = revealDirection === "left" ? 0
    : interpolate(statSpring, [0, 1], [960, 0], C);

  const renderBody = () => {
    if (accentWords.length === 0) return body;
    const parts: React.ReactNode[] = [];
    let remaining = body;
    let key = 0;
    for (const word of accentWords) {
      const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) continue;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(<span key={key++} style={{ color: CP.terracotta }}>{remaining.slice(idx, idx + word.length)}</span>);
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) parts.push(remaining);
    return parts.length > 0 ? <>{parts}</> : body;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg, overflow: "hidden" }}>
      {/* LEFT — Image panel, slides in */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
        overflow: "hidden", transform: `translateX(${imgX}px)`,
      }}>
        <Img src={staticFile(image)} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${imgScale})`, opacity: 0.9,
        }} />
        {imageLabel && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: "100%", height: "25%",
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
          }} />
        )}
        {imageLabel && (
          <div style={{
            position: "absolute", bottom: 40, left: 40, right: 40,
            ...reveal(frame, at + 18), zIndex: 2,
          }}>
            <div style={{
              backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              padding: "16px 24px", borderRadius: 4,
            }}>
              <div style={{
                fontFamily: condensed, fontSize: 36, color: "#FFFFFF",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>{imageLabel}</div>
              {imageSublabel && (
                <div style={{
                  fontFamily: sans, fontSize: 22, color: "rgba(255,255,255,0.7)",
                  marginTop: 2, letterSpacing: "0.06em",
                }}>{imageSublabel}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Stat panel, slides in */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        paddingLeft: 80, paddingRight: 80,
        transform: `translateX(${statX}px)`,
      }}>
        {categoryLabel && (
          <div style={{ ...reveal(frame, at + 12), marginBottom: 32 }}>
            <div style={{
              fontFamily: sans, fontSize: 20, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase", color: CP.terracotta,
            }}>{categoryLabel}</div>
          </div>
        )}
        <div style={reveal(frame, at + 16)}>
          <div style={{
            fontFamily: condensed, fontSize: 200, lineHeight: 0.85,
            color: CP.text, letterSpacing: "0.02em",
          }}>{value}</div>
        </div>
        <div style={{
          ...reveal(frame, at + 20), fontFamily: sans, fontSize: 28, fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase", color: CP.terracotta, marginTop: 8,
        }}>{unit}</div>
        <div style={{
          width: `${ruleWidth}%`, maxWidth: 56, height: 3,
          backgroundColor: CP.mauve, marginTop: 24, borderRadius: 1.5,
        }} />
        <div style={{
          ...reveal(frame, at + 28), fontFamily: sans, fontSize: 28, lineHeight: 1.5,
          color: CP.sub, marginTop: 20, maxWidth: 480,
        }}>{renderBody()}</div>
      </div>

      {badge && (
        <div style={{
          position: "absolute", top: 40, right: 48, ...reveal(frame, at + 6),
          backgroundColor: CP.mauve, padding: "8px 16px", fontFamily: sans,
          fontSize: 20, fontWeight: 700, letterSpacing: "0.08em", color: CP.text, zIndex: 4,
        }}>{badge}</div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-split-image-stat-reveal",
  "props": {
    "image": "demo.png",
    "value": "3",
    "unit": "MONTHS",
    "body": "Cycle times dropped once the system moved from manual approvals to digital rails.",
    "imageLabel": "36 WARSHIPS",
    "imageSublabel": "OFF KARACHI",
    "categoryLabel": "TIMELINE",
    "badge": "#SWARAJYA",
    "revealDirection": "both",
    "at": 15
  },
  "durationInFrames": 180
};
