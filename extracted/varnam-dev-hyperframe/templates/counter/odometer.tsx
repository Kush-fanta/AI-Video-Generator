import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface OdometerProps extends BaseProps {
  value: number;
  label: string;
  source?: string;
  /** Optional prefix like '$' or '₹' */
  prefix?: string;
  /** Optional suffix like 'M' or 'Cr' */
  suffix?: string;
  at?: number;
}

const DIGIT_HEIGHT = 260;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Odometer — Digit wheels roll up to final number, mechanical odometer style.
 * Each digit column scrolls independently with staggered spring timing.
 * Landing click feel via overshoot. Comma separators between groups.
 */
export const Odometer: React.FC<OdometerProps> = ({
  value,
  label,
  source,
  prefix,
  suffix,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const valueStr = Math.abs(Math.round(value)).toString();
  const digitCount = valueStr.length;

  // Build formatted digits right-to-left, inserting commas every 3 digits
  const formattedDigits: { char: string; isComma: boolean; digitIndex: number }[] = [];
  for (let i = digitCount - 1; i >= 0; i--) {
    const posFromRight = digitCount - 1 - i;
    formattedDigits.unshift({ char: valueStr[i], isComma: false, digitIndex: i });
    if (posFromRight > 0 && posFromRight % 3 === 0 && i > 0) {
      formattedDigits.unshift({ char: ",", isComma: true, digitIndex: -1 });
    }
  }

  const accentWidth = lineGrow(frame, at + 16, 30);

  // No block-level overshoot — the digit springs carry the landing feel on their own

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main content — left-anchored */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          transform: "translateY(-55%)",
          width: 1200,
        }}
      >
        {/* Digit row */}
        <div
          style={{
            ...reveal(frame, at + 4),
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {/* Prefix */}
          {prefix && (
            <div
              style={{
                fontFamily: serif,
                fontSize: 140,
                color: P.muted,
                lineHeight: 1,
                marginRight: 8,
                paddingBottom: 18,
              }}
            >
              {prefix}
            </div>
          )}

          {formattedDigits.map((entry, i) => {
            if (entry.isComma) {
              return (
                <div
                  key={`comma-${i}`}
                  style={{
                    fontFamily: serif,
                    fontSize: DIGIT_HEIGHT * 0.85,
                    lineHeight: 1,
                    color: P.light,
                    width: 40,
                    textAlign: "center",
                    paddingBottom: 4,
                  }}
                >
                  ,
                </div>
              );
            }

            const targetDigit = parseInt(entry.char, 10);
            // Stagger: rightmost digit starts first (feels mechanical)
            const staggerDelay = (digitCount - 1 - entry.digitIndex) * 4;
            const digitAt = at + 8 + staggerDelay;

            // Spring-driven scroll — each digit rolls through all values up to target.
            // High damping + low mass = quick settle with minimal overshoot.
            const scrollSpring = spring({
              frame: Math.max(0, frame - digitAt),
              fps: FPS,
              config: { damping: 38, stiffness: 55, mass: 0.4 },
            });

            // Scroll through full rotations + land on target
            const totalScroll = targetDigit * DIGIT_HEIGHT;
            const currentY = scrollSpring * totalScroll;

            return (
              <div
                key={`digit-${i}`}
                style={{
                  overflow: "hidden",
                  height: DIGIT_HEIGHT,
                  width: Math.round(DIGIT_HEIGHT * 0.65),
                  position: "relative",
                }}
              >
                {/* Top/bottom fade masks */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 40,
                    background: `linear-gradient(to bottom, ${P.bg}, transparent)`,
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 40,
                    background: `linear-gradient(to top, ${P.bg}, transparent)`,
                    zIndex: 2,
                  }}
                />

                <div
                  style={{
                    transform: `translateY(-${currentY}px)`,
                    willChange: "transform",
                  }}
                >
                  {DIGITS.map((d) => (
                    <div
                      key={d}
                      style={{
                        height: DIGIT_HEIGHT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: serif,
                        fontSize: DIGIT_HEIGHT * 0.85,
                        lineHeight: 1,
                        color: d === targetDigit && scrollSpring > 0.95
                          ? P.terracotta
                          : P.text,
                        letterSpacing: "-0.03em",
                        transition: "color 0.1s",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Suffix */}
          {suffix && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 56,
                fontWeight: 500,
                color: P.sub,
                lineHeight: 1,
                marginLeft: 16,
                paddingBottom: 30,
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
            maxWidth: 300,
            height: 4,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 20),
            fontFamily: sans,
            fontSize: 36,
            color: P.sub,
            marginTop: 22,
            lineHeight: 1.35,
            maxWidth: 700,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 30),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 48,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>

      {/* Right panel — thin terracotta accent line */}
      <div
        style={(() => {
          const r = reveal(frame, at + 14);
          return {
            position: "absolute",
            right: 120,
            top: "50%",
            width: 2,
            height: "60%",
            backgroundColor: P.terracotta,
            borderRadius: 1,
            opacity: r.opacity,
            transform: `translateY(-50%) ${r.transform}`,
          };
        })()}
      />
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "counter-odometer",
  props: {
    "value": "1850",
    "label": "Orders processed",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
