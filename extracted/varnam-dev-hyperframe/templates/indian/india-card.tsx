import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, ease } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { JaliPattern } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface IndiaCardProps {
  /** The key stat value, e.g. "$3.94T" */
  stat: string;
  /** Stat label */
  statLabel: string;
  /** Optional supporting line */
  body?: string;
  /** Source attribution */
  source?: string;
  at?: number;
}

/**
 * IndiaCard — Heritage data card with jali lattice as background watermark.
 * Key stat in MUGHAL.deepRed. Gold accent. The lattice IS the identity.
 */
export const IndiaCard: React.FC<IndiaCardProps> = ({
  stat,
  statLabel,
  body,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const accentWidth = lineGrow(frame, at + 16, 30);
  const statScale = overshootScale(frame, at + 6);

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.ivory }}>
      {/* Jali lattice watermark — the identity element */}
      <JaliPattern color={MUGHAL.gold} opacity={0.1} rows={6} cols={8} at={at} />

      {/* Secondary jali — larger, offset, deeper background layer */}
      <JaliPattern
        color={MUGHAL.jade}
        opacity={0.04}
        rows={4}
        cols={5}
        at={at + 10}
        style={{ transform: "translate(8%, 8%)" }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 140,
          transform: "translateY(-55%)",
          maxWidth: 900,
        }}
      >
        {/* Stat */}
        <div
          style={{
            ...reveal(frame, at + 4),
            fontFamily: serif,
            fontSize: 240,
            color: MUGHAL.deepRed,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            transform: `scale(${statScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {stat}
        </div>

        {/* Gold accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 280,
            height: 4,
            backgroundColor: MUGHAL.gold,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 38,
            color: MUGHAL.onyx,
            marginTop: 24,
            lineHeight: 1.35,
            fontWeight: 600,
          }}
        >
          {statLabel}
        </div>

        {/* Body */}
        {body && (
          <div
            style={{
              ...reveal(frame, at + 26),
              fontFamily: sans,
              fontSize: 26,
              color: P.sub,
              marginTop: 16,
              maxWidth: 650,
              lineHeight: 1.45,
            }}
          >
            {body}
          </div>
        )}

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 36),
              fontFamily: sans,
              fontSize: 18,
              color: P.muted,
              marginTop: 48,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
