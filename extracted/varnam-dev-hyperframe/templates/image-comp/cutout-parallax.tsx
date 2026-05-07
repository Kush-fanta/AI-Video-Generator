import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutParallaxProps extends BaseProps {
  /** Background layer PNG (moves slower) */
  bgLayer: ImageRef;
  /** Foreground layer PNG (moves faster) */
  fgLayer: ImageRef;
  headline?: string;
  label?: string;
  at?: number;
}

/**
 * 2 PNG layers at different depths — foreground moves faster than background
 * on frame scroll, creating physical depth. Parallax without 3D.
 */
export const CutoutParallax: React.FC<CutoutParallaxProps> = ({
  bgLayer,
  fgLayer,
  headline,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [at, at + 8], [0, 1], C);

  // Background: slow drift
  const bgX = interpolate(frame, [at, at + 150], [0, -30], C);
  // Foreground: faster drift (2x)
  const fgX = interpolate(frame, [at, at + 150], [0, -60], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark, opacity: fadeIn }}>
      {/* Background layer — slow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "120%",
          height: "100%",
          transform: `translateX(${bgX}px)`,
          zIndex: 1,
          opacity: 0.6,
        }}
      >
        <Img
          src={bgLayer}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Foreground layer — fast */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 60,
          width: 600,
          height: "85%",
          transform: `translateX(${fgX}px)`,
          zIndex: 2,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <Img
          src={fgLayer}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            objectPosition: "bottom left",
          }}
        />
      </div>

      {/* Optional text overlay */}
      {headline && (
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 100,
            zIndex: 3,
            ...reveal(frame, at + 15),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              color: P.bg,
              lineHeight: 1.1,
              maxWidth: 500,
              textAlign: "right",
            }}
          >
            {headline}
          </div>
          {label && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 24,
                color: P.light,
                marginTop: 16,
                textAlign: "right",
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
  "compositionId": "imgcomp-cutout-parallax",
  "props": {
    "bgLayer": "demo.png",
    "fgLayer": "demo.png",
    "headline": "Depth Without 3D",
    "label": "Two layers, one illusion",
    "at": 15
  },
  "durationInFrames": 180
};
