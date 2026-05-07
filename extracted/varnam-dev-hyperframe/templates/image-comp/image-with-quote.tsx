import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ImageWithQuoteProps extends BaseProps {
  image: ImageRef;
  quote: string;
  attribution?: string;
  source?: string;
  at?: number;
}

/**
 * FRAMED image LEFT (500x350, rounded 16px, Ken Burns).
 * RIGHT: blockquote layout — 3px terracotta left border, quote in 38px serif italic,
 * attribution below in 20px sans muted. Source pill above quote.
 */
export const ImageWithQuote: React.FC<ImageWithQuoteProps> = ({
  image,
  quote,
  attribution,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const imgScale = kenBurns(f, FPS * 6);
  const borderHeight = lineGrow(frame, at + 10, 28);

  const imgW = 500;
  const imgH = 350;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left — framed image */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 80,
          width: imgW,
          height: imgH,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          backgroundColor: P.light,
          ...(() => { const r = reveal(frame, at + 4); return { ...r, transform: `translateY(-50%) ${r.transform}` }; })(),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            opacity: 0.85,
          }}
        />
      </div>

      {/* Right — quote block */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 640,
          right: 80,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Source pill */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 6),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.terracotta,
              backgroundColor: `${P.terracotta}14`,
              padding: "6px 14px",
              borderRadius: 20,
              alignSelf: "flex-start",
              marginBottom: 20,
            }}
          >
            {source}
          </div>
        )}

        {/* Quote with terracotta left border */}
        <div
          style={{
            position: "relative",
            paddingLeft: 28,
          }}
        >
          {/* Animated terracotta border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 3,
              height: `${borderHeight}%`,
              maxHeight: "100%",
              backgroundColor: P.terracotta,
              borderRadius: 2,
            }}
          />

          <div style={reveal(frame, at + 10)}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 64,
                lineHeight: 1.3,
                color: P.text,
                fontStyle: "italic",
                maxWidth: 680,
              }}
            >
              {"\u201C"}{quote}{"\u201D"}
            </div>
          </div>

          {/* Attribution */}
          {attribution && (
            <div
              style={{
                ...reveal(frame, at + 22),
                fontFamily: sans,
                fontSize: 20,
                color: P.muted,
                marginTop: 20,
              }}
            >
              {"\u2014"} {attribution}
            </div>
          )}
        </div>
      </div>

      {/* Decorative terracotta dot — bottom-right anchor */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          right: 80,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          ...reveal(frame, at + 28),
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-image-with-quote",
  "props": {
    "image": "demo.png",
    "quote": "The same India that once answered the phone is now designing the system.",
    "attribution": "Economic Survey 2024-25",
    "source": "Economic Survey 2024-25",
    "at": 15
  },
  "durationInFrames": 150
};
