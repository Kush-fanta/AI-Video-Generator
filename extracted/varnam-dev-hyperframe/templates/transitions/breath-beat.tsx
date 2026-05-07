import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface BreathBeatProps extends BaseProps {
  /** The contemplative line — italic serif */
  text: string;
  /** Optional second line in muted sans, appears later */
  subtext?: string;
  /** Frame when subtext appears */
  subtextAt?: number;
  /** Frame when primary text appears (default 0) */
  at?: number;
}

/**
 * BreathBeat — the "let that sink in" moment.
 * Cream bg. Single italic serif line (64px, P.sub) centred in frame.
 * Thin accent line below, centred. Optional muted sans subtext arrives later.
 * Contemplation, not emptiness.
 */
export const BreathBeat: React.FC<BreathBeatProps> = ({
  text,
  subtext,
  subtextAt,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const resolvedSubtextAt = subtextAt ?? at + 40;

  // Spring-based reveal for primary text
  const textSpring = spring({ frame: frame - at, fps: FPS, config: { damping: 14, mass: 0.8, stiffness: 120 }, durationInFrames: 30 });
  // Spring-based reveal for subtext
  const subSpring = spring({ frame: frame - resolvedSubtextAt, fps: FPS, config: { damping: 14, mass: 0.8, stiffness: 120 }, durationInFrames: 30 });
  // Spring-based accent line grow
  const lineSpring = spring({ frame: frame - (at + 12), fps: FPS, config: { damping: 18, mass: 1, stiffness: 80 }, durationInFrames: 40 });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main content — full-width centred column */}
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
          alignItems: "center",
          paddingLeft: 120,
          paddingRight: 120,
          boxSizing: "border-box",
        }}
      >
        {/* Primary text */}
        <div
          style={{
            opacity: textSpring,
            transform: `translateY(${interpolate(textSpring, [0, 1], [14, 0])}px)`,
            fontFamily: serif,
            fontSize: 64,
            lineHeight: 1.35,
            color: P.sub,
            fontStyle: "italic",
            maxWidth: 840,
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          {text}
        </div>

        {/* Thin accent line — centred, restrained */}
        <div
          style={{
            width: `${lineSpring * 100}%`,
            maxWidth: 80,
            height: 2,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 1,
            opacity: 0.6,
          }}
        />

        {/* Subtext — muted sans, arrives later */}
        {subtext && (
          <div
            style={{
              opacity: subSpring,
              transform: `translateY(${interpolate(subSpring, [0, 1], [14, 0])}px)`,
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              marginTop: 24,
              maxWidth: 600,
              lineHeight: 1.5,
              fontWeight: 400,
              textAlign: "center",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-breath-beat",
  props: {
    text: "Let that sink in.",
    subtext: "The frame needs a quiet beat before it moves again.",
    subtextAt: 42
  },
  durationInFrames: 180,
};
