import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ChainItem {
  label: string;
  description?: string;
}

export interface CauseEffectChainProps extends BaseProps {
  items: ChainItem[];
  source?: string;
  at?: number;
}

/**
 * CauseEffectChain v2 — Horizontal chain: CAUSE box → arrow → EFFECT boxes.
 * Clean geometric connectors: 2px terracotta line + SVG polygon arrowhead.
 * Each box: cream card with terracotta left border (4px).
 * Stagger: box → arrow → box → arrow → box, 12 frames apart.
 * No chrome labels. No diagonal cascade. No dimming.
 */
export const CauseEffectChain: React.FC<CauseEffectChainProps> = ({
  items,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const count = Math.min(items.length, 5);
  // Layout: boxes and arrows alternating across the horizontal center
  // For N boxes there are N-1 arrows
  // Total slots: N boxes + (N-1) arrows
  // Box width, arrow width, spacing
  const boxW = count <= 3 ? 340 : count === 4 ? 280 : 230;
  const boxH = 160;
  const arrowW = count <= 3 ? 100 : count === 4 ? 80 : 64;
  const totalSlotW = count * boxW + (count - 1) * arrowW;
  const startX = (1920 - totalSlotW) / 2;
  const centerY = 540 - boxH / 2;

  // Stagger: 12 frames per element (box or arrow)
  // Element order: box0, arrow0, box1, arrow1, box2 ...
  const STAGGER = 12;

  const elementAt = (elementIndex: number) => at + 8 + elementIndex * STAGGER;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* SVG layer: arrows */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {Array.from({ length: count - 1 }).map((_, i) => {
          // Arrow sits between box i and box i+1
          // elementIndex for this arrow: 2*i + 1
          const arrowElementIdx = 2 * i + 1;
          const arrowAt = elementAt(arrowElementIdx);

          // X positions: box i ends at startX + i*(boxW+arrowW) + boxW
          const x1 = startX + i * (boxW + arrowW) + boxW + 8; // 8px gap from box edge
          const x2 = startX + (i + 1) * (boxW + arrowW) - 8; // 8px gap before next box
          const y = centerY + boxH / 2; // midpoint of box height

          // Line draws from x1 to x2
          const lineLen = x2 - x1;
          const drawPct = lineGrow(frame, arrowAt, 14);
          const drawnLen = (drawPct / 100) * lineLen;

          // Arrowhead: small filled polygon at x2, pointing right
          const arrowSize = 10;
          const arrowVisible = drawPct > 75
            ? interpolate(drawPct, [75, 100], [0, 1], C)
            : 0;

          return (
            <g key={i}>
              {/* Horizontal line */}
              <line
                x1={x1}
                y1={y}
                x2={x1 + drawnLen}
                y2={y}
                stroke={P.terracotta}
                strokeWidth={2}
                strokeLinecap="square"
              />
              {/* Arrowhead polygon: tip at x2, pointing right */}
              <polygon
                points={[
                  `${x2},${y}`,
                  `${x2 - arrowSize},${y - arrowSize * 0.55}`,
                  `${x2 - arrowSize},${y + arrowSize * 0.55}`,
                ].join(" ")}
                fill={P.terracotta}
                opacity={arrowVisible}
              />
            </g>
          );
        })}
      </svg>

      {/* Boxes */}
      {items.slice(0, count).map((item, i) => {
        // elementIndex for box i: 2*i
        const boxElementIdx = 2 * i;
        const boxAt = elementAt(boxElementIdx);

        const pop = spring({
          frame: Math.max(0, frame - boxAt),
          fps: FPS,
          config: { damping: 14, stiffness: 100, mass: 0.5 },
        });

        const x = startX + i * (boxW + arrowW);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: centerY,
              width: boxW,
              height: boxH,
              borderRadius: 6,
              backgroundColor: P.bg,
              boxShadow: `0 1px 0 0 ${P.light}, inset 0 0 0 1px ${P.light}`,
              borderLeft: `4px solid ${P.terracotta}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 24px 0 20px",
              transform: `scale(${pop})`,
              transformOrigin: "center center",
              opacity: interpolate(pop, [0, 0.25], [0, 1], C),
            }}
          >
            {/* Label */}
            <div
              style={{
                fontFamily: sans,
                fontSize: 28,
                fontWeight: 700,
                color: P.text,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              {item.label}
            </div>

            {/* Optional description */}
            {item.description && (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: P.sub,
                  lineHeight: 1.4,
                  marginTop: 8,
                }}
              >
                {item.description}
              </div>
            )}
          </div>
        );
      })}

      {/* Terracotta accent line — single, below the chain */}
      <div
        style={{
          position: "absolute",
          left: startX,
          top: centerY + boxH + 32,
          width: `${lineGrow(frame, at + 8 + (2 * count - 2) * STAGGER + 8, 28)}%`,
          maxWidth: totalSlotW,
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
              [at + 8 + (2 * count - 1) * STAGGER, at + 8 + (2 * count - 1) * STAGGER + 18],
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
  compositionId: "diagram-cause-effect-chain",
  props: {
    "items": [
      {
        "label": "Delay",
        "description": "Backlog builds up"
      },
      {
        "label": "Rework",
        "description": "More context switching"
      },
      {
        "label": "Slip",
        "description": "Launch moves"
      }
    ],
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
