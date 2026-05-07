import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextFlipCycleProps extends BaseProps {
  words: string[];
  flipInterval?: number;
  at?: number;
}

/**
 * TextFlipCycle — Split-flap display for full words. A word is displayed,
 * then flips to the next word (CSS 3D rotateX animation). Each flip takes
 * ~15 frames. Cycles through a list. Airport departure board energy.
 */
export const TextFlipCycle: React.FC<TextFlipCycleProps> = ({
  words,
  flipInterval = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  const FLIP_DURATION = 15;

  // Current word index
  const rawIndex = Math.floor(t / flipInterval);
  const currentIndex = Math.min(rawIndex, words.length - 1);
  const nextIndex = Math.min(currentIndex + 1, words.length - 1);

  // How far into the current interval
  const intervalProgress = t - currentIndex * flipInterval;

  // Are we in a flip transition?
  const isFlipping = intervalProgress >= flipInterval - FLIP_DURATION && currentIndex < words.length - 1;
  const flipProgress = isFlipping
    ? interpolate(
        intervalProgress,
        [flipInterval - FLIP_DURATION, flipInterval],
        [0, 1],
        C,
      )
    : 0;

  // Flip uses eased progress
  const easedFlip = ease(flipProgress);

  // The outgoing flap rotates from 0 to -90deg
  const outRotation = interpolate(easedFlip, [0, 1], [0, -90], C);
  // The incoming flap rotates from 90deg to 0
  const inRotation = interpolate(easedFlip, [0, 1], [90, 0], C);

  const currentWord = words[currentIndex] || "";
  const nextWord = words[nextIndex] || "";

  // Board entrance
  const boardSpring = spring({
    frame: Math.max(0, t),
    fps: FPS,
    config: { damping: 16, mass: 1.2, stiffness: 100 },
  });

  const boardScale = interpolate(boardSpring, [0, 1], [0.92, 1], C);
  const boardOpacity = interpolate(boardSpring, [0, 0.3], [0, 1], C);

  // Flap panel style
  const flapBase: React.CSSProperties = {
    width: 800,
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P.dark,
    overflow: "hidden",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    backfaceVisibility: "hidden",
  };

  const textStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 80,
    fontWeight: 700,
    color: P.bg,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Board container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: boardOpacity,
          transform: `scale(${boardScale})`,
        }}
      >
        {/* Split-flap board */}
        <div
          style={{
            position: "relative",
            width: 800,
            height: 320,
            perspective: 1200,
          }}
        >
          {/* STATIC BOTTOM HALF — shows next word (always visible behind) */}
          <div
            style={{
              ...flapBase,
              top: 162,
              borderRadius: "0 0 12px 12px",
              clipPath: "inset(0 0 0 0)", // bottom half
            }}
          >
            <span style={textStyle}>
              {isFlipping ? nextWord : currentWord}
            </span>
          </div>

          {/* STATIC TOP HALF — shows current word */}
          <div
            style={{
              ...flapBase,
              top: 0,
              borderRadius: "12px 12px 0 0",
              clipPath: "inset(0 0 0 0)",
            }}
          >
            <span style={{ ...textStyle, transform: "translateY(40%)" }}>
              {currentWord}
            </span>
          </div>

          {/* FLIPPING TOP FLAP — current word rotating away */}
          {isFlipping && (
            <div
              style={{
                ...flapBase,
                top: 0,
                height: 160,
                borderRadius: "12px 12px 0 0",
                transformOrigin: "center bottom",
                transform: `translateX(-50%) rotateX(${outRotation}deg)`,
                zIndex: 2,
              }}
            >
              <span style={{ ...textStyle, transform: "translateY(40%)" }}>
                {currentWord}
              </span>
            </div>
          )}

          {/* FLIPPING BOTTOM FLAP — next word rotating in */}
          {isFlipping && (
            <div
              style={{
                ...flapBase,
                top: 162,
                height: 160,
                borderRadius: "0 0 12px 12px",
                transformOrigin: "center top",
                transform: `translateX(-50%) rotateX(${inRotation}deg)`,
                zIndex: 2,
              }}
            >
              <span style={{ ...textStyle, transform: "translateY(-40%)" }}>
                {nextWord}
              </span>
            </div>
          )}

          {/* Center split line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 158,
              width: 810,
              height: 4,
              backgroundColor: P.bg,
              zIndex: 3,
              borderRadius: 2,
            }}
          />

          {/* Side rivets */}
          {[0, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                left: side === 0 ? -20 : undefined,
                right: side === 1 ? -20 : undefined,
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: P.muted,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* "DEPARTURES" label — airport board feel */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 0,
          right: 0,
          textAlign: "center",
          ...reveal(frame, at + 4, 14),
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            color: P.muted,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          {currentIndex + 1} of {words.length}
        </span>
      </div>

      {/* Terracotta accent */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: P.terracotta,
          opacity: interpolate(t, [4, 14], [0, 0.6], C),
        }}
      />

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, at + 8, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "ktext-text-flip-cycle",
  props: {
    words: ["Bangalore", "Hyderabad", "Pune", "Chennai", "Delhi"],
    at: 15,
  },
  durationInFrames: 180,
};
