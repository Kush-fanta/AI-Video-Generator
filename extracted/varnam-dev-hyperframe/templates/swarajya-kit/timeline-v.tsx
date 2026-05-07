/**
 * TimelineV — Vertical timeline. Red left line, dots per row.
 * Date left of line (mute), label right of line (white).
 * Rows fade in staggered.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SK } from "./_tokens";
import { fadeEnvelope, fadeIn } from "./_anim";

loadInter();

export interface TimelineVProps {
  events: Array<{ date: string; label: string; active?: boolean }>;
  durationInFrames: number;
}

const ROW_H = 90;
const STAGGER = 10;
const APPEAR_START = 12;
const LINE_X = 200;
const DOT_R = 10;

export const TimelineV: React.FC<TimelineVProps> = ({
  events,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);

  const sliced = events.slice(0, 8);
  const totalH = sliced.length * ROW_H;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SK.bg.navy,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: SK.safe.sideMargin,
        paddingRight: SK.safe.sideMargin,
      }}
    >
      <svg
        width={SK.safe.columnWidth}
        height={totalH + 20}
        style={{ overflow: "visible" }}
      >
        {/* Vertical red line */}
        <line
          x1={LINE_X}
          y1={0}
          x2={LINE_X}
          y2={totalH}
          stroke={SK.accent.red}
          strokeWidth={3}
        />

        {sliced.map((evt, i) => {
          const rowOpacity = fadeIn(frame, APPEAR_START + i * STAGGER, SK.motion.fadeFrames);
          const cy = i * ROW_H + ROW_H / 2;
          const dotColor = evt.active ? SK.accent.red : "rgba(255,255,255,0.7)";

          return (
            <g key={i} opacity={rowOpacity}>
              {/* Dot on line */}
              <circle cx={LINE_X} cy={cy} r={DOT_R} fill={dotColor} />
              {/* Date — left of line */}
              <text
                x={LINE_X - 24}
                y={cy + 6}
                textAnchor="end"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.medium}
                fontSize={22}
                fill={SK.text.mute}
              >
                {evt.date}
              </text>
              {/* Label — right of line */}
              <text
                x={LINE_X + 24}
                y={cy + 6}
                textAnchor="start"
                fontFamily={SK.font.sans}
                fontWeight={SK.weight.bold}
                fontSize={SK.size.body}
                fill={evt.active ? SK.text.white : "rgba(255,255,255,0.85)"}
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

export default TimelineV;

export const demo = {
  compositionId: "sk-timeline-v",
  durationInFrames: 150,
  props: {
    events: [
      { date: "1947", label: "Independence — defence inherited" },
      { date: "1962", label: "Sino-Indian War" },
      { date: "1971", label: "Liberation of Bangladesh" },
      { date: "1998", label: "Pokhran nuclear tests" },
      { date: "2023", label: "Chandrayaan-3 moon landing", active: true },
    ],
    durationInFrames: 150,
  },
};
