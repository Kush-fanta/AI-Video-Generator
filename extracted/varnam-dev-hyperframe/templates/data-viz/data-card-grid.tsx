import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CardItem {
  value: string;
  label: string;
  color?: string;
}

export interface DataCardGridProps extends BaseProps {
  cards: CardItem[];
  headline?: string;
  source?: string;
  at?: number;
}

const COLORS = [P.light, P.slate, P.sage, P.terracotta];

/**
 * DataCardGrid — 2-column grid of 4–6 stat cards.
 * Each card has a large serif number + small sans label.
 * Subtle 1px border, staggered spring entrance, centered in frame.
 */
export const DataCardGrid: React.FC<DataCardGridProps> = ({
  cards,
  headline,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const cardCount = Math.min(cards.length, 6);
  const cols = 2;
  const cardWidth = 420;
  const cardHeight = 240;
  const gap = 24;
  const stagger = 10;

  const rows = Math.ceil(cardCount / cols);
  const gridWidth = cols * cardWidth + (cols - 1) * gap;
  const gridHeight = rows * cardHeight + (rows - 1) * gap;

  // Center grid vertically, offset down if headline present
  const gridTop = (1920 - gridHeight) / 2 + (headline ? 60 : 0);
  const gridLeft = (1080 - gridWidth) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: gridTop - 120,
            left: gridLeft,
            right: gridLeft,
            ...reveal(frame, at + 2),
            fontFamily: serif,
            fontSize: 48,
            color: P.text,
            lineHeight: 1.2,
          }}
        >
          {headline}
        </div>
      )}

      {/* Card grid */}
      <div
        style={{
          position: "absolute",
          top: gridTop,
          left: gridLeft,
          width: gridWidth,
          display: "flex",
          flexWrap: "wrap",
          gap,
        }}
      >
        {cards.slice(0, 6).map((card, i) => {
          const cardAt = at + 8 + i * stagger;
          const color = card.color || COLORS[i % COLORS.length];

          // Spring entrance for each card
          const cardF = Math.max(0, frame - cardAt);
          const cardSpring = spring({
            frame: cardF,
            fps: FPS,
            config: { damping: 22, stiffness: 100, mass: 0.8 },
          });

          const numScale = overshootScale(frame, cardAt + 6);

          return (
            <div
              key={i}
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: 10,
                border: `1px solid ${P.light}`,
                backgroundColor: P.bg,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingLeft: 32,
                paddingRight: 32,
                opacity: cardSpring,
                transform: `translateY(${(1 - cardSpring) * 24}px)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Left accent stripe */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 4,
                  height: `${cardSpring * 100}%`,
                  backgroundColor: color,
                  borderRadius: "10px 0 0 10px",
                }}
              />

              {/* Hero number */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 80,
                  color: P.text,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  transform: `scale(${numScale})`,
                  transformOrigin: "left bottom",
                }}
              >
                {card.value}
              </div>

              {/* Label */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  color: P.sub,
                  marginTop: 10,
                  lineHeight: 1.35,
                  maxWidth: cardWidth - 64,
                }}
              >
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: gridLeft,
            ...reveal(frame, at + cardCount * stagger + 16),
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
  compositionId: "dataviz-data-card-grid",
  props: {
    "cards": [
      {
        "value": "18.4M",
        "label": "Monthly impressions"
      },
      {
        "value": "6.2%",
        "label": "CTR"
      },
      {
        "value": "412K",
        "label": "Clicks"
      },
      {
        "value": "97",
        "label": "Markets"
      }
    ],
    "headline": "Campaign summary",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
