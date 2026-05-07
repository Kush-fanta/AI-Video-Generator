import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface OrgNode {
  label: string;
  children?: OrgNode[];
}

export interface OrgChartProps extends BaseProps {
  root: OrgNode;
  category?: string;
  source?: string;
  at?: number;
}

/**
 * OrgChart — Tree structure builds root-down.
 * Root node appears first, then children spring in level by level.
 * SVG lines draw between parent and child nodes. Labels reveal per node.
 * 2-3 levels deep. Off-center root for editorial feel.
 */
export const OrgChart: React.FC<OrgChartProps> = ({
  root,
  category = "STRUCTURE",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // === PROGRAMMATIC TREE LAYOUT ===
  // Uses a standard Reingold-Tilford-inspired approach:
  // 1. Count leaf nodes at each level to determine total width.
  // 2. Assign X by distributing nodes evenly within their allocated slot.
  // 3. Y is strictly level * levelGap — no magic numbers.

  const CANVAS_W = 1920;
  const CANVAS_H = 1080;
  const H_PAD = 120;          // horizontal padding from canvas edge
  const levelGap = 240;       // vertical gap between levels
  const nodeW = 200;
  const nodeH = 72;
  const rootY = 160;

  // Compute the number of leaf nodes beneath each l1 child
  // so we can allocate proportional horizontal slots.
  const l1Children = root.children ?? [];
  const l1Count = l1Children.length;

  // Leaf count per l1 child (used for proportional slot allocation)
  const leafCounts = l1Children.map(c => Math.max(c.children?.length ?? 0, 1));
  const totalLeaves = leafCounts.reduce((a, b) => a + b, 0) || 1;

  const availableW = CANVAS_W - H_PAD * 2;

  // Flatten tree for rendering
  type FlatNode = {
    label: string;
    x: number;
    y: number;
    level: number;
    parentX?: number;
    parentY?: number;
    index: number;
  };

  const nodes: FlatNode[] = [];
  let idx = 0;

  // Root — centered
  const rootX = CANVAS_W / 2 - nodeW / 2;
  nodes.push({ label: root.label, x: rootX, y: rootY, level: 0, index: idx++ });

  // Level 1 — distribute based on leaf counts for proportional spacing
  let slotStart = H_PAD;
  l1Children.forEach((child, i) => {
    const slotW = (leafCounts[i] / totalLeaves) * availableW;
    const cx = slotStart + slotW / 2 - nodeW / 2;
    const cy = rootY + levelGap;

    nodes.push({
      label: child.label,
      x: cx,
      y: cy,
      level: 1,
      parentX: rootX,
      parentY: rootY,
      index: idx++,
    });

    // Level 2 — distribute evenly within the parent's slot
    const l2 = child.children ?? [];
    if (l2.length > 0) {
      const l2NodeW = nodeW - 20;
      const l2Gap = Math.min(40, (slotW - l2.length * l2NodeW) / Math.max(l2.length - 1, 1));
      const l2TotalW = l2.length * l2NodeW + Math.max(l2.length - 1, 0) * l2Gap;
      const l2StartX = slotStart + slotW / 2 - l2TotalW / 2;

      l2.forEach((grandchild, j) => {
        const gx = l2StartX + j * (l2NodeW + l2Gap);
        nodes.push({
          label: grandchild.label,
          x: gx,
          y: cy + levelGap,
          level: 2,
          parentX: cx,
          parentY: cy,
          index: idx++,
        });
      });
    }

    slotStart += slotW;
  });

  const levelStagger = 30;
  const nodeStagger = 8;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 80,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      {/* SVG connecting lines */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {nodes
          .filter((n) => n.parentX !== undefined)
          .map((n, i) => {
            const lineAt = at + 6 + n.level * levelStagger;
            const px = n.parentX! + nodeW / 2;
            const py = n.parentY! + nodeH;
            const cx = n.x + (n.level === 2 ? (nodeW - 20) / 2 : nodeW / 2);
            const cy = n.y;
            const midY = py + (cy - py) * 0.5;

            // Path: vertical down from parent, horizontal, vertical down to child
            const path = `M${px},${py} L${px},${midY} L${cx},${midY} L${cx},${cy}`;
            const pathLen = Math.abs(midY - py) + Math.abs(cx - px) + Math.abs(cy - midY);

            const drawProgress = spring({
              frame: Math.max(0, frame - lineAt),
              fps: FPS,
              config: { damping: 18, stiffness: 50, mass: 0.8 },
            });

            return (
              <path
                key={i}
                d={path}
                fill="none"
                stroke={P.terracotta}
                strokeWidth={2}
                strokeDasharray={`${pathLen * drawProgress} ${pathLen}`}
                strokeLinecap="round"
              />
            );
          })}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => {
        const nodeAt = at + 4 + n.level * levelStagger + (n.index % 6) * nodeStagger;
        const isRoot = n.level === 0;
        const w = n.level === 2 ? nodeW - 20 : nodeW;
        const h = isRoot ? nodeH + 12 : nodeH;

        const pop = spring({
          frame: Math.max(0, frame - nodeAt),
          fps: FPS,
          config: { damping: 12, stiffness: 100, mass: 0.5 },
        });

        const bgColor = isRoot ? P.terracotta : n.level === 1 ? P.slate : P.light;
        const textColor = isRoot || n.level === 1 ? P.bg : P.text;
        return (
          <div
            key={n.index}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: w,
              height: h,
              borderRadius: 10,
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
              transform: `scale(${pop})`,
              transformOrigin: "top center",
              opacity: interpolate(pop, [0, 0.3], [0, 1], C),
              boxShadow: isRoot ? `0 4px 20px ${P.terracotta}22` : "none",
            }}
          >
            {isRoot ? (
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 64,
                  fontWeight: 400,
                  color: textColor,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {n.label}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: sans,
                  fontSize: n.level === 1 ? 22 : 18,
                  fontWeight: 600,
                  color: textColor,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {n.label}
              </span>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 90),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-org-chart",
  props: {
    "root": {
      "label": "CEO",
      "children": [
        {
          "label": "Product",
          "children": [
            {
              "label": "Design"
            },
            {
              "label": "Research"
            }
          ]
        },
        {
          "label": "Engineering",
          "children": [
            {
              "label": "Platform"
            },
            {
              "label": "Apps"
            }
          ]
        },
        {
          "label": "Operations",
          "children": [
            {
              "label": "Finance"
            },
            {
              "label": "People"
            }
          ]
        }
      ]
    },
    "category": "ORGANIZATION",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
