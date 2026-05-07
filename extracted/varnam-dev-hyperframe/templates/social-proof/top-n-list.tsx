import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TopNItem {
  rank: number;
  name: string;
  value: string;
}

interface TopNListProps extends BaseProps {
  items: TopNItem[];
  source?: string;
  at?: number;
}

/**
 * TopNList — Minimal ranked list.
 * Layout per row: rank (large serif, P.muted) | name (DM Sans, P.text) | value (DM Sans bold, P.terracotta)
 * Clean tabular. No proportion bars. No rank colors. No category chrome.
 * #1 entry: rank 100px, name/value 48px. Rest: rank 80px, name/value 40px.
 * Row height: 100px for ≤5 items, 80px for 6–8 items.
 * Stagger: each row slides in from left, 8 frames apart, spring physics.
 * One terracotta accent line at bottom of list.
 */
export const TopNList: React.FC<TopNListProps> = ({
  items,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const sorted = [...items].sort((a, b) => a.rank - b.rank);
  const maxItems = Math.min(sorted.length, 8);
  const rowH = maxItems <= 5 ? 100 : 80;

  // Total list height for vertical centering
  const totalH = maxItems * rowH;
  const listTop = (1080 - totalH) / 2;

  const stagger = 8;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* List */}
      <div
        style={{
          position: "absolute",
          top: listTop,
          left: 0,
          width: "100%",
          paddingLeft: 120,
          paddingRight: 120,
          boxSizing: "border-box",
        }}
      >
        {sorted.slice(0, maxItems).map((item, i) => {
          const rowAt = at + 8 + i * stagger;
          const isFirst = i === 0;

          const rowSpring = spring({
            frame: Math.max(0, frame - rowAt),
            fps: FPS,
            config: { damping: 14, stiffness: 100, mass: 0.55 },
          });

          const rankSize = isFirst ? 100 : 80;
          const nameSize = isFirst ? 48 : 40;
          const valueSize = isFirst ? 48 : 40;

          return (
            <div
              key={item.rank}
              style={{
                height: rowH,
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid ${P.light}`,
                opacity: interpolate(rowSpring, [0, 0.2], [0, 1], C),
                transform: `translateX(${interpolate(rowSpring, [0, 1], [-32, 0], C)}px)`,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: rankSize,
                  color: P.muted,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  width: isFirst ? 120 : 100,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {String(item.rank).padStart(2, "0")}
              </div>

              {/* Name — grows to fill center */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: sans,
                  fontSize: nameSize,
                  fontWeight: 600,
                  color: P.text,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {item.name}
              </div>

              {/* Value — right-aligned */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: valueSize,
                  fontWeight: 700,
                  color: P.terracotta,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  flexShrink: 0,
                  marginLeft: 32,
                  textAlign: "right",
                }}
              >
                {item.value}
              </div>
            </div>
          );
        })}

        {/* Terracotta accent line — grows after last row */}
        <div
          style={{
            width: `${lineGrow(frame, at + 8 + maxItems * stagger + 4, 24)}%`,
            maxWidth: 200,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginTop: 12,
          }}
        />
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 120,
            opacity: interpolate(
              frame,
              [at + 8 + maxItems * stagger + 14, at + 8 + maxItems * stagger + 32],
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
