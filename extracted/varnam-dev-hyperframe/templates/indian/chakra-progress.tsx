import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { PICHWAI } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ChakraProgressProps extends BaseProps {
  /** Target percentage (0-100) */
  value: number;
  /** Label describing the metric */
  label: string;
  /** Optional suffix (e.g. "%" or "M") */
  suffix?: string;
  /** Optional source */
  source?: string;
  /** Animation start frame */
  at?: number;
}

const PETALS = 12;

/**
 * ChakraProgress — Mandala/lotus progress ring. Petals fill in as progress
 * indicator up to target value. Number counts up with hard snaps.
 * PICHWAI palette — lotus pink, gold, dark ground.
 */
export const ChakraProgress: React.FC<ChakraProgressProps> = ({
  value,
  label,
  suffix = "%",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Progress animation: 0→1 over 50 frames
  const progress = interpolate(frame, [at + 10, at + 60], [0, 1], { ...C, easing: ease });
  const filledPetals = Math.round(progress * PETALS * (value / 100));

  // Number count-up (hard snap — integer steps)
  const displayValue = Math.round(progress * value);

  // Outer ring draw
  const ringDraw = interpolate(frame, [at, at + 30], [0, 1], { ...C, easing: ease });
  const circumference = 2 * Math.PI * 140;

  const size = 340;

  return (
    <AbsoluteFill style={{ backgroundColor: PICHWAI.darkGround }}>
      {/* Mandala lotus ring at center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size,
          height: size,
        }}
      >
        <svg viewBox="0 0 300 300" width={size} height={size}>
          {/* Outer decorative ring */}
          <circle
            cx={150}
            cy={150}
            r={140}
            fill="none"
            stroke={PICHWAI.gold}
            strokeWidth={2}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ringDraw)}
            opacity={0.3}
          />

          {/* Inner ring */}
          <circle
            cx={150}
            cy={150}
            r={130}
            fill="none"
            stroke={PICHWAI.gold}
            strokeWidth={1}
            strokeDasharray={circumference * (130 / 140)}
            strokeDashoffset={circumference * (130 / 140) * (1 - ringDraw)}
            opacity={0.15}
          />

          {/* Lotus petals as progress indicator */}
          {Array.from({ length: PETALS }).map((_, i) => {
            const angle = (360 / PETALS) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const isFilled = i < filledPetals;
            const petalAppear = interpolate(frame, [at + 5, at + 18], [0, 1], C);

            // Petal as ellipse radiating from center
            const cx = 150 + 82 * Math.cos(rad);
            const cy = 150 + 82 * Math.sin(rad);

            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={18}
                ry={30}
                fill={isFilled ? PICHWAI.lotusPink : "none"}
                stroke={isFilled ? PICHWAI.lotusPink : PICHWAI.gold}
                strokeWidth={isFilled ? 0 : 0.8}
                opacity={isFilled ? 0.85 : petalAppear * 0.2}
                transform={`rotate(${angle + 90}, ${cx}, ${cy})`}
              />
            );
          })}

          {/* Center lotus bloom */}
          <circle
            cx={150}
            cy={150}
            r={28}
            fill={PICHWAI.gold}
            opacity={ringDraw * 0.25}
          />
          <circle
            cx={150}
            cy={150}
            r={20}
            fill={PICHWAI.lotusPink}
            opacity={ringDraw * 0.3}
          />
        </svg>

        {/* Number overlay at center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1,
              color: PICHWAI.cream,
              letterSpacing: "-0.03em",
            }}
          >
            {displayValue}
            <span style={{ fontSize: 36 }}>{suffix}</span>
          </div>
        </div>
      </div>

      {/* Label below */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: "50%",
          textAlign: "center",
          ...reveal(frame, at + 40),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            color: PICHWAI.cream,
            fontWeight: 500,
            maxWidth: 500,
            opacity: 0.8,
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
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 55),
            fontFamily: sans,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: PICHWAI.cream,
            textTransform: "uppercase",
            opacity: 0.5,
            zIndex: 3,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
