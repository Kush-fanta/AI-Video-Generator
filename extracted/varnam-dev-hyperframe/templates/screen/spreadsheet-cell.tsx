import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SpreadsheetCellProps extends BaseProps {
  /** 2D array of cell values — rows x cols */
  data: string[][];
  /** The cell to highlight — 0-indexed row and col */
  highlightCell: { row: number; col: number };
  /** Formula shown in the formula bar */
  formula?: string;
  /** Frame when element appears */
  at?: number;
}

const CELL_W = 200;
const CELL_H = 56;
const HEADER_H = 48;
const ROW_NUM_W = 60;
const COL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Spreadsheet/Excel aesthetic. Grid of cells with column headers (A, B, C...)
 * and row numbers. One cell highlighted with thick terracotta border.
 * The highlighted cell's value is prominent. Formula bar at top.
 * Green fill on positive cells, red on negative.
 * Canvas: 1080×1920 portrait.
 */
export const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  data,
  highlightCell,
  formula,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Grid entrance
  const gridScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0.94,
    to: 1.0,
  });
  const gridOpacity = interpolate(f, [0, 10], [0, 1], C);

  const numCols = data.length > 0 ? Math.max(...data.map((r) => r.length)) : 0;
  const numRows = data.length;

  // Auto-fit cell width to available space
  const gridWidth = ROW_NUM_W + numCols * CELL_W;

  /** Cell reference string, e.g. "B3" */
  const cellRef = `${COL_LETTERS[highlightCell.col] || "A"}${highlightCell.row + 1}`;

  /** Determine if a value looks positive or negative for conditional formatting */
  const cellTone = (val: string): "positive" | "negative" | "neutral" => {
    const cleaned = val.replace(/[,$%]/g, "").trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "neutral";
    if (val.startsWith("-") || val.startsWith("(")) return "negative";
    if (num > 0 && (val.includes("+") || val.includes("%"))) return "positive";
    if (num > 0) return "positive";
    return "neutral";
  };

  const cellBg = (tone: "positive" | "negative" | "neutral") => {
    if (tone === "positive") return "rgba(109,145,125,0.1)";
    if (tone === "negative") return "rgba(193,122,72,0.1)";
    return "transparent";
  };

  const cellColor = (tone: "positive" | "negative" | "neutral") => {
    if (tone === "positive") return P.sage;
    if (tone === "negative") return P.terracotta;
    return P.text;
  };

  // Highlight pulse
  const highlightPulse = interpolate(
    (frame % 60),
    [0, 30, 60],
    [1, 0.85, 1],
    C,
  );

  // Per-row reveal
  const rowReveal = (i: number) => {
    const start = 12 + i * 6;
    return {
      opacity: interpolate(f, [start, start + 8], [0, 1], C),
      transform: `translateY(${interpolate(f, [start, start + 8], [8, 0], C)}px)`,
    };
  };

  // Highlighted cell value
  const highlightValue =
    data[highlightCell.row]?.[highlightCell.col] || "";

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Formula bar */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 48,
          right: 48,
          height: 64,
          backgroundColor: "#FFFFFF",
          borderRadius: 10,
          border: `1px solid ${P.light}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          ...reveal(frame, at + 4),
        }}
      >
        {/* Cell reference badge */}
        <div
          style={{
            backgroundColor: P.terracotta,
            borderRadius: 6,
            padding: "4px 14px",
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            color: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          {cellRef}
        </div>

        {/* fx label */}
        <span
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 600,
            fontStyle: "italic",
            color: P.muted,
            flexShrink: 0,
          }}
        >
          fx
        </span>

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 32,
            backgroundColor: P.light,
            flexShrink: 0,
          }}
        />

        {/* Formula / value */}
        <span
          style={{
            fontFamily: sans,
            fontSize: 24,
            color: P.text,
            flex: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {formula || highlightValue}
        </span>
      </div>

      {/* Spreadsheet grid */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 48,
          right: 48,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          border: `1px solid ${P.light}`,
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
          transform: `scale(${gridScale})`,
          opacity: gridOpacity,
        }}
      >
        {/* Column headers row */}
        <div
          style={{
            display: "flex",
            height: HEADER_H,
            backgroundColor: "#F7F6F2",
            borderBottom: `1px solid ${P.light}`,
          }}
        >
          {/* Empty corner cell */}
          <div
            style={{
              width: ROW_NUM_W,
              height: HEADER_H,
              borderRight: `1px solid ${P.light}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          {/* Column letters */}
          {Array.from({ length: numCols }, (_, ci) => (
            <div
              key={ci}
              style={{
                width: CELL_W,
                height: HEADER_H,
                borderRight: `1px solid ${P.light}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 700,
                color: ci === highlightCell.col ? P.terracotta : P.muted,
                backgroundColor:
                  ci === highlightCell.col
                    ? "rgba(193,122,72,0.08)"
                    : "transparent",
              }}
            >
              {COL_LETTERS[ci]}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {data.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              height: CELL_H,
              borderBottom:
                ri < numRows - 1 ? `1px solid ${P.light}` : "none",
              ...rowReveal(ri),
            }}
          >
            {/* Row number */}
            <div
              style={{
                width: ROW_NUM_W,
                height: CELL_H,
                borderRight: `1px solid ${P.light}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  ri === highlightCell.row
                    ? "rgba(193,122,72,0.08)"
                    : "#F7F6F2",
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 600,
                color: ri === highlightCell.row ? P.terracotta : P.muted,
              }}
            >
              {ri + 1}
            </div>

            {/* Cells */}
            {Array.from({ length: numCols }, (_, ci) => {
              const val = row[ci] || "";
              const isHighlight =
                ri === highlightCell.row && ci === highlightCell.col;
              const tone = cellTone(val);

              return (
                <div
                  key={ci}
                  style={{
                    width: CELL_W,
                    height: CELL_H,
                    borderRight: `1px solid ${P.light}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0 14px",
                    backgroundColor: isHighlight
                      ? `rgba(193,122,72,${0.08 * highlightPulse})`
                      : cellBg(tone),
                    border: isHighlight
                      ? `3px solid ${P.terracotta}`
                      : "none",
                    boxSizing: "border-box",
                    fontFamily: sans,
                    fontSize: isHighlight ? 26 : 22,
                    fontWeight: isHighlight ? 700 : 500,
                    color: isHighlight ? P.terracotta : cellColor(tone),
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Big editorial callout of highlighted value */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 72,
          right: 72,
          ...reveal(frame, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.0,
            color: P.terracotta,
            letterSpacing: "-0.03em",
          }}
        >
          {highlightValue}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 600,
            color: P.muted,
            marginTop: 8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Cell {cellRef}
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 36, 24)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 16,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-spreadsheet-cell",
  props: {
    data: [["City", "GCCs", "Revenue"], ["BLR", "500+", "$35B"], ["HYD", "300+", "$22B"], ["PUN", "200+", "$15B"]],
    highlightCell: { row: 1, col: 2 },
    formula: "=SUM(C2:C4)",
    at: 15,
  },
  durationInFrames: 180,
};
