import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface BatteryFillProps extends BaseProps {
  percent: number;
  label: string;
  at?: number;
}

/**
 * BatteryFill — Large battery icon (rounded rect + terminal nub).
 * Fills from bottom to top with spring physics.
 * Color: terracotta below 20%, slate 20-50%, sage above 50%.
 */
export const BatteryFill: React.FC<BatteryFillProps> = ({
  percent,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 13, stiffness: 55, mass: 1.3 },
  });

  const clamped = Math.min(Math.max(percent, 0), 100);
  const fillHeight = fillProgress * clamped;
  const numScale = overshootScale(frame, at + 8);

  const fillColor = clamped < 20 ? P.terracotta : clamped < 50 ? P.slate : P.sage;

  // Battery dimensions
  const bx = 310;
  const by = 500;
  const bw = 460;
  const bh = 700;
  const radius = 28;
  const nubW = 120;
  const nubH = 40;
  const wallThick = 8;
  const innerPad = 16;

  // Inner fill area
  const ix = bx + wallThick + innerPad;
  const iy = by + wallThick + innerPad;
  const iw = bw - 2 * (wallThick + innerPad);
  const ih = bh - 2 * (wallThick + innerPad);

  // Animated display number
  const displayPercent = Math.round(fillProgress * clamped);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Terminal nub */}
        <rect
          x={(1080 - nubW) / 2}
          y={by - nubH + 6}
          width={nubW}
          height={nubH}
          rx={10}
          fill={P.light}
        />

        {/* Battery outline */}
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={radius}
          fill="none"
          stroke={P.text}
          strokeWidth={wallThick}
        />

        {/* Inner fill — clips from bottom */}
        <defs>
          <clipPath id="batteryInner">
            <rect x={ix} y={iy} width={iw} height={ih} rx={radius - wallThick} />
          </clipPath>
        </defs>

        <rect
          x={ix}
          y={iy + ih * (1 - fillHeight / 100)}
          width={iw}
          height={ih * (fillHeight / 100)}
          fill={fillColor}
          clipPath="url(#batteryInner)"
          rx={12}
        />

        {/* Segment lines — 4 horizontal dividers */}
        {[25, 50, 75].map((tick) => (
          <line
            key={tick}
            x1={ix + 8}
            y1={iy + ih * (1 - tick / 100)}
            x2={ix + iw - 8}
            y2={iy + ih * (1 - tick / 100)}
            stroke={P.bg}
            strokeWidth={2}
            opacity={0.5}
          />
        ))}
      </svg>

      {/* Percentage inside battery */}
      <div
        style={{
          position: "absolute",
          top: by + bh / 2 - 80,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 6),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: fillHeight > 50 ? P.bg : P.text,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {displayPercent}%
        </div>
      </div>

      {/* Label below battery */}
      <div
        style={{
          position: "absolute",
          top: by + bh + 60,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 18),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            color: P.sub,
            lineHeight: 1.3,
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      {/* Scale labels on right side */}
      {[0, 25, 50, 75, 100].map((tick) => (
        <div
          key={tick}
          style={{
            position: "absolute",
            top: iy + ih * (1 - tick / 100) - 12,
            left: bx + bw + 20,
            ...reveal(frame, at + 4),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              fontWeight: 600,
            }}
          >
            {tick}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-battery-fill",
  props: {
    percent: 67,
    label: "Fortune 30 GCC Penetration",
    at: 15,
  },
  durationInFrames: 180,
};
