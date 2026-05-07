import { AbsoluteFill, useCurrentFrame, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CutoutHeroProps extends BaseProps {
  /**
   * Pre-processed transparent PNG cutout — generate with `scripts/bgless.py`
   * or the nano-banana-bgless pipeline. Pass `staticFile(...)` or a URL.
   * Expects a transparent PNG cutout — generate with `scripts/bgless.py` or the nano-banana-bgless pipeline.
   */
  bglessImageSrc: ImageRef;
  headline: string;
  label?: string;
  at?: number;
}

/**
 * Large transparent PNG cutout (550px+) dominates center-right.
 * Expects a transparent PNG cutout — generate with `scripts/bgless.py` or the nano-banana-bgless pipeline.
 * Text positioned left: headline 80px serif, accent line, label 28px sans.
 * The cutout IS the visual hero — bold, large, unapologetic.
 */
export const CutoutHero: React.FC<CutoutHeroProps> = ({
  bglessImageSrc,
  headline,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const accentWidth = lineGrow(frame, at + 12, 26);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left — text block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "48%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 4)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.06,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 660,
            }}
          >
            {headline}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 160,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {label && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 28,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 22,
              maxWidth: 500,
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Right — cutout hero image (550px+) */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 0,
          width: 620,
          height: "92%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 1,
          ...reveal(frame, at + 6),
        }}
      >
        <Img
          src={bglessImageSrc}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            minWidth: 550,
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Decorative terracotta dot — bottom left anchor */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          ...reveal(frame, at + 26),
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-hero",
  "props": {
    "bglessImageSrc": "demo.png",
    "headline": "Brain Centre",
    "label": "India's new role in the global economy",
    "at": 15
  },
  "durationInFrames": 150
};
