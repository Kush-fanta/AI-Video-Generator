import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface BracketAnnotationProps extends BaseProps {
  /** Left edge x of the bracketed region */
  x: number;
  /** Top edge y of the bracketed region */
  y: number;
  /** Width of the bracketed region */
  width?: number;
  /** Height of the bracketed region */
  height?: number;
  /** Annotation label */
  label: string;
  /** Optional secondary label line */
  sublabel?: string;
  /** Frame offset */
  at?: number;
  /** Which side the bracket appears on */
  side?: "left" | "right" | "top" | "bottom";
}

/**
 * BracketAnnotation — SVG bracket draws in around a section with a dark frosted
 * label panel. Draw animation (tips + bar sequence) is preserved.
 * Supports primary label + sublabel in P.muted.
 */
export const BracketAnnotation: React.FC<BracketAnnotationProps> = ({
  x,
  y,
  width = 400,
  height = 200,
  label,
  sublabel,
  at = 0,
  side = "right",
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const bracketGap = 16;
  const tipLen = 14;
  const midTipLen = 20;

  // Phase 1: center tick draws first — starts as a single dot, expands to midTipLen (0-10f)
  const midTickProgress = interpolate(f, [0, 10], [0, 1], C);
  // Phase 2: bar grows outward from center toward both ends (8-26f)
  const barProgress = interpolate(f, [8, 26], [0, 1], C);
  // Phase 3: tips extend outward from bar ends (22-36f)
  const tipProgress = interpolate(f, [22, 36], [0, 1], C);

  // Label springs in after all three phases complete (36f+)
  const labelSpring = spring({
    frame: Math.max(0, f - 36),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const labelOpacity = interpolate(f, [36, 46], [0, 1], C);

  let bracketPath = "";
  let labelX: number, labelY: number, labelTransform: string;

  if (side === "right") {
    const bx = x + width + bracketGap;
    const midY = y + height / 2;

    // The bar's vertical spine sits at bx + tipLen
    const barX = bx + tipLen;
    // Phase 1: center tick grows rightward away from bar (outward from anchor)
    const tickEnd = barX + midTipLen * midTickProgress;
    // Phase 2: bar grows up and down from midY (outward from center)
    const barHalfH = (height / 2) * barProgress;
    // Phase 3: tips grow from bar spine (barX) toward content edge (bx) —
    // anchor fixed at bx, tip extends outward to barX
    const topTipEnd = bx + tipLen * tipProgress;   // grows from bx → barX
    const botTipEnd = bx + tipLen * tipProgress;

    bracketPath = [
      midTickProgress > 0 ? `M ${barX} ${midY} L ${tickEnd} ${midY}` : "",
      barProgress > 0 ? `M ${barX} ${midY - barHalfH} L ${barX} ${midY + barHalfH}` : "",
      tipProgress > 0 ? `M ${bx} ${y} L ${topTipEnd} ${y}` : "",
      tipProgress > 0 ? `M ${bx} ${y + height} L ${botTipEnd} ${y + height}` : "",
    ].filter(Boolean).join(" ");

    labelX = barX + midTipLen + 16;
    labelY = midY;
    labelTransform = "translate(0%, -50%)";
  } else if (side === "left") {
    const bx = x - bracketGap;
    const midY = y + height / 2;

    const barX = bx - tipLen;
    const tickEnd = barX - midTipLen * midTickProgress;
    const barHalfH = (height / 2) * barProgress;
    // Tips anchor at bx, grow leftward to barX
    const topTipEnd = bx - tipLen * tipProgress;
    const botTipEnd = bx - tipLen * tipProgress;

    bracketPath = [
      midTickProgress > 0 ? `M ${barX} ${midY} L ${tickEnd} ${midY}` : "",
      barProgress > 0 ? `M ${barX} ${midY - barHalfH} L ${barX} ${midY + barHalfH}` : "",
      tipProgress > 0 ? `M ${bx} ${y} L ${topTipEnd} ${y}` : "",
      tipProgress > 0 ? `M ${bx} ${y + height} L ${botTipEnd} ${y + height}` : "",
    ].filter(Boolean).join(" ");

    labelX = barX - midTipLen - 16;
    labelY = midY;
    labelTransform = "translate(-100%, -50%)";
  } else if (side === "top") {
    const by = y - bracketGap;
    const midX = x + width / 2;

    const barY = by - tipLen;
    const tickEnd = barY - midTipLen * midTickProgress;
    const barHalfW = (width / 2) * barProgress;
    // Tips anchor at by, grow upward to barY
    const leftTipEnd = by - tipLen * tipProgress;
    const rightTipEnd = by - tipLen * tipProgress;

    bracketPath = [
      midTickProgress > 0 ? `M ${midX} ${barY} L ${midX} ${tickEnd}` : "",
      barProgress > 0 ? `M ${midX - barHalfW} ${barY} L ${midX + barHalfW} ${barY}` : "",
      tipProgress > 0 ? `M ${x} ${by} L ${x} ${leftTipEnd}` : "",
      tipProgress > 0 ? `M ${x + width} ${by} L ${x + width} ${rightTipEnd}` : "",
    ].filter(Boolean).join(" ");

    labelX = midX;
    labelY = barY - midTipLen - 16;
    labelTransform = "translate(-50%, -100%)";
  } else {
    // bottom
    const by = y + height + bracketGap;
    const midX = x + width / 2;

    const barY = by + tipLen;
    const tickEnd = barY + midTipLen * midTickProgress;
    const barHalfW = (width / 2) * barProgress;
    // Tips anchor at by, grow downward to barY
    const leftTipEnd = by + tipLen * tipProgress;
    const rightTipEnd = by + tipLen * tipProgress;

    bracketPath = [
      midTickProgress > 0 ? `M ${midX} ${barY} L ${midX} ${tickEnd}` : "",
      barProgress > 0 ? `M ${midX - barHalfW} ${barY} L ${midX + barHalfW} ${barY}` : "",
      tipProgress > 0 ? `M ${x} ${by} L ${x} ${leftTipEnd}` : "",
      tipProgress > 0 ? `M ${x + width} ${by} L ${x + width} ${rightTipEnd}` : "",
    ].filter(Boolean).join(" ");

    labelX = midX;
    labelY = barY + midTipLen + 16;
    labelTransform = "translate(-50%, 0%)";
  }

  return (
    <AbsoluteFill>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d={bracketPath}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Label — dark frosted panel */}
      <div
        style={{
          position: "absolute",
          left: labelX,
          top: labelY,
          transform: `${labelTransform} scale(${0.85 + 0.15 * labelSpring})`,
          opacity: labelOpacity,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10,10,10,0.82)",
            borderRadius: 4,
            padding: "10px 16px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              color: P.bg,
              letterSpacing: "0.02em",
              lineHeight: 1.3,
            }}
          >
            {label}
          </div>
          {sublabel && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 400,
                color: P.muted,
                letterSpacing: "0.03em",
                marginTop: 4,
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-bracket-annotation",
  props: {
    x: 520,
    y: 300,
    width: 480,
    height: 220,
    label: "Critical section",
    sublabel: "The rest can stay muted.",
    side: "right"
  },
  durationInFrames: 180,
};
