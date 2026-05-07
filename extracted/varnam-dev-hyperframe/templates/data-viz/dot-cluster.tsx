import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DotClusterProps extends BaseProps {
  count: number;
  label: string;
  heroNumber?: string;
  /** What each dot represents — e.g. "1 company", "1 million people" */
  dotUnit?: string;
  source?: string;
  at?: number;
}

/** Golden angle in radians */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * DotCluster — Quantity visualization.
 * Dots appear using golden-angle spiral, filling progressively.
 * Hero number overlays in centre of cluster.
 * Cluster is centred in frame — the dot field IS the frame.
 * One thing: the number and its dots.
 */
export const DotCluster: React.FC<DotClusterProps> = ({
  count,
  label,
  heroNumber,
  dotUnit = "1 unit",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Spring-driven dot reveal progress (0 → 1)
  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 40, mass: 1.0 },
  });

  const visibleDots = Math.round(fillProgress * count);

  // Cluster centred in frame
  const cx = 960;
  const cy = 500;

  // Generate dot positions using golden-angle spiral
  const dots: Array<{ x: number; y: number; opacity: number }> = [];
  const dotRadius = 8;
  const spreadFactor = Math.max(5, Math.min(11, 320 / Math.sqrt(count)));

  for (let i = 0; i < visibleDots; i++) {
    const angle = i * GOLDEN_ANGLE;
    const r = spreadFactor * Math.sqrt(i);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    // Varying opacity — outer dots slightly more transparent
    const opacity = interpolate(i, [0, count], [1, 0.45], C);
    dots.push({ x, y, opacity });
  }

  // Hero number overshoot
  const numScale = overshootScale(frame, at + 18);

  // Cluster radius for positioning label below
  const clusterR = spreadFactor * Math.sqrt(count);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Dots — rendered as SVG for precision */}
      <svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
      >
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dotRadius}
            fill={P.terracotta}
            opacity={dot.opacity}
          />
        ))}
      </svg>

      {/* Hero number — centred in cluster */}
      {heroNumber && (
        <div
          style={{
            position: "absolute",
            top: cy - 110,
            left: cx - 300,
            width: 600,
            textAlign: "center",
            ...reveal(frame, at + 15),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 220,
              color: P.text,
              lineHeight: 1.0,
              transform: `scale(${numScale})`,
              transformOrigin: "center center",
              textShadow: `0 0 80px ${P.bg}, 0 0 140px ${P.bg}, 0 0 200px ${P.bg}`,
              letterSpacing: "-0.04em",
            }}
          >
            {heroNumber}
          </div>
        </div>
      )}

      {/* Label — below cluster, centred */}
      <div
        style={{
          position: "absolute",
          top: cy + clusterR + 48,
          left: cx - 320,
          width: 640,
          textAlign: "center",
          ...reveal(frame, at + 22),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 32,
            color: P.sub,
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            ...reveal(frame, at + 30),
            fontFamily: sans,
            fontSize: 20,
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
export const demo = {
  compositionId: "dataviz-dot-cluster",
  props: {
    "count": 120,
    "label": "Signup cohort",
    "heroNumber": "120K",
    "dotUnit": "users",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
