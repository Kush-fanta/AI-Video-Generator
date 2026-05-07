import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BlindsOpenProps extends BaseProps {
  content: string;
  slats?: number;
  openAt?: number;
  at?: number;
}

/**
 * BlindsOpen — Horizontal slats (venetian blinds) cover the screen.
 * They rotate open in sequence from top to bottom, revealing content.
 * Each slat is a dark rectangle with spring physics on rotation.
 * Content behind is a hero statement.
 */
export const BlindsOpen: React.FC<BlindsOpenProps> = ({
  content,
  slats = 14,
  openAt = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Each slat opens with a stagger from top to bottom
  const staggerPerSlat = 3; // frames between each slat opening
  const slatHeight = 1920 / slats;

  // Content visibility — emerges as blinds open
  // Start showing once first few slats are open
  const contentStartAt = openAt + 8;
  const contentOpacity = interpolate(
    f,
    [contentStartAt, contentStartAt + slats * staggerPerSlat * 0.5],
    [0, 1],
    C,
  );

  // Content scale — spring pop once mostly visible
  const contentScaleAt = openAt + Math.floor(slats * staggerPerSlat * 0.4);
  const contentScale = f >= contentScaleAt
    ? spring({
        frame: f - contentScaleAt,
        fps,
        config: { damping: 16, stiffness: 80, mass: 0.8 },
        from: 0.96,
        to: 1.0,
      })
    : 0.96;

  // Accent line after blinds are mostly open
  const accentAt = openAt + slats * staggerPerSlat + 5;
  const accentWidth = lineGrow(frame, at + accentAt, 22);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Content behind blinds */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.1,
            color: P.text,
            textAlign: "center",
            maxWidth: 860,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {content}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 200,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Venetian blinds — slats */}
      {Array.from({ length: slats }, (_, i) => {
        const slatOpenAt = openAt + i * staggerPerSlat;

        // Each slat rotates from 0 (closed/flat, covering) to 85 degrees (open)
        const slatRotation = f >= slatOpenAt
          ? spring({
              frame: f - slatOpenAt,
              fps,
              config: { damping: 12, stiffness: 70, mass: 0.7 + (i % 3) * 0.1 },
              from: 0,
              to: 85,
            })
          : 0;

        // Slat opacity — fades out once fully rotated (thin edge disappears)
        const slatOpacity = interpolate(slatRotation, [0, 60, 85], [1, 0.6, 0.1]);

        // Slight shadow on each slat for depth
        const shadowIntensity = interpolate(slatRotation, [0, 85], [0.15, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * slatHeight,
              left: 0,
              width: "100%",
              height: slatHeight + 1, // +1 to avoid sub-pixel gaps
              perspective: 600,
              zIndex: slats - i,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: P.dark,
                transformOrigin: "center top",
                transform: `rotateX(${slatRotation}deg)`,
                opacity: slatOpacity,
                boxShadow: `0 4px 8px rgba(0,0,0,${shadowIntensity})`,
              }}
            >
              {/* Slat surface detail — subtle horizontal line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.03)",
                }}
              />
              {/* Slat bottom edge highlight */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-blinds-open",
  props: {
    content: "Innovation Hub",
    openAt: 20,
    at: 15,
  },
  durationInFrames: 180,
};
