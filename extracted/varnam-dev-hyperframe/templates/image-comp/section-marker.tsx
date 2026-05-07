import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

export interface SectionMarkerProps extends BaseProps {
  /** Section title (e.g. "THE GAP", "THE INSTINCT") */
  title: string;
  /** Background image — required. No bare canvas. */
  image: ImageRef;
  /** Optional subtitle below */
  subtitle?: string;
  /** Category label above title */
  categoryLabel?: string;
  /** Channel badge */
  badge?: string;
  /** Image darkness (0-1, default 0.65) */
  imageDim?: number;
  at?: number;
}

/**
 * Section marker / concept label. Bold condensed text over a darkened full-bleed image.
 * NEVER bare text on flat canvas — always has image backing.
 * Used for structural beats: "THE GAP", "THE OBVIOUS ANSWER", etc.
 */
export const SectionMarker: React.FC<SectionMarkerProps> = ({
  title,
  image,
  subtitle,
  categoryLabel,
  badge,
  imageDim = 0.65,
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const C = mergePalette(paletteOverride);
  const imgScale = kenBurns(f, FPS * 6, 1.0, 1.06);
  const ruleWidth = lineGrow(frame, at + 12, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Background image — always present */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            opacity: 1 - imageDim,
          }}
        />
      </div>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* Category label */}
        {categoryLabel && (
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.terracotta,
              marginBottom: 12,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {/* Red accent rule */}
        <div
          style={{
            width: `${ruleWidth}%`,
            maxWidth: 56,
            height: 3,
            backgroundColor: C.mauve,
            marginBottom: 20,
            borderRadius: 1.5,
          }}
        />

        {/* Title */}
        <div style={reveal(frame, at + 8)}>
          <div
            style={{
              fontFamily: condensed,
              fontSize: 120,
              lineHeight: 1.0,
              color: C.text,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textAlign: "center",
              maxWidth: 1400,
              padding: "0 80px",
            }}
          >
            {title}
          </div>
        </div>

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 28,
              lineHeight: 1.5,
              color: C.sub,
              marginTop: 20,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            ...reveal(frame, at + 2),
            backgroundColor: C.mauve,
            padding: "8px 16px",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: C.text,
            zIndex: 4,
          }}
        >
          {badge}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-section-marker",
  "props": {
    "title": "THE GAP",
    "image": "demo.png",
    "subtitle": "The infrastructure gap made the policy gap visible.",
    "categoryLabel": "SECTION",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 150
};
