import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: condensed } = loadCondensed();

export interface SplitImageStatProps extends BaseProps {
  /** Image for the left panel */
  image: ImageRef;
  /** Hero stat number (e.g. "3", "60", "127.5") */
  value: string;
  /** Unit or label directly under the number (e.g. "MONTHS", "DAYS") */
  unit: string;
  /** Supporting text below the red rule */
  body: string;
  /** Label bar overlay on the image (e.g. "36 WARSHIPS") */
  imageLabel?: string;
  /** Secondary image label line (e.g. "OFF KARACHI") */
  imageSublabel?: string;
  /** Category label top of data panel */
  categoryLabel?: string;
  /** Channel badge top-right */
  badge?: string;
  /** Words in body to highlight with accent color */
  accentWords?: string[];
  at?: number;
}

/**
 * Split layout: cinematic image LEFT (50%), solid-color data panel RIGHT (50%).
 *
 * Left panel: full-bleed image with Ken Burns, optional label bar at bottom.
 * Right panel: category label → hero stat (massive condensed sans) →
 *   unit label (gold/accent, spaced caps) → red rule → body text.
 *
 * Matches the Swarajya reference: "36 WARSHIPS OFF KARACHI" left,
 * "3 MONTHS" with supporting text right on navy.
 */
export const SplitImageStat: React.FC<SplitImageStatProps> = ({
  image,
  value,
  unit,
  body,
  imageLabel,
  imageSublabel,
  categoryLabel,
  badge,
  accentWords = [],
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const C = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 6);
  const ruleWidth = lineGrow(frame, at + 18, 22);

  /** Render body with accent-colored words */
  const renderBody = () => {
    if (accentWords.length === 0) return body;
    const parts: React.ReactNode[] = [];
    let remaining = body;
    let key = 0;
    for (const word of accentWords) {
      const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) continue;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(
        <span key={key++} style={{ color: C.terracotta }}>
          {remaining.slice(idx, idx + word.length)}
        </span>,
      );
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) parts.push(remaining);
    return parts.length > 0 ? <>{parts}</> : body;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* LEFT — Image panel (50%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
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
            opacity: 0.9,
          }}
        />

        {/* Dark gradient at bottom of image for label */}
        {imageLabel && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "25%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
            }}
          />
        )}

        {/* Image label bar */}
        {imageLabel && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 40,
              right: 40,
              ...reveal(frame, at + 6),
              zIndex: 2,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                padding: "16px 24px",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  fontFamily: condensed,
                  fontSize: 36,
                  color: "#FFFFFF",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {imageLabel}
              </div>
              {imageSublabel && (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 22,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 2,
                    letterSpacing: "0.06em",
                  }}
                >
                  {imageSublabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Data panel (50%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* Category label */}
        {categoryLabel && (
          <div
            style={{
              ...reveal(frame, at + 4),
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.terracotta,
              }}
            >
              {categoryLabel}
            </div>
          </div>
        )}

        {/* Hero stat number */}
        <div style={reveal(frame, at + 8)}>
          <div
            style={{
              fontFamily: condensed,
              fontSize: 200,
              lineHeight: 0.85,
              color: C.text,
              letterSpacing: "0.02em",
            }}
          >
            {value}
          </div>
        </div>

        {/* Unit label */}
        <div
          style={{
            ...reveal(frame, at + 12),
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.terracotta,
            marginTop: 8,
          }}
        >
          {unit}
        </div>

        {/* Red accent rule */}
        <div
          style={{
            width: `${ruleWidth}%`,
            maxWidth: 56,
            height: 3,
            backgroundColor: C.mauve,
            marginTop: 24,
            borderRadius: 1.5,
          }}
        />

        {/* Body text */}
        <div
          style={{
            ...reveal(frame, at + 22),
            fontFamily: sans,
            fontSize: 28,
            lineHeight: 1.5,
            color: C.sub,
            marginTop: 20,
            maxWidth: 480,
          }}
        >
          {renderBody()}
        </div>
      </div>

      {/* Badge — top right */}
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
  "compositionId": "imgcomp-split-image-stat",
  "props": {
    "image": "demo.png",
    "value": "3",
    "unit": "MONTHS",
    "body": "Cycle times dropped once the system moved from manual approvals to digital rails.",
    "imageLabel": "36 WARSHIPS",
    "imageSublabel": "OFF KARACHI",
    "categoryLabel": "TIMELINE",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 180
};
