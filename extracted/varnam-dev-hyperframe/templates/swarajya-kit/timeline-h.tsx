/**
 * TimelineH — Horizontal timeline. SVG line draws left-to-right,
 * dots pop in staggered, labels below, dates above.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface TimelineHProps {
  events: Array<{ date: string; label: string; active?: boolean }>;
  durationInFrames: number;
}

const LINE_W = 1600;
const LINE_Y = 80;
const DOT_R = 10;
const LINE_START = 12;
const LINE_END = 32;
const DOT_BASE = 32;
const DOT_STAGGER = 6;

export const TimelineH: React.FC<TimelineHProps> = ({
  events,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = events.slice(0, 6);
  const lineProgress = interpolate(frame, [LINE_START, LINE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drawnLineW = LINE_W * lineProgress;

  const PAD = 80;
  const spacing = (LINE_W - PAD * 2) / Math.max(sliced.length - 1, 1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={LINE_W}
        height={260}
        style={{ overflow: "visible" }}
      >
        {/* Horizontal line */}
        <line
          x1={PAD}
          y1={LINE_Y}
          x2={PAD + drawnLineW - PAD * 2 * lineProgress}
          y2={LINE_Y}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
        />

        {sliced.map((evt, i) => {
          const x = PAD + i * spacing;
          const dotOpacity = fadeIn(frame, DOT_BASE + i * DOT_STAGGER, 8);
          const dotColor = evt.active ? SK.accent.red : "rgba(255,255,255,0.6)";

          return (
            <g key={i} opacity={dotOpacity}>
              {/* Dot */}
              <circle
                cx={x}
                cy={LINE_Y}
                r={DOT_R}
                fill={dotColor}
              />
              {/* Date above */}
              <text
                x={x}
                y={LINE_Y - 24}
                textAnchor="middle"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.medium}
                fontSize={SK.size.label}
                fill={SK.text.mute}
              >
                {evt.date}
              </text>
              {/* Label below */}
              <text
                x={x}
                y={LINE_Y + 38}
                textAnchor="middle"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.medium}
                fontSize={22}
                fill={evt.active ? SK.text.white : SK.text.mute}
              >
                {evt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default TimelineH;

export const demo = {
  compositionId: "sk-timeline-h",
  durationInFrames: 150,
  props: {
    events: [
      { date: "1984", label: "ISRO founded" },
      { date: "1998", label: "Pokhran-II" },
      { date: "2008", label: "Chandrayaan-1" },
      { date: "2023", label: "Moon landing", active: true },
    ],
    durationInFrames: 150,
  },
};
