/**
 * Demo — same sealed StatFrame used three ways.
 * Specialist job shrinks to: write eyebrow, values, labels, source.
 * No coordinates, no size, no color, no font. The component owns those.
 *
 *   npx remotion still sample/stat-frame-demo.tsx Words    out/sf-words.png
 *   npx remotion still sample/stat-frame-demo.tsx Numbers  out/sf-numbers.png
 *   npx remotion still sample/stat-frame-demo.tsx Ratio    out/sf-ratio.png
 *   npx remotion still sample/stat-frame-demo.tsx TooLong  out/sf-toolong.png   # fails loudly
 */
import React from "react";
import { Composition, registerRoot } from "remotion";
import { StatFrame } from "./stat-frame";

const W = 1920;
const H = 1080;

const Words: React.FC = () => (
  <StatFrame
    eyebrow="Indigenous fighter capability"
    stats={[
      { value: "Two", label: "Carriers · commissioned" },
      { value: "Zero", label: "Indigenous jets off them" },
    ]}
    source="Ministry of Defence · 2025"
  />
);

const Numbers: React.FC = () => (
  <StatFrame
    eyebrow="Opportunity cost · carrier aviation"
    stats={[
      { value: "₹63,000 cr", label: "Paid to France for 36 Rafale-M" },
      { value: "₹1,800 cr", label: "Tejas Mk2 annual budget" },
    ]}
    source="MoD · 2025"
  />
);

const Ratio: React.FC = () => (
  <StatFrame
    eyebrow="Squadron strength · 2024"
    stats={[
      { value: "42", label: "Sanctioned" },
      { value: "31", label: "Flying" },
    ]}
    source="IISS Military Balance"
  />
);

// Deliberately exceeds label limit (44 chars) to demonstrate loud failure.
// Rendering this should throw, not silently break the frame.
const TooLong: React.FC = () => (
  <StatFrame
    eyebrow="This should fail because the label below is far too long for the frame"
    stats={[
      { value: "42", label: "This label is significantly longer than the StatFrame contract permits" },
      { value: "31", label: "Short" },
    ]}
    source="Contract violation demo"
  />
);

const Root: React.FC = () => (
  <>
    <Composition id="Words"   component={Words}   width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Numbers" component={Numbers} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Ratio"   component={Ratio}   width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="TooLong" component={TooLong} width={W} height={H} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
