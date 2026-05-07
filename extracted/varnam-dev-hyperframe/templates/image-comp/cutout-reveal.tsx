import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CutoutRevealProps extends BaseProps {
  image: ImageRef;
  headline: string;
  body?: string;
  source?: string;
  /** Frame when the mask wipe reveals the image */
  revealAt?: number;
  at?: number;
}

/**
 * Dramatic reveal: text fills the frame first, then a mask wipe unveils
 * a large bgless PNG behind/beside it. The image was always there —
 * the reveal says "now look at this."
 */
export const CutoutReveal: React.FC<CutoutRevealProps> = ({
  image,
  headline,
  body,
  source,
  revealAt = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maskProgress = interpolate(
    frame,
    [at + revealAt, at + revealAt + 22],
    [0, 100],
    { ...C, easing: ease },
  );

  const imgScale = frame >= at + revealAt
    ? spring({
        frame: Math.max(0, frame - at - revealAt),
        fps,
        config: { damping: 18, stiffness: 60, mass: 0.8 },
        from: 1.08,
        to: 1.0,
      })
    : 1.08;

  // Text dims when image reveals
  const textDim = frame >= at + revealAt
    ? interpolate(frame, [at + revealAt, at + revealAt + 12], [1, 0.6], C)
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Text block — left, vertically centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          zIndex: 3,
          opacity: textDim,
        }}
      >
        <div style={reveal(frame, at + 4)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1.06,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 560,
            }}
          >
            {headline}
          </div>
        </div>

        <div
          style={{
            width: `${lineGrow(frame, at + 12, 20)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 1.5,
          }}
        />

        {body && (
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 22,
              maxWidth: 440,
            }}
          >
            {body}
          </div>
        )}
      </div>

      {/* Image — right side, revealed by clip mask */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: 40,
          width: "48%",
          height: "84%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          clipPath: `inset(0 ${100 - maskProgress}% 0 0)`,
          zIndex: 2,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            objectFit: "contain",
            transform: `scale(${imgScale})`,
          }}
        />
      </div>

      {/* Vertical accent — appears at reveal */}
      {frame >= at + revealAt && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            width: 2,
            height: `${lineGrow(frame, at + revealAt + 4, 18) * 0.6}%`,
            maxHeight: "70%",
            backgroundColor: P.terracotta,
            opacity: 0.4,
          }}
        />
      )}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            ...reveal(frame, at + revealAt + 16),
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: P.muted,
            textTransform: "uppercase",
            zIndex: 3,
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-reveal",
  "props": {
    "image": "demo.png",
    "headline": "The architect behind the system",
    "body": "From policy to protocol — one infrastructure, a billion users.",
    "revealAt": 40,
    "at": 15
  },
  "durationInFrames": 180
};
