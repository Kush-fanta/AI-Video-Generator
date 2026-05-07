import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import { ScallopedBorder } from "../shared/indian/patterns";
import { RAJASTHAN } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const DIGIT_COLORS = [RAJASTHAN.pink, RAJASTHAN.marigold, RAJASTHAN.emerald, RAJASTHAN.blue, RAJASTHAN.rust];

interface FestivalCounterProps {
  /** Target number to count to (displayed as string for formatting) */
  value: string;
  /** Label below the number */
  label: string;
  /** Optional source */
  source?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Number counter with each digit in a different RAJASTHAN accent color
 * (pink, marigold, emerald). Scalloped border below. Hard snap scale on arrival.
 */
export const FestivalCounter: React.FC<FestivalCounterProps> = ({
  value,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const digits = value.split("");

  return (
    <AbsoluteFill style={{ backgroundColor: RAJASTHAN.white }}>
      {/* Digits */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        {digits.map((char, i) => {
          const isDigit = /\d/.test(char);
          const delay = at + 4 + i * 4;
          const digitScale = interpolate(frame, [delay, delay + 5, delay + 8], [1.4, 0.95, 1], {
            ...C,
            easing: ease,
          });
          const digitOpacity = interpolate(frame, [delay, delay + 4], [0, 1], C);
          const color = isDigit ? DIGIT_COLORS[i % DIGIT_COLORS.length] : RAJASTHAN.blue;

          return (
            <div
              key={i}
              style={{
                fontFamily: serif,
                fontSize: isDigit ? 180 : 120,
                lineHeight: 1,
                color,
                opacity: digitOpacity,
                transform: `scale(${isDigit ? digitScale : 1})`,
                transformOrigin: "center bottom",
                letterSpacing: "-0.02em",
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Scalloped border below number */}
      <ScallopedBorder
        color={RAJASTHAN.marigold}
        opacity={0.3}
        side="bottom"
        at={at + digits.length * 4 + 6}
        scallops={16}
        style={{ bottom: "auto", top: "56%" }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          textAlign: "center",
          ...reveal(frame, at + digits.length * 4 + 10),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            color: RAJASTHAN.blue,
            fontWeight: 500,
            maxWidth: 600,
            lineHeight: 1.4,
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
            left: 100,
            ...reveal(frame, at + 30),
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: RAJASTHAN.rust,
            opacity: 0.5,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
