/**
 * full-bleed-stat.tsx — Swarajya full-bleed photo with hero stat overlay.
 *
 * Editorial job: Photo fills the entire frame. A large hero stat floats over
 * in DC7070. The photo is the world; the stat is the argument landing on it.
 *
 * Layout zones (floating over photo):
 *   y 120–220   eyebrow
 *   y 220–600   hero stat (280px PT Serif Bold)
 *   y 600–800   stat label
 *   y 800–900   source (anchor zone)
 *   y 900–1080  RESERVED — no elements ever
 *
 * Render:
 *   npx remotion still templates/swarajya/full-bleed-stat.tsx swarajya-full-bleed-stat out/full-bleed-stat.png
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
  spring,
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

// ─── FullBleedStat ───

interface FullBleedStatProps {
  photoSrc:    string;
  eyebrow:     string;
  heroStat:    string;
  statLabel:   string;
  sourceText?: string;
  at?:         number;
}

const FullBleedStat: React.FC<FullBleedStatProps> = ({
  photoSrc,
  eyebrow,
  heroStat,
  statLabel,
  sourceText,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Photo: opacity 0→0.55 at frame 4
  const photoOpacity = interpolate(frame, [4, 4 + 18], [0, 0.55], C);

  // Eyebrow: reveal at frame 6
  const eyebrowStyle = reveal(frame, 6);

  // DC7070 rule scaleX 0→1 at frame 8
  const ruleScaleX = interpolate(frame, [8, 8 + 16], [0, 1], C);

  // Hero stat: spring scale entrance at frame 14
  // spring returns 0→1; map to 0.88→1.0 with overshoot baked into physics
  const statSpring = spring({
    frame: Math.max(0, frame - 14),
    fps:   FPS,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });
  const statS = interpolate(statSpring, [0, 1], [0.88, 1.0], C);
  const statOpacity = interpolate(frame, [14, 14 + 10], [0, 1], C);

  // Stat label: reveal at frame 22
  const statLabelStyle = reveal(frame, 22);

  // Source: fade at frame 30
  const sourceOpacity = interpolate(frame, [30, 30 + 14], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>

      {/* ── Full-bleed photo ── */}
      <Img
        src={photoSrc}
        style={{
          position:  "absolute",
          left:      0,
          top:       0,
          width:     1920,
          height:    1080,
          objectFit: "cover" as const,
          display:   "block",
          opacity:   photoOpacity,
        }}
      />

      {/* ── Cream vignette at bottom: transparent→BG gradient, y ~600–900 ── */}
      <div
        style={{
          position:   "absolute",
          left:       0,
          top:        600,
          width:      1920,
          height:     300,
          background: `linear-gradient(to bottom, transparent, ${BG})`,
        }}
      />

      {/* ── Eyebrow: PT Serif Regular 40px, #202020, letterSpacing 6, x 120, y 160 ── */}
      <div
        style={{
          position:      "absolute",
          left:          120,
          top:           160,
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

      {/* ── DC7070 thin rule: 3px, scaleX 0→1, x 120, y 240, width 120px ── */}
      <div
        style={{
          position:        "absolute",
          left:            120,
          top:             240,
          width:           120,
          height:          3,
          background:      CORAL,
          transformOrigin: "left center",
          transform:       `scaleX(${ruleScaleX})`,
          opacity:         ruleScaleX,
        }}
      />

      {/* ── Hero stat: PT Serif Bold 280px, #DC7070, x 120, y 260 ── */}
      <div
        style={{
          position:        "absolute",
          left:            120,
          top:             260,
          fontFamily:      PT,
          fontWeight:      700,
          fontSize:        280,
          color:           CORAL,
          lineHeight:      1,
          letterSpacing:   -8,
          transformOrigin: "left center",
          transform:       `scale(${statS})`,
          opacity:         statOpacity,
        }}
      >
        {heroStat}
      </div>

      {/* ── Stat label: PT Serif Regular 40px, #202020, x 120, y 580 ── */}
      <div
        style={{
          position:   "absolute",
          left:       120,
          top:        580,
          width:      900,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   40,
          color:      INK,
          lineHeight: 1.4,
          opacity:    statLabelStyle.opacity,
          transform:  statLabelStyle.transform,
        }}
      >
        {statLabel}
      </div>

      {/* ── Source: IBM Plex Mono 28px, #8A8A8A, x 120, y 820 ── */}
      {sourceText && (
        <div
          style={{
            position:   "absolute",
            left:       120,
            top:        820,
            width:      900,
            fontFamily: MONO,
            fontSize:   28,
            color:      "#8A8A8A",
            lineHeight: 1.3,
            opacity:    sourceOpacity,
          }}
        >
          {sourceText}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-full-bleed-stat",
  props: {
    photoSrc:   staticFile("sub.png"),
    eyebrow:    "INDIA'S NAVY",
    heroStat:   "24th",
    statLabel:  "Rank in global naval power. Up from 42nd in 2001.",
    sourceText: "Global Firepower Index 2024",
    at:         0,
  },
  durationInFrames: 180,
};

// ─── Remotion root ───

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={FullBleedStat as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
