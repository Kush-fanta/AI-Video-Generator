import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const BLOCK_COLORS = [P.terracotta, P.sage, P.slate, P.mauve];

interface TreemapItem {
  label: string;
  value: number;
}

interface TreemapProps extends BaseProps {
  items: TreemapItem[];
  title?: string;
  source?: string;
  at?: number;
}

/**
 * Treemap — Nested rectangles showing proportional data.
 * 4-8 blocks sized by value. Largest terracotta, others cycle palette.
 * Each block springs into size with stagger. Labels inside each block.
 * Uses a simple squarified layout algorithm for 1080x1920 portrait.
 */

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  item: TreemapItem;
  index: number;
}

/* Simple slice-and-dice treemap layout */
function computeTreemap(
  items: TreemapItem[],
  x: number,
  y: number,
  w: number,
  h: number,
): LayoutRect[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ x, y, w, h, item: items[0], index: 0 }];
  }

  const total = items.reduce((s, it) => s + it.value, 0);
  const sorted = [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.value - a.item.value);

  const rects: LayoutRect[] = [];
  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;

  sorted.forEach(({ item, index }, i) => {
    const remaining = sorted.slice(i).reduce((s, it) => s + it.item.value, 0);
    const fraction = item.value / remaining;

    if (cw >= ch) {
      // Split horizontally
      const blockW = cw * fraction;
      rects.push({ x: cx, y: cy, w: blockW, h: ch, item, index });
      cx += blockW;
      cw -= blockW;
    } else {
      // Split vertically
      const blockH = ch * fraction;
      rects.push({ x: cx, y: cy, w: cw, h: blockH, item, index });
      cy += blockH;
      ch -= blockH;
    }
  });

  return rects;
}

export const Treemap: React.FC<TreemapProps> = ({
  items,
  title,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const total = items.reduce((s, it) => s + it.value, 0);

  // Treemap area
  const MARGIN = 80;
  const TOP = title ? 240 : 140;
  const BOTTOM = source ? 160 : 80;
  const mapX = MARGIN;
  const mapY = TOP;
  const mapW = 1080 - MARGIN * 2;
  const mapH = 1920 - TOP - BOTTOM;
  const GAP = 6;

  const rects = computeTreemap(items, mapX, mapY, mapW, mapH);

  // Sort by original value descending for color assignment
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
            left: MARGIN,
            right: MARGIN,
            fontFamily: sans,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {title}
        </div>
      )}

      {/* Treemap blocks */}
      {rects.map((rect, i) => {
        const stagger = 6;
        const blockAt = at + 8 + i * stagger;
        const f = Math.max(0, frame - blockAt);

        const sp = spring({
          frame: f,
          fps: FPS,
          config: { damping: 14, stiffness: 80, mass: 0.8 },
        });

        // Color: largest is terracotta, rest cycle
        const valueRank = sortedByValue.findIndex(
          (it) => it.label === rect.item.label,
        );
        const color =
          valueRank === 0
            ? P.terracotta
            : BLOCK_COLORS[(valueRank - 1) % BLOCK_COLORS.length + 1] ||
              BLOCK_COLORS[valueRank % BLOCK_COLORS.length];

        const percentage = ((rect.item.value / total) * 100).toFixed(0);

        // Block springs from center of its space
        const centerX = rect.x + rect.w / 2;
        const centerY = rect.y + rect.h / 2;
        const blockW = (rect.w - GAP) * sp;
        const blockH = (rect.h - GAP) * sp;

        const showLabel = rect.w > 100 && rect.h > 80;
        const labelSize = rect.w > 200 && rect.h > 140 ? 40 : 28;
        const valueSize = rect.w > 200 && rect.h > 140 ? 64 : 40;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: centerX - blockW / 2,
              top: centerY - blockH / 2,
              width: blockW,
              height: blockH,
              backgroundColor: color,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              opacity: f > 0 ? 1 : 0,
            }}
          >
            {showLabel && sp > 0.5 && (
              <>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: valueSize,
                    color: "#fff",
                    lineHeight: 1.0,
                    letterSpacing: "-0.02em",
                    textAlign: "center",
                  }}
                >
                  {percentage}%
                </div>
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: labelSize,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                    marginTop: 8,
                    textAlign: "center",
                    padding: "0 12px",
                    lineHeight: 1.2,
                  }}
                >
                  {rect.item.label}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            ...reveal(frame, at + 8 + rects.length * 6 + 15),
            position: "absolute",
            bottom: 60,
            left: MARGIN,
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
  compositionId: "dataviz-treemap",
  props: {
    items: [{ label: "IT Services", value: 45 }, { label: "Engineering", value: 28 }, { label: "AI/ML", value: 15 }, { label: "Consulting", value: 12 }],
    title: "GCC Revenue Split",
    source: "NASSCOM",
    at: 15,
  },
  durationInFrames: 180,
};
