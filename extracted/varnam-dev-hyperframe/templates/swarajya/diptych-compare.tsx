/**
 * diptych-compare.tsx — Swarajya two-photo comparison template.
 *
 * Editorial job: Two photos side by side, each filling their half.
 * A thin DC7070 vertical rule at center. A top headline bar and a bottom label
 * banner float over the images on a cream band.
 *
 * Layout:
 *   Left photo:   x 0–940, y 0–1080, full bleed
 *   Right photo:  x 980–1920, y 0–1080, full bleed
 *   DC7070 rule:  x=960, full height, scaleY 0→1
 *   Top bar:      y 0–160, cream 0.92 opacity — headline
 *   Bottom bar:   y 780–900, cream 0.92 opacity — labels
 *   RESERVED:     y 900–1080
 *
 * Render:
 *   npx remotion still templates/swarajya/diptych-compare.tsx swarajya-diptych-compare out/diptych-compare.png
 */
import React from "react";
import {
  AbsoluteFill,
  Composition,
  registerRoot,
  useCurrentFrame,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";

const { fontFamily: PT } = loadPTSerif();

// ─── Swarajya design tokens (inline — do not import from shared) ───
const BG    = "#F2EDE7";
const CORAL = "#DC7070";
const INK   = "#202020";

const W   = 1920;
const H   = 1080;
const FPS = 30;

// ─── Animation helpers ───
const C = {
  extrapolateLeft:  "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const reveal = (frame: number, at: number, dur = 18) => ({
  opacity:   interpolate(frame, [at, at + dur], [0, 1], C),
  transform: `translateY(${interpolate(
    frame,
    [at, at + dur],
    [14, 0],
    { ...C, easing: ease }
  )}px)`,
});

// ─── DiptychCompare ───

interface DiptychCompareProps {
  leftPhotoSrc:    string;
  rightPhotoSrc:   string;
  leftLabel:       string;
  leftSublabel:    string;
  rightLabel:      string;
  rightSublabel:   string;
  headlinePre:     string;   // text before kicker
  headlineKicker:  string;   // the DC7070 kicker word/phrase
  at?:             number;
}

const DiptychCompare: React.FC<DiptychCompareProps> = ({
  leftPhotoSrc,
  rightPhotoSrc,
  leftLabel,
  leftSublabel,
  rightLabel,
  rightSublabel,
  headlinePre,
  headlineKicker,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Top and bottom cream bars: fade in at frame 2
  const barOpacity = interpolate(frame, [2, 2 + 14], [0, 1], C);

  // DC7070 center rule: scaleY 0→1 at frame 4
  const ruleScaleY = interpolate(frame, [4, 4 + 20], [0, 1], C);

  // Left photo: opacity 0→0.8 at frame 6
  const leftPhotoOpacity = interpolate(frame, [6, 6 + 18], [0, 0.8], C);

  // Right photo: opacity 0→0.8 at frame 8 (staggered)
  const rightPhotoOpacity = interpolate(frame, [8, 8 + 18], [0, 0.8], C);

  // Left label: reveal at frame 14
  const leftLabelStyle = reveal(frame, 14);

  // Right label: reveal at frame 16 (staggered)
  const rightLabelStyle = reveal(frame, 16);

  // Headline (in top bar): reveal at frame 10
  const headlineStyle = reveal(frame, 10);

  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>

      {/* ── Left photo: x 0–940, y 0–1080, full bleed ── */}
      <Img
        src={leftPhotoSrc}
        style={{
          position:  "absolute",
          left:      0,
          top:       0,
          width:     940,
          height:    1080,
          objectFit: "cover" as const,
          display:   "block",
          opacity:   leftPhotoOpacity,
        }}
      />

      {/* ── Right photo: x 980–1920, y 0–1080, full bleed ── */}
      <Img
        src={rightPhotoSrc}
        style={{
          position:  "absolute",
          left:      980,
          top:       0,
          width:     940,
          height:    1080,
          objectFit: "cover" as const,
          display:   "block",
          opacity:   rightPhotoOpacity,
        }}
      />

      {/* ── DC7070 vertical rule: 3px at x=960, full height ── */}
      <div
        style={{
          position:        "absolute",
          left:            960,
          top:             0,
          width:           3,
          height:          1080,
          background:      CORAL,
          transformOrigin: "top center",
          transform:       `scaleY(${ruleScaleY})`,
        }}
      />

      {/* ── Top headline bar: y 0–160, cream 0.92 ── */}
      <div
        style={{
          position:        "absolute",
          left:            0,
          top:             0,
          width:           1920,
          height:          160,
          backgroundColor: BG,
          opacity:         barOpacity * 0.92,
        }}
      />

      {/* ── Headline text: centered, PT Serif Bold 64px, #202020 ── */}
      <div
        style={{
          position:   "absolute",
          left:       0,
          top:        50,
          width:      1920,
          textAlign:  "center" as const,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   64,
          color:      INK,
          lineHeight: 1.1,
          opacity:    headlineStyle.opacity,
          transform:  headlineStyle.transform,
        }}
      >
        {headlinePre}{" "}
        <span style={{ color: CORAL }}>{headlineKicker}</span>
      </div>

      {/* ── Bottom label banner: y 780–900, cream 0.92 ── */}
      <div
        style={{
          position:        "absolute",
          left:            0,
          top:             780,
          width:           1920,
          height:          120,
          backgroundColor: BG,
          opacity:         barOpacity * 0.92,
        }}
      />

      {/* ── Left label: PT Serif Bold 40px, #DC7070, x 60, y 820 ── */}
      <div
        style={{
          position:   "absolute",
          left:       60,
          top:        820,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   40,
          color:      CORAL,
          lineHeight: 1,
          opacity:    leftLabelStyle.opacity,
          transform:  leftLabelStyle.transform,
        }}
      >
        {leftLabel}
      </div>

      {/* ── Left sublabel: PT Serif Regular 32px, #202020 70% opacity, x 60, y 870 ── */}
      <div
        style={{
          position:   "absolute",
          left:       60,
          top:        870,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   32,
          color:      INK,
          lineHeight: 1,
          opacity:    0.7 * leftLabelStyle.opacity,
          transform:  leftLabelStyle.transform,
        }}
      >
        {leftSublabel}
      </div>

      {/* ── Right label: PT Serif Bold 40px, #DC7070, x 1000, y 820 ── */}
      <div
        style={{
          position:   "absolute",
          left:       1000,
          top:        820,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   40,
          color:      CORAL,
          lineHeight: 1,
          opacity:    rightLabelStyle.opacity,
          transform:  rightLabelStyle.transform,
        }}
      >
        {rightLabel}
      </div>

      {/* ── Right sublabel: PT Serif Regular 32px, #202020 70% opacity, x 1000, y 870 ── */}
      <div
        style={{
          position:   "absolute",
          left:       1000,
          top:        870,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   32,
          color:      INK,
          lineHeight: 1,
          opacity:    0.7 * rightLabelStyle.opacity,
          transform:  rightLabelStyle.transform,
        }}
      >
        {rightSublabel}
      </div>
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-diptych-compare",
  props: {
    leftPhotoSrc:   staticFile("jets.png"),
    rightPhotoSrc:  staticFile("missile.png"),
    leftLabel:      "TEJAS MK1A",
    leftSublabel:   "83 ordered · 0 squadrons",
    rightLabel:     "BrahMos-NG",
    rightSublabel:  "Inducted · 3 regiments",
    headlinePre:    "Same budget. Very different",
    headlineKicker: "outcomes.",
    at:             0,
  },
  durationInFrames: 180,
};

// ─── Remotion root ───

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={DiptychCompare as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
