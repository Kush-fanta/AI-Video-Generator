import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { PaperBg } from "./paper-bg";
import { HalftoneBeam } from "./halftone-beam";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: oswald } = loadFont();

interface BeamConnectProps extends BaseProps {
  /** Left subject — transparent PNG cutout */
  leftSubject: string;
  /** Right subject — transparent PNG cutout */
  rightSubject: string;
  /** Headline text placed on the beam */
  headline: string;
  /** Beam color (default golden yellow) */
  beamColor?: string;
  /** Beam direction: which side originates the beam */
  beamFrom?: "left" | "right";
  /** Paper background color */
  paperColor?: string;
  /** Make subjects B&W */
  grayscale?: boolean;
  /** Headline font size */
  headlineFontSize?: number;
  /** Frame to start */
  at?: number;
}

/**
 * TWO SUBJECTS CONNECTED BY A HALFTONE BEAM.
 *
 * Layout (baked, not configurable):
 * - Left subject: anchored bottom-left, fills 60% of frame height
 * - Right subject: anchored bottom-right, fills 45% of frame height
 * - Beam: connects right→left (or left→right), narrow at source, wide at target
 * - Headline: centered on beam, rotated to match beam angle
 * - Left subject overlaps beam (z=3), right is behind beam origin (z=1)
 *
 * Agent passes: two images, one headline, optional beam color. That's it.
 * The composition handles everything else.
 */
export const BeamConnect: React.FC<BeamConnectProps> = ({
  leftSubject,
  rightSubject,
  headline,
  beamColor = "#E8A828",
  beamFrom = "right",
  paperColor = "#F0EBE0",
  grayscale = true,
  headlineFontSize = 40,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const imgFilter = grayscale
    ? "grayscale(1) contrast(1.15) drop-shadow(4px 5px 3px rgba(0,0,0,0.1))"
    : "drop-shadow(4px 5px 3px rgba(0,0,0,0.1))";

  // Entrance animations
  const leftOpacity = interpolate(f, [0, 8], [0, 1], C);
  const leftY = interpolate(f, [0, 10], [20, 0], { ...C, easing: ease });
  const rightOpacity = interpolate(f, [4, 12], [0, 1], C);
  const rightY = interpolate(f, [4, 14], [20, 0], { ...C, easing: ease });
  const textOpacity = interpolate(f, [18, 24], [0, 1], C);
  const textScale = interpolate(f, [18, 22, 26, 30], [1.15, 0.97, 1.02, 1.0], C);

  // Beam endpoints — match figure positions exactly.
  // Left subject head is at ~18% from left, ~22% from top (she's tall, grounded at bottom).
  // Right subject screen is at ~72% from left, ~38% from top.
  const beamSource = beamFrom === "right"
    ? { x: 73, y: 38 }
    : { x: 22, y: 22 };
  const beamTarget = beamFrom === "right"
    ? { x: 22, y: 22 }
    : { x: 73, y: 38 };

  // Headline rotation follows beam slope but stays readable (never upside down)
  const dx = beamTarget.x - beamSource.x;
  const dy = beamTarget.y - beamSource.y;
  let beamAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  // Keep text readable: if angle > 90 or < -90, flip it
  if (beamAngle > 90) beamAngle -= 180;
  if (beamAngle < -90) beamAngle += 180;
  // Clamp to ±20° for aesthetics
  beamAngle = Math.max(-20, Math.min(20, beamAngle));

  return (
    <PaperBg color={paperColor} grain={0.07} vignette={0.12}>
      {/* Beam — z=2, between the subjects */}
      <HalftoneBeam
        from={beamSource}
        to={beamTarget}
        color={beamColor}
        narrowWidth={100}
        wideWidth={440}
        dotSize={3}
        dotSpacing={8}
        at={at + 8}
      />

      {/* Right subject — BEHIND beam origin, anchored bottom-right */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: -10,
          zIndex: 1,
          opacity: rightOpacity,
          transform: `translateY(${rightY}px)`,
        }}
      >
        <Img
          src={rightSubject}
          style={{
            height: "62vh",
            maxHeight: 670,
            objectFit: "contain",
            filter: imgFilter,
          }}
        />
      </div>

      {/* Left subject — IN FRONT of beam, anchored bottom-left, DOMINANT */}
      <div
        style={{
          position: "absolute",
          left: -10,
          bottom: -10,
          zIndex: 3,
          opacity: leftOpacity,
          transform: `translateY(${leftY}px)`,
        }}
      >
        <Img
          src={leftSubject}
          style={{
            height: "88vh",
            maxHeight: 950,
            objectFit: "contain",
            filter: imgFilter,
          }}
        />
      </div>

      {/* Headline — ON the beam, angled to match */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "24%",
          transform: `translate(-50%, -50%) rotate(${beamAngle}deg) scale(${textScale})`,
          zIndex: 4,
          opacity: textOpacity,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: headlineFontSize,
            fontWeight: 700,
            color: "#1A1A1A",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>
      </div>
    </PaperBg>
  );
};

export const demo = {
  compositionId: "collage-beam-connect",
  props: { leftSubject: "demo-cutout.png", rightSubject: "demo-cutout.png", headline: "CONNECTED", at: 15 },
  durationInFrames: 180,
};
