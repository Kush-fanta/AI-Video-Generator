import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface DebatePoint {
  text: string;
  at: number;
}

export interface SplitScreenDebateProps extends BaseProps {
  /** Left column header */
  leftHeader: string;
  /** Right column header */
  rightHeader: string;
  /** Left column points */
  leftPoints: DebatePoint[];
  /** Right column points */
  rightPoints: DebatePoint[];
  /** Frame offset */
  at?: number;
  /** Left accent color (default mauve) */
  leftColor?: string;
  /** Right accent color (default terracotta) */
  rightColor?: string;
}

/**
 * Left vs right text columns that build simultaneously. Point/counterpoint.
 * Different colors per side. Center divider line grows on entry.
 * Each point enters with a hard snap from its respective side.
 */
export const SplitScreenDebate: React.FC<SplitScreenDebateProps> = ({
  leftHeader,
  rightHeader,
  leftPoints,
  rightPoints,
  at = 0,
  leftColor,
  rightColor,
}) => {
  const frame = useCurrentFrame();
  const lColor = leftColor ?? P.mauve;
  const rColor = rightColor ?? P.terracotta;

  const headerOpacity = interpolate(frame, [at, at + 10], [0, 1], C);

  // Center divider grows
  const dividerHeight = `${interpolate(frame, [at, at + 30], [0, 80], { ...C, easing: (t: number) => 1 - Math.pow(1 - t, 3) })}%`;

  const renderPoints = (points: DebatePoint[], color: string, side: "left" | "right") =>
    points.map((point, i) => {
      const pointAt = point.at + at;
      const slideX = side === "left" ? -20 : 20;
      const x = interpolate(frame, [pointAt, pointAt + 6], [slideX, 0], C);
      const op = interpolate(frame, [pointAt, pointAt + 6], [0, 1], C);

      return (
        <div
          key={i}
          style={{
            opacity: op,
            transform: `translateX(${x}px)`,
            fontFamily: sans,
            fontSize: 36,
            fontWeight: 700,
            color: P.text,
            marginBottom: 20,
            paddingLeft: side === "left" ? 0 : 16,
            paddingRight: side === "right" ? 0 : 16,
            borderLeft: side === "right" ? `4px solid ${color}` : "none",
            borderRight: side === "left" ? `4px solid ${color}` : "none",
            textAlign: side as "left" | "right",
          }}
        >
          {point.text}
        </div>
      );
    });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 20)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "10%",
          width: 2,
          height: dividerHeight,
          backgroundColor: P.light,
          transform: "translateX(-50%)",
        }}
      />

      {/* Left column */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "50%", height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          paddingRight: 60,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 52,
            fontWeight: 400,
            color: lColor,
            marginBottom: 32,
            opacity: headerOpacity,
            textAlign: "right" as const,
            letterSpacing: "-0.02em",
          }}
        >
          {leftHeader}
        </div>
        {renderPoints(leftPoints, lColor, "left")}
      </div>

      {/* Right column */}
      <div
        style={{
          position: "absolute",
          top: 0, right: 0, width: "50%", height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 100,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 52,
            fontWeight: 400,
            color: rColor,
            marginBottom: 32,
            opacity: headerOpacity,
            letterSpacing: "-0.02em",
          }}
        >
          {rightHeader}
        </div>
        {renderPoints(rightPoints, rColor, "right")}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-split-screen-debate",
  props: { leftHeader: "OUTSOURCING", rightHeader: "GCC MODEL", leftPoints: [{ text: "Vendor relationship" }, { text: "Cost focus" }], rightPoints: [{ text: "Company-owned" }, { text: "Innovation focus" }], at: 15 },
  durationInFrames: 180,
};
