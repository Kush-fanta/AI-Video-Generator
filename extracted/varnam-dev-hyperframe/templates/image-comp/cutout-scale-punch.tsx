import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutScalePunchProps extends BaseProps {
  /** Transparent PNG that punches to fill frame */
  bglessImageSrc: ImageRef;
  headline: string;
  label?: string;
  at?: number;
}

/**
 * Tiny image center-screen, then PUNCHES to fill 80% of frame in 4 frames.
 * Maximum kinetic impact. Text snaps in after.
 */
export const CutoutScalePunch: React.FC<CutoutScalePunchProps> = ({
  bglessImageSrc,
  headline,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Tiny → massive in 4 frames. Hard snap, no easing.
  const scale = interpolate(frame, [at, at + 4], [0.15, 1.0], C);
  const imgOpacity = interpolate(frame, [at, at + 2], [0, 1], C);

  // Text snaps in 10 frames after punch
  const textAt = at + 14;
  const textOpacity = interpolate(frame, [textAt, textAt + 3], [0, 1], C);
  const textY = interpolate(frame, [textAt, textAt + 3], [16, 0], C);

  const accentWidth = lineGrow(frame, textAt + 6, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Image — punches from tiny to 80% */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "55%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          width: "75%",
          height: "85%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: imgOpacity,
          zIndex: 1,
        }}
      >
        <Img
          src={bglessImageSrc}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Text — snaps in bottom-left after punch */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          zIndex: 2,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            lineHeight: 1.08,
            color: P.text,
            letterSpacing: "-0.02em",
            maxWidth: 600,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 2,
          }}
        />

        {label && (
          <div
            style={{
              ...reveal(frame, textAt + 10),
              fontFamily: sans,
              fontSize: 24,
              color: P.sub,
              marginTop: 16,
              maxWidth: 500,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-scale-punch",
  "props": {
    "bglessImageSrc": "demo.png",
    "headline": "Maximum Impact",
    "label": "Tiny to massive in 4 frames",
    "at": 15
  },
  "durationInFrames": 180
};
