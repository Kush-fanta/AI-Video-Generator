import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  interpolate,
  registerRoot,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadPT } from "@remotion/google-fonts/PTSerif";

// --- Swarajya tokens ---
const BG    = "#F2EDE7";
const CORAL = "#DC7070";
const INK   = "#202020";
const FPS   = 30;
const W     = 1920;
const H     = 1080;

// --- Fonts ---
const { fontFamily: PT } = loadPT("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

// --- Animation helpers ---
const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const fadeIn = (frame: number, at: number, dur = 16) =>
  interpolate(frame, [at, at + dur], [0, 1], C);
const reveal = (frame: number, at: number, dur = 16) => ({
  opacity: interpolate(frame, [at, at + dur], [0, 1], C),
  transform: `translateY(${interpolate(frame, [at, at + dur], [12, 0], { ...C, easing: ease })}px)`,
});
const scaleX = (frame: number, at: number, dur = 14) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...C, easing: ease });
const scaleY = (frame: number, at: number, dur = 20) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...C, easing: ease });

// --- Props ---
interface ImageVerdictProps {
  photoSrc: string;
  eyebrow: string;
  verdictQuestion: string;
  dampingClause: string;
  followLine?: string;
  at?: number;
}

// --- Component ---
const ImageVerdict: React.FC<ImageVerdictProps> = ({
  photoSrc,
  eyebrow,
  verdictQuestion,
  dampingClause,
  followLine,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Seam bar: scaleY 0→1 from top, frame 2, duration 24
  const seamScale = scaleY(frame, 2, 24);

  // Image opacity 0→0.92, frame 4, duration 20
  const imgOpacity = interpolate(frame, [4, 4 + 20], [0, 0.92], C);

  // Short ink rule: scaleX, frame 12, default dur 14
  const inkRuleScale = scaleX(frame, 12);

  // DC7070 rule: scaleX, frame 30, duration 12
  const coralRuleScale = scaleX(frame, 30, 12);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Image zone — right 65%: left 672, top 0, width 1248, height 1080 */}
      <Img
        src={photoSrc}
        style={{
          position: "absolute",
          left: 672,
          top: 0,
          width: 1248,
          height: 1080,
          objectFit: "cover",
          display: "block",
          opacity: imgOpacity,
        }}
      />

      {/* DC7070 seam bar: left 668, top 0, width 4, height 1080 */}
      <div
        style={{
          position: "absolute",
          left: 668,
          top: 0,
          width: 4,
          height: 1080,
          background: CORAL,
          transformOrigin: "top center",
          transform: `scaleY(${seamScale})`,
        }}
      />

      {/* Eyebrow: left 64, top 178, PT Serif Regular 34px */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 178,
          fontFamily: PT,
          fontWeight: 400,
          fontSize: 34,
          color: INK,
          letterSpacing: 8,
          textTransform: "uppercase",
          opacity: 0.45 * fadeIn(frame, 10),
        }}
      >
        {eyebrow}
      </div>

      {/* Short ink rule: left 64, top 240, width 48, height 1 */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 240,
          width: 48,
          height: 1,
          background: INK,
          opacity: 0.18 * inkRuleScale,
          transformOrigin: "left center",
          transform: `scaleX(${inkRuleScale})`,
        }}
      />

      {/* Verdict question: left 64, top 262, PT Serif Bold Italic 54px */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 262,
          fontFamily: PT,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: 54,
          color: INK,
          lineHeight: 1.22,
          width: 528,
          ...reveal(frame, 16),
        }}
      >
        {verdictQuestion}
      </div>

      {/* DC7070 rule: left 64, top 570, width 56, height 2 */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 570,
          width: 56,
          height: 2,
          background: CORAL,
          transformOrigin: "left center",
          transform: `scaleX(${coralRuleScale})`,
        }}
      />

      {/* Damning clause: left 64, top 596, PT Serif Bold 58px, CORAL */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 596,
          fontFamily: PT,
          fontWeight: 700,
          fontSize: 58,
          color: CORAL,
          lineHeight: 1.18,
          width: 528,
          ...reveal(frame, 32),
        }}
      >
        {dampingClause}
      </div>

      {/* Follow line: left 64, top 756, PT Serif Regular 32px */}
      {followLine !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 756,
            fontFamily: PT,
            fontWeight: 400,
            fontSize: 32,
            color: INK,
            lineHeight: 1.4,
            width: 528,
            opacity: 0.68 * fadeIn(frame, 42),
          }}
        >
          {followLine}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// --- Demo ---
export const demo = {
  compositionId: "swarajya-image-verdict",
  props: {
    photoSrc: staticFile("missile.png"),
    eyebrow: "OPERATION SINDOOR",
    verdictQuestion: "India intercepted every missile. But did it win the narrative?",
    dampingClause: "Pakistan was 15 minutes ahead.",
    followLine: "Before India's first official statement was issued.",
    at: 0,
  },
  durationInFrames: 180,
};

// --- Root ---
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={ImageVerdict as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  );
};

registerRoot(RemotionRoot);

export default ImageVerdict;
