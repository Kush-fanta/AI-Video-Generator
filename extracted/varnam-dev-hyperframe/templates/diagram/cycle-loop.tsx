import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

interface CycleNode {
  label: string;
  description?: string;
}

export interface CycleLoopProps extends BaseProps {
  nodes: CycleNode[];
  source?: string;
  at?: number;
}

/**
 * CycleLoop — Circular process diagram with 3–5 nodes.
 * Connectors: SVG cubic bezier arcs (geometric, not organic).
 * Control points are perpendicular to chord at 1/3 distance, bulging outward.
 * Draw animation: strokeDasharray/strokeDashoffset technique.
 * Arrowhead: SVG polygon rotated to match arc tangent at endpoint.
 * No chrome labels. One terracotta accent line. No category label.
 */
export const CycleLoop: React.FC<CycleLoopProps> = ({
  nodes,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const count = Math.min(Math.max(nodes.length, 3), 5);
  const stagger = 20; // frames per node+arc pair

  const centerX = 960;
  const centerY = 520;
  const radius = 270;
  const nodeR = 52; // circle radius for nodes

  // Node positions: start from top (-π/2), clockwise
  const positions = nodes.slice(0, count).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      angle,
    };
  });

  // === CLEAN SVG ARC APPROACH ===
  // Nodes sit on a circle of `radius`. Connectors are arcs of a LARGER concentric circle
  // (radius + arcBulge), drawn as true SVG elliptical arcs (A command).
  // This guarantees mathematically perfect circular arcs — no hand-drawn approximations.
  const arcBulge = 40; // how far outward the arc curves beyond the node circle
  const arcR = radius + arcBulge; // radius of the arc circle

  // For arc from angle a1 to angle a2 (both in radians, clockwise):
  // Use SVG A command: large-arc-flag = 0 (always minor arc between adjacent nodes)
  // sweep-flag = 1 (clockwise)
  const svgArcPath = (
    startX: number, startY: number,
    endX: number, endY: number,
    rx: number, ry: number,
    sweepFlag: 0 | 1
  ) => `M${startX},${startY} A${rx},${ry} 0 0 ${sweepFlag} ${endX},${endY}`;

  // Approximate arc length for a circular arc: r * deltaAngle
  const arcLenForSegment = (i: number, nextI: number) => {
    const a1 = positions[i].angle;
    const a2 = positions[nextI].angle;
    let delta = a2 - a1;
    if (delta < 0) delta += Math.PI * 2;
    return arcR * delta;
  };

  // Tangent direction at end of arc (for arrowhead):
  // For a clockwise arc, tangent at endpoint is perpendicular to radius, rotated +90°
  const arcEndTangent = (endAngle: number) => endAngle + Math.PI / 2;

  // Total arcs: count arcs (including close-the-loop: last → first)
  const totalArcs = count;
  // Node i reveals at: at + 10 + i*stagger
  // Arc i (from node i to node (i+1)%count) draws right after node i appears
  const nodeAt = (i: number) => at + 10 + i * stagger;
  const arcAt = (i: number) => nodeAt(i) + 6;
  // Close-the-loop arc: after last node is fully in
  const closeArcAt = nodeAt(count - 1) + 8;

  // Spring config for node pop
  const nodeSpringCfg = { damping: 13, stiffness: 110, mass: 0.4 };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* SVG: arcs and arrowheads */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          {/* No filter needed — clean geometry only */}
        </defs>

        {/* Draw arcs using clean SVG elliptical arc commands (A) — no hand-drawn bezier */}
        {Array.from({ length: count }).map((_, i) => {
          const nextI = (i + 1) % count;
          const p1 = positions[i];
          const p2 = positions[nextI];

          // Start/end points on the node circle edges, offset outward on the arc circle
          // Arc travels along the outer concentric circle (arcR) between the two angular positions
          const a1 = p1.angle;
          const a2 = p2.angle;

          // Offset start/end on node edges: direction from node center toward the next node
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const nx = dx / dist;
          const ny = dy / dist;
          const startX = p1.x + nx * (nodeR + 8);
          const startY = p1.y + ny * (nodeR + 8);
          const endX = p2.x - nx * (nodeR + 8);
          const endY = p2.y - ny * (nodeR + 8);

          // Pure SVG arc: rx=ry=arcR, no rotation, small arc, clockwise
          const pathD = svgArcPath(startX, startY, endX, endY, arcR, arcR, 1);
          const len = arcLenForSegment(i, nextI);

          const isCloseArc = nextI === 0;
          const thisArcAt = isCloseArc ? closeArcAt : arcAt(i);

          const drawSpring = spring({
            frame: Math.max(0, frame - thisArcAt),
            fps: FPS,
            config: { damping: 16, stiffness: 60, mass: 0.6 },
          });

          const drawnLen = len * drawSpring;
          const tipAngle = arcEndTangent(a2);
          const arrowSize = 10;
          const arrowVisible = drawSpring > 0.8
            ? interpolate(drawSpring, [0.8, 1.0], [0, 1], C)
            : 0;

          return (
            <g key={i}>
              <path
                d={pathD}
                fill="none"
                stroke={P.terracotta}
                strokeWidth={2.5}
                strokeDasharray={`${drawnLen} ${len + 2}`}
                strokeLinecap="square"
              />
              <polygon
                points={[
                  `${endX},${endY}`,
                  `${endX - arrowSize * Math.cos(tipAngle - 0.4)},${endY - arrowSize * Math.sin(tipAngle - 0.4)}`,
                  `${endX - arrowSize * Math.cos(tipAngle + 0.4)},${endY - arrowSize * Math.sin(tipAngle + 0.4)}`,
                ].join(" ")}
                fill={P.terracotta}
                opacity={arrowVisible}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.slice(0, count).map((node, i) => {
        const nAt = nodeAt(i);
        const pop = spring({
          frame: Math.max(0, frame - nAt),
          fps: FPS,
          config: nodeSpringCfg,
        });

        const pos = positions[i];
        const isActive = frame >= nAt && frame < nAt + stagger;

        // After all revealed, node 0 re-highlights when close arc finishes
        const closeProgress = spring({
          frame: Math.max(0, frame - closeArcAt),
          fps: FPS,
          config: { damping: 16, stiffness: 60, mass: 0.6 },
        });
        const isRelit = i === 0 && closeProgress > 0.7;

        const strokeColor = isActive || isRelit ? P.terracotta : "none";
        const bgColor = P.light;
        const textColor = P.text;

        // Description placement: radially outward
        const angle = pos.angle;
        const labelR = radius + nodeR + 32;
        const labelX = centerX + Math.cos(angle) * labelR;
        const labelY = centerY + Math.sin(angle) * labelR;
        const isRightHalf = Math.cos(angle) > 0.2;
        const isLeftHalf = Math.cos(angle) < -0.2;

        return (
          <div key={i}>
            {/* Node circle — rendered via SVG would require foreignObject, use div */}
            <div
              style={{
                position: "absolute",
                left: pos.x - nodeR,
                top: pos.y - nodeR,
                width: nodeR * 2,
                height: nodeR * 2,
                borderRadius: "50%",
                backgroundColor: bgColor,
                border: `3px solid ${strokeColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${interpolate(pop, [0, 1], [0.6, 1], C)})`,
                transformOrigin: "center center",
                opacity: interpolate(pop, [0, 0.2], [0, 1], C),
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 28,
                  fontWeight: 700,
                  color: textColor,
                  textAlign: "center",
                  lineHeight: 1.2,
                  padding: "0 8px",
                }}
              >
                {node.label}
              </span>
            </div>

            {/* Description — radially placed */}
            {node.description && (
              <div
                style={{
                  position: "absolute",
                  left: labelX + (isLeftHalf ? -220 : isRightHalf ? 0 : -110),
                  top: labelY - 18,
                  width: 220,
                  textAlign: isLeftHalf ? "right" : isRightHalf ? "left" : "center",
                  opacity: interpolate(pop, [0.4, 0.9], [0, 1], C),
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    color: P.sub,
                    lineHeight: 1.4,
                  }}
                >
                  {node.description}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Single terracotta accent line — center bottom area */}
      <div
        style={{
          position: "absolute",
          left: centerX - 120,
          top: centerY + radius + nodeR + 56,
          width: `${lineGrow(frame, at + 6, 22)}%`,
          maxWidth: 240,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 80,
            opacity: interpolate(
              frame,
              [at + 10 + count * stagger + 10, at + 10 + count * stagger + 28],
              [0, 1],
              C
            ),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-cycle-loop",
  props: {
    "nodes": [
      {
        "label": "Signal",
        "description": "Collect the signal"
      },
      {
        "label": "Shape",
        "description": "Turn it into a draft"
      },
      {
        "label": "Ship",
        "description": "Push the output"
      },
      {
        "label": "Review",
        "description": "Feed the loop back"
      }
    ],
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
