import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();

export interface TopicHeroProps extends BaseProps {
  title: string;
  image: ImageRef;
  categoryLabel?: string;
  at?: number;
}

/**
 * Topic introduction with image backdrop.
 * Framed image FULL WIDTH at bottom 55% (rounded top corners, Ken Burns, 0.85 opacity).
 * Title in 108px serif positioned left over cream. One terracotta accent line below title.
 */
export const TopicHero: React.FC<TopicHeroProps> = ({
  title,
  image,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgScale = kenBurns(Math.max(0, frame - at), FPS * 6);
  const accentWidth = lineGrow(frame, at + 10, 28);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Bottom half — image with rounded top corners */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "55%",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
          ...reveal(frame, at + 4),
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

      {/* Top section — title over cream */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "72%",
          height: "48%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 40,
          zIndex: 2,
        }}
      >
        {/* Title */}
        <div
          style={{
            ...reveal(frame, at + 6),
            fontFamily: serif,
            fontSize: 108,
            lineHeight: 1.0,
            color: P.text,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 160,
            height: 4,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-topic-hero",
  "props": {
    "title": "Innovation Node",
    "image": "demo.png",
    "categoryLabel": "THE DIRECTION",
    "at": 15
  },
  "durationInFrames": 150
};
