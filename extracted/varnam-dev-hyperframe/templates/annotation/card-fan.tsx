import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CardItem {
  title: string;
  body: string;
}

interface CardFanProps extends BaseProps {
  cards: CardItem[];
  at?: number;
}

/**
 * CardFan — Playing card / flash card metaphor. Cards fan out from
 * a central pivot point, each at a different angle. Spring physics
 * on the fan animation. Cards are cream with thin border. 3-6 cards.
 * Portrait 1080x1920.
 */
export const CardFan: React.FC<CardFanProps> = ({
  cards,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const count = Math.min(cards.length, 6);

  // Fan parameters
  const pivotX = 540; // center of 1080
  const pivotY = 1400; // low pivot for upward fan
  const cardW = 360;
  const cardH = 520;

  // Total fan angle spread — distribute cards evenly
  const totalSpread = Math.min(count * 16, 80);
  const startAngle = -totalSpread / 2;

  // Staggered spring: cards fan out one by one
  const stagger = 6;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {cards.slice(0, count).map((card, i) => {
        const cardAt = 8 + i * stagger;
        const fanSpring = spring({
          frame: Math.max(0, f - cardAt),
          fps: FPS,
          config: { damping: 14, stiffness: 80, mass: 0.8 },
        });
        const opacity = interpolate(f, [cardAt, cardAt + 10], [0, 1], C);

        // Target angle for this card in the fan
        const targetAngle = count === 1
          ? 0
          : startAngle + (totalSpread / (count - 1)) * i;
        const currentAngle = interpolate(fanSpring, [0, 1], [0, targetAngle], C);

        // Card is positioned from pivot, offset upward
        const cardOffsetY = -580;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pivotX,
              top: pivotY,
              width: 0,
              height: 0,
              transform: `rotate(${currentAngle}deg)`,
              transformOrigin: "0 0",
              opacity,
              zIndex: count - i, // first card on top
            }}
          >
            {/* Card body — positioned relative to pivot */}
            <div
              style={{
                position: "absolute",
                left: -cardW / 2,
                top: cardOffsetY,
                width: cardW,
                height: cardH,
                backgroundColor: P.bg,
                border: `1.5px solid ${P.light}`,
                borderRadius: 12,
                padding: 36,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 24,
              }}
            >
              {/* Card number — top left */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 24,
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 700,
                  color: P.muted,
                  letterSpacing: "0.05em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 48,
                  lineHeight: 1.15,
                  color: P.text,
                  letterSpacing: "-0.02em",
                  marginTop: 20,
                }}
              >
                {card.title}
              </div>

              {/* Body */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: P.sub,
                  letterSpacing: "0.01em",
                }}
              >
                {card.body}
              </div>

              {/* Bottom accent line */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 36,
                  width: 48,
                  height: 3,
                  backgroundColor: P.terracotta,
                  borderRadius: 2,
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-card-fan",
  props: {
    cards: [{ title: "Phase 1", body: "Cost centre" }, { title: "Phase 2", body: "Delivery hub" }, { title: "Phase 3", body: "Innovation lab" }],
    at: 15,
  },
  durationInFrames: 180,
};
