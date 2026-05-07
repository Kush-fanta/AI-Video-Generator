import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LineItem {
  name: string;
  amount: string;
}

export interface ReceiptScrollProps extends BaseProps {
  /** Line items on the receipt */
  items: LineItem[];
  /** Total amount — bold at bottom */
  total: string;
  /** Merchant / store name */
  merchant?: string;
  /** Date string */
  date?: string;
  /** Frame when element appears */
  at?: number;
}

const RECEIPT_W = 640;
const ITEM_HEIGHT = 72;
const ITEM_STAGGER = 12;

/**
 * Receipt/invoice that scrolls up with line items appearing in sequence.
 * Dashed separators, bold total, monospace feel. Narrow centered on screen
 * like a real thermal receipt. Slightly off-white paper bg.
 * Canvas: 1080×1920 portrait.
 */
export const ReceiptScroll: React.FC<ReceiptScrollProps> = ({
  items,
  total,
  merchant = "STORE",
  date,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Receipt slides up from below
  const receiptHeight = 340 + items.length * ITEM_HEIGHT + 220;
  const scrollOffset = interpolate(
    f,
    [10, 10 + items.length * ITEM_STAGGER + 40],
    [receiptHeight * 0.3, 0],
    C,
  );

  // Paper entrance
  const paperOpacity = interpolate(f, [0, 12], [0, 1], C);
  const paperScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 18, stiffness: 80, mass: 1.0 },
    from: 0.96,
    to: 1.0,
  });

  /** Per-item reveal */
  const itemReveal = (i: number) => {
    const start = 18 + i * ITEM_STAGGER;
    const progress = spring({
      frame: Math.max(0, f - start),
      fps: FPS,
      config: { damping: 14, stiffness: 140, mass: 0.7 },
      from: 0,
      to: 1,
    });
    return {
      opacity: f >= start ? progress : 0,
      transform: `translateX(${interpolate(f >= start ? progress : 0, [0, 1], [20, 0])}px)`,
    };
  };

  /** Dashed line SVG */
  const DashedLine = () => (
    <svg width="100%" height="2" style={{ display: "block", margin: "8px 0" }}>
      <line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke={P.muted}
        strokeWidth="1.5"
        strokeDasharray="8,6"
      />
    </svg>
  );

  // Total reveal
  const totalStart = 18 + items.length * ITEM_STAGGER + 10;
  const totalProgress = spring({
    frame: Math.max(0, f - totalStart),
    fps: FPS,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
    from: 0,
    to: 1,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Receipt paper */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 120,
          bottom: 80,
          transform: `translateX(-50%) translateY(${scrollOffset}px) scale(${paperScale})`,
          width: RECEIPT_W,
          opacity: paperOpacity,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#FAF9F5",
            borderRadius: 4,
            padding: "48px 44px 56px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            minHeight: "100%",
          }}
        >
          {/* Merchant header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
              ...reveal(frame, at + 6),
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: P.text,
              }}
            >
              {merchant}
            </div>
            {date && (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  color: P.muted,
                  marginTop: 8,
                  letterSpacing: "0.06em",
                }}
              >
                {date}
              </div>
            )}
          </div>

          <DashedLine />

          {/* Column headers */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0 8px",
              ...reveal(frame, at + 12),
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: P.muted,
              }}
            >
              Item
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: P.muted,
              }}
            >
              Amount
            </span>
          </div>

          <DashedLine />

          {/* Line items */}
          {items.map((item, i) => (
            <div key={i} style={itemReveal(i)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: `1px solid rgba(155,148,139,0.2)`,
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 28,
                    color: P.text,
                    flex: 1,
                    paddingRight: 16,
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 28,
                    fontWeight: 600,
                    color: P.text,
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {item.amount}
                </span>
              </div>
            </div>
          ))}

          <DashedLine />

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              opacity: f >= totalStart ? totalProgress : 0,
              transform: `scale(${f >= totalStart ? interpolate(totalProgress, [0, 1], [1.05, 1.0]) : 1.05})`,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: P.text,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: serif,
                fontSize: 48,
                fontWeight: 400,
                color: P.terracotta,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {total}
            </span>
          </div>

          <DashedLine />

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              ...reveal(frame, at + totalStart + 10),
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: P.muted,
                letterSpacing: "0.06em",
              }}
            >
              Thank you
            </div>
          </div>

          {/* Tear edge at bottom — zigzag */}
          <div
            style={{
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              height: 12,
              overflow: "hidden",
            }}
          >
            <svg width="100%" height="12" preserveAspectRatio="none">
              <path
                d={`M0,0 ${Array.from({ length: 60 }, (_, i) => `L${i * 12 + 6},${i % 2 === 0 ? 12 : 0}`).join(" ")} L720,0`}
                fill="#FAF9F5"
              />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-receipt-scroll",
  props: {
    items: [{ name: "IT Support", amount: "$12B" }, { name: "Engineering R&D", amount: "$35B" }, { name: "AI/ML Ops", amount: "$18B" }],
    total: "$100B",
    merchant: "India GCC Inc.",
    date: "FY 2024",
    at: 15,
  },
  durationInFrames: 180,
};
