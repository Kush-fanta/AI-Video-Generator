import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutObjectPrimeProps extends BaseProps {
  /** Transparent PNG of the object (book, artifact, weapon, tool) */
  bglessImageSrc: ImageRef;
  /** Text that the object earns — quote or description */
  text: string;
  attribution?: string;
  at?: number;
}

/**
 * Object priming: physical object fills frame FIRST, holds for 40 frames,
 * then text wipes in beside it. The object earns the text.
 */
export const CutoutObjectPrime: React.FC<CutoutObjectPrimeProps> = ({
  bglessImageSrc,
  text,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Object appears immediately with subtle scale
  const objScale = interpolate(frame, [at, at + 6], [1.05, 1.0], C);
  const objOpacity = interpolate(frame, [at, at + 4], [0, 1], C);

  // Object starts centered, then shifts left after hold
  const holdEnd = at + 40;
  const objX = interpolate(frame, [holdEnd, holdEnd + 10], [0, -22], C);

  // Text wipes in from right after hold
  const textX = interpolate(frame, [holdEnd, holdEnd + 8], [60, 0], C);
  const textOpacity = interpolate(frame, [holdEnd, holdEnd + 6], [0, 1], C);

  const accentWidth = lineGrow(frame, holdEnd + 12, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Object — starts centered, shifts left */}
      <div
        style={{
          position: "absolute",
          left: `${50 + objX}%`,
          top: "50%",
          transform: `translate(-50%, -50%) scale(${objScale})`,
          opacity: objOpacity,
          width: 520,
          height: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

      {/* Text — wipes in from right after hold */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 0,
          width: "42%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 2,
          opacity: textOpacity,
          transform: `translateX(${textX}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 42,
            lineHeight: 1.35,
            color: P.text,
            fontStyle: "italic",
            maxWidth: 480,
          }}
        >
          "{text}"
        </div>

        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {attribution && (
          <div
            style={{
              ...reveal(frame, holdEnd + 18),
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              marginTop: 16,
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
  "compositionId": "imgcomp-cutout-object-prime",
  "props": {
    "bglessImageSrc": "demo.png",
    "text": "The object speaks before the words arrive.",
    "attribution": "Design Principle",
    "at": 15
  },
  "durationInFrames": 180
};
