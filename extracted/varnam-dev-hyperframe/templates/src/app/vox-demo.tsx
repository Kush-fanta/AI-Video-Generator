/**
 * Vox-style demo — ACTUAL chaotic energy.
 * Hard snaps, not springs. Rotation. Screen shake. Saturated color.
 * Things SLAM and STOP. Collage layering. Nothing is elegant.
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { FPS, C } from "../../shared/primitives";

const { fontFamily: sans } = loadSans();

// ── Vox palette — SATURATED, not muted ───────────────────────────────────────
const VOX = {
  yellow: "#FFD100",
  red: "#E63B2E",
  blue: "#1B4D8F",
  darkBlue: "#0D2B52",
  white: "#FFFFFF",
  black: "#111111",
  cream: "#F5F0E8",
};

// ── Hard snap easing — NOT spring. Cubic overshoot that STOPS. ───────────────
const snap = (t: number) => {
  // Overshoots to 1.08 then snaps back. Harsh.
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 4) * (1 - t < 0 ? 1 : 1);
};

// Camera shake — rapid small offsets that decay
const shake = (frame: number, startAt: number, intensity = 6) => {
  const t = frame - startAt;
  if (t < 0 || t > 8) return { x: 0, y: 0, rot: 0 };
  const decay = 1 - t / 8;
  const seed = Math.sin(t * 47.3) * 43758.5453;
  const x = (seed - Math.floor(seed) - 0.5) * intensity * 2 * decay;
  const y = (Math.sin(t * 73.1) * 0.5) * intensity * 2 * decay;
  const rot = (Math.sin(t * 31.7) * 0.5) * 1.5 * decay;
  return { x, y, rot };
};

// Hard cut entrance — frame 0 to frame N, no easing grace period
const hardIn = (frame: number, at: number, dur: number = 4) =>
  interpolate(frame, [at, at + dur], [0, 1], C);

// Scale slam — goes BIG then snaps to 1
const scaleSLAM = (frame: number, at: number) => {
  const t = hardIn(frame, at, 6);
  if (t <= 0) return 0;
  if (t < 0.6) return interpolate(t, [0, 0.6], [1.4, 1.0], C);
  return 1.0;
};

// ── Animation 1: Cutout Slam ─────────────────────────────────────────────────
// Bold yellow bg. Cutout SLAMS in with rotation. Text SMASHES from left.
// Screen shakes on impact. Drop shadows. Nothing subtle.

const CutoutSlam: React.FC = () => {
  const frame = useCurrentFrame();

  // Screen shake on cutout landing (frame 12)
  const s1 = shake(frame, 12, 8);
  // Second shake on text slam (frame 18)
  const s2 = shake(frame, 18, 5);
  const totalShake = {
    x: s1.x + s2.x,
    y: s1.y + s2.y,
    rot: s1.rot + s2.rot,
  };

  // Cutout SLAMS from right — hard, not springy
  const cutoutProgress = hardIn(frame, 8, 4);
  const cutoutX = interpolate(cutoutProgress, [0, 1], [600, 0], C);
  const cutoutRot = interpolate(cutoutProgress, [0, 1], [12, -2], C);
  // Settle rotation
  const cutoutRotSettle = frame > 14
    ? interpolate(frame, [14, 20], [-2, 0], C)
    : cutoutRot;

  // Text SMASHES from left
  const textProgress = hardIn(frame, 14, 3);
  const textX = interpolate(textProgress, [0, 1], [-400, 0], C);

  // Number scales in HUGE then snaps
  const numScale = scaleSLAM(frame, 20);

  // Bottom bar wipes in
  const barWidth = hardIn(frame, 26, 5);

  // "every single day" drops in
  const tagDrop = hardIn(frame, 30, 3);
  const tagY = interpolate(tagDrop, [0, 1], [-40, 0], C);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: VOX.yellow,
        transform: `translate(${totalShake.x}px, ${totalShake.y}px) rotate(${totalShake.rot}deg)`,
      }}
    >
      {/* Bold geometric shape — blue rectangle, tilted */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -80,
          width: 900,
          height: 1200,
          backgroundColor: VOX.blue,
          transform: "rotate(-8deg)",
          opacity: hardIn(frame, 4, 3),
          zIndex: 1,
        }}
      />

      {/* Cutout — SLAMS in with rotation, drop shadow */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: -20,
          width: 650,
          height: 750,
          transform: `translateX(${cutoutX}px) rotate(${cutoutRotSettle}deg)`,
          opacity: cutoutProgress,
          zIndex: 3,
          filter: "drop-shadow(8px 8px 0px rgba(0,0,0,0.3))",
        }}
      >
        <Img
          src={staticFile("demo-cutout.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Text block — left side, HARD entrance */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 80,
          transform: `translateX(${textX}px) translateY(-55%)`,
          zIndex: 4,
          maxWidth: 750,
        }}
      >
        {/* Big number */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 180,
            fontWeight: 900,
            lineHeight: 0.9,
            color: VOX.white,
            transform: `scale(${numScale})`,
            transformOrigin: "left bottom",
            textShadow: "4px 4px 0px rgba(0,0,0,0.2)",
            letterSpacing: "-0.04em",
          }}
        >
          553M
        </div>

        {/* Label — red bg, white text, tilted */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: VOX.red,
            padding: "8px 24px",
            marginTop: 12,
            transform: "rotate(-1deg)",
            opacity: textProgress,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 32,
              fontWeight: 800,
              color: VOX.white,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            transactions per day
          </span>
        </div>

        {/* Separator bar */}
        <div
          style={{
            width: interpolate(barWidth, [0, 1], [0, 500], C),
            height: 6,
            backgroundColor: VOX.black,
            marginTop: 24,
          }}
        />

        {/* "every single day" tag */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 56,
            fontWeight: 900,
            color: VOX.black,
            marginTop: 16,
            opacity: tagDrop,
            transform: `translateY(${tagY}px)`,
            letterSpacing: "-0.02em",
          }}
        >
          More than Visa +<br />Mastercard combined.
        </div>
      </div>

      {/* Source — bottom left, hard black on yellow */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 80,
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          color: VOX.black,
          opacity: hardIn(frame, 40, 4),
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          zIndex: 5,
        }}
      >
        NPCI March 2025
      </div>
    </AbsoluteFill>
  );
};

// ── Animation 2: Word Stack ──────────────────────────────────────────────────
// Words SLAM in one at a time, stacking vertically. Each new word pushes
// the previous ones up. Bold, uppercase, huge. Different colors.
// Final word gets the red treatment. Screen shakes on each word.

const WORDS = [
  { word: "INDIA", color: VOX.darkBlue },
  { word: "BUILT", color: VOX.darkBlue },
  { word: "THE WORLD'S", color: VOX.blue },
  { word: "LARGEST", color: VOX.red },
  { word: "PAYMENT RAIL.", color: VOX.black },
  { word: "FOR FREE.", color: VOX.red },
];

const WORD_INTERVAL = 18; // frames between each word slam

const WordStack: React.FC = () => {
  const frame = useCurrentFrame();

  // Which words are visible
  const visibleCount = WORDS.reduce(
    (acc, _, i) => (frame >= 10 + i * WORD_INTERVAL ? acc + 1 : acc),
    0
  );

  // Combine all shakes
  let shakeX = 0, shakeY = 0, shakeRot = 0;
  for (let i = 0; i < WORDS.length; i++) {
    const s = shake(frame, 10 + i * WORD_INTERVAL, 6);
    shakeX += s.x;
    shakeY += s.y;
    shakeRot += s.rot;
  }

  // Background shifts on final word
  const isFinal = visibleCount >= WORDS.length;
  const bgColor = isFinal ? VOX.yellow : VOX.cream;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg)`,
        transition: "background-color 0.08s",
      }}
    >
      {/* Cutout — behind text, appears mid-sequence */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 0,
          width: 480,
          height: 580,
          opacity: interpolate(frame, [50, 60], [0, 0.15], C),
          zIndex: 1,
          filter: "grayscale(100%)",
        }}
      >
        <Img
          src={staticFile("demo-cutout.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Word stack */}
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
          paddingLeft: 80,
          paddingRight: 200,
          zIndex: 2,
        }}
      >
        {WORDS.map((w, i) => {
          const wordAt = 10 + i * WORD_INTERVAL;
          const isVisible = frame >= wordAt;
          if (!isVisible) return null;

          const wordFrame = frame - wordAt;
          const scale = scaleSLAM(frame, wordAt);
          const isLast = i === WORDS.length - 1;

          // Previous words compress slightly when new one arrives
          const nextWordAt = 10 + (i + 1) * WORD_INTERVAL;
          const compress = i < WORDS.length - 1 && frame >= nextWordAt
            ? interpolate(frame, [nextWordAt, nextWordAt + 4], [1, 0.85], C)
            : 1;

          return (
            <div
              key={i}
              style={{
                fontFamily: sans,
                fontSize: isLast ? 96 : 80,
                fontWeight: 900,
                lineHeight: 1.05,
                color: isLast && isFinal ? VOX.red : w.color,
                transform: `scale(${scale * compress})`,
                transformOrigin: "left center",
                letterSpacing: "-0.03em",
                marginBottom: 4,
                textShadow: isLast
                  ? "3px 3px 0px rgba(0,0,0,0.15)"
                  : "none",
              }}
            >
              {w.word}
            </div>
          );
        })}
      </div>

      {/* Red underline on final word */}
      {isFinal && (
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: 80,
            width: interpolate(
              frame,
              [10 + (WORDS.length - 1) * WORD_INTERVAL + 4, 10 + (WORDS.length - 1) * WORD_INTERVAL + 10],
              [0, 400],
              C
            ),
            height: 8,
            backgroundColor: VOX.red,
            zIndex: 3,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ── Combined ─────────────────────────────────────────────────────────────────

const s = (sec: number) => Math.round(sec * FPS);

export const VoxDemo: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={s(6)}>
      <CutoutSlam />
    </Sequence>
    <Sequence from={s(6)} durationInFrames={s(6)}>
      <WordStack />
    </Sequence>
  </AbsoluteFill>
);

export const VOX_DEMO_DURATION = s(12);
