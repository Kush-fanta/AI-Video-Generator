import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ROW_COLORS = [P.terracotta, P.sage, P.slate, P.mauve, P.sub];

interface IsotypeItem {
  label: string;
  count: number;
  color?: string;
}

interface IsotypeRowProps extends BaseProps {
  items: IsotypeItem[];
  unitLabel?: string;
  title?: string;
  at?: number;
}

/**
 * IsotypeRow — Pictographic visualization using repeated unit icons.
 * Each row represents a category. Units (rounded squares) fill in from
 * left with stagger. One unit = a value. Color-coded.
 * Inspired by ISOTYPE charts from Otto Neurath.
 */
export const IsotypeRow: React.FC<IsotypeRowProps> = ({
  items,
  unitLabel,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Layout
  const MARGIN = 80;
  const TOP = title ? 280 : 200;
  const LABEL_W = 260;
  const GRID_LEFT = MARGIN + LABEL_W + 20;
  const GRID_RIGHT = 1080 - MARGIN;
  const GRID_W = GRID_RIGHT - GRID_LEFT;

  // Unit sizing
  const UNIT_SIZE = 40;
  const UNIT_GAP = 8;
  const ROW_GAP = 48;

  // Max units per row for layout
  const maxUnitsPerRow = Math.floor((GRID_W + UNIT_GAP) / (UNIT_SIZE + UNIT_GAP));
  const maxCount = Math.max(...items.map((it) => it.count), 1);

  // Row height depends on wrapping
  const rowHeight = (count: number) => {
    const rows = Math.ceil(count / maxUnitsPerRow);
    return rows * (UNIT_SIZE + UNIT_GAP) - UNIT_GAP;
  };

  // Per-row stagger
  const ROW_STAGGER = 12;
  // Per-unit stagger within row
  const UNIT_STAGGER = 0.6; // frames between each unit appearing

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

      {/* Unit label legend */}
      {unitLabel && (
        <div
          style={{
            ...reveal(frame, at + 4),
            position: "absolute",
            top: TOP - 60,
            left: GRID_LEFT,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: UNIT_SIZE * 0.6,
              height: UNIT_SIZE * 0.6,
              borderRadius: 4,
              backgroundColor: P.muted,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            = {unitLabel}
          </div>
        </div>
      )}

      {/* Rows */}
      {items.map((item, rowIdx) => {
        const rowAt = at + 8 + rowIdx * ROW_STAGGER;

        // Cumulative Y position
        let yOffset = TOP;
        for (let r = 0; r < rowIdx; r++) {
          yOffset += rowHeight(items[r].count) + ROW_GAP;
        }

        const color = item.color || ROW_COLORS[rowIdx % ROW_COLORS.length];

        return (
          <div key={rowIdx}>
            {/* Row label */}
            <div
              style={{
                ...reveal(frame, rowAt),
                position: "absolute",
                top: yOffset,
                left: MARGIN,
                width: LABEL_W,
                textAlign: "right",
                fontFamily: sans,
                fontSize: 30,
                fontWeight: 600,
                color: P.text,
                lineHeight: 1.3,
              }}
            >
              {item.label}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 44,
                  color: P.text,
                  marginTop: 4,
                }}
              >
                {item.count}
              </div>
            </div>

            {/* Unit grid */}
            <div
              style={{
                position: "absolute",
                top: yOffset,
                left: GRID_LEFT,
                width: GRID_W,
                display: "flex",
                flexWrap: "wrap",
                gap: UNIT_GAP,
              }}
            >
              {Array.from({ length: item.count }, (_, unitIdx) => {
                const unitAt = rowAt + 4 + unitIdx * UNIT_STAGGER;
                const unitF = Math.max(0, frame - unitAt);

                const unitSp = spring({
                  frame: unitF,
                  fps: FPS,
                  config: { damping: 12, stiffness: 140, mass: 0.5 },
                });

                return (
                  <div
                    key={unitIdx}
                    style={{
                      width: UNIT_SIZE,
                      height: UNIT_SIZE,
                      borderRadius: 6,
                      backgroundColor: color,
                      transform: `scale(${unitSp})`,
                      opacity: unitF > 0 ? 1 : 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "dataviz-isotype-row",
  props: {
    items: [{ label: "Fortune 30", count: 20 }, { label: "Fortune 100", count: 65 }],
    unitLabel: "companies",
    title: "GCC Adoption",
    at: 15,
  },
  durationInFrames: 180,
};
