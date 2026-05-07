import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface OdometerProps extends BaseProps {
  /** Target number to roll to (digits only, e.g. "1850") */
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  source?: string;
  at?: number;
}

/**
 * Odometer — Digits roll like a mechanical counter. Each digit column
 * spins independently with staggered timing. Stops with a slight bounce.
 * Hard snap landing — digits overshoot then correct.
 */
export const Odometer: React.FC<OdometerProps> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const digits = value.split("");
  const DIGIT_H = 260;
  const ROLL_DUR = 20;

  const accentWidth = lineGrow(frame, at + 40, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Digit row */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Prefix */}
          {prefix && (
            <div
              style={{
                ...reveal(frame, at + 4),
                fontFamily: serif,
                fontSize: 200,
                color: P.muted,
                lineHeight: 1,
                marginRight: 8,
              }}
            >
              {prefix}
            </div>
          )}

          {digits.map((digit, i) => {
            if (digit === "," || digit === ".") {
              return (
                <div
                  key={i}
                  style={{
                    ...reveal(frame, at + 6 + i * 3),
                    fontFamily: serif,
                    fontSize: 240,
                    color: P.text,
                    lineHeight: 1,
                    width: 40,
                    textAlign: "center",
                  }}
                >
                  {digit}
                </div>
              );
            }

            const target = parseInt(digit, 10);
            const digitStart = 6 + i * 4;
            // Roll through numbers: overshoot by 1 then snap back
            const progress = interpolate(
              f,
              [digitStart, digitStart + ROLL_DUR],
              [0, 1],
              C,
            );
            // Overshoot: go past target by ~1 digit, then bounce back
            const overshoot = interpolate(
              f,
              [digitStart + ROLL_DUR, digitStart + ROLL_DUR + 4, digitStart + ROLL_DUR + 8],
              [0, -1.2, 0],
              C,
            );

            // Current display value cycles through digits
            const totalSpin = target + 10; // full rotations + target
            const currentVal = progress * totalSpin;
            const displayDigit = Math.round(currentVal % 10);
            const offsetY = (overshoot * DIGIT_H) / 10;

            const opacity = interpolate(f, [digitStart, digitStart + 3], [0, 1], C);

            return (
              <div
                key={i}
                style={{
                  width: 140,
                  height: DIGIT_H,
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: 8,
                  backgroundColor: f > digitStart ? P.dark : "transparent",
                  marginLeft: i > 0 ? 6 : 0,
                  opacity,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) translateY(${offsetY}px)`,
                    fontFamily: serif,
                    fontSize: 240,
                    lineHeight: 1,
                    color: P.bg,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {progress >= 1 ? target : displayDigit}
                </div>
              </div>
            );
          })}

          {/* Suffix */}
          {suffix && (
            <div
              style={{
                ...reveal(frame, at + 6 + digits.length * 4),
                fontFamily: serif,
                fontSize: 200,
                color: P.muted,
                lineHeight: 1,
                marginLeft: 8,
              }}
            >
              {suffix}
            </div>
          )}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 320,
            height: 4,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 38),
            fontFamily: sans,
            fontSize: 36,
            color: P.sub,
            marginTop: 24,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 48),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 40,
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
export const demo = {
  compositionId: "dataviz-odometer",
  props: {
    "value": "1850",
    "label": "Orders processed",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
