import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface FactBoxProps extends BaseProps {
  stat: string;
  label: string;
  detail?: string;
  at?: number;
}

/**
 * FactBox — Lower-third stat callout. Dark bg, cream text.
 * Terracotta left border accent (4px). Slides in from bottom.
 * Portrait 1080x1920 canvas.
 */
export const FactBox: React.FC<FactBoxProps> = ({
  stat,
  label,
  detail,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* ── slide in from bottom ── */
  const entrySpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const slideY = interpolate(entrySpring, [0, 1], [120, 0], C);
  const opacity = interpolate(entrySpring, [0, 1], [0, 1], C);

  /* ── terracotta border reveal ── */
  const borderHeight = interpolate(f, [8, 30], [0, 100], C);

  /* ── stat number staggers in slightly after box ── */
  const statOpacity = interpolate(f, [10, 20], [0, 1], C);
  const statY = interpolate(f, [10, 22], [10, 0], C);

  /* ── label staggers after stat ── */
  const labelOpacity = interpolate(f, [16, 26], [0, 1], C);

  /* ── detail last ── */
  const detailOpacity = interpolate(f, [22, 32], [0, 1], C);

  /* ── exit: fade out ── */
  const exitOpacity = interpolate(frame, [at + 130, at + 150], [1, 0], C);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 80,
        right: 80,
        zIndex: 80,
        transform: `translateY(${slideY}px)`,
        opacity: opacity * exitOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          backgroundColor: P.dark,
          borderRadius: 10,
          overflow: "hidden",
          minHeight: 160,
        }}
      >
        {/* Terracotta left border */}
        <div
          style={{
            width: 4,
            flexShrink: 0,
            background: `linear-gradient(to bottom, ${P.terracotta} ${borderHeight}%, transparent ${borderHeight}%)`,
            borderRadius: "10px 0 0 10px",
          }}
        />

        {/* Content */}
        <div style={{ padding: "28px 36px 24px", flex: 1 }}>
          {/* Stat number */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              lineHeight: 1,
              color: P.bg,
              letterSpacing: "-0.03em",
              opacity: statOpacity,
              transform: `translateY(${statY}px)`,
            }}
          >
            {stat}
          </div>

          {/* Label */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 600,
              color: P.light,
              marginTop: 10,
              lineHeight: 1.35,
              letterSpacing: "0.02em",
              opacity: labelOpacity,
            }}
          >
            {label}
          </div>

          {/* Detail */}
          {detail && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 400,
                color: P.muted,
                marginTop: 8,
                lineHeight: 1.4,
                opacity: detailOpacity,
              }}
            >
              {detail}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const demo = {
  compositionId: "lower-fact-box",
  props: {
    stat: "18%",
    label: "Lift after the rewrite",
    detail: "The shorter sequence outperformed the longer cut."
  },
  durationInFrames: 180,
};
