import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, dimTo, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface StaccatoItem {
  text: string;
  at: number;
  color?: string;
}

export interface StaccatoListProps extends BaseProps {
  items: StaccatoItem[];
  layout?: "stack" | "grid";
  at?: number;
}

const ACCENT_COLORS = [P.terracotta, P.sage, P.mauve, P.slate];

/**
 * Words/phrases appear one by one with colored accent strips (4-5px left border).
 * Each gets its own row. Previous dims but stays. The list accelerates the rhythm.
 * Optional 2x2 grid layout for 4 items. Right-half gets a ghost count that increments
 * as each item reveals.
 */
export const StaccatoList: React.FC<StaccatoListProps> = ({
  items,
  layout = "stack",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const sorted = [...items].sort((a, b) => a.at - b.at);
  const useGrid = layout === "grid" && sorted.length >= 4;
  const lastItem = sorted[sorted.length - 1];

  // Count of items revealed so far — increments as each item reaches its at frame
  const revealedCount = sorted.filter((item) => frame >= item.at + at).length;

  const renderItem = (item: StaccatoItem, i: number) => {
    const isLast = i === sorted.length - 1;
    const nextAt = isLast ? null : sorted[i + 1].at + at;
    const itemAt = item.at + at;
    const accentColor = item.color ?? ACCENT_COLORS[i % ACCENT_COLORS.length];

    // Dim previous items, keep last bright
    const dimOp = nextAt !== null
      ? dimTo(frame, nextAt, 0.18, 8)
      : 1;

    return (
      <div
        key={i}
        style={{
          ...reveal(frame, itemAt),
          opacity: frame >= itemAt ? dimOp * interpolate(frame, [itemAt, itemAt + 12], [0, 1], C) : 0,
          display: "flex",
          alignItems: "center",
          marginBottom: useGrid ? 0 : 8,
          padding: useGrid ? "8px 0" : 0,
        }}
      >
        {/* Colored accent strip — left border, grows in height */}
        <div
          style={{
            width: 7,
            height: `${lineGrow(frame, itemAt + 2, 14)}%`,
            maxHeight: isLast ? 90 : 68,
            minHeight: 6,
            backgroundColor: accentColor,
            borderRadius: 3,
            marginRight: 32,
            flexShrink: 0,
            opacity: interpolate(frame, [itemAt, itemAt + 10], [0, 1], C),
          }}
        />

        {/* Item text */}
        <div
          style={{
            fontFamily: isLast ? serif : sans,
            fontSize: isLast && !useGrid ? 96 : useGrid ? 64 : 64,
            lineHeight: 1.1,
            color: isLast ? P.terracotta : P.text,
            fontWeight: isLast ? 400 : 700,
            letterSpacing: isLast ? "-0.03em" : "-0.02em",
          }}
        >
          {item.text}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Terracotta accent line — top left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          width: `${lineGrow(frame, at, 26)}%`,
          maxWidth: 60,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Ghost item count — right side, updates as each item reveals */}
      {lastItem && revealedCount > 0 && (
        <div
          style={{
            position: "absolute",
            right: 80,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: serif,
            fontSize: 360,
            fontWeight: 400,
            color: P.muted,
            opacity: 0.08,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            letterSpacing: "-0.05em",
            textAlign: "right",
          }}
        >
          {revealedCount}
        </div>
      )}

      {useGrid ? (
        /* 2x2 Grid layout */
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            paddingLeft: 120,
            paddingRight: 180,
            paddingTop: 160,
            paddingBottom: 120,
            gap: "12px 48px",
            alignItems: "center",
          }}
        >
          {sorted.slice(0, 4).map((item, i) => renderItem(item, i))}
        </div>
      ) : (
        /* Stack layout */
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 100,
            paddingRight: 120,
          }}
        >
          {sorted.map((item, i) => renderItem(item, i))}
        </div>
      )}

      {/* Decorative bottom line */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 120,
          width: `${lineGrow(frame, at + 8, 40)}%`,
          maxWidth: 300,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-staccato-list",
  props: {
    items: [
      {
        text: "Start with the headline.",
        at: 0
      },
      {
        text: "Then reveal the proof.",
        at: 16
      },
      {
        text: "Then hold the beat.",
        at: 32
      },
      {
        text: "Then close cleanly.",
        at: 48
      }
    ],
    layout: "stack"
  },
  durationInFrames: 180,
};
