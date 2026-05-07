import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface Era {
  label: string;
  startYear: string;
  endYear: string;
  description: string;
  stat?: string;
  statLabel?: string;
}

interface EraSpotlightProps extends BaseProps {
  eras: Era[];
  activeIndex?: number;
  category?: string;
  source?: string;
  at?: number;
}

/**
 * EraSpotlight — Portrait 1080×1920. Horizontal timeline bar near
 * the top third. One segment highlighted in terracotta. Below the
 * bar: large year range in serif, era description, and a key stat.
 * Non-active segments dim. The hero era content springs in with
 * editorial left-aligned layout.
 */
export const EraSpotlight: React.FC<EraSpotlightProps> = ({
  eras,
  activeIndex = 0,
  category = "HISTORY",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const trackLeft = 100;
  const trackRight = 100;
  const trackWidth = 1080 - trackLeft - trackRight;
  const trackY = 500;
  const trackHeight = 8;
  const eraCount = eras.length;
  const eraWidth = trackWidth / eraCount;

  const activeEra = eras[activeIndex];

  // Spotlight spring
  const spotSpring = spring({
    frame: Math.max(0, f - 12),
    fps: FPS,
    config: { damping: 16, stiffness: 60, mass: 0.7 },
  });

  // Card spring (delayed)
  const cardSpring = spring({
    frame: Math.max(0, f - 30),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.6 },
  });

  // Stat spring (further delayed)
  const statSpring = spring({
    frame: Math.max(0, f - 50),
    fps: FPS,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: trackLeft,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      {/* Timeline track background */}
      <div
        style={{
          position: "absolute",
          top: trackY,
          left: trackLeft,
          width: `${lineGrow(frame, at + 6, 20)}%`,
          maxWidth: trackWidth,
          height: trackHeight,
          backgroundColor: P.light,
          borderRadius: trackHeight / 2,
        }}
      />

      {/* Era segments */}
      {eras.map((era, i) => {
        const segX = trackLeft + eraWidth * i;
        const isActive = i === activeIndex;
        const segColor = isActive ? P.terracotta : P.slate;

        const segOpacity = isActive
          ? 1
          : interpolate(spotSpring, [0, 1], [0.7, 0.18], C);

        const segScale = isActive
          ? interpolate(spotSpring, [0, 1], [1, 2.8], C)
          : 1;

        return (
          <div key={i}>
            {/* Segment bar */}
            <div
              style={{
                ...reveal(frame, at + 8 + i * 6),
                position: "absolute",
                top: trackY - 1,
                left: segX + 3,
                width: eraWidth - 6,
                height: trackHeight + 2,
                backgroundColor: segColor,
                borderRadius: 4,
                opacity: segOpacity,
                transform: `scaleY(${segScale})`,
                transformOrigin: "center center",
              }}
            />

            {/* Era label above track */}
            <div
              style={{
                ...reveal(frame, at + 10 + i * 6),
                position: "absolute",
                top: trackY - 44,
                left: segX,
                width: eraWidth,
                textAlign: "center",
                fontFamily: sans,
                fontSize: isActive ? 20 : 16,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? P.text : P.muted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                opacity: segOpacity,
              }}
            >
              {era.label}
            </div>

            {/* Year range below track */}
            <div
              style={{
                ...reveal(frame, at + 12 + i * 6),
                position: "absolute",
                top: trackY + trackHeight + 16,
                left: segX,
                width: eraWidth,
                textAlign: "center",
                fontFamily: sans,
                fontSize: isActive ? 18 : 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? P.terracotta : P.muted,
                letterSpacing: "0.04em",
                opacity: segOpacity,
              }}
            >
              {era.startYear} — {era.endYear}
            </div>
          </div>
        );
      })}

      {/* Spotlight glow under active segment */}
      <div
        style={{
          position: "absolute",
          top: trackY - 30,
          left: trackLeft + eraWidth * activeIndex - 20,
          width: eraWidth + 40,
          height: 80,
          background: `radial-gradient(ellipse at center, ${P.terracotta}20 0%, transparent 70%)`,
          opacity: spotSpring,
          pointerEvents: "none",
        }}
      />

      {/* ===== Hero content for active era ===== */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: trackLeft,
          right: trackRight,
          opacity: interpolate(cardSpring, [0, 0.3], [0, 1], C),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0], C)}px)`,
        }}
      >
        {/* Large year range */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 88,
            color: P.text,
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          {activeEra.startYear} — {activeEra.endYear}
        </div>

        {/* Era name */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.terracotta,
            marginBottom: 28,
          }}
        >
          {activeEra.label}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 38, 18)}%`,
            maxWidth: 70,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* Description */}
        <div
          style={{
            ...reveal(frame, at + 40),
            fontFamily: sans,
            fontSize: 30,
            color: P.sub,
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          {activeEra.description}
        </div>

        {/* Key stat */}
        {activeEra.stat && (
          <div
            style={{
              marginTop: 60,
              opacity: interpolate(statSpring, [0, 0.3], [0, 1], C),
              transform: `translateY(${interpolate(statSpring, [0, 1], [20, 0], C)}px)`,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 72,
                color: P.terracotta,
                lineHeight: 1.1,
                marginBottom: 8,
              }}
            >
              {activeEra.stat}
            </div>
            {activeEra.statLabel && (
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 24,
                  color: P.muted,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {activeEra.statLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: trackLeft,
            ...reveal(frame, at + 65),
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
