/**
 * then-now-split.tsx — Swarajya split template.
 *
 * Editorial job: Temporal gap. Before vs after.
 * Shows the distance India has traveled — or failed to travel.
 * Left: THEN (subdued ink). Right: NOW (coral).
 *
 * Layout zones:
 *   y 120–220   eyebrow
 *   y 220–600   headline zone
 *   y 600–800   body zone (substat lives here)
 *   y 800–900   anchor
 *   y 900–1080  RESERVED
 *
 * Render:
 *   npx remotion still templates/swarajya/then-now-split.tsx swarajya-then-now-split out/then-now-split.png
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

// scaleX 0→1 for horizontal rules
const ruleScale = (frame: number, at: number, dur = 16) =>
  interpolate(frame, [at, at + dur], [0, 1], C);

// ─── ThenNowSplit ───

interface ThenNowSplitProps {
  thenDate:     string;
  thenContent:  string;
  thenStat?:    string;
  nowDate:      string;
  nowContent:   string;
  nowStat?:     string;
  at?:          number;
}

const ThenNowSplit: React.FC<ThenNowSplitProps> = ({
  thenDate,
  thenContent,
  thenStat,
  nowDate,
  nowContent,
  nowStat,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;

  // DC7070 vertical rule: grows from top at frame 4
  const barScale = interpolate(frame, [4, 4 + 18], [0, 1], C);

  // THEN side stagger: eyebrow frame 6, date frame 8, rule frame 9, content frame 11, stat frame 14
  const thenEyebrowStyle  = reveal(frame, 6);
  const thenDateStyle     = reveal(frame, 8);
  const thenRuleScale     = ruleScale(frame, 9);
  const thenContentStyle  = reveal(frame, 11);
  const thenStatOpacity   = interpolate(frame, [14, 14 + 16], [0, 1], C);

  // NOW side stagger: eyebrow frame 12, date frame 14, rule frame 15, content frame 17, stat frame 20
  const nowEyebrowStyle   = reveal(frame, 12);
  const nowDateStyle      = reveal(frame, 14);
  const nowRuleScale      = ruleScale(frame, 15);
  const nowContentStyle   = reveal(frame, 17);
  const nowStatOpacity    = interpolate(frame, [20, 20 + 16], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>

      {/* ══════════════ LEFT: THEN column (x 120–880) ══════════════ */}

      {/* THEN eyebrow */}
      <div
        style={{
          position:      "absolute",
          left:          120,
          top:           160,
          fontFamily:    PT,
          fontWeight:    400,
          fontSize:      40,
          color:         INK,
          letterSpacing: 8,
          textTransform: "uppercase" as const,
          opacity:       0.45 * thenEyebrowStyle.opacity,
          transform:     thenEyebrowStyle.transform,
        }}
      >
        Then
      </div>

      {/* THEN date */}
      <div
        style={{
          position:   "absolute",
          left:       120,
          top:        220,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   36,
          color:      INK,
          opacity:    0.45 * thenDateStyle.opacity,
          transform:  thenDateStyle.transform,
        }}
      >
        {thenDate}
      </div>

      {/* THEN horizontal rule: 1px, #202020 at 15% opacity, y 280, width 160px */}
      <div
        style={{
          position:        "absolute",
          left:            120,
          top:             280,
          width:           160,
          height:          1,
          background:      INK,
          opacity:         0.15 * thenRuleScale,
          transformOrigin: "left center",
          transform:       `scaleX(${thenRuleScale})`,
        }}
      />

      {/* THEN content */}
      <div
        style={{
          position:   "absolute",
          left:       120,
          top:        320,
          width:      720,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   52,
          color:      INK,
          lineHeight: 1.25,
          opacity:    0.55 * thenContentStyle.opacity,
          transform:  thenContentStyle.transform,
        }}
      >
        {thenContent}
      </div>

      {/* THEN subStat (optional) */}
      {thenStat && (
        <div
          style={{
            position:   "absolute",
            left:       120,
            top:        600,
            fontFamily: PT,
            fontWeight: 700,
            fontSize:   120,
            color:      INK,
            lineHeight: 1,
            opacity:    0.35 * thenStatOpacity,
          }}
        >
          {thenStat}
        </div>
      )}

      {/* ══════════════ DC7070 vertical rule at x=960 ══════════════ */}
      <div
        style={{
          position:        "absolute",
          left:            960,
          top:             120,
          width:           2,
          height:          780,
          background:      CORAL,
          transformOrigin: "top center",
          transform:       `scaleY(${barScale})`,
        }}
      />

      {/* ══════════════ RIGHT: NOW column (x 1040–1800) ══════════════ */}

      {/* NOW eyebrow */}
      <div
        style={{
          position:      "absolute",
          left:          1040,
          top:           160,
          fontFamily:    PT,
          fontWeight:    700,
          fontSize:      40,
          color:         CORAL,
          letterSpacing: 8,
          textTransform: "uppercase" as const,
          opacity:       nowEyebrowStyle.opacity,
          transform:     nowEyebrowStyle.transform,
        }}
      >
        Now
      </div>

      {/* NOW date */}
      <div
        style={{
          position:   "absolute",
          left:       1040,
          top:        220,
          fontFamily: PT,
          fontWeight: 400,
          fontSize:   36,
          color:      CORAL,
          opacity:    nowDateStyle.opacity,
          transform:  nowDateStyle.transform,
        }}
      >
        {nowDate}
      </div>

      {/* NOW horizontal rule: 2px, #DC7070, y 280, width 160px */}
      <div
        style={{
          position:        "absolute",
          left:            1040,
          top:             280,
          width:           160,
          height:          2,
          background:      CORAL,
          transformOrigin: "left center",
          transform:       `scaleX(${nowRuleScale})`,
          opacity:         nowRuleScale,
        }}
      />

      {/* NOW content */}
      <div
        style={{
          position:   "absolute",
          left:       1040,
          top:        320,
          width:      760,
          fontFamily: PT,
          fontWeight: 700,
          fontSize:   52,
          color:      INK,
          lineHeight: 1.25,
          opacity:    nowContentStyle.opacity,
          transform:  nowContentStyle.transform,
        }}
      >
        {nowContent}
      </div>

      {/* NOW subStat (optional) */}
      {nowStat && (
        <div
          style={{
            position:   "absolute",
            left:       1040,
            top:        600,
            fontFamily: PT,
            fontWeight: 700,
            fontSize:   120,
            color:      CORAL,
            lineHeight: 1,
            opacity:    nowStatOpacity,
          }}
        >
          {nowStat}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo export ───

export const demo = {
  compositionId: "swarajya-then-now-split",
  props: {
    thenDate:    "2000",
    thenContent: "India imports 70% of defence equipment. DPSUs produce ordnance, not platforms.",
    thenStat:    "70%",
    nowDate:     "2024",
    nowContent:  "Indigenous content mandate: 75% on new acquisitions. Tejas, Arjun, INS Vikrant in service.",
    nowStat:     "75%",
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
      component={ThenNowSplit as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  </>
);

registerRoot(RemotionRoot);
