import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CorrectionNoticeProps extends BaseProps {
  original: string;
  corrected: string;
  date?: string;
  at?: number;
}

/**
 * CorrectionNotice — Formal editorial correction.
 * "CORRECTION" header in uppercase sans with terracotta underline.
 * Original text in serif with animated strikethrough.
 * Corrected text below in bold. Date stamp.
 * Institutional, serious.
 */
export const CorrectionNotice: React.FC<CorrectionNoticeProps> = ({
  original,
  corrected,
  date,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Header entrance spring */
  const headerSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 90, mass: 1 },
  });

  /* Strikethrough line progress — sweeps across after original text appears */
  const strikeProgress = interpolate(
    frame,
    [at + 18, at + 40],
    [0, 100],
    { ...C, easing: ease },
  );

  /* Original text fade to muted when struck */
  const originalDim = interpolate(
    frame,
    [at + 30, at + 42],
    [1, 0.4],
    C,
  );

  /* Corrected text entrance spring */
  const correctedSpring = spring({
    frame: Math.max(0, f - 40),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        {/* CORRECTION header */}
        <div
          style={{
            opacity: headerSpring,
            transform: `translateY(${interpolate(headerSpring, [0, 1], [20, 0], C)}px)`,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: P.text,
            }}
          >
            Correction
          </span>
        </div>

        {/* Terracotta underline */}
        <div
          style={{
            width: `${lineGrow(frame, at + 4, 22)}%`,
            maxWidth: 260,
            height: 3,
            backgroundColor: P.terracotta,
            marginBottom: 56,
            borderRadius: 2,
          }}
        />

        {/* Date stamp */}
        {date && (
          <div
            style={{
              ...reveal(frame, at + 6),
              marginBottom: 36,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 500,
                color: P.muted,
                letterSpacing: "0.06em",
              }}
            >
              {date}
            </span>
          </div>
        )}

        {/* Original text with strikethrough */}
        <div
          style={{
            ...reveal(frame, at + 10),
            position: "relative",
            marginBottom: 48,
            opacity: originalDim,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: 44,
              lineHeight: 1.4,
              color: P.sub,
              margin: 0,
              maxWidth: 820,
            }}
          >
            {original}
          </p>

          {/* Animated strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikeProgress}%`,
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Thin divider */}
        <div
          style={{
            width: `${lineGrow(frame, at + 36, 18)}%`,
            maxWidth: 80,
            height: 1,
            backgroundColor: P.light,
            marginBottom: 40,
          }}
        />

        {/* Corrected text */}
        <div
          style={{
            opacity: correctedSpring,
            transform: `translateY(${interpolate(correctedSpring, [0, 1], [16, 0], C)}px)`,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.38,
              color: P.text,
              margin: 0,
              maxWidth: 820,
            }}
          >
            {corrected}
          </p>
        </div>

        {/* Institutional footer */}
        <div
          style={{
            ...reveal(frame, at + 54),
            marginTop: 60,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: P.muted,
              textTransform: "uppercase",
            }}
          >
            This correction has been appended to the original article
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-correction-notice",
  props: {
    original: "India is the back office of the world",
    corrected: "India is the brain centre of the world",
    date: "2024",
    at: 15,
  },
  durationInFrames: 180,
};
