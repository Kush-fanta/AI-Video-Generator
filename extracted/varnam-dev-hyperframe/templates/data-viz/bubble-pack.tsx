import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const BUBBLE_COLORS = [P.terracotta, P.sage, P.slate, P.mauve];

interface BubbleItem {
  label: string;
  value: number;
}

interface BubblePackProps extends BaseProps {
  items: BubbleItem[];
  title?: string;
  source?: string;
  at?: number;
}

/**
 * BubblePack — Proportional circles packed together.
 * Each circle's radius proportional to value. Circles spring in from center.
 * Largest is terracotta, others cycle palette. Label inside or below each circle.
 * Uses a simple deterministic circle-packing layout.
 */

interface PackedCircle {
  x: number;
  y: number;
  r: number;
  item: BubbleItem;
  colorIndex: number;
}

/* Simple circle packing: place circles one by one, largest first, using greedy placement */
function packCircles(items: BubbleItem[], cx: number, cy: number): PackedCircle[] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const maxVal = sorted[0].value;
  const minR = 50;
  const maxR = 180;

  const circles: PackedCircle[] = [];

  sorted.forEach((item, i) => {
    const r = minR + ((item.value / maxVal) * (maxR - minR));

    if (i === 0) {
      circles.push({ x: cx, y: cy, r, item, colorIndex: 0 });
      return;
    }

    // Find best position: try angles around existing circles
    let bestX = cx;
    let bestY = cy;
    let bestDist = Infinity;

    for (let ci = 0; ci < circles.length; ci++) {
      const ref = circles[ci];
      const targetDist = ref.r + r + 8; // gap between circles

      for (let a = 0; a < 36; a++) {
        const angle = (a / 36) * 2 * Math.PI;
        const tx = ref.x + targetDist * Math.cos(angle);
        const ty = ref.y + targetDist * Math.sin(angle);

        // Check no overlap with existing circles
        let valid = true;
        for (const other of circles) {
          const dx = tx - other.x;
          const dy = ty - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < other.r + r + 6) {
            valid = false;
            break;
          }
        }

        if (valid) {
          const distFromCenter = Math.sqrt(
            (tx - cx) * (tx - cx) + (ty - cy) * (ty - cy),
          );
          if (distFromCenter < bestDist) {
            bestDist = distFromCenter;
            bestX = tx;
            bestY = ty;
          }
        }
      }
    }

    circles.push({ x: bestX, y: bestY, r, item, colorIndex: i });
  });

  return circles;
}

export const BubblePack: React.FC<BubblePackProps> = ({
  items,
  title,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const CENTER_X = 540;
  const CENTER_Y = title ? 960 : 920;

  const packed = packCircles(items, CENTER_X, CENTER_Y);

  // Sort by value descending so largest gets terracotta
  const sortedByValue = [...items].sort((a, b) => b.value - a.value);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Title */}
      {title && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 80,
            left: 80,
            right: 80,
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

      {/* Bubbles */}
      {packed.map((circle, i) => {
        const stagger = 5;
        const bubbleAt = at + 8 + i * stagger;
        const f = Math.max(0, frame - bubbleAt);

        const sp = spring({
          frame: f,
          fps: FPS,
          config: { damping: 12, stiffness: 80, mass: 0.9 },
        });

        // Color assignment: largest is terracotta, rest cycle
        const valueRank = sortedByValue.findIndex(
          (it) => it.label === circle.item.label,
        );
        const color =
          valueRank === 0
            ? P.terracotta
            : BUBBLE_COLORS[((valueRank - 1) % (BUBBLE_COLORS.length - 1)) + 1];

        // Spring from center
        const x = CENTER_X + (circle.x - CENTER_X) * sp;
        const y = CENTER_Y + (circle.y - CENTER_Y) * sp;
        const r = circle.r * sp;

        const showInside = circle.r > 65;
        const labelFontSize = circle.r > 120 ? 28 : 22;
        const valueFontSize = circle.r > 120 ? 48 : 32;

        return (
          <div key={i}>
            {/* Circle */}
            <div
              style={{
                position: "absolute",
                left: x - r,
                top: y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                backgroundColor: color,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                opacity: f > 0 ? 1 : 0,
              }}
            >
              {showInside && sp > 0.5 && (
                <>
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: valueFontSize,
                      color: "#fff",
                      lineHeight: 1.0,
                    }}
                  >
                    {circle.item.value}
                  </div>
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: labelFontSize,
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 500,
                      marginTop: 4,
                      textAlign: "center",
                      padding: "0 8px",
                      lineHeight: 1.2,
                    }}
                  >
                    {circle.item.label}
                  </div>
                </>
              )}
            </div>

            {/* External label for small circles */}
            {!showInside && sp > 0.5 && (
              <div
                style={{
                  position: "absolute",
                  left: x - 80,
                  top: y + r + 8,
                  width: 160,
                  textAlign: "center",
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 600,
                  color: P.sub,
                  lineHeight: 1.2,
                  opacity: f > 0 ? 1 : 0,
                }}
              >
                {circle.item.label}
              </div>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 8 + packed.length * 5 + 15),
            position: "absolute",
            bottom: 60,
            left: 80,
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
  compositionId: "dataviz-bubble-pack",
  props: {
    items: [{ label: "BLR", value: 500 }, { label: "HYD", value: 300 }, { label: "PUN", value: 200 }, { label: "CHN", value: 150 }],
    title: "GCCs by City",
    at: 15,
  },
  durationInFrames: 180,
};
