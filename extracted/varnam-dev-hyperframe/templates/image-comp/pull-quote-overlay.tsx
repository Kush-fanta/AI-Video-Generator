import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { mergePalette } from "../shared/palette";
import { reveal, kenBurns, lineGrow, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();
const { fontFamily: serif } = loadSerif();

export interface PullQuoteOverlayProps extends BaseProps {
  /** Background image */
  image: ImageRef;
  /** The quote text */
  quote: string;
  /** Attribution line */
  attribution: string;
  /** Badge */
  badge?: string;
  /** Image dim level */
  imageDim?: number;
  /** Words to highlight in gold */
  accentWords?: string[];
  at?: number;
}

/**
 * PullQuoteOverlay — Large serif quote centered over darkened full-bleed image.
 *
 * Mode 2 editorial. Gold quotation mark. Serif italic quote.
 * Red rule above attribution. Heavy spring entrance.
 * For sourced statements, expert opinions, key findings.
 *
 * Different from VerdictOverlay: this is for SOMEONE ELSE's words (quoted),
 * VerdictOverlay is for the channel's own verdict.
 */
export const PullQuoteOverlay: React.FC<PullQuoteOverlayProps> = ({
  image,
  quote,
  attribution,
  badge,
  imageDim = 0.2,
  accentWords = [],
  palette: paletteOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const CP = mergePalette(paletteOverride);

  const imgScale = kenBurns(f, FPS * 7);
  const ruleWidth = lineGrow(frame, at + 22, 22);

  const quoteEntrance = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 24, stiffness: 45, mass: 1.8 },
  });

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
    <AbsoluteFill style={{ backgroundColor: CP.dark }}>
      {/* Image backing */}
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${imgScale})`,
          opacity: imageDim,
          position: "absolute",
        }}
      />

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
          alignItems: "center",
          justifyContent: "center",
          padding: "54px 160px",
        }}
      >
        {/* Gold quotation mark */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 160,
            color: CP.terracotta,
            lineHeight: 0.6,
            opacity: quoteEntrance * 0.4,
            marginBottom: -20,
          }}
        >
          "
        </div>

        {/* Quote */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 42,
            fontStyle: "italic",
            lineHeight: 1.55,
            color: CP.text,
            textAlign: "center",
            maxWidth: 1100,
            opacity: quoteEntrance,
            transform: `translateY(${(1 - quoteEntrance) * 30}px)`,
          }}
        >
          {renderQuote()}
        </div>

        {/* Red rule */}
        <div
          style={{
            width: `${ruleWidth}%`,
            maxWidth: 56,
            height: 3,
            backgroundColor: CP.mauve,
            marginTop: 32,
            borderRadius: 1.5,
          }}
        />

        {/* Attribution */}
        <div
          style={{
            ...reveal(frame, at + 28),
            fontFamily: sans,
            fontSize: 22,
            color: CP.sub,
            marginTop: 20,
            letterSpacing: "0.06em",
            textAlign: "center",
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
  "compositionId": "imgcomp-pull-quote-overlay",
  "props": {
    "image": "demo.png",
    "quote": "The same India that once answered the phone is now designing the system.",
    "attribution": "Economic Survey 2024-25",
    "badge": "#SWARAJYA",
    "at": 15
  },
  "durationInFrames": 180
};
