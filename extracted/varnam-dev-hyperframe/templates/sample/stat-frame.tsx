/**
 * StatFrame — sealed swarajya primitive.
 *
 * Content in, frame out. No coordinates. No AbsoluteFill at the leaf.
 * Identity (cream/coral/PT Serif/80-40) baked in. Zones solved by flex/grid.
 *
 * Invalid content fails at runtime with a clear message.
 * A specialist cannot produce a broken StatFrame — the API doesn't permit it.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";

const { fontFamily: PT } = loadPTSerif();

const BG = "#F2EDE7";
const CORAL = "#DC7070";
const INK = "#202020";

// Content length contracts. A specialist who exceeds these has written copy
// the frame cannot carry — the fix is the writing, not the layout.
const LIMITS = {
  eyebrow: 48,
  value: 14,
  label: 44,
  source: 60,
};

export type Stat = {
  value: string;
  label: string;
};

export type StatFrameProps = {
  eyebrow?: string;
  stats: [Stat, Stat]; // tuple, exactly two
  source?: string;
};

const check = (s: string | undefined, max: number, name: string) => {
  if (s && s.length > max) {
    throw new Error(
      `[StatFrame] ${name} is ${s.length} chars (max ${max}): "${s}". ` +
        `Rewrite — do not extend the layout.`
    );
  }
};

export const StatFrame: React.FC<StatFrameProps> = ({ eyebrow, stats, source }) => {
  check(eyebrow, LIMITS.eyebrow, "eyebrow");
  check(source, LIMITS.source, "source");
  stats.forEach((s, i) => {
    check(s.value, LIMITS.value, `stats[${i}].value`);
    check(s.label, LIMITS.label, `stats[${i}].label`);
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: PT,
        padding: "120px 120px 80px 120px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* eyebrow row — fixed height, never grows */}
      <div style={eyebrowStyle}>{eyebrow ?? ""}</div>
      <div style={ruleStyle} />

      {/* stats row — occupies the middle, collision-free by grid */}
      <div
        style={{
          flexGrow: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1.5px 1fr",
          alignItems: "center",
          padding: "40px 0",
          minHeight: 0,
        }}
      >
        <Cell stat={stats[0]} />
        <div
          style={{
            background: INK,
            opacity: 0.2,
            height: "55%",
            alignSelf: "center",
          }}
        />
        <Cell stat={stats[1]} />
      </div>

      {/* source row — anchored, never collides */}
      <div style={sourceStyle}>{source ?? ""}</div>
    </AbsoluteFill>
  );
};

const Cell: React.FC<{ stat: Stat }> = ({ stat }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      padding: "0 40px",
      textAlign: "center",
    }}
  >
    <div style={valueStyle}>{stat.value}</div>
    <div style={labelStyle}>{stat.label}</div>
  </div>
);

const eyebrowStyle: React.CSSProperties = {
  fontWeight: 400,
  fontSize: 40,
  letterSpacing: 6,
  textTransform: "uppercase",
  color: INK,
  opacity: 0.5,
  flexShrink: 0,
  lineHeight: 1.2,
};
const ruleStyle: React.CSSProperties = {
  marginTop: 32,
  height: 1,
  background: INK,
  opacity: 0.15,
  flexShrink: 0,
};
const valueStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 80,
  lineHeight: 1,
  color: CORAL,
};
const labelStyle: React.CSSProperties = {
  fontWeight: 400,
  fontSize: 40,
  lineHeight: 1.25,
  color: INK,
  letterSpacing: 2,
  textTransform: "uppercase",
  maxWidth: 640,
};
const sourceStyle: React.CSSProperties = {
  fontWeight: 400,
  fontSize: 28,
  color: INK,
  opacity: 0.5,
  textAlign: "right",
  flexShrink: 0,
};
