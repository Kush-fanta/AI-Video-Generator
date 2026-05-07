/**
 * photo-verdict.tsx — Swarajya image-dominant verdict template.
 *
 * Editorial job: Photo fills 2/3 of the frame (left, full bleed). Right 1/3 is a cream
 * strip with a verdict-style text stack. Dramatic — like a closing frame.
 *
 * Layout zones (cream strip):
 *   y 120–220   eyebrow
 *   y 220–600   verdict headline
 *   y 600–800   damning clause + follow line
 *   y 800–900   anchor
 *   y 900–1080  RESERVED — no elements ever
 *
 * Render:
 *   npx remotion still templates/swarajya/photo-verdict.tsx swarajya-photo-verdict out/photo-verdict.png
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

// ─── PhotoVerdict ───

interface PhotoVerdictProps {
  photoSrc:       string;
  eyebrow:        string;
  verdictQuestion: string;
  dampingClause:  string;
  followLine?:    string;
  at?:            number;
}

const PhotoVerdict: React.FC<PhotoVerdictProps> = ({
  photoSrc,
  eyebrow,
  verdictQuestion,
  dampingClause,
  followLine,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // DC7070 vertical bar at x=1284: scaleY 0→1 at frame 4
  const barScaleY = interpolate(frame, [4, 4 + 18], [0, 1], C);

  // Photo: opacity 0→0.9 at frame 8
  const photoOpacity = interpolate(frame, [8, 8 + 18], [0, 0.9], C);

  // Eyebrow: reveal at frame 12
  const eyebrowStyle = reveal(frame, 12);

  // Verdict headline: reveal at frame 16
  const headlineStyle = reveal(frame, 16);

  // Horizontal rule: scaleX 0→1 at frame 28
  const ruleScaleX = interpolate(frame, [28, 28 + 16], [0, 1], C);

  // Damning clause: reveal at frame 30
  const dampingStyle = reveal(frame, 30);

  // Follow line: reveal at frame 36
  const followStyle = reveal(frame, 36);

  // Strip interior left edge: x=1320, width goes to x=1860 → 540px usable
  const STRIP_TEXT_LEFT = 1320;
  const STRIP_TEXT_W    = 540;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>

      {/* ── Left 2/3: full-bleed photo x 0–1280, y 0–1080 ── */}
      <Img
        src={photoSrc}
        style={{
          position:  "absolute",
          left:      0,
          top:       0,
          width:     1280,
          height:    1080,
          objectFit: "cover" as const,
          display:   "block",
          opacity:   photoOpacity,
        }}
      />

      {/* ── Right cream strip: x 1280–1920 ── */}
      <div
        style={{
          position:        "absolute",
          left:            1280,
          top:             0,
          width:           640,
          height:          1080,
          backgroundColor: BG,
        }}
      />

      {/* ── DC7070 vertical bar: 4px at x=1284, full height, scaleY 0→1 ── */}
      <div
        style={{
          position:        "absolute",
          left:            1284,
          top:             0,
          width:           4,
          height:          1080,
          background:      CORAL,
          transformOrigin: "top center",
          transform:       `scaleY(${barScaleY})`,
        }}
      />

      {/* ── Eyebrow: PT Serif Regular 36px, #202020 50% opacity, letterSpacing 8, y 200 ── */}
      <div
        style={{
          position:      "absolute",
          left:          STRIP_TEXT_LEFT,
          top:           200,
          width:         STRIP_TEXT_W,
          fontFamily:    PT,
          fontWeight:    400,
          fontSize:      36,
          color:         INK,
          letterSpacing: 8,
          textTransform: "uppercase" as const,
          opacity:       0.5 * eyebrowStyle.opacity,
          transform:     eyebrowStyle.transform,
        }}
      >
        {eyebrow}
      </div>

      {/* ── Verdict headline: PT Serif Bold Italic 52px, #202020, y 260 ── */}
      <div
        style={{
          position:    "absolute",
          left:        STRIP_TEXT_LEFT,
          top:         260,
          width:       STRIP_TEXT_W,
          fontFamily:  PT,
          fontWeight:  700,
          fontStyle:   "italic" as const,
          fontSize:    52,
          color:       INK,
          lineHeight:  1.25,
          opacity:     headlineStyle.opacity,
          transform:   headlineStyle.transform,
        }}
      >
        {verdictQuestion}
      </div>

      {/* ── Horizontal rule: 1px #202020 15% opacity, scaleX 0→1, y 570, width 180px ── */}
      <div
        style={{
          position:        "absolute",
          left:            STRIP_TEXT_LEFT,
          top:             570,
          width:           180,
          height:          1,
          background:      INK,
          opacity:         0.15 * ruleScaleX,
          transformOrigin: "left center",
          transform:       `scaleX(${ruleScaleX})`,
        }}
      />

      {/* ── Damning clause: PT Serif Bold 56px, #DC7070, y 600 ── */}
      <div
        style={{
          position:   "absolute",
          left:       STRIP_TEXT_LEFT,
          top:        600,
          width:      STRIP_TEXT_W,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   56,
          color:      CORAL,
          lineHeight: 1.15,
          opacity:    dampingStyle.opacity,
          transform:  dampingStyle.transform,
        }}
      >
        {dampingClause}
      </div>

      {/* ── Follow line: PT Serif Regular 34px, #202020 70% opacity, y 740 ── */}
      {followLine && (
        <div
          style={{
            position:   "absolute",
            left:       STRIP_TEXT_LEFT,
            top:        740,
            width:      STRIP_TEXT_W,
            fontFamily: PT,
            fontWeight: 400,
            fontSize:   34,
            color:      INK,
            lineHeight: 1.4,
            opacity:    0.7 * followStyle.opacity,
            transform:  followStyle.transform,
          }}
        >
          {followLine}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-photo-verdict",
  props: {
    photoSrc:        staticFile("intercept.png"),
    eyebrow:         "OPERATION SINDOOR",
    verdictQuestion: "India intercepted the missiles. But did it win the narrative?",
    dampingClause:   "Pakistan already had the story out.",
    followLine:      "15 minutes ahead of India's official statement.",
    at:              0,
  },
  durationInFrames: 180,
};

// ─── Remotion root ───

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={PhotoVerdict as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
