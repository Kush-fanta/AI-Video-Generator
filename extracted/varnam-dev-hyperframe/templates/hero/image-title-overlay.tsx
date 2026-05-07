import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ImageTitleOverlayProps extends BaseProps {
  title: string;
  subtitle?: string;
  image: string;
  at?: number;
}

/**
 * Full-bleed bgless PNG with title text overlaid in a frosted/semi-transparent bar.
 * Image dominates — snaps in first (object priming), then text bar slides up.
 */
export const ImageTitleOverlay: React.FC<ImageTitleOverlayProps> = ({
  title,
  subtitle,
  image,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgOpacity = interpolate(frame, [at + 2, at + 8], [0, 1], C);
  const barY = interpolate(frame, [at + 10, at + 18], [40, 0], C);
  const barOpacity = interpolate(frame, [at + 10, at + 18], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Full-bleed image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: imgOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Frosted text bar — bottom third */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          opacity: barOpacity,
          transform: `translateY(${barY}px)`,
          padding: "48px 100px 64px",
          background: `linear-gradient(transparent, rgba(10,10,10,0.85) 30%)`,
        }}
      >
        {/* Title */}
        <div style={reveal(frame, at + 14)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1.05,
              color: P.bg,
              letterSpacing: "-0.02em",
              maxWidth: 800,
            }}
          >
            {title}
          </div>
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 18, 16)}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 18,
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.4,
              color: P.light,
              marginTop: 14,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-image-title-overlay",
  "props": {
    "title": "The New Headquarters",
    "subtitle": "How GCCs became the brain, not the hand",
    "image": "demo-cutout.png",
    "at": 15
  },
  "durationInFrames": 150
};
