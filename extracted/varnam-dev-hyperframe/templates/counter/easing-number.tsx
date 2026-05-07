import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EasingNumberProps extends BaseProps {
  value: number;
  label: string;
  source?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  at?: number;
}

const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const EasingNumber: React.FC<EasingNumberProps> = ({
  value,
  label,
  source,
  prefix,
  suffix,
  decimals = 0,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  /* ── count ── */
  const countDur = 72;
  const countStart = at + 8;
  const progress = interpolate(
    frame,
    [countStart, countStart + countDur],
    [0, 1],
    { ...C, easing: easeOutExpo },
  );
  const cur = progress * value;
  const display =
    decimals > 0 ? cur.toFixed(decimals) : Math.round(cur).toLocaleString();

  /* ── landing pulse ── */
  const landAt = countStart + countDur - 4;
  const numScale = overshootScale(frame, landAt);

  /* ── decorative tick marks along left edge ── */
  const tickCount = 5;
  const tickSpacing = 56;
  const tickBaseY = 640;

  /* ── thin vertical rule ── */
  const ruleHeight = lineGrow(frame, at + 4, 40);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Left vertical rule */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "30%",
          width: 1.5,
          height: `${ruleHeight * 0.4}%`,
          backgroundColor: P.light,
        }}
      />

      {/* Tick marks */}
      {Array.from({ length: tickCount }).map((_, i) => {
        const tickAt = at + 10 + i * 5;
        const tickW = lineGrow(frame, tickAt, 14);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 80,
              top: tickBaseY + i * tickSpacing,
              width: tickW * 0.2,
              height: 1,
              backgroundColor: i === 0 ? P.terracotta : P.muted,
              opacity: i === 0 ? 1 : 0.4,
            }}
          />
        );
      })}

      {/* Main content block */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 720,
        }}
      >
        {/* Prefix on its own line when present */}
        {prefix && (
          <div
            style={{
              ...reveal(frame, at + 4),
              fontFamily: sans,
              fontSize: 48,
              fontWeight: 500,
              color: P.muted,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {prefix}
          </div>
        )}

        {/* Hero number */}
        <div
          style={{
            ...reveal(frame, at + 6),
            transform: `scale(${numScale})`,
            transformOrigin: "left bottom",
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 0.88,
              color: P.dark,
              letterSpacing: "-0.04em",
              display: "block",
            }}
          >
            {display}
          </span>
        </div>

        {/* Suffix */}
        {suffix && (
          <div
            style={{
              ...reveal(frame, at + 10),
              fontFamily: sans,
              fontSize: 52,
              fontWeight: 500,
              color: P.terracotta,
              marginTop: 8,
              letterSpacing: "0.02em",
            }}
          >
            {suffix}
          </div>
        )}

        {/* Terracotta accent bar */}
        <div
          style={{
            width: lineGrow(frame, at + 18, 28) * 1.2,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 36,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 22),
            fontFamily: sans,
            fontSize: 32,
            fontWeight: 400,
            color: P.sub,
            marginTop: 24,
            lineHeight: 1.4,
            maxWidth: 640,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 36),
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: P.muted,
              marginTop: 56,
              textTransform: "uppercase",
            }}
          >
            {source}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "counter-easing-number",
  props: {
    "value": 64,
    "label": "Open rate",
    "suffix": "%",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
