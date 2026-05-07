import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PixelResolveProps extends BaseProps {
  content: string;
  label?: string;
  resolveAt?: number;
  at?: number;
}

// Deterministic pseudo-random for consistent renders
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Palette colors for pixel blocks
const BLOCK_COLORS = [P.terracotta, P.sage, P.mauve, P.slate, P.light, P.muted];

/**
 * PixelResolve — Content appears as a grid of large colored blocks (pixelated)
 * that progressively resolves to the actual text. Simulated by overlaying
 * a grid of rects that shrink and fade. Start with 8x8 blocks, end clear.
 * Feels like a broadcast signal resolving.
 */
export const PixelResolve: React.FC<PixelResolveProps> = ({
  content,
  label,
  resolveAt = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Grid dimensions
  const cols = 8;
  const rows = 14; // portrait — more rows
  const cellW = 1080 / cols;
  const cellH = 1920 / rows;

  // Resolve progress: spring-based
  const resolveProgress = f >= resolveAt
    ? spring({
        frame: f - resolveAt,
        fps,
        config: { damping: 18, stiffness: 40, mass: 1.2 },
        from: 0,
        to: 1,
      })
    : 0;

  // Each cell has a staggered resolve time based on distance from center
  const centerX = cols / 2;
  const centerY = rows / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  // Pre-resolve shimmer: blocks appear in waves
  const shimmerProgress = interpolate(f, [0, resolveAt], [0, 1], C);

  // Text opacity — fades in as blocks resolve
  const textOpacity = interpolate(resolveProgress, [0.3, 0.8], [0, 1], C);

  // Text scale pop when fully resolved
  const textScale = f >= resolveAt + 25
    ? spring({
        frame: f - resolveAt - 25,
        fps,
        config: { damping: 14, stiffness: 90, mass: 0.8 },
        from: 1.04,
        to: 1.0,
      })
    : 1.0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Pixel grid overlay */}
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const dist = Math.sqrt(
            Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2),
          );
          const normDist = dist / maxDist;

          // Each cell resolves at a slightly different time
          // Center resolves first (radial wipe)
          const cellResolvePoint = normDist * 0.7 + seededRandom(row * cols + col) * 0.3;
          const cellProgress = interpolate(
            resolveProgress,
            [cellResolvePoint * 0.6, cellResolvePoint * 0.6 + 0.4],
            [0, 1],
            C,
          );

          // Block opacity: starts visible, fades out as it resolves
          const blockOpacity = interpolate(cellProgress, [0, 0.8, 1], [1, 0.4, 0]);

          // Block scale: shrinks as it resolves
          const blockScale = interpolate(cellProgress, [0, 1], [1, 0.3], C);

          // Pre-resolve: blocks shimmer in
          const shimmerDelay = seededRandom(row * cols + col + 100) * 0.6;
          const shimmerOpacity = interpolate(
            shimmerProgress,
            [shimmerDelay, shimmerDelay + 0.3],
            [0, 1],
            C,
          );

          const colorIndex = (row * cols + col) % BLOCK_COLORS.length;
          const color = BLOCK_COLORS[colorIndex];

          if (blockOpacity < 0.01 && resolveProgress > 0.5) return null;

          return (
            <div
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                left: col * cellW,
                top: row * cellH,
                width: cellW,
                height: cellH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: cellW - 2,
                  height: cellH - 2,
                  backgroundColor: color,
                  opacity: blockOpacity * shimmerOpacity,
                  transform: `scale(${blockScale})`,
                  borderRadius: 4,
                }}
              />
            </div>
          );
        }),
      )}

      {/* Resolved text content */}
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
          opacity: textOpacity,
          transform: `scale(${textScale})`,
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              color: P.sub,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              marginBottom: 24,
            }}
          >
            {label}
          </div>
        )}
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
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-pixel-resolve",
  props: {
    content: "$100B",
    label: "The number",
    resolveAt: 25,
    at: 15,
  },
  durationInFrames: 180,
};
