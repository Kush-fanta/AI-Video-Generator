import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface DatelineProps extends BaseProps {
  location: string;
  date: string;
  lede: string;
  at?: number;
}

/**
 * Dateline — Journalistic dateline opener.
 * Location in uppercase bold sans, em dash, date.
 * Thin rule separates dateline from body.
 * Lede paragraph in serif. Wire-service authority.
 */
export const Dateline: React.FC<DatelineProps> = ({
  location,
  date,
  lede,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* Location snaps in with spring */
  const locSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  /* Rule grows */
  const ruleWidth = lineGrow(frame, at + 8, 28);

  /* Lede entrance */
  const ledeSpring = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 18, stiffness: 60, mass: 1.1 },
  });

  /* Drop cap scale for the first letter of lede */
  const dropCapScale = spring({
    frame: Math.max(0, f - 18),
    fps: FPS,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const firstChar = lede.charAt(0);
  const restOfLede = lede.slice(1);

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
        {/* Dateline row: LOCATION — date */}
        <div
          style={{
            opacity: locSpring,
            transform: `translateX(${interpolate(locSpring, [0, 1], [-20, 0], C)}px)`,
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.text,
            }}
          >
            {location}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 32,
              color: P.muted,
              fontWeight: 400,
            }}
          >
            {"\u2014"}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            {date}
          </span>
        </div>

        {/* Separator rule */}
        <div
          style={{
            width: `${ruleWidth}%`,
            height: 1,
            backgroundColor: P.text,
            marginTop: 28,
            marginBottom: 44,
          }}
        />

        {/* Lede paragraph with drop cap */}
        <div
          style={{
            opacity: ledeSpring,
            transform: `translateY(${interpolate(ledeSpring, [0, 1], [18, 0], C)}px)`,
            display: "flex",
            gap: 8,
            maxWidth: 840,
          }}
        >
          {/* Drop cap */}
          <span
            style={{
              fontFamily: serif,
              fontSize: 120,
              lineHeight: 0.82,
              color: P.terracotta,
              fontWeight: 400,
              transform: `scale(${dropCapScale})`,
              transformOrigin: "left top",
              flexShrink: 0,
              marginRight: 8,
              marginTop: 4,
            }}
          >
            {firstChar}
          </span>

          {/* Rest of lede */}
          <p
            style={{
              fontFamily: serif,
              fontSize: 40,
              lineHeight: 1.48,
              color: P.text,
              margin: 0,
              flex: 1,
            }}
          >
            {restOfLede}
          </p>
        </div>

        {/* Wire credit */}
        <div
          style={{
            ...reveal(frame, at + 34),
            marginTop: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 24,
                height: 1,
                backgroundColor: P.light,
              }}
            />
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
              Wire report
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-dateline",
  props: {
    location: "BANGALORE",
    date: "April 9, 2026",
    lede: "The city that houses more than 500 global capability centres has quietly become the world's largest tech hub.",
    at: 15,
  },
  durationInFrames: 180,
};
