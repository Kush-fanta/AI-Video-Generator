import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const FLOW_COLORS = [P.terracotta, P.sage, P.slate, P.mauve, P.sub];

interface Flow {
  from: number;
  to: number;
  value: number;
}

interface SankeyFlowProps extends BaseProps {
  leftItems: string[];
  rightItems: string[];
  flows: Flow[];
  title?: string;
  at?: number;
}

/**
 * SankeyFlow — Simplified Sankey diagram.
 * Left column of items, right column, curved connections between them.
 * Connection width proportional to flow value. Connections draw left-to-right.
 * Max 4-5 items per side.
 */
export const SankeyFlow: React.FC<SankeyFlowProps> = ({
  leftItems,
  rightItems,
  flows,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const MARGIN = 80;
  const TOP = title ? 280 : 180;
  const COL_WIDTH = 200;
  const LEFT_X = MARGIN + COL_WIDTH;
  const RIGHT_X = 1080 - MARGIN - COL_WIDTH;
  const FLOW_AREA_W = RIGHT_X - LEFT_X;

  // Vertical layout for items
  const AREA_H = 1400;
  const leftSlotH = AREA_H / Math.max(leftItems.length, 1);
  const rightSlotH = AREA_H / Math.max(rightItems.length, 1);

  // Compute node Y positions
  const leftY = (i: number) => TOP + i * leftSlotH + leftSlotH / 2;
  const rightY = (i: number) => TOP + i * rightSlotH + rightSlotH / 2;

  // Max flow value for width scaling
  const maxFlow = Math.max(...flows.map((fl) => fl.value), 1);
  const maxStroke = 36;
  const minStroke = 6;

  // Flow draw animation — staggered
  const flowStagger = 6;

  // Bezier curve path for a flow
  const flowPath = (fromIdx: number, toIdx: number) => {
    const y1 = leftY(fromIdx);
    const y2 = rightY(toIdx);
    const x1 = LEFT_X;
    const x2 = RIGHT_X;
    const cpx = x1 + FLOW_AREA_W * 0.45;
    const cpx2 = x2 - FLOW_AREA_W * 0.45;
    return `M${x1},${y1} C${cpx},${y1} ${cpx2},${y2} ${x2},${y2}`;
  };

  // Approximate path length for dash animation
  const approxPathLen = FLOW_AREA_W * 1.3;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Title */}
      {title && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 80,
            left: MARGIN,
            right: MARGIN,
            fontFamily: sans,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: P.muted,
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Left column labels */}
      {leftItems.map((item, i) => (
        <div
          key={`l-${i}`}
          style={{
            ...reveal(frame, at + 6 + i * 4),
            position: "absolute",
            top: leftY(i) - 28,
            left: MARGIN,
            width: COL_WIDTH - 20,
            textAlign: "right",
            fontFamily: sans,
            fontSize: 32,
            fontWeight: 600,
            color: P.text,
            lineHeight: 1.3,
          }}
        >
          {item}
        </div>
      ))}

      {/* Right column labels */}
      {rightItems.map((item, i) => (
        <div
          key={`r-${i}`}
          style={{
            ...reveal(frame, at + 6 + i * 4),
            position: "absolute",
            top: rightY(i) - 28,
            left: RIGHT_X + 20,
            width: COL_WIDTH - 20,
            textAlign: "left",
            fontFamily: sans,
            fontSize: 32,
            fontWeight: 600,
            color: P.text,
            lineHeight: 1.3,
          }}
        >
          {item}
        </div>
      ))}

      {/* Node dots — left */}
      {leftItems.map((_, i) => {
        const dotSp = spring({
          frame: Math.max(0, f - 4 - i * 4),
          fps: FPS,
          config: { damping: 12, stiffness: 120, mass: 0.6 },
        });
        return (
          <div
            key={`ld-${i}`}
            style={{
              position: "absolute",
              top: leftY(i) - 10 * dotSp,
              left: LEFT_X - 10 * dotSp,
              width: 20 * dotSp,
              height: 20 * dotSp,
              borderRadius: "50%",
              backgroundColor: FLOW_COLORS[i % FLOW_COLORS.length],
              opacity: f > 4 + i * 4 ? 1 : 0,
            }}
          />
        );
      })}

      {/* Node dots — right */}
      {rightItems.map((_, i) => {
        const dotSp = spring({
          frame: Math.max(0, f - 4 - i * 4),
          fps: FPS,
          config: { damping: 12, stiffness: 120, mass: 0.6 },
        });
        return (
          <div
            key={`rd-${i}`}
            style={{
              position: "absolute",
              top: rightY(i) - 10 * dotSp,
              left: RIGHT_X - 10 * dotSp,
              width: 20 * dotSp,
              height: 20 * dotSp,
              borderRadius: "50%",
              backgroundColor: P.slate,
              opacity: f > 4 + i * 4 ? 1 : 0,
            }}
          />
        );
      })}

      {/* Flow connections — SVG */}
      <svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
      >
        {flows.map((fl, i) => {
          const flowAt = 18 + i * flowStagger;
          const drawProgress = interpolate(
            f,
            [flowAt, flowAt + 30],
            [approxPathLen, 0],
            C,
          );
          const strokeW =
            minStroke + ((fl.value / maxFlow) * (maxStroke - minStroke));
          const color = FLOW_COLORS[fl.from % FLOW_COLORS.length];

          return (
            <path
              key={i}
              d={flowPath(fl.from, fl.to)}
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={approxPathLen}
              strokeDashoffset={drawProgress}
              opacity={f > flowAt ? 0.55 : 0}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-sankey-flow",
  props: {
    leftItems: ["US HQ", "EU HQ", "APAC"],
    rightItems: ["Bangalore", "Hyderabad", "Pune"],
    flows: [{ from: 0, to: 0, value: 40 }, { from: 1, to: 0, value: 30 }, { from: 2, to: 1, value: 20 }],
    title: "GCC Flow",
    at: 15,
  },
  durationInFrames: 180,
};
