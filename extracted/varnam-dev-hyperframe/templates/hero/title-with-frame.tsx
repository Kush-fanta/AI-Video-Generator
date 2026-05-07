import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface TitleWithFrameProps extends BaseProps {
  title: string;
  subtitle?: string;
  categoryLabel?: string;
  image: ImageRef;
  at?: number;
}

/**
 * Opening title card.
 * Large serif title LEFT (96px, bold), framed image RIGHT (bounded, rounded 16px, Ken Burns).
 * Optional category label top-left with terracotta underline.
 * One terracotta accent line below title.
 */
export const TitleWithFrame: React.FC<TitleWithFrameProps> = ({
  title,
  subtitle,
  categoryLabel,
  image,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = frame - at;

  const imgScale = kenBurns(Math.max(0, f), FPS * 6);
  const accentWidth = lineGrow(frame, at + 14, 30);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>

      {/* Left column — title block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "52%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 40,
        }}
      >
        <div style={reveal(frame, at + 5)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 128,
              fontWeight: 700,
              lineHeight: 0.96,
              color: P.text,
              letterSpacing: "-0.03em",
              maxWidth: 700,
            }}
          >
            {title}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 180,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 20,
              maxWidth: 540,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right column — framed image */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 60,
          bottom: 60,
          width: "44%",
          borderRadius: 16,
          overflow: "hidden",
          ...reveal(frame, at + 8),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-title-with-frame",
  "props": {
    "title": "India",
    "subtitle": "The Back Office",
    "categoryLabel": "THE OLD STORY",
    "image": "demo.png",
    "at": 15
  },
  "durationInFrames": 150
};
