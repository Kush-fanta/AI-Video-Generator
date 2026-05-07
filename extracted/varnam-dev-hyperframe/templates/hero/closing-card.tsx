import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ClosingCardProps extends BaseProps {
  channelName: string;
  cta?: string;
  tagline?: string;
  at?: number;
}

/**
 * End card. Channel name massive serif left-aligned. CTA in muted uppercase sans.
 * Terracotta accent line grows beneath name. Ghost channel name rotated on right edge.
 * Thin vertical rule separates content from ghost zone. Minimal, confident close.
 */
export const ClosingCard: React.FC<ClosingCardProps> = ({
  channelName,
  cta = "Subscribe",
  tagline,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const ghostOpacity = interpolate(frame, [at + 18, at + 38], [0, 0.04], C);
  const accentW = lineGrow(frame, at + 14, 36);
  const vertH = lineGrow(frame, at + 8, 30);
  const bottomRule = lineGrow(frame, at + 26, 28);

  // Staggered dot reveal
  const dotScale = interpolate(frame, [at + 30, at + 38], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost channel name — rotated vertically along right edge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 120,
          transform: "translateY(-50%) rotate(90deg)",
          transformOrigin: "center center",
          fontFamily: serif,
          fontSize: 220,
          lineHeight: 1,
          color: P.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.06em",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {channelName}
      </div>

      {/* Thin vertical rule — right third divider */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: 720,
          width: 1,
          height: `${vertH * 0.7}%`,
          maxHeight: 1000,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />

      {/* Top-left editorial mark: three stacked lines */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          ...reveal(frame, at + 4),
        }}
      >
        <div style={{ width: 32, height: 1.5, backgroundColor: P.muted, opacity: 0.5 }} />
        <div style={{ width: 20, height: 1.5, backgroundColor: P.terracotta, opacity: 0.7 }} />
      </div>

      {/* Main content block — left-weighted */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 680,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
        }}
      >
        {/* Channel name — large serif */}
        <div style={reveal(frame, at + 6)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 112,
              lineHeight: 1.0,
              color: P.text,
              letterSpacing: "-0.03em",
            }}
          >
            {channelName}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 220,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 36,
            borderRadius: 1.5,
          }}
        />

        {/* Tagline if provided */}
        {tagline && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 26,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 24,
              maxWidth: 480,
              fontWeight: 400,
            }}
          >
            {tagline}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            ...reveal(frame, at + 28),
            fontFamily: sans,
            fontSize: 20,
            color: P.muted,
            marginTop: tagline ? 32 : 40,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Terracotta dot before CTA */}
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: P.terracotta,
              transform: `scale(${dotScale})`,
            }}
          />
          {cta}
        </div>
      </div>

      {/* Bottom-left thin rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${bottomRule * 0.4}%`,
          maxWidth: 340,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />

      {/* Bottom-right muted channel echo */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 100,
          ...reveal(frame, at + 36),
          fontFamily: sans,
          fontSize: 14,
          letterSpacing: "0.2em",
          color: P.muted,
          textTransform: "uppercase",
          opacity: 0.5,
        }}
      >
        {channelName}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-closing-card",
  "props": {
    "channelName": "INDIA PILL",
    "cta": "Subscribe for data-backed analysis",
    "tagline": "Data-backed analysis of India's transformation",
    "at": 15
  },
  "durationInFrames": 180
};
