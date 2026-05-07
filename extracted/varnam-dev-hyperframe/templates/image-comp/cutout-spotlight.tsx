import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutSpotlightProps extends BaseProps {
  /** Large transparent PNG to selectively reveal */
  bglessImageSrc: ImageRef;
  headline?: string;
  label?: string;
  at?: number;
}

/**
 * Dark background, circular spotlight (radial gradient mask) that tracks
 * and reveals portions of a large cutout. Dramatic selective reveal.
 */
export const CutoutSpotlight: React.FC<CutoutSpotlightProps> = ({
  bglessImageSrc,
  headline,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Spotlight position drifts across the image
  const spotX = interpolate(frame, [at, at + 60, at + 120], [35, 55, 50], C);
  const spotY = interpolate(frame, [at, at + 60, at + 120], [55, 40, 50], C);
  // Spotlight radius grows
  const spotRadius = interpolate(frame, [at, at + 10, at + 90], [0, 22, 35], C);

  const fadeIn = interpolate(frame, [at, at + 6], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Image with radial mask */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: fadeIn,
          WebkitMaskImage: `radial-gradient(circle at ${spotX}% ${spotY}%, black ${spotRadius}%, transparent ${spotRadius + 8}%)`,
          maskImage: `radial-gradient(circle at ${spotX}% ${spotY}%, black ${spotRadius}%, transparent ${spotRadius + 8}%)`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={bglessImageSrc}
            style={{
              maxWidth: "80%",
              maxHeight: "85%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Subtle glow ring around spotlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at ${spotX}% ${spotY}%, rgba(193,122,72,0.08) ${spotRadius - 2}%, transparent ${spotRadius + 12}%)`,
          zIndex: 0,
        }}
      />

      {/* Text — bottom */}
      {headline && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            zIndex: 2,
            ...reveal(frame, at + 20),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 52,
              color: P.bg,
              lineHeight: 1.1,
              maxWidth: 600,
            }}
          >
            {headline}
          </div>
          {label && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 22,
                color: P.light,
                marginTop: 14,
              }}
            >
              {label}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-spotlight",
  "props": {
    "bglessImageSrc": "demo.png",
    "headline": "Selective reveal",
    "label": "Only what matters",
    "at": 15
  },
  "durationInFrames": 180
};
