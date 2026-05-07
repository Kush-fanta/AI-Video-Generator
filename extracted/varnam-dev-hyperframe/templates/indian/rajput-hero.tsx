import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import { ScallopedBorder } from "../shared/indian/patterns";
import { RAJASTHAN } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface RajputHeroProps {
  /** Main headline text */
  headline: string;
  /** Optional subtitle below headline */
  subtitle?: string;
  /** Optional category label top-left */
  categoryLabel?: string;
  /** Optional source line */
  source?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Bold hero card with RAJASTHAN.pink accent. ScallopedBorder top and bottom.
 * Headline huge (120px) white on deep RAJASTHAN.blue. Marigold accent line.
 */
export const RajputHero: React.FC<RajputHeroProps> = ({
  headline,
  subtitle,
  categoryLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const accentW = lineGrow(frame, at + 10, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: RAJASTHAN.blue }}>
      {/* Scalloped borders */}
      <ScallopedBorder color={RAJASTHAN.marigold} opacity={0.35} side="top" at={at + 5} scallops={14} />
      <ScallopedBorder color={RAJASTHAN.marigold} opacity={0.35} side="bottom" at={at + 8} scallops={14} />

      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: RAJASTHAN.sand,
            opacity: 0.7,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          right: 100,
          transform: `translateY(-50%) scale(${interpolate(frame, [at + 4, at + 12], [1.08, 1], { ...C, easing: ease })})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 4),
            fontFamily: serif,
            fontSize: 120,
            lineHeight: 1.0,
            color: RAJASTHAN.white,
            letterSpacing: "-0.03em",
          }}
        >
          {headline}
        </div>

        {/* Marigold accent line */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 180,
            height: 4,
            backgroundColor: RAJASTHAN.marigold,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {/* Pink accent dot */}
        <div
          style={{
            ...reveal(frame, at + 14),
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: RAJASTHAN.pink,
            marginTop: 18,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 30,
              lineHeight: 1.4,
              color: RAJASTHAN.sand,
              marginTop: 20,
              maxWidth: 700,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            ...reveal(frame, at + 26),
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: RAJASTHAN.sand,
            opacity: 0.5,
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
