import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: serif } = loadSerif();
const { fontFamily: condensed } = loadCondensed();

export interface EvidenceCardProps extends BaseProps {
  /** Document/source image on the left */
  image: ImageRef;
  /** Pull quote or key finding */
  quote: string;
  /** Attribution (e.g. "— Ministry of Defence, 2023") */
  attribution: string;
  /** Category label */
  categoryLabel?: string;
  /** Optional headline above the quote */
  headline?: string;
  /** Badge */
  badge?: string;
  /** Words to highlight */
  accentWords?: string[];
  at?: number;
}

/**
 * EvidenceCard — Document/source on left with editorial pull quote on right.
 *
 * Left: image with subtle tilt (2°) and shadow, like a document laid on desk.
 * Right: navy panel with serif pull quote, red rule, attribution.
 * For presenting sources, reports, documents as evidence.
 *
 * "According to the Ministry of Defence..." with document photo beside it.
 */
export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  image,
  quote,
  attribution,
  categoryLabel,
  headline,
  badge,
  accentWords = [],
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const docSlide = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 20, stiffness: 50, mass: 1.4 },
  });

  const ruleWidth = lineGrow(frame, at + 24, 22);

  const renderQuote = () => {
    if (accentWords.length === 0) return quote;
    const parts: React.ReactNode[] = [];
    let remaining = quote;
    let key = 0;
    for (const word of accentWords) {
      const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) continue;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(
        <span key={key++} style={{ color: CP.terracotta }}>
          {remaining.slice(idx, idx + word.length)}
        </span>,
      );
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) parts.push(remaining);
    return parts.length > 0 ? <>{parts}</> : quote;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* LEFT — Document image (42%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "42%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "80%",
            height: "75%",
            transform: `rotate(-2deg) translateX(${(1 - docSlide) * -80}px)`,
            opacity: docSlide,
            boxShadow: "20px 20px 60px rgba(0,0,0,0.4)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Subtle gold edge accent on document */}
        <div
          style={{
            position: "absolute",
            top: "12.5%",
            left: "10%",
            width: 3,
            height: `${75 * docSlide}%`,
            backgroundColor: CP.terracotta,
            opacity: 0.6,
            transform: "rotate(-2deg)",
          }}
        />
      </div>

      {/* RIGHT — Quote panel (58%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "58%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 64,
          paddingRight: 96,
        }}
      >
        {/* Category label */}
        {categoryLabel && (
          <div
            style={{
              ...reveal(frame, at + 8),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CP.terracotta,
              marginBottom: 16,
            }}
          >
            {categoryLabel}
          </div>
        )}

        {/* Headline */}
        {headline && (
          <div
            style={{
              ...reveal(frame, at + 10),
              fontFamily: condensed,
              fontSize: 72,
              color: CP.text,
              letterSpacing: "0.02em",
              lineHeight: 0.95,
              marginBottom: 28,
            }}
          >
            {headline}
          </div>
        )}

        {/* Red rule */}
        <div
          style={{
            width: `${ruleWidth}%`,
            maxWidth: 56,
            height: 3,
            backgroundColor: CP.mauve,
            marginBottom: 28,
            borderRadius: 1.5,
          }}
        />

        {/* Pull quote */}
        <div
          style={{
            ...reveal(frame, at + 16),
            fontFamily: serif,
            fontSize: 34,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.55,
            color: CP.text,
            maxWidth: 620,
          }}
        >
          "{renderQuote()}"
        </div>

        {/* Attribution */}
        <div
          style={{
            ...reveal(frame, at + 26),
            fontFamily: sans,
            fontSize: 20,
            color: CP.sub,
            marginTop: 24,
            letterSpacing: "0.04em",
          }}
        >
          {attribution}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            ...reveal(frame, at + 2),
            backgroundColor: CP.mauve,
            padding: "8px 16px",
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: CP.text,
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
  "compositionId": "imgcomp-evidence-card",
  "props": {
    "image": "demo.png",
    "quote": "The evidence never supported the original claim.",
    "attribution": "Economic Survey 2024-25",
    "categoryLabel": "THE RECEIPT",
    "headline": "A Record of the Shift",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 180
};
