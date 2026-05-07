/**
 * swarajya-kit-demo.tsx — Render stills of the 4 new Swarajya templates.
 *
 * Render all:
 *   npx remotion still swarajya-kit-demo.tsx SplitImageStatDemo --frame=45 out/kit-split.png
 *   npx remotion still swarajya-kit-demo.tsx FullBleedDemo --frame=45 out/kit-fullbleed.png
 *   npx remotion still swarajya-kit-demo.tsx SectionMarkerDemo --frame=45 out/kit-marker.png
 *   npx remotion still swarajya-kit-demo.tsx DualStatDemo --frame=45 out/kit-dualstat.png
 */
import React from "react";
import { AbsoluteFill, Composition, Sequence, registerRoot, useCurrentFrame, interpolate } from "remotion";
import { SplitImageStat } from "./image-comp/split-image-stat";
import { SplitImageStatReveal } from "./image-comp/split-image-stat-reveal";
import { FullBleedOverlay } from "./image-comp/full-bleed-overlay";
import { SectionMarker } from "./image-comp/section-marker";
import { DualStatCompare } from "./image-comp/dual-stat-compare";
import { VerdictOverlay } from "./image-comp/verdict-overlay";
import { StatStrip } from "./image-comp/stat-strip";
import { SP } from "./shared/swarajya-palette";
import { swarajyaIdentityPack } from "./shared/identity/presets";

const C_CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** Horizontal whip wipe — gold bar slashes across in 8 frames */
const WhipWipe: React.FC<{ at: number; color?: string }> = ({ at, color = SP.terracotta }) => {
  const frame = useCurrentFrame();
  const lead = interpolate(frame, [at, at + 8], [-10, 110], C_CLAMP);
  const trail = interpolate(frame, [at + 3, at + 11], [-10, 110], C_CLAMP);
  return (
    <div style={{
      position: "absolute", top: 0, left: `${trail}%`,
      width: `${Math.max(0, lead - trail)}%`, height: "100%",
      backgroundColor: color, zIndex: 10,
    }} />
  );
};

/** White flash slam — 2 frame punch */
const FlashPunch: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 1, at + 2, at + 4], [0, 0.9, 0.9, 0], C_CLAMP);
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "#FFFFFF", opacity, zIndex: 11, pointerEvents: "none",
    }} />
  );
};

const FPS = 30;

const SplitImageStatDemo: React.FC = () => (
  <SplitImageStat
    image="swarajya-sub.png"
    value="1,493"
    unit="FACTORIES"
    body="More than Maharashtra and Gujarat combined"
    imageLabel="36 WARSHIPS"
    imageSublabel="OFF KARACHI"
    categoryLabel="KOLKATA, 1951"
    badge="#SWARAJYA"
    accentWords={["Maharashtra", "Gujarat"]}
    palette={SP}
  />
);

const FullBleedDemo: React.FC = () => (
  <FullBleedOverlay
    image="swarajya-jets.png"
    headline="OPERATION SINDOOR"
    categoryLabel="OPERATION SINDOOR"
    badge="#SWARAJYA"
    condensedMode
    accentWords={["SINDOOR"]}
    identity={swarajyaIdentityPack}
  />
);

const SectionMarkerDemo: React.FC = () => (
  <SectionMarker
    title="THE OBVIOUS ANSWER"
    subtitle="If you had to bet on which state would lead India — Bengal was it"
    categoryLabel="KOLKATA, 1951"
    image="swarajya-map.png"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const DualStatDemo: React.FC = () => (
  <DualStatCompare
    leftValue="127.5"
    leftLabel="Per capita income, 1960 (% of national avg)"
    rightValue="83.7"
    rightLabel="Per capita income, 2023"
    comparisonLabel="THE JOURNEY"
    rightIsDecline
    badge="#SWARAJYA"
    palette={SP}
  />
);

// 30-second reel: 4 templates × 7s each = 840 frames at 30 fps
// Gold whip wipe between segments 1→2, 2→3. Flash punch into segment 4 (the verdict).
const SwarajyaKitReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
    {/* Segment 1: 0–210 — SplitImageStat */}
    <Sequence from={0} durationInFrames={210}>
      <SplitImageStatDemo />
    </Sequence>

    {/* Whip wipe 1→2 (gold bar) */}
    <Sequence from={0} durationInFrames={840}>
      <WhipWipe at={205} color={SP.terracotta} />
    </Sequence>

    {/* Segment 2: 210–420 — FullBleedOverlay */}
    <Sequence from={210} durationInFrames={210}>
      <FullBleedDemo />
    </Sequence>

    {/* Whip wipe 2→3 (red bar) */}
    <Sequence from={0} durationInFrames={840}>
      <WhipWipe at={415} color={SP.mauve} />
    </Sequence>

    {/* Segment 3: 420–630 — SectionMarker */}
    <Sequence from={420} durationInFrames={210}>
      <SectionMarkerDemo />
    </Sequence>

    {/* Flash punch into verdict */}
    <Sequence from={0} durationInFrames={840}>
      <FlashPunch at={625} />
    </Sequence>

    {/* Segment 4: 630–840 — DualStatCompare */}
    <Sequence from={630} durationInFrames={210}>
      <DualStatDemo />
    </Sequence>
  </AbsoluteFill>
);

// ── New templates ────────────────────────────────────────────────

const SplitRevealDemo: React.FC = () => (
  <SplitImageStatReveal
    image="swarajya-sub.png"
    value="27%"
    unit="OF INDIA'S OUTPUT"
    body="West Bengal's share of national industrial production, 1951"
    imageLabel="HOOGHLY BELT"
    imageSublabel="The industrial heart of India"
    categoryLabel="INDUSTRIAL OUTPUT"
    badge="#SWARAJYA"
    revealDirection="both"
    palette={SP}
  />
);

const VerdictDemo: React.FC = () => (
  <VerdictOverlay
    image="swarajya-map.png"
    verdict="It wasn't fate. It was arithmetic."
    attribution="THE BENGAL CURVE"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const StatStripDemo: React.FC = () => (
  <StatStrip
    image="swarajya-intercept.png"
    value="85.6%"
    unit="OF ALL DISRUPTION"
    body="Of every man-day lost nationally — West Bengal alone"
    badge="#SWARAJYA"
    palette={SP}
  />
);

// 49-second reel: 7 templates × 7s = 1470 frames
const SwarajyaFullReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
    <Sequence from={0} durationInFrames={210}><SplitRevealDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><WhipWipe at={205} color={SP.terracotta} /></Sequence>
    <Sequence from={210} durationInFrames={210}><FullBleedDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><WhipWipe at={415} color={SP.mauve} /></Sequence>
    <Sequence from={420} durationInFrames={210}><StatStripDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><FlashPunch at={625} /></Sequence>
    <Sequence from={630} durationInFrames={210}><SectionMarkerDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><WhipWipe at={835} color={SP.terracotta} /></Sequence>
    <Sequence from={840} durationInFrames={210}><DualStatDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><WhipWipe at={1045} color={SP.mauve} /></Sequence>
    <Sequence from={1050} durationInFrames={210}><SplitImageStatDemo /></Sequence>
    <Sequence from={0} durationInFrames={1470}><FlashPunch at={1255} /></Sequence>
    <Sequence from={1260} durationInFrames={210}><VerdictDemo /></Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SplitImageStatDemo" component={SplitImageStatDemo} durationInFrames={FPS * 5} fps={FPS} width={1920} height={1080} />
    <Composition id="FullBleedDemo" component={FullBleedDemo} durationInFrames={FPS * 5} fps={FPS} width={1920} height={1080} />
    <Composition id="SectionMarkerDemo" component={SectionMarkerDemo} durationInFrames={FPS * 5} fps={FPS} width={1920} height={1080} />
    <Composition id="DualStatDemo" component={DualStatDemo} durationInFrames={FPS * 5} fps={FPS} width={1920} height={1080} />
    <Composition id="SwarajyaKitReel" component={SwarajyaKitReel} durationInFrames={840} fps={FPS} width={1920} height={1080} />
    <Composition id="SwarajyaFullReel" component={SwarajyaFullReel} durationInFrames={1470} fps={FPS} width={1920} height={1080} />
  </>
);

registerRoot(RemotionRoot);
