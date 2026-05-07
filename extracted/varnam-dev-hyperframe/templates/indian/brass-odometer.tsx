import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease, FPS } from "../shared/primitives";
import { TEMPLE } from "../shared/indian/palettes";
import { JaliPattern } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BrassOdometerProps {
  /** The target number to display, e.g. "142857" */
  value: string;
  /** Label below the counter */
  label: string;
  /** Optional source attribution */
  source?: string;
  /** Start frame offset */
  at?: number;
}

/**
 * BrassOdometer — Mechanical counter styled as a brass/copper display.
 * TEMPLE.brass digit tiles with patina gradient. Numbers roll with hard snap stops.
 * Ornate JaliPattern border frame.
 */
export const BrassOdometer: React.FC<BrassOdometerProps> = ({
  value,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const digits = value.split("");

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.charcoal }}>
      {/* Ornate border */}
      <JaliPattern color={TEMPLE.brass} opacity={0.1} rows={4} cols={6} at={at} />

      {/* Top decorative bar */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [at, at + 20], [0, 600], { ...C, easing: ease }),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${TEMPLE.brass}, transparent)`,
        }}
      />

      {/* Digit tiles */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          display: "flex",
          gap: 12,
        }}
      >
        {digits.map((digit, i) => {
          const isNumeric = /\d/.test(digit);
          // Each digit snaps at staggered times — hard snap, no easing
          const digitDelay = at + 8 + i * 6;
          const targetNum = isNumeric ? parseInt(digit) : 0;

          // Roll through numbers with hard snaps
          const rollProgress = interpolate(frame, [digitDelay, digitDelay + 25], [0, 1], C);
          // Quantize to create hard snap stops
          const currentNum = isNumeric
            ? Math.min(targetNum, Math.floor(rollProgress * (targetNum + 1)))
            : digit;

          const tileOpacity = interpolate(frame, [digitDelay - 4, digitDelay], [0, 1], C);

          return (
            <div
              key={i}
              style={{
                width: isNumeric ? 110 : 40,
                height: 160,
                borderRadius: 8,
                background: isNumeric
                  ? `linear-gradient(180deg, ${TEMPLE.brass} 0%, #8B6914 40%, ${TEMPLE.brass} 60%, #A07828 100%)`
                  : "transparent",
                boxShadow: isNumeric
                  ? `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.5)`
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: tileOpacity,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Patina texture overlay */}
              {isNumeric && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                 radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)`,
                    pointerEvents: "none",
                  }}
                />
              )}
              {/* Horizontal score line */}
              {isNumeric && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 4,
                    right: 4,
                    height: 1,
                    backgroundColor: "rgba(0,0,0,0.25)",
                  }}
                />
              )}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: isNumeric ? 120 : 80,
                  fontWeight: 400,
                  color: TEMPLE.charcoal,
                  textShadow: isNumeric
                    ? "0 1px 0 rgba(255,255,255,0.4)"
                    : "none",
                  lineHeight: 1,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {currentNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: "50%",
          ...reveal(frame, at + 30),
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 36,
            color: TEMPLE.offWhite,
            textAlign: "center",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            ...reveal(frame, at + 40),
            fontFamily: sans,
            fontSize: 18,
            color: TEMPLE.sandalwood,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Bottom decorative bar */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [at + 5, at + 25], [0, 400], { ...C, easing: ease }),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${TEMPLE.brass}80, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
