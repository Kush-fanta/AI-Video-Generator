import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CountdownTimerProps extends BaseProps {
  seconds: number;
  label: string;
  urgencyAt?: number;
  at?: number;
}

/** Format seconds as MM:SS */
const fmt = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/**
 * CountdownTimer — Large circular timer display.
 * Ring depletes as time runs out. Terracotta when urgent.
 * Spring bounce on number changes.
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  label,
  urgencyAt = 10,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Entrance spring for ring
  const entranceProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 60, mass: 1.0 },
  });

  // Countdown: 1 second = 30 frames. Starts after entrance (~20f)
  const countdownStart = 20;
  const elapsedFrames = Math.max(0, f - countdownStart);
  const elapsedSeconds = Math.floor(elapsedFrames / FPS);
  const remaining = Math.max(0, seconds - elapsedSeconds);
  const ratio = seconds > 0 ? remaining / seconds : 0;

  // Is urgent?
  const isUrgent = remaining <= urgencyAt && remaining > 0;

  // Ring color
  const ringColor = isUrgent ? P.terracotta : P.sage;

  // Ring geometry
  const cx = 540;
  const cy = 860;
  const r = 320;
  const strokeW = 28;
  const circumference = 2 * Math.PI * r;

  // Ring depletion: starts full, shrinks to 0
  const ringProgress = f < countdownStart ? entranceProgress : ratio;
  const offset = circumference * (1 - ringProgress);

  // Pulse when urgent (every second)
  const pulseScale = isUrgent
    ? 1 + 0.02 * Math.sin((elapsedFrames % FPS) * (Math.PI / FPS) * 2)
    : 1;

  // Number bounce on each second change
  const subFrame = elapsedFrames % FPS;
  const numberBounce = subFrame < 6
    ? spring({
        frame: subFrame,
        fps: FPS,
        config: { damping: 8, stiffness: 200, mass: 0.4 },
      })
    : 1;
  const numberScale = f < countdownStart
    ? spring({ frame: f, fps: FPS, config: { damping: 10, stiffness: 80, mass: 0.8 } })
    : 0.92 + 0.08 * numberBounce;

  // Tick marks every 5 seconds
  const totalTicks = Math.min(seconds, 60);
  const tickInterval = totalTicks > 30 ? 5 : totalTicks > 12 ? 2 : 1;
  const ticks = Array.from({ length: Math.floor(totalTicks / tickInterval) + 1 }).map(
    (_, i) => i * tickInterval,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={P.light}
          strokeWidth={strokeW}
          opacity={0.5}
        />

        {/* Depleting ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity={entranceProgress}
        />

        {/* Tick marks around the outside */}
        {ticks.map((tick) => {
          const frac = tick / seconds;
          const angle = -90 + frac * 360;
          const rad = (angle * Math.PI) / 180;
          const isMajor = tick % (tickInterval * 5) === 0 || tick === 0;
          const inner = r + strokeW / 2 + 6;
          const outer = inner + (isMajor ? 18 : 10);
          return (
            <line
              key={tick}
              x1={cx + inner * Math.cos(rad)}
              y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)}
              y2={cy + outer * Math.sin(rad)}
              stroke={P.muted}
              strokeWidth={isMajor ? 3 : 1.5}
              opacity={0.5 * entranceProgress}
            />
          );
        })}
      </svg>

      {/* Time display */}
      <div
        style={{
          position: "absolute",
          top: cy - 80,
          left: 0,
          width: 1080,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 200,
            color: isUrgent ? P.terracotta : P.text,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            transform: `scale(${numberScale * pulseScale})`,
            opacity: interpolate(f, [0, 8], [0, 1], C),
          }}
        >
          {f < countdownStart ? fmt(seconds) : fmt(remaining)}
        </div>
      </div>

      {/* "seconds remaining" subtext inside ring */}
      <div
        style={{
          position: "absolute",
          top: cy + 100,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 10),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            color: P.muted,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {remaining === 1 ? "second left" : "seconds left"}
        </div>
      </div>

      {/* Label below ring */}
      <div
        style={{
          position: "absolute",
          top: cy + r + strokeW / 2 + 60,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 48,
            color: P.sub,
            lineHeight: 1.3,
            fontWeight: 600,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Urgency flash overlay */}
      {isUrgent && remaining > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: P.terracotta,
            opacity: 0.03 + 0.02 * Math.sin((elapsedFrames % FPS) * 0.4),
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-countdown-timer",
  props: {
    seconds: 47,
    label: "Average UPI Transaction Time",
    at: 15,
  },
  durationInFrames: 180,
};
