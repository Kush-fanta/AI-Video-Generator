import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  interpolate,
  registerRoot,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadPT } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

// --- Swarajya tokens ---
const BG    = "#F2EDE7";
const CORAL = "#DC7070";
const INK   = "#202020";
const FPS   = 30;
const W     = 1920;
const H     = 1080;

// --- Fonts ---
const { fontFamily: PT } = loadPT("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

// --- Animation helpers ---
const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const fadeIn = (frame: number, at: number, dur = 16) =>
  interpolate(frame, [at, at + dur], [0, 1], C);
const reveal = (frame: number, at: number, dur = 16) => ({
  opacity: interpolate(frame, [at, at + dur], [0, 1], C),
  transform: `translateY(${interpolate(frame, [at, at + dur], [12, 0], { ...C, easing: ease })}px)`,
});
const scaleX = (frame: number, at: number, dur = 14) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...C, easing: ease });
const scaleY = (frame: number, at: number, dur = 20) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...C, easing: ease });

// --- Props ---
interface PortraitStatProps {
  photoSrc: string;
  label: string;
  heroNumber: string;
  description: string;
  caption?: string;
  at?: number;
}

// --- Component ---
const PortraitStat: React.FC<PortraitStatProps> = ({
  photoSrc,
  label,
  heroNumber,
  description,
  caption,
  at = 0,
}) => {
  const frame = useCurrentFrame() - at;
  const { fps } = useVideoConfig();

  // Seam bar: scaleY 0→1 from top, starts frame 2, duration 22
  const seamScale = scaleY(frame, 2, 22);

  // Image opacity 0→0.92, frame 6, duration 20
  const imgOpacity = interpolate(frame, [6, 6 + 20], [0, 0.92], C);

  // Hero number spring: starts frame 14
  const spr = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 14, stiffness: 100, mass: 1.1 },
  });
  const heroScale = interpolate(spr, [0, 1], [0.82, 1.0], C);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Image zone — right 40%: left 1152, top 0, width 768, height 1080 */}
      <Img
        src={photoSrc}
        style={{
          position: "absolute",
          left: 1152,
          top: 0,
          width: 768,
          height: 1080,
          objectFit: "cover",
          display: "block",
          opacity: imgOpacity,
        }}
      />

      {/* DC7070 seam bar: left 1148, top 0, width 4, height 1080 */}
      <div
        style={{
          position: "absolute",
          left: 1148,
          top: 0,
          width: 4,
          height: 1080,
          background: CORAL,
          transformOrigin: "top center",
          transform: `scaleY(${seamScale})`,
        }}
      />

      {/* Label (eyebrow): left 100, top 172, PT Serif Regular 36px */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 172,
          fontFamily: PT,
          fontWeight: 400,
          fontSize: 36,
          color: INK,
          letterSpacing: 7,
          textTransform: "uppercase",
          opacity: 0.45 * fadeIn(frame, 10),
        }}
      >
        {label}
      </div>

      {/* Hero number: left 88, top 220, PT Serif Bold 320px, CORAL */}
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 220,
          fontFamily: PT,
          fontWeight: 700,
          fontSize: 320,
          color: CORAL,
          lineHeight: 1,
          transformOrigin: "left top",
          transform: `scale(${heroScale})`,
          opacity: fadeIn(frame, 14, 12),
        }}
      >
        {heroNumber}
      </div>

      {/* Stat description: left 100, top 640, PT Serif Regular 44px */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 640,
          fontFamily: PT,
          fontWeight: 400,
          fontSize: 44,
          color: INK,
          lineHeight: 1.35,
          width: 920,
          ...reveal(frame, 28),
        }}
      >
        {description}
      </div>

      {/* Caption (optional): left 100, top 840, IBM Plex Mono 26px */}
      {caption !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 840,
            fontFamily: MONO,
            fontWeight: 400,
            fontSize: 26,
            color: "#8A8A8A",
            opacity: fadeIn(frame, 38),
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// --- Demo ---
export const demo = {
  compositionId: "swarajya-portrait-stat",
  props: {
    photoSrc: staticFile("pilot.png"),
    label: "IAF PILOT STRENGTH",
    heroNumber: "42",
    description: "Sanctioned squadrons. India operates 31. Eleven short — and falling.",
    caption: "CAG Report on IAF Operational Readiness, 2023",
    at: 0,
  },
  durationInFrames: 180,
};

// --- Root ---
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={demo.compositionId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={PortraitStat as any}
      durationInFrames={demo.durationInFrames}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={demo.props}
    />
  );
};

registerRoot(RemotionRoot);

export default PortraitStat;
