import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FlipCardProps extends BaseProps {
  front: string;
  back: string;
  flipAt?: number;
  at?: number;
}

/**
 * FlipCard — A card centered on screen. Flips with CSS 3D rotateY +
 * perspective to reveal content on the back. Front: a question or label.
 * Back: the answer or stat in terracotta. Spring physics for satisfying settle.
 * Portrait 1080x1920.
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  flipAt = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Card entrance — scale spring
  const entranceSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });
  const entranceOpacity = interpolate(f, [0, 12], [0, 1], C);

  // Flip spring — starts at flipAt
  const flipF = Math.max(0, f - flipAt);
  const flipSpring = spring({
    frame: flipF,
    fps: FPS,
    config: { damping: 16, stiffness: 60, mass: 1.0 },
  });

  // Rotation: 0 -> 180 degrees
  const rotateY = interpolate(flipSpring, [0, 1], [0, 180], C);

  // Determine which face is visible
  const showBack = rotateY > 90;

  // Card dimensions
  const cardW = 780;
  const cardH = 560;
  const cardX = (1080 - cardW) / 2;
  const cardY = (1920 - cardH) / 2 - 60;

  // Entrance scale
  const entranceScale = interpolate(entranceSpring, [0, 1], [0.88, 1], C);

  // Subtle shadow shift during flip
  const shadowX = interpolate(rotateY, [0, 90, 180], [0, 16, 0], C);
  const shadowBlur = interpolate(rotateY, [0, 90, 180], [24, 40, 24], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Perspective container */}
      <div
        style={{
          position: "absolute",
          left: cardX,
          top: cardY,
          width: cardW,
          height: cardH,
          perspective: 1200,
          opacity: entranceOpacity,
        }}
      >
        {/* Card — rotates in 3D */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `scale(${entranceScale}) rotateY(${rotateY}deg)`,
            transformOrigin: "50% 50%",
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              backgroundColor: P.bg,
              border: `2px solid ${P.light}`,
              borderRadius: 16,
              boxShadow: `${shadowX}px 8px ${shadowBlur}px rgba(0,0,0,0.08)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 56,
            }}
          >
            {/* Question mark accent */}
            <div
              style={{
                fontFamily: serif,
                fontSize: 120,
                color: P.light,
                lineHeight: 1,
                marginBottom: 20,
                userSelect: "none",
              }}
            >
              ?
            </div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 64,
                lineHeight: 1.25,
                color: P.text,
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {front}
            </div>
          </div>

          {/* Back face — rotated 180deg so it reads correctly when flipped */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: P.dark,
              borderRadius: 16,
              boxShadow: `${-shadowX}px 8px ${shadowBlur}px rgba(0,0,0,0.12)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 56,
            }}
          >
            {/* Terracotta top accent */}
            <div
              style={{
                position: "absolute",
                top: 32,
                left: 56,
                width: 64,
                height: 4,
                backgroundColor: P.terracotta,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontFamily: serif,
                fontSize: 72,
                lineHeight: 1.2,
                color: P.terracotta,
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {back}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle label below card */}
      <div
        style={{
          position: "absolute",
          bottom: cardY - 80,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
            opacity: interpolate(f, [4, 16], [0, 0.6], C),
          }}
        >
          {showBack ? "Answer" : "Question"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-flip-card",
  props: {
    front: "What did India used to be?",
    back: "The back office of the world",
    flipAt: 40,
    at: 15,
  },
  durationInFrames: 180,
};
