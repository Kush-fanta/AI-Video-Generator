import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PinItem {
  text: string;
  rotation?: number;
}

interface PinBoardProps extends BaseProps {
  items: PinItem[];
  title?: string;
  at?: number;
}

// Predefined positions for up to 6 items on the board
const POSITIONS = [
  { x: 80, y: 440 },
  { x: 560, y: 380 },
  { x: 120, y: 860 },
  { x: 520, y: 900 },
  { x: 300, y: 1320 },
  { x: 620, y: 1280 },
];

/**
 * PinBoard — Cork board texture background. Multiple items pinned
 * at slight rotations, each appearing with a spring drop. Push pin
 * graphics (small circles with shadow) at top of each card.
 * Portrait 1080x1920.
 */
export const PinBoard: React.FC<PinBoardProps> = ({
  items,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const count = Math.min(items.length, 6);
  const stagger = 10;

  // Title reveal
  const titleReveal = reveal(frame, at);

  return (
    <AbsoluteFill>
      {/* Cork board background — warm textured brown */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#C4A97D",
          backgroundImage: [
            "radial-gradient(ellipse at 20% 50%, rgba(180,150,110,0.6) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 30%, rgba(160,130,90,0.4) 0%, transparent 40%)",
            "radial-gradient(ellipse at 50% 80%, rgba(170,140,100,0.5) 0%, transparent 45%)",
          ].join(", "),
        }}
      >
        {/* Subtle noise texture via repeating gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
          }}
        />
      </div>

      {/* Title — top area */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 180,
            left: 80,
            right: 80,
            ...titleReveal,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              color: "#2A2016",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Pinned items */}
      {items.slice(0, count).map((item, i) => {
        const itemAt = (title ? 14 : 6) + i * stagger;
        const dropSpring = spring({
          frame: Math.max(0, f - itemAt),
          fps: FPS,
          config: { damping: 11, stiffness: 130, mass: 0.55 },
        });
        const opacity = interpolate(f, [itemAt, itemAt + 8], [0, 1], C);

        const pos = POSITIONS[i];
        const rot = item.rotation ?? (i % 2 === 0 ? -3 + i : 2 + i);
        const cardW = 400;
        const cardH = 300;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: cardW,
              opacity,
              transform: `rotate(${rot}deg) translateY(${interpolate(dropSpring, [0, 1], [-40, 0], C)}px) scale(${interpolate(dropSpring, [0, 1], [0.85, 1], C)})`,
              transformOrigin: "50% 0%",
              zIndex: i + 1,
            }}
          >
            {/* Card body */}
            <div
              style={{
                width: cardW,
                minHeight: cardH,
                backgroundColor: P.bg,
                borderRadius: 3,
                padding: 36,
                boxShadow: "0 6px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 40,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: P.text,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.text}
              </div>
            </div>

            {/* Push pin */}
            <div
              style={{
                position: "absolute",
                top: -10,
                left: cardW / 2 - 12,
                width: 24,
                height: 24,
                borderRadius: 12,
                background: `radial-gradient(circle at 40% 35%, ${P.terracotta}, #8B4A1A)`,
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-pin-board",
  props: {
    items: [{ text: "1,850 GCCs" }, { text: "$100B revenue" }, { text: "67% Fortune 30" }],
    title: "Key Facts",
    at: 15,
  },
  durationInFrames: 180,
};
