/**
 * claim-reality-split.tsx — Swarajya split template.
 *
 * Editorial job: The gap between official announcement and actual fact.
 * The core Swarajya move — claim on left (subdued), reality on right (coral).
 *
 * Layout zones:
 *   y 120–220   eyebrow
 *   y 220–600   headline zone
 *   y 600–800   body zone
 *   y 800–900   anchor (source)
 *   y 900–1080  RESERVED
 *
 * Render:
 *   npx remotion still templates/swarajya/claim-reality-split.tsx swarajya-claim-reality-split out/claim-reality-split.png
 */
import React from "react";
import {
  AbsoluteFill,
  Composition,
  registerRoot,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: MONO } = loadIBMPlexMono();

// ─── Swarajya design tokens (inline — do not import from shared) ───
const BG     = "#F2EDE7";
const CORAL  = "#DC7070";
const INK    = "#202020";
const MUTED  = "rgba(32,32,32,0.45)";

const W = 1920;
const H = 1080;
const FPS = 30;

// ─── Animation helpers ───
const C = {
  extrapolateLeft:  "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Fade + translateY reveal. Returns a style object. */
const reveal = (frame: number, at: number, dur = 18) => ({
  opacity: interpolate(frame, [at, at + dur], [0, 1], C),
  transform: `translateY(${interpolate(
    frame,
    [at, at + dur],
    [14, 0],
    { ...C, easing: ease }
  )}px)`,
});

// ─── ClaimRealitySplit ───

interface ClaimRealitySplitProps {
  claimText:   string;
  realityText: string;
  sourceLabel?: string;
  at?: number;
}

const ClaimRealitySplit: React.FC<ClaimRealitySplitProps> = ({
  claimText,
  realityText,
  sourceLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // Vertical bar: scaleY 0→1 from top, starting frame 4
  const barScale = interpolate(frame, [4, 4 + 18], [0, 1], C);

  // Left text fade: frame 6
  const leftReveal = reveal(frame, 6);

  // Right headline fade: frame 10
  const rightReveal = reveal(frame, 10);

  // Source fade: frame 22
  const sourceOpacity = interpolate(frame, [22, 22 + 14], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>

      {/* ── Left side eyebrow: OFFICIAL POSITION ── */}
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
          opacity:       0.45,
        }}
      >
        Official Position
      </div>

      {/* ── Right side eyebrow: WHAT ACTUALLY HAPPENED ── */}
      <div
        style={{
          position:      "absolute",
          left:          1040,
          top:           160,
          fontFamily:    PT,
          fontWeight:    400,
          fontSize:      40,
          color:         CORAL,
          letterSpacing: 6,
          textTransform: "uppercase" as const,
        }}
      >
        What Actually Happened
      </div>

      {/* ── DC7070 vertical rule at x=960, grows scaleY 0→1 from top ── */}
      <div
        style={{
          position:        "absolute",
          left:            960,
          top:             120,
          width:           3,
          height:          780,
          background:      CORAL,
          transformOrigin: "top center",
          transform:       `scaleY(${barScale})`,
        }}
      />

      {/* ── Left: claim text, 52px, #202020 at 45% opacity ── */}
      <div
        style={{
          position:   "absolute",
          left:       120,
          top:        260,
          width:      800,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   52,
          color:      INK,
          lineHeight: 1.25,
          opacity:    0.45 * leftReveal.opacity,
          transform:  leftReveal.transform,
        }}
      >
        {claimText}
      </div>

      {/* ── Right: reality text, PT Serif Bold 72px, #DC7070 ── */}
      <div
        style={{
          position:   "absolute",
          left:       1000,
          top:        260,
          width:      840,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   72,
          color:      CORAL,
          lineHeight: 1.15,
          opacity:    rightReveal.opacity,
          transform:  rightReveal.transform,
        }}
      >
        {realityText}
      </div>

      {/* ── Source label — anchor zone ── */}
      {sourceLabel && (
        <div
          style={{
            position:   "absolute",
            left:       1000,
            top:        820,
            width:      840,
            fontFamily: MONO,
            fontSize:   28,
            color:      "#8A8A8A",
            lineHeight: 1.3,
            opacity:    sourceOpacity,
          }}
        >
          {sourceLabel}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-claim-reality-split",
  props: {
    claimText:   "India's air defence performed flawlessly during Operation Sindoor.",
    realityText: "Four S-400 batteries engaged. Two were overloaded within 90 seconds.",
    sourceLabel: "Parliamentary Standing Committee on Defence, May 2025",
    at:          0,
  },
  durationInFrames: 150,
};

// ─── Remotion root ───

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={ClaimRealitySplit as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
