import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, ease } from "../shared/primitives";
import { TEXTILE, MUGHAL } from "../shared/indian/palettes";
import { PaisleyBorder } from "../shared/indian/patterns";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ScrollDecreeProps {
  /** Title/heading of the decree */
  title?: string;
  /** Lines of text to inscribe */
  lines: string[];
  /** Optional footer/attribution */
  attribution?: string;
  at?: number;
}

/**
 * ScrollDecree — Text on a manuscript/scroll background.
 * TEXTILE.cream body, rolled edges at top/bottom via SVG.
 * Text reveals line by line as if being inscribed. PaisleyBorder decoration.
 */
export const ScrollDecree: React.FC<ScrollDecreeProps> = ({
  title,
  lines,
  attribution,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const scrollWidth = 1100;
  const scrollLeft = (1920 - scrollWidth) / 2;
  const rollHeight = 50;

  // Scroll unrolls
  const unroll = interpolate(frame, [at, at + 25], [0, 1], { ...C, easing: ease });
  const scrollHeight = 700 * unroll;

  return (
    <AbsoluteFill style={{ backgroundColor: TEXTILE.iron }}>
      {/* Paisley borders */}
      <PaisleyBorder color={MUGHAL.gold} opacity={0.12} side="left" at={at + 5} />
      <PaisleyBorder color={MUGHAL.gold} opacity={0.12} side="right" at={at + 5} />

      {/* Scroll body */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: scrollWidth,
          height: scrollHeight,
          overflow: "hidden",
        }}
      >
        {/* Parchment background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: TEXTILE.cream,
            boxShadow: "inset 0 0 80px rgba(139,109,68,0.15)",
          }}
        />

        {/* Top roll */}
        <svg
          viewBox={`0 0 ${scrollWidth} ${rollHeight}`}
          width={scrollWidth}
          height={rollHeight}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="roll-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A08050" />
              <stop offset="30%" stopColor="#C8A870" />
              <stop offset="50%" stopColor="#D4B888" />
              <stop offset="70%" stopColor="#C8A870" />
              <stop offset="100%" stopColor="#B09060" />
            </linearGradient>
          </defs>
          <ellipse cx={scrollWidth / 2} cy={rollHeight / 2} rx={scrollWidth / 2} ry={rollHeight / 2} fill="url(#roll-top)" />
          {/* Roll shadow */}
          <rect x={0} y={rollHeight - 8} width={scrollWidth} height={8} fill="rgba(0,0,0,0.08)" />
        </svg>

        {/* Bottom roll */}
        <svg
          viewBox={`0 0 ${scrollWidth} ${rollHeight}`}
          width={scrollWidth}
          height={rollHeight}
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="roll-bot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B09060" />
              <stop offset="30%" stopColor="#C8A870" />
              <stop offset="50%" stopColor="#D4B888" />
              <stop offset="70%" stopColor="#C8A870" />
              <stop offset="100%" stopColor="#A08050" />
            </linearGradient>
          </defs>
          <ellipse cx={scrollWidth / 2} cy={rollHeight / 2} rx={scrollWidth / 2} ry={rollHeight / 2} fill="url(#roll-bot)" />
          <rect x={0} y={0} width={scrollWidth} height={8} fill="rgba(0,0,0,0.08)" />
        </svg>

        {/* Text content area */}
        <div
          style={{
            position: "absolute",
            top: rollHeight + 20,
            left: 100,
            right: 100,
            bottom: rollHeight + 20,
          }}
        >
          {/* Title */}
          {title && (
            <div
              style={{
                fontFamily: serif,
                fontSize: 52,
                color: TEXTILE.pomegranate,
                textAlign: "center",
                marginBottom: 30,
                opacity: interpolate(frame, [at + 20, at + 28], [0, 1], C),
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </div>
          )}

          {/* Decorative divider */}
          {title && (
            <div
              style={{
                width: interpolate(frame, [at + 25, at + 40], [0, 300], { ...C, easing: ease }),
                height: 2,
                backgroundColor: MUGHAL.gold,
                margin: "0 auto 30px",
                opacity: 0.5,
              }}
            />
          )}

          {/* Lines — inscribed one by one */}
          {lines.map((line, i) => {
            const lineDelay = at + 30 + i * 12;
            const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 8], [0, 1], C);
            // Text appears character by character
            const charProgress = interpolate(frame, [lineDelay, lineDelay + 15], [0, 1], { ...C, easing: ease });
            const visibleChars = Math.floor(charProgress * line.length);

            return (
              <div
                key={i}
                style={{
                  fontFamily: serif,
                  fontSize: 34,
                  color: TEXTILE.iron,
                  lineHeight: 1.7,
                  textAlign: "center",
                  opacity: lineOpacity,
                  minHeight: 58,
                }}
              >
                {line.slice(0, visibleChars)}
                {visibleChars < line.length && (
                  <span style={{ opacity: 0.3 }}>|</span>
                )}
              </div>
            );
          })}

          {/* Attribution */}
          {attribution && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: TEXTILE.madder,
                textAlign: "center",
                marginTop: 40,
                fontStyle: "italic",
                opacity: interpolate(
                  frame,
                  [at + 30 + lines.length * 12 + 10, at + 30 + lines.length * 12 + 18],
                  [0, 0.7],
                  C
                ),
              }}
            >
              — {attribution}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
