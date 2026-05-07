import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface IndexCardProps extends BaseProps {
  title: string;
  body: string;
  annotation?: string;
  at?: number;
}

/* Ruled line color — classic red */
const RULE_RED = "#D4726A";
/* Card off-white */
const CARD_BG = "#F5F3EE";
/* Margin line red */
const MARGIN_RED = "#CC6B63";

/**
 * IndexCard — Physical index card aesthetic.
 * Off-white card with subtle shadow on cream bg.
 * Red horizontal lines, red margin line on left.
 * Content typed in sans for monospace feel.
 * Pin/clip decoration at top.
 */
export const IndexCard: React.FC<IndexCardProps> = ({
  title,
  body,
  annotation,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Card drops in with spring */
  const cardSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 1.1 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [60, 0], C);
  const cardRotate = interpolate(cardSpring, [0, 1], [2, 0], C);

  /* Text typewriter-ish reveal: stagger lines */
  const titleReveal = reveal(frame, at + 10);
  const bodyReveal = reveal(frame, at + 18);

  /* Ruled lines — 12 horizontal lines */
  const lineCount = 12;
  const lineSpacing = 52;
  const topOffset = 200; /* space for title area */

  /* Annotation scribble reveal */
  const annotationSpring = spring({
    frame: Math.max(0, f - 30),
    fps: FPS,
    config: { damping: 20, stiffness: 60, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 860,
          height: 1100,
          transform: `translate(-50%, -50%) translateY(${cardY}px) rotate(${cardRotate}deg)`,
          backgroundColor: CARD_BG,
          borderRadius: 6,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Clip decoration at top */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 64,
            height: 40,
            borderRadius: "0 0 32px 32px",
            backgroundColor: P.slate,
            opacity: 0.7,
            zIndex: 10,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 48,
            height: 28,
            borderRadius: "0 0 24px 24px",
            backgroundColor: P.light,
            opacity: 0.9,
            zIndex: 11,
          }}
        />

        {/* Red margin line — vertical */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 100,
            width: 2,
            height: "100%",
            backgroundColor: MARGIN_RED,
            opacity: 0.45,
          }}
        />

        {/* Second margin line (classic double) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 106,
            width: 1,
            height: "100%",
            backgroundColor: MARGIN_RED,
            opacity: 0.25,
          }}
        />

        {/* Horizontal ruled lines */}
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: topOffset + i * lineSpacing,
              left: 40,
              right: 40,
              height: 1,
              backgroundColor: RULE_RED,
              opacity: interpolate(
                frame,
                [at + 4 + i * 1.5, at + 8 + i * 1.5],
                [0, 0.25],
                C,
              ),
            }}
          />
        ))}

        {/* Title area — above the first ruled line */}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 130,
            right: 60,
            ...titleReveal,
          }}
        >
          <h2
            style={{
              fontFamily: sans,
              fontSize: 42,
              fontWeight: 700,
              color: P.text,
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.2,
              textDecoration: "underline",
              textDecorationColor: MARGIN_RED,
              textDecorationThickness: 2,
              textUnderlineOffset: 8,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Body content — on the ruled lines */}
        <div
          style={{
            position: "absolute",
            top: topOffset + 10,
            left: 130,
            right: 60,
            ...bodyReveal,
          }}
        >
          <p
            style={{
              fontFamily: sans,
              fontSize: 30,
              fontWeight: 400,
              color: P.text,
              margin: 0,
              lineHeight: `${lineSpacing}px`,
              letterSpacing: "0.01em",
            }}
          >
            {body}
          </p>
        </div>

        {/* Annotation — handwritten feel, rotated slightly */}
        {annotation && (
          <div
            style={{
              position: "absolute",
              bottom: 80,
              right: 60,
              opacity: annotationSpring,
              transform: `rotate(-3deg) translateY(${interpolate(annotationSpring, [0, 1], [10, 0], C)}px)`,
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 28,
                fontStyle: "italic",
                color: P.terracotta,
                opacity: 0.8,
              }}
            >
              {annotation}
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-index-card",
  props: {
    title: "GCC Definition",
    body: "A company-owned offshore operation that handles core business functions.",
    annotation: "Key concept",
    at: 15,
  },
  durationInFrames: 180,
};
