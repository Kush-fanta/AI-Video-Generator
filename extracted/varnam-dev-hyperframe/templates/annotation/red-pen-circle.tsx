import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface RedPenCircleProps extends BaseProps {
  text: string;
  circledPortion: string;
  note?: string;
  at?: number;
}

/**
 * RedPenCircle — Text displayed, then a hand-drawn wobbly terracotta circle
 * draws around a key phrase via stroke-dashoffset animation.
 * An optional annotation note appears after the circle completes.
 * Portrait 1080x1920.
 */
export const RedPenCircle: React.FC<RedPenCircleProps> = ({
  text,
  circledPortion,
  note,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Text reveal
  const textReveal = reveal(frame, at);

  // Circle drawing phase: starts after text settles
  const circleStart = 24;
  const circleDur = 28;
  const circleProgress = interpolate(f, [circleStart, circleStart + circleDur], [0, 1], C);

  // Note springs in after circle completes
  const noteAt = circleStart + circleDur + 6;
  const noteSpring = spring({
    frame: Math.max(0, f - noteAt),
    fps: FPS,
    config: { damping: 13, stiffness: 100, mass: 0.6 },
  });
  const noteOpacity = interpolate(f, [noteAt, noteAt + 10], [0, 1], C);

  // Wobbly ellipse path — hand-drawn feel via slight irregularities
  // Centered at 540, ~960 (around the circled text area)
  const cx = 540;
  const cy = 940;
  const rx = 320;
  const ry = 90;

  // Generate wobbly path points
  const points = 40;
  let pathD = "";
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobbleX = Math.sin(angle * 7) * 8 + Math.cos(angle * 3) * 5;
    const wobbleY = Math.cos(angle * 5) * 6 + Math.sin(angle * 4) * 4;
    const px = cx + (rx + wobbleX) * Math.cos(angle);
    const py = cy + (ry + wobbleY) * Math.sin(angle);
    pathD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
  }
  pathD += " Z";

  // Approximate perimeter for dash animation
  const perimeter = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) + 60;

  // Split text around the circled portion
  const circledIdx = text.indexOf(circledPortion);
  const before = circledIdx >= 0 ? text.slice(0, circledIdx) : text;
  const circled = circledIdx >= 0 ? circledPortion : "";
  const after = circledIdx >= 0 ? text.slice(circledIdx + circledPortion.length) : "";

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main text block — centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          ...textReveal,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 68,
            lineHeight: 1.4,
            color: P.text,
            textAlign: "center",
            maxWidth: 920,
            letterSpacing: "-0.01em",
          }}
        >
          {before}
          <span style={{ position: "relative", display: "inline" }}>
            {circled}
          </span>
          {after}
        </div>
      </div>

      {/* Wobbly circle overlay — SVG */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <path
          d={pathD}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={perimeter}
          strokeDashoffset={perimeter * (1 - circleProgress)}
          opacity={circleProgress > 0 ? 0.85 : 0}
        />
      </svg>

      {/* Arrow + note below the circle */}
      {note && (
        <div
          style={{
            position: "absolute",
            top: cy + ry + 40,
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: noteOpacity,
            transform: `translateY(${interpolate(noteSpring, [0, 1], [20, 0], C)}px)`,
          }}
        >
          {/* Small arrow */}
          <svg width={24} height={20} viewBox="0 0 24 20" style={{ marginBottom: 12 }}>
            <path
              d="M12 0 L12 16 M6 10 L12 16 L18 10"
              fill="none"
              stroke={P.terracotta}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 600,
              color: P.terracotta,
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {note}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-red-pen-circle",
  props: {
    text: "India is the brain centre, not the back office.",
    circledPortion: "brain centre",
    note: "Key claim",
    at: 15,
  },
  durationInFrames: 180,
};
