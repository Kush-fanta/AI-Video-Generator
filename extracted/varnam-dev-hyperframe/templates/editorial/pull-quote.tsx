import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PullQuoteProps extends BaseProps {
  quote: string;
  attribution: string;
  publication?: string;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * PullQuote — Magazine-style pull quote.
 * Massive decorative opening quotation mark (400px, light opacity).
 * Quote text 52px serif. Attribution with em dash.
 * Terracotta vertical bar on left edge.
 */
export const PullQuote: React.FC<PullQuoteProps> = ({
  quote,
  attribution,
  publication,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  /* Terracotta bar height animates with spring */
  const barHeight = spring({
    frame: f,
    fps: FPS,
    config: { damping: 18, stiffness: 60, mass: 1.1 },
  });

  /* Decorative mark fade */
  const markOpacity = spring({
    frame: Math.max(0, f - 4),
    fps: FPS,
    config: { damping: 22, stiffness: 40, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Terracotta vertical bar — left edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: `${50 - barHeight * 30}%`,
          width: 6,
          height: `${barHeight * 60}%`,
          backgroundColor: pal.terracotta,
          borderRadius: 3,
        }}
      />

      {/* Decorative opening quotation mark */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          fontFamily: serif,
          fontSize: 400,
          lineHeight: 0.7,
          color: pal.light,
          opacity: markOpacity * 0.15,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {"\u201C"}
      </div>

      {/* Quote content block */}
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
          paddingLeft: 120,
          paddingRight: 100,
        }}
      >
        {/* Quote text */}
        <div
          style={{
            ...reveal(frame, at + 8),
            fontFamily: serif,
            fontSize: 52,
            lineHeight: 1.38,
            color: pal.text,
            letterSpacing: "0.01em",
            maxWidth: 820,
          }}
        >
          {"\u201C"}{quote}{"\u201D"}
        </div>

        {/* Thin rule separator */}
        <div
          style={{
            width: `${lineGrow(frame, at + 18, 20)}%`,
            maxWidth: 120,
            height: 2,
            backgroundColor: pal.terracotta,
            marginTop: 40,
            marginBottom: 28,
            borderRadius: 1,
          }}
        />

        {/* Attribution */}
        <div style={reveal(frame, at + 22)}>
          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 600,
              color: pal.sub,
            }}
          >
            {"\u2014"} {attribution}
          </span>
        </div>

        {/* Publication */}
        {publication && (
          <div
            style={{
              ...reveal(frame, at + 28),
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 500,
                fontStyle: "italic",
                color: pal.muted,
                letterSpacing: "0.02em",
              }}
            >
              {publication}
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-pull-quote",
  props: {
    quote: "GCCs in India have moved beyond back-office roles into strategic hubs.",
    attribution: "Economic Survey",
    publication: "2024-25",
    at: 15,
  },
  durationInFrames: 180,
};
