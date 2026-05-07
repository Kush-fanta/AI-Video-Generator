import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CutoutSilhouetteProps extends BaseProps {
  image: ImageRef;
  quote: string;
  attribution?: string;
  at?: number;
}

/**
 * Large bgless PNG rendered as a darkened silhouette (filter: brightness(0) opacity(0.08))
 * filling the background. A quote or statement overlays it in large serif.
 * The person/object IS the texture, not the subject — the words are the subject.
 */
export const CutoutSilhouette: React.FC<CutoutSilhouetteProps> = ({
  image,
  quote,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgScale = kenBurns(Math.max(0, frame - at), FPS * 6, 1.0, 1.06);
  const silhouetteOpacity = interpolate(frame, [at, at + 30], [0, 0.07], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Silhouette — large, centered, very faint */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "15%",
          width: "70%",
          height: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: silhouetteOpacity,
          pointerEvents: "none",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            filter: "brightness(0)",
            transform: `scale(${imgScale})`,
          }}
        />
      </div>

      {/* Quote — centered, large serif */}
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
          padding: "0 160px",
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 10)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1.2,
              color: P.text,
              textAlign: "center",
              maxWidth: 1100,
              fontStyle: "italic",
            }}
          >
            &ldquo;{quote}&rdquo;
          </div>
        </div>

        <div
          style={{
            width: `${lineGrow(frame, at + 22, 20)}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 36,
            borderRadius: 1.5,
          }}
        />

        {attribution && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 22,
              color: P.sub,
              marginTop: 20,
              letterSpacing: "0.04em",
            }}
          >
            {attribution}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-silhouette",
  "props": {
    "image": "demo.png",
    "quote": "When the infrastructure is free, everyone builds on it.",
    "attribution": "India Stack, 2024",
    "at": 15
  },
  "durationInFrames": 150
};
