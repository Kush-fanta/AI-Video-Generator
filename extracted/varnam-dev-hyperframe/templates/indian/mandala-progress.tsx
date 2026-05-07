import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { PICHWAI } from "../shared/indian/palettes";
import { ChakraSpinner } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MandalaProgressProps {
  /** Percentage (0-100) */
  percent: number;
  /** Label below */
  label: string;
  /** Optional source */
  source?: string;
  /** Number of concentric rings */
  rings?: number;
  at?: number;
}

/**
 * MandalaProgress — Circular progress indicator styled as a mandala.
 * Concentric rings fill inward like petals. ChakraSpinner at center.
 * PICHWAI palette. Percentage displayed in the middle.
 */
export const MandalaProgress: React.FC<MandalaProgressProps> = ({
  percent,
  label,
  source,
  rings = 5,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const fillProgress = interpolate(frame, [at + 8, at + 55], [0, percent / 100], { ...C, easing: ease });
  const size = 520;
  const cx = size / 2;
  const cy = size / 2;

  const ringColors = [
    PICHWAI.lotusPink,
    PICHWAI.lotusGreen,
    PICHWAI.gold,
    PICHWAI.terracotta,
    PICHWAI.skyBlue,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PICHWAI.darkGround }}>
      {/* Mandala */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: size,
          height: size,
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          {/* Background rings */}
          {Array.from({ length: rings }).map((_, r) => {
            const radius = (size / 2 - 20) * ((rings - r) / rings);
            return (
              <circle
                key={`bg-${r}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={PICHWAI.cream}
                strokeWidth={1}
                opacity={0.08}
              />
            );
          })}

          {/* Filled petal arcs — outer rings fill first */}
          {Array.from({ length: rings }).map((_, r) => {
            const radius = (size / 2 - 20) * ((rings - r) / rings);
            const ringWidth = (size / 2 - 20) / rings;
            const petals = 12 + r * 4;
            const ringFillFrac = interpolate(fillProgress, [r / rings, (r + 1) / rings], [0, 1], C);

            return Array.from({ length: petals }).map((_, p) => {
              const angle = (360 / petals) * p - 90;
              const petalArc = 360 / petals * 0.75;
              const startAngle = (angle * Math.PI) / 180;
              const endAngle = ((angle + petalArc * ringFillFrac) * Math.PI) / 180;

              const x1 = cx + radius * Math.cos(startAngle);
              const y1 = cy + radius * Math.sin(startAngle);
              const x2 = cx + radius * Math.cos(endAngle);
              const y2 = cy + radius * Math.sin(endAngle);

              const largeArc = petalArc * ringFillFrac > 180 ? 1 : 0;

              if (ringFillFrac <= 0) return null;

              return (
                <path
                  key={`ring-${r}-petal-${p}`}
                  d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={ringColors[r % ringColors.length]}
                  strokeWidth={ringWidth * 0.6}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              );
            });
          })}

          {/* Decorative dots at petal tips */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 24;
            const outerR = size / 2 - 15;
            const dotOpacity = interpolate(frame, [at + 12 + i, at + 16 + i], [0, 0.5], C);
            return (
              <circle
                key={`dot-${i}`}
                cx={cx + outerR * Math.cos(angle)}
                cy={cy + outerR * Math.sin(angle)}
                r={3}
                fill={PICHWAI.gold}
                opacity={dotOpacity}
              />
            );
          })}
        </svg>

        {/* ChakraSpinner at center */}
        <ChakraSpinner
          color={PICHWAI.gold}
          size={60}
          rpm={3}
          opacity={0.3}
          at={at + 5}
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Percentage text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            textAlign: "center",
            ...reveal(frame, at + 15),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 88,
              color: PICHWAI.cream,
              lineHeight: 1,
            }}
          >
            {Math.round(fillProgress * 100)}%
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: "50%",
          textAlign: "center",
          ...reveal(frame, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 32,
            color: PICHWAI.cream,
            maxWidth: 700,
            lineHeight: 1.35,
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
            bottom: 50,
            left: "50%",
            ...reveal(frame, at + 45),
            fontFamily: sans,
            fontSize: 18,
            color: PICHWAI.gold,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
