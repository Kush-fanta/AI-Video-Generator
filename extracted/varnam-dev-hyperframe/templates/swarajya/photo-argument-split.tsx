/**
 * photo-argument-split.tsx — Swarajya split template.
 *
 * Editorial job: Photo as evidence, text as verdict.
 * Person Frame Split and Evidence Frame merged.
 * Left: photo in DC7070-bordered rect. Right: argument text stack.
 *
 * Layout zones:
 *   y 120–220   eyebrow
 *   y 220–600   headline zone
 *   y 600–800   body zone
 *   y 800–900   anchor (caption)
 *   y 900–1080  RESERVED
 *
 * Render:
 *   npx remotion still templates/swarajya/photo-argument-split.tsx swarajya-photo-argument-split out/photo-argument-split.png
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

// ─── PhotoArgumentSplit ───

interface PhotoArgumentSplitProps {
  photoSrc:     string;
  eyebrow:      string;
  headline:     string;
  bodyText:     string;
  captionText?: string;
  at?:          number;
}

const PhotoArgumentSplit: React.FC<PhotoArgumentSplitProps> = ({
  photoSrc,
  eyebrow,
  headline,
  bodyText,
  captionText,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Photo border: fade 0→1 at frame 4
  const borderOpacity = interpolate(frame, [4, 4 + 14], [0, 1], C);

  // Photo image: fade in at frame 6
  const photoOpacity = interpolate(frame, [6, 6 + 16], [0, 1], C);

  // Right eyebrow: reveal at frame 8
  const eyebrowStyle = reveal(frame, 8);

  // Right headline: reveal at frame 12
  const headlineStyle = reveal(frame, 12);

  // Right body: reveal at frame 20
  const bodyStyle = reveal(frame, 20);

  // Caption: fade at frame 28
  const captionOpacity = interpolate(frame, [28, 28 + 14], [0, 1], C);

  // Photo rect: 720 × 560px, x 120–840, vertically centered y ~210–770
  const PHOTO_X = 120;
  const PHOTO_Y = 210;
  const PHOTO_W = 720;
  const PHOTO_H = 560;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>

      {/* ── Photo border: absolute-positioned div, border 2px solid #DC7070 ── */}
      <div
        style={{
          position:    "absolute",
          left:        PHOTO_X,
          top:         PHOTO_Y,
          width:       PHOTO_W,
          height:      PHOTO_H,
          border:      `2px solid ${CORAL}`,
          borderRadius: 0,
          opacity:     borderOpacity,
          overflow:    "hidden",
        }}
      >
        {/* Photo fills rect at 65% opacity, object-fit cover */}
        <Img
          src={photoSrc}
          style={{
            width:      "100%",
            height:     "100%",
            objectFit:  "cover" as const,
            display:    "block",
            opacity:    0.65 * photoOpacity,
          }}
        />
      </div>

      {/* ── Right: eyebrow ── */}
      <div
        style={{
          position:      "absolute",
          left:          960,
          top:           160,
          width:         840,
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

      {/* ── Right: headline, PT Serif Bold 72px, #DC7070, y ~240 ── */}
      <div
        style={{
          position:   "absolute",
          left:       960,
          top:        240,
          width:      840,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   72,
          color:      CORAL,
          lineHeight: 1.15,
          opacity:    headlineStyle.opacity,
          transform:  headlineStyle.transform,
        }}
      >
        {headline}
      </div>

      {/* ── Right: body, PT Serif Regular 40px, #202020, y ~480 ── */}
      <div
        style={{
          position:   "absolute",
          left:       960,
          top:        480,
          width:      840,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   40,
          color:      INK,
          lineHeight: 1.35,
          opacity:    bodyStyle.opacity,
          transform:  bodyStyle.transform,
        }}
      >
        {bodyText}
      </div>

      {/* ── Caption: IBM Plex Mono 28px, #8A8A8A, anchor zone y ~820 ── */}
      {captionText && (
        <div
          style={{
            position:   "absolute",
            left:       960,
            top:        820,
            width:      840,
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
  compositionId: "swarajya-photo-argument-split",
  props: {
    photoSrc:    staticFile("jet.png"),
    eyebrow:     "INDIGENOUS FIGHTER",
    headline:    "The jet exists. The squadron doesn't.",
    bodyText:    "Tejas MK1A: 83 ordered in 2021. Deliveries began 2024. Squadron strength: zero.",
    captionText: "HAL Annual Report 2024 — IAF Force Structure Review",
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
      component={PhotoArgumentSplit as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
