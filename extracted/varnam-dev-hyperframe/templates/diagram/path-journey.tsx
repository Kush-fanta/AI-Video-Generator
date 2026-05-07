import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, lineGrow, reveal } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export const PATH_JOURNEY_DURATION = 210;

interface JourneyNode {
  label: string;
  detail: string;
  x: number;
  y: number;
}

export interface PathJourneyProps extends BaseProps {
  category?: string;
  headline: string;
  travelerLabel?: string;
  nodes: JourneyNode[];
  payoff?: string;
  source?: string;
  at?: number;
}

interface Point {
  x: number;
  y: number;
}

const getPolylineLength = (points: Point[]) => {
  let total = 0;

  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }

  return total;
};

const getPointAlongPolyline = (points: Point[], progress: number) => {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  const totalLength = getPolylineLength(points);
  const target = totalLength * progress;
  let travelled = 0;

  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1];
    const end = points[i];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if (travelled + segmentLength >= target) {
      const local = (target - travelled) / segmentLength;
      return {
        x: start.x + dx * local,
        y: start.y + dy * local,
      };
    }

    travelled += segmentLength;
  }

  return points[points.length - 1];
};

export const PathJourney: React.FC<PathJourneyProps> = ({
  category = "ONE TOKEN",
  headline,
  travelerLabel = "PAYLOAD",
  nodes,
  payoff,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const points = nodes.map((node) => ({ x: node.x, y: node.y }));
  const totalLength = getPolylineLength(points);
  const drawProgress = lineGrow(frame, at + 16, 60) / 100;
  const tokenProgress = interpolate(frame, [at + 24, at + 102], [0, 1], C);
  const tokenPoint = getPointAlongPolyline(points, tokenProgress);

  const activeIndex = nodes.reduce((closest, node, index) => {
    const threshold = nodes.length === 1 ? 1 : index / (nodes.length - 1);

    if (tokenProgress >= threshold) {
      return index;
    }

    return closest;
  }, 0);

  const pathString = nodes
    .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
    .join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 48,
          borderRadius: 28,
          border: `1px solid ${P.light}`,
          opacity: 0.45,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 88,
          left: 100,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      <div
        style={{
          position: "absolute",
          top: 126,
          left: 100,
          width: `${lineGrow(frame, at + 6, 18)}%`,
          maxWidth: 86,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 999,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 172,
          left: 100,
          maxWidth: 720,
          ...reveal(frame, at + 8),
          fontFamily: serif,
          fontSize: 74,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          color: P.text,
        }}
      >
        {headline}
      </div>

      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d={pathString}
          fill="none"
          stroke={P.light}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathString}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={totalLength * (1 - drawProgress)}
        />
      </svg>

      {nodes.map((node, index) => {
        const nodeAt = at + 22 + index * 16;
        const nodeScale = spring({
          frame: Math.max(0, frame - nodeAt),
          fps: FPS,
          config: { damping: 16, stiffness: 140, mass: 0.55 },
        });
        const isActive = activeIndex >= index;

        return (
          <div key={`${node.label}-${index}`}>
            <div
              style={{
                position: "absolute",
                left: node.x - 22,
                top: node.y - 22,
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: isActive ? P.terracotta : "#F7F4EF",
                border: `3px solid ${isActive ? P.terracotta : P.light}`,
                boxShadow: isActive ? "0 0 0 10px rgba(193,122,72,0.12)" : "none",
                transform: `scale(${nodeScale})`,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: node.x - 105,
                top: node.y + 42,
                width: 210,
                padding: "14px 16px 16px",
                borderRadius: 22,
                backgroundColor: "#FFFCF8",
                border: `1px solid ${isActive ? `${P.terracotta}44` : P.light}`,
                boxShadow: "0 10px 24px rgba(42,38,34,0.08)",
                opacity: interpolate(nodeScale, [0, 0.35], [0, 1], C),
                transform: `translateY(${interpolate(nodeScale, [0, 1], [20, 0], C)}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: isActive ? P.terracotta : P.muted,
                  marginBottom: 10,
                }}
              >
                Step {index + 1}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 30,
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                  color: P.text,
                  marginBottom: 8,
                }}
              >
                {node.label}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: P.sub,
                }}
              >
                {node.detail}
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: tokenPoint.x - 74,
          top: tokenPoint.y - 102,
          width: 148,
          padding: "10px 14px",
          borderRadius: 999,
          backgroundColor: P.text,
          boxShadow: "0 14px 28px rgba(42,38,34,0.18)",
          ...reveal(frame, at + 28),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: P.bg,
            textAlign: "center",
          }}
        >
          {travelerLabel}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: tokenPoint.x - 18,
          top: tokenPoint.y - 18,
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: P.text,
          border: `5px solid ${P.bg}`,
          boxShadow: "0 16px 28px rgba(42,38,34,0.16)",
        }}
      />

      {payoff ? (
        <div
          style={{
            position: "absolute",
            right: 100,
            bottom: 118,
            width: 520,
            ...reveal(frame, at + 100),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 16,
            }}
          >
            Payoff
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 36,
              lineHeight: 1.28,
              fontWeight: 700,
              color: P.terracotta,
              letterSpacing: "-0.02em",
            }}
          >
            {payoff}
          </div>
        </div>
      ) : null}

      {source ? (
        <div
          style={{
            position: "absolute",
            left: 100,
            bottom: 86,
            ...reveal(frame, at + 108),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          Source: {source}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-path-journey",
  props: {
    "category": "CUSTOMER FLOW",
    "headline": "One path, many steps",
    "travelerLabel": "CUSTOMER",
    "nodes": [
      {
        "label": "Start",
        "detail": "Entry point",
        "x": 260,
        "y": 820
      },
      {
        "label": "Evaluate",
        "detail": "Compare options",
        "x": 600,
        "y": 560
      },
      {
        "label": "Decide",
        "detail": "Choose the path",
        "x": 980,
        "y": 760
      },
      {
        "label": "Adopt",
        "detail": "Stay on the path",
        "x": 1340,
        "y": 480
      }
    ],
    "payoff": "The journey stays visible",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
