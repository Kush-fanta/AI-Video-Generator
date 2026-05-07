import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StarRatingProps extends BaseProps {
  rating: number;
  maxRating?: number;
  label: string;
  source?: string;
  at?: number;
}

/** 5-pointed star SVG path centered at (cx, cy) with given size */
const starPath = (cx: number, cy: number, size: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? size : size * 0.4;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `M ${points.join(" L ")} Z`;
};

/**
 * StarRating — 5 large stars in a row.
 * Stars fill left to right with spring scale. Supports half stars.
 * Filled = terracotta, empty = P.light outlines.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const starSize = 72;
  const gap = 32;
  const totalWidth = starSize * 2 * maxRating + gap * (maxRating - 1);
  const startX = (1080 - totalWidth) / 2 + starSize;
  const starY = 920;

  const numScale = overshootScale(frame, at + 6);

  // Per-star spring (staggered entrance)
  const starScale = (idx: number) => {
    const delay = idx * 6;
    return spring({
      frame: Math.max(0, f - delay),
      fps: FPS,
      config: { damping: 10, stiffness: 100, mass: 0.6 },
    });
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Rating number */}
      <div
        style={{
          position: "absolute",
          top: 660,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 200,
            color: P.text,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {rating.toFixed(1)}
        </div>
      </div>

      {/* Stars */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          {Array.from({ length: maxRating }).map((_, i) => {
            const fill = Math.min(Math.max(rating - i, 0), 1);
            if (fill > 0 && fill < 1) {
              // Half-star clip
              const cx = startX + i * (starSize * 2 + gap);
              return (
                <clipPath key={`clip-${i}`} id={`half-${i}`}>
                  <rect
                    x={cx - starSize}
                    y={starY - starSize}
                    width={starSize * 2 * fill}
                    height={starSize * 2}
                  />
                </clipPath>
              );
            }
            return null;
          })}
        </defs>

        {Array.from({ length: maxRating }).map((_, i) => {
          const cx = startX + i * (starSize * 2 + gap);
          const scale = starScale(i);
          const fill = Math.min(Math.max(rating - i, 0), 1);

          return (
            <g key={i} transform={`translate(${cx}, ${starY}) scale(${scale}) translate(${-cx}, ${-starY})`}>
              {/* Empty star outline */}
              <path
                d={starPath(cx, starY, starSize)}
                fill="none"
                stroke={P.light}
                strokeWidth={4}
              />

              {/* Full fill */}
              {fill >= 1 && (
                <path
                  d={starPath(cx, starY, starSize)}
                  fill={P.terracotta}
                />
              )}

              {/* Partial fill (half star) */}
              {fill > 0 && fill < 1 && (
                <path
                  d={starPath(cx, starY, starSize)}
                  fill={P.terracotta}
                  clipPath={`url(#half-${i})`}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: starY + starSize + 60,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 22),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            color: P.sub,
            lineHeight: 1.3,
            maxWidth: 740,
            margin: "0 auto",
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
            top: starY + starSize + 140,
            left: 0,
            width: 1080,
            textAlign: "center",
            ...reveal(frame, at + 28),
          }}
        >
          <div
            style={{
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
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-star-rating",
  props: {
    rating: 4.5,
    label: "India as GCC Destination",
    source: "AT Kearney",
    at: 15,
  },
  durationInFrames: 180,
};
