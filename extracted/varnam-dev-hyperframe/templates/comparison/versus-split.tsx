import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface VersusSplitProps extends BaseProps {
  sideA: { value: string; label: string };
  sideB: { value: string; label: string };
  categoryLabel?: string;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * VersusSplit — Diagonal split composition.
 * Left half cream bg (side A), right half dark bg (side B).
 * Bold "VS" at the intersection on a terracotta diagonal line.
 * Each side springs in from its respective edge.
 */
export const VersusSplit: React.FC<VersusSplitProps> = ({
  sideA,
  sideB,
  categoryLabel,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  // Side A slides in from left
  const slideA = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const offsetA = interpolate(slideA, [0, 1], [-400, 0], C);

  // Side B slides in from right (staggered)
  const slideB = spring({
    frame: Math.max(0, f - 6),
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const offsetB = interpolate(slideB, [0, 1], [400, 0], C);

  // VS badge scale entrance
  const vsScale = spring({
    frame: Math.max(0, f - 14),
    fps: FPS,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });

  // Diagonal line reveal
  const diagWidth = lineGrow(frame, at + 8, 20);

  // The diagonal skew offset (how far the diagonal cuts)
  const skew = 120;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg, overflow: "hidden" }}>
      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            ...reveal(frame, at + 2),
            position: "absolute",
            top: 80,
            left: 0,
            width: 1080,
            textAlign: "center",
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: pal.muted,
            zIndex: 10,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Side A — left half, cream bg */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          clipPath: `polygon(0 0, ${540 + skew}px 0, ${540 - skew}px 100%, 0 100%)`,
          backgroundColor: pal.bg,
          transform: `translateX(${offsetA}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 100,
            transform: "translateY(-50%)",
            width: 400,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              color: pal.text,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
            }}
          >
            {sideA.value}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              color: pal.sub,
              marginTop: 20,
              lineHeight: 1.3,
            }}
          >
            {sideA.label}
          </div>
        </div>
      </div>

      {/* Side B — right half, dark bg */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          clipPath: `polygon(${540 + skew}px 0, 100% 0, 100% 100%, ${540 - skew}px 100%)`,
          backgroundColor: pal.dark,
          transform: `translateX(${offsetB}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 100,
            transform: "translateY(-50%)",
            width: 400,
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 140,
              color: pal.bg,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
            }}
          >
            {sideB.value}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              color: pal.light,
              marginTop: 20,
              lineHeight: 1.3,
            }}
          >
            {sideB.label}
          </div>
        </div>
      </div>

      {/* Diagonal terracotta line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          zIndex: 5,
          opacity: interpolate(diagWidth, [0, 100], [0, 1], C),
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <line
            x1={540 + skew}
            y1={0}
            x2={540 - skew}
            y2={1920}
            stroke={pal.terracotta}
            strokeWidth={6}
            strokeDasharray={`${(diagWidth / 100) * 2200}`}
            strokeDashoffset={0}
          />
        </svg>
      </div>

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          zIndex: 10,
          width: 160,
          height: 160,
          borderRadius: "50%",
          backgroundColor: pal.terracotta,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: "#fff",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          VS
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "comp-versus-split",
  props: {
    sideA: { value: "$100B", label: "India GCC Revenue" },
    sideB: { value: "$46B", label: "2019 Revenue" },
    categoryLabel: "THEN VS NOW",
    at: 15,
  },
  durationInFrames: 180,
};
