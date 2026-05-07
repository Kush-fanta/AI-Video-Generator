import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const LEVELS = [
  { name: "Low", color: "#6D917D" },
  { name: "Guarded", color: "#A8B060" },
  { name: "Elevated", color: "#D4A843" },
  { name: "High", color: "#C17A48" },
  { name: "Severe", color: "#8B2E2E" },
] as const;

export interface ThreatLevelProps extends BaseProps {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  description?: string;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * ThreatLevel — Horizontal 5-segment threat bar.
 * Marker slides to active level with spring. Active segment fills with color.
 * Green → yellow → orange → red → dark red progression.
 */
export const ThreatLevel: React.FC<ThreatLevelProps> = ({
  level,
  label,
  description,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  const slideProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 70, mass: 1.0 },
  });

  const segWidth = 160;
  const segHeight = 80;
  const gap = 12;
  const totalWidth = segWidth * 5 + gap * 4;
  const startX = (1080 - totalWidth) / 2;

  // Marker position: center of active segment
  const targetX = startX + (level - 1) * (segWidth + gap) + segWidth / 2;
  const markerX = interpolate(slideProgress, [0, 1], [startX + segWidth / 2, targetX], C);

  // Fill progress for each segment
  const segFillProgress = (idx: number) => {
    if (idx >= level) return 0;
    const segDelay = idx * 4;
    return spring({
      frame: Math.max(0, f - segDelay),
      fps: FPS,
      config: { damping: 18, stiffness: 100, mass: 0.6 },
    });
  };

  const activeLevel = LEVELS[level - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            color: pal.text,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </div>
      </div>

      {/* Segments */}
      <div
        style={{
          position: "absolute",
          top: 880,
          left: startX,
          display: "flex",
          gap,
          ...reveal(frame, at + 6),
        }}
      >
        {LEVELS.map((lvl, i) => {
          const fill = segFillProgress(i);
          const isActive = i === level - 1;
          return (
            <div
              key={lvl.name}
              style={{
                width: segWidth,
                height: segHeight,
                borderRadius: 10,
                backgroundColor: pal.light,
                position: "relative",
                overflow: "hidden",
                border: isActive ? `3px solid ${lvl.color}` : "3px solid transparent",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: `${fill * 100}%`,
                  backgroundColor: lvl.color,
                  borderRadius: 7,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Segment labels */}
      <div
        style={{
          position: "absolute",
          top: 880 + segHeight + 14,
          left: startX,
          display: "flex",
          gap,
          ...reveal(frame, at + 10),
        }}
      >
        {LEVELS.map((lvl, i) => (
          <div
            key={lvl.name}
            style={{
              width: segWidth,
              textAlign: "center",
              fontFamily: sans,
              fontSize: 22,
              fontWeight: i === level - 1 ? 700 : 500,
              color: i === level - 1 ? lvl.color : pal.muted,
              letterSpacing: "0.02em",
            }}
          >
            {lvl.name}
          </div>
        ))}
      </div>

      {/* Marker triangle */}
      <div
        style={{
          position: "absolute",
          top: 880 - 28,
          left: markerX - 14,
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: `20px solid ${activeLevel.color}`,
        }}
      />

      {/* Active level name — large */}
      <div
        style={{
          position: "absolute",
          top: 1060,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            color: activeLevel.color,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {activeLevel.name}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            position: "absolute",
            top: 1190,
            left: 120,
            width: 840,
            textAlign: "center",
            ...reveal(frame, at + 20),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 36,
              color: pal.sub,
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-threat-level",
  props: {
    level: 4,
    label: "Talent Shortage Severity",
    description: "Critical shortage in specialized AI/ML roles",
    at: 15,
  },
  durationInFrames: 180,
};
