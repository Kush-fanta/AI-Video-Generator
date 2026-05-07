import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CountdownHeroProps extends BaseProps {
  from: number;
  statement: string;
  label?: string;
  at?: number;
  palette?: Partial<typeof P>;
}

/** Frames per countdown number */
const BEAT = 24;

/**
 * CountdownHero — Large countdown number (serif 300px+) that counts down
 * from N to 0. Each number change has overshoot scale. At 0, the number is
 * replaced by a terracotta statement. Urgency builds with a pulsing
 * background that gets more intense as numbers decrease.
 */
export const CountdownHero: React.FC<CountdownHeroProps> = ({
  from,
  statement,
  label,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const t = frame - at;

  // Current countdown value
  const countIndex = Math.floor(t / BEAT);
  const currentNumber = Math.max(0, from - countIndex);
  const isFinished = currentNumber === 0;
  const beatT = t % BEAT; // frames into current beat

  // How far through the countdown (0 = start, 1 = done)
  const urgency = Math.min(1, countIndex / from);

  // Overshoot scale on each number change
  const numberScale = beatT < 14
    ? interpolate(beatT, [0, 3, 7, 14], [1.15, 0.96, 1.03, 1.0], C)
    : 1.0;

  // Number opacity — snap in
  const numberOpacity = interpolate(beatT, [0, 2], [0, 1], C);

  // Pulsing background — gets more intense as countdown progresses
  const pulseRate = 0.08 + urgency * 0.12; // faster as we approach zero
  const pulseIntensity = 0.02 + urgency * 0.06;
  const bgPulse = isFinished
    ? 0
    : Math.sin(t * pulseRate) * pulseIntensity;

  // Background darkens slightly with urgency
  const bgDarken = interpolate(urgency, [0, 1], [0, 0.15], C);

  // Statement entrance — spring slam when countdown hits 0
  const statementAt = from * BEAT;
  const stT = t - statementAt;
  const statementSpring = stT >= 0
    ? spring({
        frame: stT,
        fps: FPS,
        config: { damping: 8, mass: 1.3, stiffness: 90 },
      })
    : 0;
  const statementOpacity = interpolate(stT, [0, 4], [0, 1], C);
  const statementScale = interpolate(statementSpring, [0, 1], [1.4, 1.0], C);

  // Flash on final reveal
  const finalFlash = stT >= 0 && stT <= 10
    ? interpolate(stT, [0, 3, 10], [0, 0.15, 0], C)
    : 0;

  // Label
  const labelReveal = reveal(frame, at + statementAt + 20, 14);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.bg,
      }}
    >
      {/* Dark urgency overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: pal.dark,
          opacity: bgDarken + bgPulse,
          pointerEvents: "none",
        }}
      />

      {/* Terracotta flash on final */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: pal.terracotta,
          opacity: finalFlash,
          pointerEvents: "none",
        }}
      />

      {/* Ghost number — massive background */}
      {!isFinished && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: serif,
            fontSize: 900,
            lineHeight: 0.8,
            color: pal.dark,
            opacity: 0.04 + urgency * 0.02,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {currentNumber}
        </div>
      )}

      {/* Countdown number or statement */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        {!isFinished ? (
          /* Active countdown number */
          <div
            style={{
              fontFamily: serif,
              fontSize: 320,
              lineHeight: 0.85,
              color: pal.text,
              letterSpacing: "-0.04em",
              opacity: numberOpacity,
              transform: `scale(${numberScale})`,
              transformOrigin: "center center",
            }}
          >
            {currentNumber}
          </div>
        ) : (
          /* Final statement */
          <>
            <div
              style={{
                fontFamily: serif,
                fontSize: 88,
                lineHeight: 1.1,
                color: pal.terracotta,
                letterSpacing: "-0.03em",
                textAlign: "center",
                opacity: statementOpacity,
                transform: `scale(${statementScale})`,
                transformOrigin: "center center",
                maxWidth: 880,
              }}
            >
              {statement}
            </div>

            {/* Terracotta accent below statement */}
            <div
              style={{
                width: `${lineGrow(frame, at + statementAt + 8, 18)}%`,
                maxWidth: 100,
                height: 3,
                backgroundColor: pal.terracotta,
                borderRadius: 2,
                marginTop: 36,
              }}
            />

            {/* Label */}
            {label && (
              <div
                style={{
                  ...labelReveal,
                  fontFamily: sans,
                  fontSize: 28,
                  fontWeight: 500,
                  color: pal.sub,
                  marginTop: 24,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                }}
              >
                {label}
              </div>
            )}
          </>
        )}
      </div>

      {/* Progress dots — shows countdown position */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          display: "flex",
          gap: 12,
          ...reveal(frame, at + 4),
          transform: "translateX(-50%)",
        }}
      >
        {Array.from({ length: from }, (_, i) => {
          const isPast = i < countIndex;
          const isCurrent = i === countIndex && !isFinished;
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: isPast || isCurrent ? pal.terracotta : pal.light,
                opacity: isPast ? 0.4 : isCurrent ? 1 : 0.5,
                transform: isCurrent ? "scale(1.3)" : "scale(1)",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-countdown-hero",
  props: {
    from: 5,
    statement: "India crosses $100B",
    label: "GCC Milestone",
    at: 15,
  },
  durationInFrames: 180,
};
