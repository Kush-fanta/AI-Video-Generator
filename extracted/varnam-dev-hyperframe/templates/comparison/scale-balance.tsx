import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ScaleBalanceProps extends BaseProps {
  leftItem: { text: string; weight: number };
  rightItem: { text: string; weight: number };
  label?: string;
  at?: number;
}

/**
 * ScaleBalance — Abstract balance scale with two pans on a beam.
 * The beam tilts toward the heavier side with spring physics.
 * Heavier side text is larger and terracotta-colored.
 */
export const ScaleBalance: React.FC<ScaleBalanceProps> = ({
  leftItem,
  rightItem,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const total = leftItem.weight + rightItem.weight;
  const tiltAngle = total > 0
    ? ((rightItem.weight - leftItem.weight) / total) * 14
    : 0;

  // Beam entrance
  const beamEntrance = spring({
    frame: f,
    fps: FPS,
    config: { damping: 18, stiffness: 60, mass: 1.2 },
  });

  // Beam tilt with spring
  const beamTilt = spring({
    frame: Math.max(0, f - 12),
    fps: FPS,
    config: { damping: 10, stiffness: 50, mass: 1.5 },
  });
  const rotation = interpolate(beamTilt, [0, 1], [0, tiltAngle], C);

  // Pan entrance — left then right
  const leftPanScale = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });
  const rightPanScale = spring({
    frame: Math.max(0, f - 10),
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.7 },
  });

  const leftIsHeavier = leftItem.weight >= rightItem.weight;
  const heavyFontSize = 72;
  const lightFontSize = 56;

  // Beam geometry
  const beamCenterX = 540;
  const beamCenterY = 960;
  const beamHalfWidth = 380;
  const panHangLength = 160;

  // Calculate pan positions after tilt
  const radians = (rotation * Math.PI) / 180;
  const leftPanX = beamCenterX - beamHalfWidth * Math.cos(radians);
  const leftPanY = beamCenterY - beamHalfWidth * Math.sin(radians) + panHangLength;
  const rightPanX = beamCenterX + beamHalfWidth * Math.cos(radians);
  const rightPanY = beamCenterY + beamHalfWidth * Math.sin(radians) + panHangLength;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Label */}
      {label && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 200,
            left: 0,
            width: 1080,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {label}
        </div>
      )}

      {/* Scale assembly */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          opacity: beamEntrance,
        }}
      >
        {/* Fulcrum triangle */}
        <svg
          style={{ position: "absolute", top: 0, left: 0 }}
          width={1080}
          height={1920}
          viewBox="0 0 1080 1920"
        >
          {/* Fulcrum */}
          <polygon
            points={`${beamCenterX},${beamCenterY + 20} ${beamCenterX - 40},${beamCenterY + 80} ${beamCenterX + 40},${beamCenterY + 80}`}
            fill={P.sub}
          />
          {/* Beam */}
          <line
            x1={beamCenterX - beamHalfWidth}
            y1={beamCenterY}
            x2={beamCenterX + beamHalfWidth}
            y2={beamCenterY}
            stroke={P.sub}
            strokeWidth={6}
            strokeLinecap="round"
            transform={`rotate(${rotation}, ${beamCenterX}, ${beamCenterY})`}
          />
          {/* Left chain */}
          <line
            x1={leftPanX}
            y1={leftPanY - panHangLength}
            x2={leftPanX}
            y2={leftPanY - 30}
            stroke={P.light}
            strokeWidth={3}
          />
          {/* Right chain */}
          <line
            x1={rightPanX}
            y1={rightPanY - panHangLength}
            x2={rightPanX}
            y2={rightPanY - 30}
            stroke={P.light}
            strokeWidth={3}
          />
          {/* Left pan (arc) */}
          <path
            d={`M ${leftPanX - 100} ${leftPanY} Q ${leftPanX} ${leftPanY + 40} ${leftPanX + 100} ${leftPanY}`}
            fill="none"
            stroke={leftIsHeavier ? P.terracotta : P.slate}
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* Right pan (arc) */}
          <path
            d={`M ${rightPanX - 100} ${rightPanY} Q ${rightPanX} ${rightPanY + 40} ${rightPanX + 100} ${rightPanY}`}
            fill="none"
            stroke={!leftIsHeavier ? P.terracotta : P.slate}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </svg>

        {/* Left pan text */}
        <div
          style={{
            position: "absolute",
            left: leftPanX - 180,
            top: leftPanY + 50,
            width: 360,
            textAlign: "center",
            transform: `scale(${leftPanScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: leftIsHeavier ? heavyFontSize : lightFontSize,
              color: leftIsHeavier ? P.terracotta : P.slate,
              lineHeight: 1.1,
            }}
          >
            {leftItem.text}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.muted,
              marginTop: 12,
            }}
          >
            {leftItem.weight}
          </div>
        </div>

        {/* Right pan text */}
        <div
          style={{
            position: "absolute",
            left: rightPanX - 180,
            top: rightPanY + 50,
            width: 360,
            textAlign: "center",
            transform: `scale(${rightPanScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: !leftIsHeavier ? heavyFontSize : lightFontSize,
              color: !leftIsHeavier ? P.terracotta : P.slate,
              lineHeight: 1.1,
            }}
          >
            {rightItem.text}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.muted,
              marginTop: 12,
            }}
          >
            {rightItem.weight}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-scale-balance",
  props: {
    leftItem: { text: "Cost savings", weight: 40 },
    rightItem: { text: "Strategic value", weight: 75 },
    label: "GCC Value Proposition",
    at: 15,
  },
  durationInFrames: 180,
};
