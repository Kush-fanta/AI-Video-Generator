import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SplitFlapProps extends BaseProps {
  /** The final text to display — typically a number or short string */
  value: string;
  label: string;
  source?: string;
  at?: number;
}

const FLAP_HEIGHT = 200;
const FLAP_WIDTH = 165;
const FLAP_GAP = 8;

/** Characters the flap cycles through before landing */
const CHAR_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ .-+$%".split("");

/**
 * SplitFlap — Airport departures-board flip animation.
 * Each character flips through the charset before landing on its final value.
 * Mechanical half-split look with top/bottom halves and a center divider.
 */
export const SplitFlap: React.FC<SplitFlapProps> = ({
  value,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const chars = value.toUpperCase().split("");
  const accentWidth = lineGrow(frame, at + 16, 30);

  // Landing overshoot for the whole block
  const lastCharDelay = (chars.length - 1) * 6;
  const landFrame = at + 10 + lastCharDelay + 30;
  const blockScale = overshootScale(frame, landFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Main content — centered vertically, left-anchored */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          transform: "translateY(-55%)",
        }}
      >
        {/* Flap row */}
        <div
          style={{
            ...reveal(frame, at + 4),
            display: "flex",
            gap: FLAP_GAP,
            transform: `scale(${blockScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {chars.map((targetChar, i) => {
            const charAt = at + 10 + i * 6;
            const flipDuration = 30; // frames to cycle through chars

            // Spring for the flip settling
            const settleSpring = spring({
              frame: Math.max(0, frame - charAt),
              fps: FPS,
              config: { damping: 20, stiffness: 80, mass: 0.9 },
            });

            const elapsed = frame - charAt;
            const isLanded = elapsed >= 0 && settleSpring > 0.98;

            // Each flip cycle is split into two half-flaps:
            //   Phase A (0..0.5): bottom flap (outgoing) falls from 0° → +90° (disappears downward)
            //   Phase B (0.5..1): top flap (incoming) falls from -90° → 0° (snaps into place)
            // We run multiple rapid cycles then settle on targetChar.

            // How many full flip cycles have happened so far
            const cycleFrames = 6; // frames per full cycle (snappy mechanical feel)
            const numCycles = isLanded
              ? Math.floor(flipDuration / cycleFrames)
              : elapsed < 0 ? 0 : Math.floor(elapsed / cycleFrames);

            // Progress within the current in-progress cycle [0..1]
            const cycleProgress = elapsed <= 0 ? 0 : isLanded ? 1 : (elapsed % cycleFrames) / cycleFrames;

            // Which chars are showing in this cycle
            const cycleIndex = numCycles % CHAR_SET.length;
            const nextCycleIndex = (numCycles + 1) % CHAR_SET.length;

            let topChar: string;
            let bottomChar: string;
            let topRotateX: number;
            let bottomRotateX: number;

            if (elapsed < 0) {
              // Before this char's turn: blank
              topChar = " ";
              bottomChar = " ";
              topRotateX = 0;
              bottomRotateX = 0;
            } else if (isLanded) {
              // Fully settled: both halves show final char, flat
              topChar = targetChar;
              bottomChar = targetChar;
              topRotateX = 0;
              bottomRotateX = 0;
            } else if (elapsed >= flipDuration) {
              // Landed but spring not confirmed yet
              topChar = targetChar;
              bottomChar = targetChar;
              topRotateX = 0;
              bottomRotateX = 0;
            } else {
              // Snap to targetChar for last cycle
              const showingTarget = elapsed > flipDuration * 0.65;
              const outgoingChar = showingTarget ? targetChar : CHAR_SET[cycleIndex];
              const incomingChar = showingTarget ? targetChar : CHAR_SET[nextCycleIndex];

              if (cycleProgress < 0.5) {
                // Phase A: bottom flap falling — top is static showing outgoing, bottom rotates down
                // Bottom rotates 0° → +90° over first half; snappy spring-like snap
                const phaseA = cycleProgress / 0.5; // 0→1
                bottomChar = outgoingChar;
                topChar = outgoingChar;
                bottomRotateX = interpolate(phaseA, [0, 0.6, 1], [0, 60, 90], C);
                topRotateX = 0;
              } else {
                // Phase B: top flap snapping down — bottom is gone (90°), top falls -90° → 0°
                const phaseB = (cycleProgress - 0.5) / 0.5; // 0→1
                bottomChar = incomingChar;
                topChar = incomingChar;
                topRotateX = interpolate(phaseB, [0, 0.4, 1], [-90, -20, 0], C);
                bottomRotateX = 90; // still down (hidden), then snaps back flat at phase end
                if (phaseB > 0.85) bottomRotateX = 0; // snap bottom flat once top lands
              }
            }

            const charStyle = (color: string): React.CSSProperties => ({
              width: FLAP_WIDTH,
              height: FLAP_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: serif,
              fontSize: 140, // FLAP_HEIGHT * 0.7
              color,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            });

            const landedColor = P.terracotta;
            const flipColor = P.bg;

            return (
              <div
                key={i}
                style={{
                  width: FLAP_WIDTH,
                  height: FLAP_HEIGHT,
                  position: "relative",
                  perspective: 600,
                }}
              >
                {/* Top half — shows incoming char, folds DOWN from -90° to 0° (reveals from above) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: FLAP_WIDTH,
                    height: FLAP_HEIGHT / 2,
                    overflow: "hidden",
                    backgroundColor: "#1A1A18",
                    borderRadius: "8px 8px 0 0",
                    transform: `perspective(600px) rotateX(${topRotateX}deg)`,
                    transformOrigin: "bottom center",
                  }}
                >
                  <div style={charStyle(isLanded ? landedColor : flipColor)}>
                    {topChar}
                  </div>
                </div>

                {/* Bottom half — outgoing char falls away, then snaps back with incoming char */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: FLAP_WIDTH,
                    height: FLAP_HEIGHT / 2,
                    overflow: "hidden",
                    backgroundColor: "#1A1A18",
                    borderRadius: "0 0 8px 8px",
                    transform: `perspective(600px) rotateX(${bottomRotateX}deg)`,
                    transformOrigin: "top center",
                  }}
                >
                  <div
                    style={{
                      ...charStyle(isLanded ? landedColor : flipColor),
                      marginTop: -(FLAP_HEIGHT / 2),
                    }}
                  >
                    {bottomChar}
                  </div>
                </div>

                {/* Center divider — the mechanical split line */}
                <div
                  style={{
                    position: "absolute",
                    top: FLAP_HEIGHT / 2 - 1,
                    left: 0,
                    width: FLAP_WIDTH,
                    height: 2,
                    backgroundColor: P.dark,
                    zIndex: 5,
                  }}
                />

                {/* Side rivets */}
                {[FLAP_HEIGHT / 2 - 4, FLAP_HEIGHT / 2 + 2].map((y, ri) => (
                  <React.Fragment key={ri}>
                    <div
                      style={{
                        position: "absolute",
                        top: y,
                        left: -3,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#333",
                        zIndex: 6,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: y,
                        right: -3,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#333",
                        zIndex: 6,
                      }}
                    />
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 300,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 20),
            fontFamily: sans,
            fontSize: 40,
            color: P.light,
            marginTop: 20,
            lineHeight: 1.35,
            maxWidth: 700,
          }}
        >
          {label}
        </div>

        {/* Source */}
        {source && (
          <div
            style={{
              ...reveal(frame, at + 32),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              marginTop: 44,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "counter-split-flap",
  props: {
    "value": "18.5M",
    "label": "Active audience",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
