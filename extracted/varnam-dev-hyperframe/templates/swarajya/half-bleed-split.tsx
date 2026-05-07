/**
 * half-bleed-split.tsx — Swarajya image-dominant split template.
 *
 * Editorial job: Photo fills the entire left half (full bleed — the entertainment).
 * Argument text lives in a cream right half. The image IS the left side.
 *
 * Layout zones (right column):
 *   y 120–220   eyebrow
 *   y 220–600   headline zone
 *   y 600–800   body zone
 *   y 800–900   anchor (caption)
 *   y 900–1080  RESERVED — no elements ever
 *
 * Render:
 *   npx remotion still templates/swarajya/half-bleed-split.tsx swarajya-half-bleed-split out/half-bleed-split.png
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
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: PT }   = loadPTSerif();
const { fontFamily: MONO } = loadIBMPlexMono();

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

// ─── HalfBleedSplit ───

interface HalfBleedSplitProps {
  photoSrc:     string;
  eyebrow:      string;
  headline:     string;
  bodyText:     string;
  captionText?: string;
  at?:          number;
}

const HalfBleedSplit: React.FC<HalfBleedSplitProps> = ({
  photoSrc,
  eyebrow,
  headline,
  bodyText,
  captionText,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // DC7070 vertical border at right edge of photo zone: scaleY 0→1 at frame 4
  const borderScaleY = interpolate(frame, [4, 4 + 18], [0, 1], C);

  // Photo: opacity 0→0.85 at frame 8
  const photoOpacity = interpolate(frame, [8, 8 + 18], [0, 0.85], C);

  // Eyebrow: reveal at frame 10
  const eyebrowStyle = reveal(frame, 10);

  // Headline: reveal at frame 14
  const headlineStyle = reveal(frame, 14);

  // Horizontal rule: scaleX 0→1 at frame 22
  const ruleScaleX = interpolate(frame, [22, 22 + 16], [0, 1], C);

  // Body: reveal at frame 24
  const bodyStyle = reveal(frame, 24);

  // Caption: fade at frame 32
  const captionOpacity = interpolate(frame, [32, 32 + 14], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>

      {/* ── Left half: full-bleed photo x 0–960, y 0–1080 ── */}
      <Img
        src={photoSrc}
        style={{
          position:  "absolute",
          left:      0,
          top:       0,
          width:     960,
          height:    1080,
          objectFit: "cover" as const,
          display:   "block",
          opacity:   photoOpacity,
        }}
      />

      {/* ── DC7070 right-edge border on photo zone: 2px vertical line at x=958 ── */}
      <div
        style={{
          position:        "absolute",
          left:            958,
          top:             0,
          width:           2,
          height:          1080,
          background:      CORAL,
          transformOrigin: "top center",
          transform:       `scaleY(${borderScaleY})`,
        }}
      />

      {/* ── Right half cream backing (x 960–1920) ── */}
      {/* The BG fill on AbsoluteFill covers this — no separate div needed */}

      {/* ── Right: eyebrow — PT Serif Regular 40px, #202020, letterSpacing 6, y 160 ── */}
      <div
        style={{
          position:      "absolute",
          left:          1000,
          top:           160,
          width:         800,
          fontFamily:    PT,
          fontWeight:    400,
          fontSize:      40,
          color:         INK,
          letterSpacing: 6,
          textTransform: "uppercase" as const,
          opacity:       eyebrowStyle.opacity,
          transform:     eyebrowStyle.transform,
        }}
      >
        {eyebrow}
      </div>

      {/* ── Right: headline — PT Serif Bold 80px, #DC7070, y 240 ── */}
      <div
        style={{
          position:   "absolute",
          left:       1000,
          top:        240,
          width:      800,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   80,
          color:      CORAL,
          lineHeight: 1.15,
          opacity:    headlineStyle.opacity,
          transform:  headlineStyle.transform,
        }}
      >
        {headline}
      </div>

      {/* ── Horizontal rule: 1px #202020 15% opacity, scaleX 0→1, y 520, width 200px ── */}
      <div
        style={{
          position:        "absolute",
          left:            1000,
          top:             520,
          width:           200,
          height:          1,
          background:      INK,
          opacity:         0.15 * ruleScaleX,
          transformOrigin: "left center",
          transform:       `scaleX(${ruleScaleX})`,
        }}
      />

      {/* ── Right: body — PT Serif Regular 40px, #202020, y 560 ── */}
      <div
        style={{
          position:   "absolute",
          left:       1000,
          top:        560,
          width:      800,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   40,
          color:      INK,
          lineHeight: 1.4,
          opacity:    bodyStyle.opacity,
          transform:  bodyStyle.transform,
        }}
      >
        {bodyText}
      </div>

      {/* ── Caption: IBM Plex Mono 28px, #8A8A8A, y 820 ── */}
      {captionText && (
        <div
          style={{
            position:   "absolute",
            left:       1000,
            top:        820,
            width:      800,
            fontFamily: MONO,
            fontSize:   28,
            color:      "#8A8A8A",
            lineHeight: 1.3,
            opacity:    captionOpacity,
          }}
        >
          {captionText}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-half-bleed-split",
  props: {
    photoSrc:    staticFile("pilot.png"),
    eyebrow:     "IAF PILOT",
    headline:    "Training for a war India almost wasn't ready to fight.",
    bodyText:    "Sortie rates, squadron strength, and the gap that nearly became permanent.",
    captionText: "CAG Report on IAF Operational Readiness, 2023",
    at:          0,
  },
  durationInFrames: 180,
};

// ─── Remotion root ───

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={HalfBleedSplit as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
