import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface RedlineBoxProps extends BaseProps {
  /** Left edge x of the boxed region */
  x: number;
  /** Top edge y of the boxed region */
  y: number;
  /** Width of the box */
  width?: number;
  /** Height of the box */
  height?: number;
  /** Optional label below the box */
  label?: string;
  /** Optional inline label inside top edge of box */
  inlineLabel?: string;
  /** Whether to show the inner glow fill (opt-in) */
  showGlow?: boolean;
  /** Frame offset */
  at?: number;
}

/**
 * RedlineBox — Terracotta rectangle draws around a frame region.
 * Two-pass draw animation. 18px corner tick marks (investigative style).
 * Inner glow is opt-in via showGlow prop (default off).
 * Optional inlineLabel inside top-left of box. Optional label below.
 */
export const RedlineBox: React.FC<RedlineBoxProps> = ({
  x,
  y,
  width = 400,
  height = 250,
  label,
  inlineLabel,
  showGlow = false,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Pass 1: top + bottom edges (0-18f)
  const hProgress = interpolate(f, [0, 18], [0, 1], C);
  // Pass 2: left + right edges (14-30f)
  const vProgress = interpolate(f, [14, 30], [0, 1], C);

  // Small corner offsets for hand-drawn feel
  const offsets = [
    { x: -2, y: 1 },   // top-left
    { x: 3, y: -1 },   // top-right
    { x: -1, y: -2 },  // bottom-left
    { x: 2, y: 1 },    // bottom-right
  ];

  const tl = { x: x + offsets[0].x, y: y + offsets[0].y };
  const tr = { x: x + width + offsets[1].x, y: y + offsets[1].y };
  const bl = { x: x + offsets[2].x, y: y + height + offsets[2].y };
  const br = { x: x + width + offsets[3].x, y: y + height + offsets[3].y };

  const topEndX = tl.x + (tr.x - tl.x) * hProgress;
  const topEndY = tl.y + (tr.y - tl.y) * hProgress;
  const botEndX = bl.x + (br.x - bl.x) * hProgress;
  const botEndY = bl.y + (br.y - bl.y) * hProgress;
  const leftEndX = tl.x + (bl.x - tl.x) * vProgress;
  const leftEndY = tl.y + (bl.y - tl.y) * vProgress;
  const rightEndX = tr.x + (br.x - tr.x) * vProgress;
  const rightEndY = tr.y + (br.y - tr.y) * vProgress;

  // Inner glow (only when showGlow is true)
  const glowActive = showGlow && f > 32;
  const glowPhase = Math.max(0, f - 32);
  const glowOpacity = glowActive
    ? 0.06 + 0.04 * Math.sin(glowPhase * 0.12)
    : 0;

  // Label animations
  const labelOpacity = interpolate(f, [34, 44], [0, 1], C);
  const labelSpring = spring({
    frame: Math.max(0, f - 34),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  // Inline label appears with tick marks
  const inlineLabelOpacity = interpolate(f, [28, 36], [0, 1], C);

  // Corner tick marks — 18px perpendicular accents
  const tickLen = 18;
  const tickOpacity = interpolate(f, [28, 34], [0, 0.6], C);

  return (
    <AbsoluteFill>
      {/* Inner glow fill — opt-in only */}
      {glowActive && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width,
            height,
            backgroundColor: P.terracotta,
            opacity: glowOpacity,
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Inline label — inside top edge */}
      {inlineLabel && inlineLabelOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: x + 8,
            top: y + 8,
            opacity: inlineLabelOpacity,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              color: P.slate,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            {inlineLabel}
          </div>
        </div>
      )}

      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Pass 1: Top edge */}
        <line
          x1={tl.x} y1={tl.y}
          x2={topEndX} y2={topEndY}
          stroke={P.terracotta}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Pass 1: Bottom edge */}
        <line
          x1={bl.x} y1={bl.y}
          x2={botEndX} y2={botEndY}
          stroke={P.terracotta}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Pass 2: Left edge */}
        {vProgress > 0 && (
          <line
            x1={tl.x} y1={tl.y}
            x2={leftEndX} y2={leftEndY}
            stroke={P.terracotta}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Pass 2: Right edge */}
        {vProgress > 0 && (
          <line
            x1={tr.x} y1={tr.y}
            x2={rightEndX} y2={rightEndY}
            stroke={P.terracotta}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Corner tick marks — 18px perpendicular accents */}
        {tickOpacity > 0 && (
          <g opacity={tickOpacity}>
            {/* TL */}
            <line x1={tl.x - tickLen} y1={tl.y} x2={tl.x + tickLen} y2={tl.y}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />
            <line x1={tl.x} y1={tl.y - tickLen} x2={tl.x} y2={tl.y + tickLen}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />

            {/* TR */}
            <line x1={tr.x - tickLen} y1={tr.y} x2={tr.x + tickLen} y2={tr.y}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />
            <line x1={tr.x} y1={tr.y - tickLen} x2={tr.x} y2={tr.y + tickLen}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />

            {/* BL */}
            <line x1={bl.x - tickLen} y1={bl.y} x2={bl.x + tickLen} y2={bl.y}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />
            <line x1={bl.x} y1={bl.y - tickLen} x2={bl.x} y2={bl.y + tickLen}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />

            {/* BR */}
            <line x1={br.x - tickLen} y1={br.y} x2={br.x + tickLen} y2={br.y}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />
            <line x1={br.x} y1={br.y - tickLen} x2={br.x} y2={br.y + tickLen}
              stroke={P.terracotta} strokeWidth={1} strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Label below box */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y + height + 16,
            width,
            textAlign: "center",
            opacity: labelOpacity,
            transform: `translateY(${(1 - labelSpring) * 8}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              color: P.terracotta,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-redline-box",
  props: {
    x: 520,
    y: 260,
    width: 460,
    height: 260,
    label: "Needs review",
    inlineLabel: "Draft note",
    showGlow: true
  },
  durationInFrames: 180,
};
