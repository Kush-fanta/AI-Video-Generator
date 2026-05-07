import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutSlamProps extends BaseProps {
  /** Transparent PNG cutout that slams into frame */
  bglessImageSrc: ImageRef;
  headline: string;
  label?: string;
  at?: number;
}

/**
 * Image SLAMS into frame — scale 1.3→1.0 over 3 frames with hard opacity snap.
 * Text arrives after with snap, not spring. Maximum hard-cut energy.
 */
export const CutoutSlam: React.FC<CutoutSlamProps> = ({
  bglessImageSrc,
  headline,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // 3-frame slam: scale 1.3→1.0, opacity 0→1
  const slamScale = interpolate(frame, [at, at + 3], [1.3, 1.0], C);
  const slamOpacity = interpolate(frame, [at, at + 3], [0, 1], C);

  // Text snaps in 12 frames after image lands
  const textOpacity = interpolate(frame, [at + 15, at + 17], [0, 1], C);
  const textY = interpolate(frame, [at + 15, at + 17], [20, 0], C);

  const accentWidth = lineGrow(frame, at + 20, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Image — center, slams in */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 0,
          width: 640,
          height: "94%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 1,
          opacity: slamOpacity,
          transform: `scale(${slamScale})`,
        }}
      >
        <Img
          src={bglessImageSrc}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            minWidth: 500,
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Text — left, snaps in after slam */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "46%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          zIndex: 2,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 76,
            lineHeight: 1.06,
            color: P.text,
            letterSpacing: "-0.02em",
            maxWidth: 620,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 140,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {label && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 26,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 20,
              maxWidth: 480,
              ...reveal(frame, at + 22),
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
  "compositionId": "imgcomp-cutout-slam",
  "props": {
    "bglessImageSrc": "demo.png",
    "headline": "Hard Impact",
    "label": "No easing, no mercy",
    "at": 15
  },
  "durationInFrames": 180
};
