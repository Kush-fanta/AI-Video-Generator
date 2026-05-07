import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TickerCrawlProps extends BaseProps {
  tickerText: string;
  headline?: string;
  tag?: string;
  at?: number;
}

/* Ticker bar height */
const TICKER_H = 80;
/* Ticker Y position — bottom third */
const TICKER_Y = 1920 - 300;

/**
 * TickerCrawl — News ticker scrolling across the bottom third.
 * Dark bar (P.dark) spans full width. Text scrolls right-to-left.
 * Above the ticker: static headline or content area.
 * Terracotta tag badge on the left ("LIVE" default).
 */
export const TickerCrawl: React.FC<TickerCrawlProps> = ({
  tickerText,
  headline,
  tag = "LIVE",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Ticker bar slides up from bottom with spring */
  const barSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });
  const barY = interpolate(barSpring, [0, 1], [TICKER_H + 20, 0], C);

  /* Text scroll — continuous right-to-left */
  const textWidth = tickerText.length * 22; /* approximate */
  const scrollX = interpolate(
    frame,
    [at + 8, at + 8 + (textWidth + 1080) / 2],
    [1080, -textWidth],
    { extrapolateLeft: "clamp", extrapolateRight: "extend" as const },
  );

  /* Tag pulse — subtle */
  const tagPulse = 1 + Math.sin(f * 0.15) * 0.04;

  /* Headline entrance */
  const headlineSpring = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 18, stiffness: 60, mass: 1.1 },
  });

  /* Live dot blink */
  const dotOpacity = interpolate(
    Math.sin(f * 0.18),
    [-1, 1],
    [0.25, 1],
    C,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Upper content area — headline */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: TICKER_Y - 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {headline && (
          <>
            <div
              style={{
                opacity: headlineSpring,
                transform: `translateY(${interpolate(headlineSpring, [0, 1], [20, 0], C)}px)`,
              }}
            >
              <h1
                style={{
                  fontFamily: serif,
                  fontSize: 72,
                  lineHeight: 1.1,
                  color: P.text,
                  margin: 0,
                  maxWidth: 880,
                  letterSpacing: "-0.02em",
                }}
              >
                {headline}
              </h1>
            </div>

            {/* Accent line */}
            <div
              style={{
                width: `${lineGrow(frame, at + 12, 24)}%`,
                maxWidth: 160,
                height: 3,
                backgroundColor: P.terracotta,
                marginTop: 32,
                borderRadius: 2,
              }}
            />
          </>
        )}
      </div>

      {/* Thin rule above ticker */}
      <div
        style={{
          position: "absolute",
          top: TICKER_Y - 1,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: P.light,
          opacity: barSpring,
        }}
      />

      {/* Ticker bar */}
      <div
        style={{
          position: "absolute",
          top: TICKER_Y,
          left: 0,
          right: 0,
          height: TICKER_H,
          backgroundColor: P.dark,
          transform: `translateY(${barY}px)`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Tag badge — terracotta, left-anchored */}
        <div
          style={{
            flexShrink: 0,
            backgroundColor: P.terracotta,
            height: "100%",
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            paddingRight: 24,
            gap: 10,
            transform: `scaleX(${tagPulse})`,
            transformOrigin: "left center",
            zIndex: 2,
          }}
        >
          {/* Live dot */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#FFFFFF",
              opacity: dotOpacity,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {tag}
          </span>
        </div>

        {/* Separator dot */}
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(200,194,182,0.3)", flexShrink: 0, marginLeft: 20, marginRight: 8 }} />

        {/* Scrolling text */}
        <div
          style={{
            position: "relative",
            flex: 1,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: `translateX(${scrollX}px) translateY(-50%)`,
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 500,
              color: "#D4D0C8",
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
            }}
          >
            {tickerText}
            {/* Repeat for seamless loop */}
            <span style={{ marginLeft: 120 }}>{tickerText}</span>
          </span>
        </div>
      </div>

      {/* Sub-ticker thin rule */}
      <div style={{ position: "absolute", top: TICKER_Y + TICKER_H, left: 0, right: 0, height: 2, backgroundColor: P.terracotta, opacity: barSpring * 0.6 }} />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-ticker-crawl",
  props: {
    tickerText: "GCC revenue crosses $100B — 1,850 centres operational — 67% of Fortune 30 have Indian GCCs",
    headline: "India GCC Watch",
    tag: "LIVE",
    at: 15,
  },
  durationInFrames: 180,
};
