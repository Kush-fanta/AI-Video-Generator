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
interface DiptychV2Props {
  leftPhotoSrc: string;
  rightPhotoSrc: string;
  headlinePre: string;
  headlineKicker: string;
  leftLabel: string;
  leftSublabel: string;
  rightLabel: string;
  rightSublabel: string;
  at?: number;
}

// --- Component ---
const DiptychV2: React.FC<DiptychV2Props> = ({
  leftPhotoSrc,
  rightPhotoSrc,
  headlinePre,
  headlineKicker,
  leftLabel,
  leftSublabel,
  rightLabel,
  rightSublabel,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Thin rule below band: scaleX, starts frame 2
  const ruleScale = scaleX(frame, 2);

  // DC7070 center divider: scaleY from top, starts frame 4, duration 22
  const dividerScale = scaleY(frame, 4, 22);

  // Headline reveal: starts frame 4
  const headlineReveal = reveal(frame, 4);

  // Left image opacity 0→0.88, frame 8, duration 18
  const leftImgOpacity = interpolate(frame, [8, 8 + 18], [0, 0.88], C);

  // Right image opacity 0→0.88, frame 10, duration 18
  const rightImgOpacity = interpolate(frame, [10, 10 + 18], [0, 0.88], C);

  // Labels: fadeIn starting frame 20
  const labelOpacity = fadeIn(frame, 20);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Left image: x 0–948, y 180–1080 full bleed */}
      <Img
        src={leftPhotoSrc}
        style={{
          position: "absolute",
          left: 0,
          top: 180,
          width: 948,
          height: 900,
          objectFit: "cover",
          display: "block",
          opacity: leftImgOpacity,
        }}
      />

      {/* Right image: x 960–1920, y 180–1080 full bleed */}
      <Img
        src={rightPhotoSrc}
        style={{
          position: "absolute",
          left: 960,
          top: 180,
          width: 960,
          height: 900,
          objectFit: "cover",
          display: "block",
          opacity: rightImgOpacity,
        }}
      />

      {/* Cream headline band: y 0–180 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 180,
          background: BG,
        }}
      />

      {/* Thin rule below band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 178,
          width: 1920,
          height: 1,
          background: INK,
          opacity: 0.1,
          transformOrigin: "left center",
          transform: `scaleX(${ruleScale})`,
        }}
      />

      {/* Headline: left 120, top 52, PT Serif Bold 68px — fits one line */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 52,
          fontFamily: PT,
          fontWeight: 700,
          fontSize: 68,
          color: INK,
          lineHeight: 1,
          whiteSpace: "nowrap",
          ...headlineReveal,
        }}
      >
        {headlinePre}{" "}
        <span style={{ color: CORAL }}>{headlineKicker}</span>
      </div>

      {/* DC7070 center divider: top 180, height 900 full bleed */}
      <div
        style={{
          position: "absolute",
          left: 956,
          top: 180,
          width: 3,
          height: 900,
          background: CORAL,
          transformOrigin: "top center",
          transform: `scaleY(${dividerScale})`,
        }}
      />

      {/* Left label bg strip: top 836, height 46 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 836,
          width: 948,
          height: 46,
          background: BG,
          opacity: 0.88,
        }}
      />

      {/* Right label bg strip */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 836,
          width: 960,
          height: 46,
          background: BG,
          opacity: 0.88,
        }}
      />

      {/* Left label */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 845,
          fontFamily: PT,
          fontWeight: 700,
          fontSize: 34,
          color: CORAL,
          opacity: labelOpacity,
          whiteSpace: "nowrap",
        }}
      >
        {leftLabel}
        <span style={{ fontWeight: 400, fontSize: 30, color: INK, opacity: 0.65 }}>
          {" — " + leftSublabel}
        </span>
      </div>

      {/* Right label */}
      <div
        style={{
          position: "absolute",
          left: 988,
          top: 845,
          fontFamily: PT,
          fontWeight: 700,
          fontSize: 34,
          color: CORAL,
          opacity: labelOpacity,
          whiteSpace: "nowrap",
        }}
      >
        {rightLabel}
        <span style={{ fontWeight: 400, fontSize: 30, color: INK, opacity: 0.65 }}>
          {" — " + rightSublabel}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// --- Demo ---
export const demo = {
  compositionId: "swarajya-diptych-v2",
  props: {
    leftPhotoSrc: staticFile("pilot.png"),
    rightPhotoSrc: staticFile("missile.png"),
    headlinePre: "Same budget. Completely different",
    headlineKicker: "outcomes.",
    leftLabel: "TEJAS MK1A",
    leftSublabel: "83 ordered · 0 squadrons",
    rightLabel: "BrahMos-NG",
    rightSublabel: "Inducted · 3 regiments active",
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
      component={DiptychV2 as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  );
};

registerRoot(RemotionRoot);

export default DiptychV2;
