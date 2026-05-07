import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { DarkCanvas } from "../collage/dark-canvas";
import { P } from "../shared/palette";
import { C, FPS, lineGrow, reveal } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export const FEATURE_SPOTLIGHT_DURATION = 210;

interface SpotlightChip {
  label: string;
  detail?: string;
  x: number;
  y: number;
}

export interface FeatureSpotlightProps extends BaseProps {
  category?: string;
  headline: string;
  subheadline?: string;
  featureName: string;
  heroValue?: string;
  heroLabel?: string;
  chips: SpotlightChip[];
  source?: string;
  at?: number;
}

const connectorStyle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    position: "absolute" as const,
    left: x1,
    top: y1,
    width: length,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
    transform: `rotate(${angle}deg) scaleX(${progress})`,
    transformOrigin: "left center",
  };
};

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  category = "DARK PUNCTUATION",
  headline,
  subheadline,
  featureName,
  heroValue,
  heroLabel,
  chips,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const cardX = 660;
  const cardY = 248;
  const cardW = 600;
  const cardH = 492;
  const cardCenterX = cardX + cardW / 2;
  const cardCenterY = cardY + cardH / 2;

  const cardScale = spring({
    frame: Math.max(0, frame - (at + 12)),
    fps: FPS,
    config: { damping: 14, stiffness: 140, mass: 0.65 },
  });

  return (
    <DarkCanvas
      color="#0A0D14"
      highlightColor="rgba(37, 47, 76, 0.65)"
      highlightX={52}
      highlightY={38}
      grain={0.05}
    >
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 100,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.52)",
        }}
      >
        {category}
      </div>

      <div
        style={{
          position: "absolute",
          top: 126,
          left: 100,
          width: `${lineGrow(frame, at + 6, 18)}%`,
          maxWidth: 86,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 999,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 172,
          left: 100,
          maxWidth: 760,
          ...reveal(frame, at + 8),
          fontFamily: serif,
          fontSize: 74,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          color: "#F4EFE7",
        }}
      >
        {headline}
      </div>

      {subheadline ? (
        <div
          style={{
            position: "absolute",
            top: 336,
            left: 100,
            width: 560,
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 28,
            lineHeight: 1.45,
            color: "rgba(244,239,231,0.72)",
          }}
        >
          {subheadline}
        </div>
      ) : null}

      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {[1, 2, 3].map((ring) => {
          const radius = 180 + ring * 78;
          const ringOpacity = interpolate(frame, [at + 10 + ring * 6, at + 38 + ring * 6], [0, 0.25 - ring * 0.04], C);
          return (
            <circle
              key={ring}
              cx={cardCenterX}
              cy={cardCenterY}
              r={radius}
              fill="none"
              stroke={ring === 1 ? "rgba(193,122,72,0.34)" : "rgba(255,255,255,0.12)"}
              strokeWidth={ring === 1 ? 2.5 : 1.5}
              strokeDasharray={ring === 1 ? "10 18" : "6 16"}
              opacity={ringOpacity}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: cardX,
          top: cardY,
          width: cardW,
          height: cardH,
          borderRadius: 34,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(14,17,24,0.92) 100%)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
          transform: `scale(${cardScale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 22%, rgba(193,122,72,0.18), transparent 44%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 34,
            left: 36,
            ...reveal(frame, at + 20),
            fontFamily: sans,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.54)",
          }}
        >
          Contrast beat
        </div>

        <div
          style={{
            position: "absolute",
            left: 36,
            right: 36,
            top: 118,
            ...reveal(frame, at + 24),
            fontFamily: serif,
            fontSize: 88,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: "#F7F1E8",
          }}
        >
          {featureName}
        </div>

        <div
          style={{
            position: "absolute",
            left: 36,
            top: 262,
            width: 146,
            height: 6,
            borderRadius: 999,
            backgroundColor: P.terracotta,
          }}
        />

        {heroValue ? (
          <div
            style={{
              position: "absolute",
              left: 36,
              bottom: 86,
              ...reveal(frame, at + 34),
              fontFamily: serif,
              fontSize: 120,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: "#F7F1E8",
            }}
          >
            {heroValue}
          </div>
        ) : null}

        {heroLabel ? (
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 40,
              ...reveal(frame, at + 40),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            {heroLabel}
          </div>
        ) : null}
      </div>

      {chips.map((chip, index) => {
        const chipAt = at + 28 + index * 10;
        const chipProgress = lineGrow(frame, chipAt, 14) / 100;
        const chipScale = spring({
          frame: Math.max(0, frame - chipAt),
          fps: FPS,
          config: { damping: 15, stiffness: 145, mass: 0.55 },
        });
        const chipWidth = 260;
        const chipHeight = 92;
        const chipCenterX = chip.x + chipWidth / 2;
        const chipCenterY = chip.y + chipHeight / 2;

        return (
          <div key={`${chip.label}-${index}`}>
            <div
              style={connectorStyle(
                cardCenterX,
                cardCenterY,
                chipCenterX,
                chipCenterY,
                chipProgress,
              )}
            />

            <div
              style={{
                position: "absolute",
                left: chip.x,
                top: chip.y,
                width: chipWidth,
                minHeight: chipHeight,
                padding: "18px 18px 16px",
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
                opacity: interpolate(chipScale, [0, 0.35], [0, 1], C),
                transform: `translateY(${interpolate(chipScale, [0, 1], [24, 0], C)}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.48)",
                  marginBottom: 10,
                }}
              >
                Support
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 32,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "#F7F1E8",
                  marginBottom: chip.detail ? 8 : 0,
                }}
              >
                {chip.label}
              </div>
              {chip.detail ? (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 18,
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.66)",
                  }}
                >
                  {chip.detail}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {source ? (
        <div
          style={{
            position: "absolute",
            right: 100,
            bottom: 82,
            ...reveal(frame, at + 102),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.46)",
          }}
        >
          Source: {source}
        </div>
      ) : null}
    </DarkCanvas>
  );
};

export const demo = {
  compositionId: "screen-feature-spotlight",
  props: {
    category: "DARK PUNCTUATION",
    headline: "A single accent can carry the whole frame.",
    subheadline: "The supporting material stays readable while the hero stays dominant.",
    featureName: "Feature Spotlight",
    heroValue: "72%",
    heroLabel: "of reviewers picked the shorter layout",
    chips: [
      {
        label: "Signal",
        detail: "First read",
        x: 1230,
        y: 690
      },
      {
        label: "Rhythm",
        detail: "Timing beat",
        x: 1495,
        y: 560
      },
      {
        label: "Proof",
        detail: "Source trail",
        x: 1405,
        y: 820
      }
    ],
    source: "Internal analysis"
  },
  durationInFrames: 210,
};
