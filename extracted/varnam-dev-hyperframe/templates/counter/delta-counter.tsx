import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DeltaCounterProps extends BaseProps {
  delta: string;
  direction: "up" | "down";
  before: string;
  after: string;
  label: string;
  source?: string;
  at?: number;
}

export const DeltaCounter: React.FC<DeltaCounterProps> = ({
  delta,
  direction,
  before,
  after,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const isUp = direction === "up";
  const deltaColor = isUp ? P.sage : P.mauve;

  /* ── old value: visible early, then dims + strikethrough ── */
  const oldReveal = reveal(frame, at + 4);
  const dimProgress = interpolate(frame, [at + 40, at + 56], [0, 1], C);
  const oldOpacity = Math.max(0.25, 1 - dimProgress * 0.75);
  const strikeW = interpolate(frame, [at + 44, at + 60], [0, 100], C);

  /* ── new value: appears after old dims ── */
  const newSpring = spring({
    frame: Math.max(0, frame - at - 50),
    fps: FPS,
    config: { damping: 13, stiffness: 90, mass: 0.9 },
  });
  const newOpacity = interpolate(newSpring, [0, 1], [0, 1], C);
  const newY = interpolate(newSpring, [0, 1], [24, 0], C);
  const newScale = overshootScale(frame, at + 68);

  /* ── delta badge ── */
  const badgeSpring = spring({
    frame: Math.max(0, frame - at - 62),
    fps: FPS,
    config: { damping: 11, stiffness: 120, mass: 0.7 },
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.6, 1], C);
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1], C);

  /* ── connecting line between old and new ── */
  const connectorH = lineGrow(frame, at + 42, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 520,
        }}
      >
        {/* Old value */}
        <div style={{ opacity: oldOpacity * (oldReveal.opacity as number) }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 10,
            }}
          >
            Previous
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                fontFamily: serif,
                fontSize: 140,
                lineHeight: 0.9,
                color: P.text,
                letterSpacing: "-0.03em",
              }}
            >
              {before}
            </span>
            {/* Strikethrough line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "52%",
                width: `${strikeW}%`,
                height: 3,
                backgroundColor: P.muted,
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* Vertical connector */}
        <div
          style={{
            width: 1.5,
            height: connectorH * 0.6,
            backgroundColor: P.light,
            marginLeft: 20,
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        {/* New value */}
        <div
          style={{
            opacity: newOpacity,
            transform: `translateY(${newY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 10,
            }}
          >
            Current
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 28,
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 200,
                lineHeight: 0.88,
                color: P.terracotta,
                letterSpacing: "-0.04em",
                transform: `scale(${newScale})`,
                transformOrigin: "left bottom",
                display: "inline-block",
              }}
            >
              {after}
            </span>

            {/* Delta badge */}
            <div
              style={{
                opacity: badgeOpacity,
                transform: `scale(${badgeScale})`,
                transformOrigin: "left center",
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: `${deltaColor}18`,
                padding: "10px 22px",
                borderRadius: 6,
                borderLeft: `3px solid ${deltaColor}`,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 20 20">
                <path
                  d={isUp ? "M10 3 L17 13 H3 Z" : "M10 17 L17 7 H3 Z"}
                  fill={deltaColor}
                />
              </svg>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 36,
                  fontWeight: 700,
                  color: deltaColor,
                  lineHeight: 1,
                }}
              >
                {delta}
              </span>
            </div>
          </div>
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: lineGrow(frame, at + 72, 24) * 1.4,
            maxWidth: 140,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 40,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 76),
            fontFamily: sans,
            fontSize: 30,
            color: P.sub,
            marginTop: 22,
            lineHeight: 1.4,
            maxWidth: 620,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 88),
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: P.muted,
              marginTop: 48,
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
  compositionId: "counter-delta-counter",
  props: {
    "delta": "+34%",
    "direction": "up",
    "before": "12.4M",
    "after": "16.8M",
    "label": "Monthly revenue",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
