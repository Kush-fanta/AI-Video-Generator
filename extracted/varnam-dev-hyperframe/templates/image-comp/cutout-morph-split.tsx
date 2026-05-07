import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutMorphSplitProps extends BaseProps {
  /** First image — starts full bleed */
  imageA: ImageRef;
  /** Second image — revealed on split */
  imageB: ImageRef;
  headline?: string;
  label?: string;
  /** Frame at which split begins */
  splitAt?: number;
  at?: number;
}

/**
 * Frame starts as one image full-bleed, then splits down center revealing
 * second image on opposite side + text in the gap between.
 */
export const CutoutMorphSplit: React.FC<CutoutMorphSplitProps> = ({
  imageA,
  imageB,
  headline,
  label,
  splitAt = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [at, at + 6], [0, 1], C);

  // Split: each half pulls away from center, gap widens
  const gapPx = interpolate(frame, [splitAt, splitAt + 12], [0, 160], C);
  const halfGap = gapPx / 2;

  // Image B fades in behind the gap
  const bOpacity = interpolate(frame, [splitAt + 4, splitAt + 12], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, opacity: enterOpacity }}>
      {/* Image A — left half, clips to left of center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `calc(50% - ${halfGap}px)`,
          height: "100%",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <Img
          src={imageA}
          style={{
            width: "100vw",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left center",
          }}
        />
      </div>

      {/* Image A — right half (before split) / Image B — right half (after split) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `calc(50% - ${halfGap}px)`,
          height: "100%",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <Img
          src={frame >= splitAt ? imageB : imageA}
          style={{
            width: "100vw",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            opacity: frame >= splitAt ? bOpacity : 1,
          }}
        />
      </div>

      {/* Center gap — text appears here */}
      {gapPx > 10 && headline && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: gapPx,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              ...reveal(frame, splitAt + 8),
              fontFamily: serif,
              fontSize: 28,
              color: P.text,
              textAlign: "center",
              writingMode: "vertical-rl" as const,
              letterSpacing: "0.04em",
            }}
          >
            {headline}
          </div>
          {label && (
            <div
              style={{
                ...reveal(frame, splitAt + 16),
                fontFamily: sans,
                fontSize: 14,
                color: P.muted,
                textAlign: "center",
                writingMode: "vertical-rl" as const,
                marginTop: 12,
              }}
            >
              {label}
            </div>
          )}
        </div>
      )}

      {/* Terracotta accent lines at split edges */}
      {gapPx > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(50% - ${halfGap}px)`,
              width: 2,
              height: "100%",
              backgroundColor: P.terracotta,
              zIndex: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: `calc(50% - ${halfGap}px)`,
              width: 2,
              height: "100%",
              backgroundColor: P.terracotta,
              zIndex: 4,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-morph-split",
  "props": {
    "imageA": "demo.png",
    "imageB": "demo.png",
    "headline": "Before → After",
    "label": "The split reveals",
    "splitAt": 40,
    "at": 15
  },
  "durationInFrames": 180
};
