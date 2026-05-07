import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface ArrowCalloutProps extends BaseProps {
  /** Target point the arrow points TO (portrait 1080x1920 canvas) */
  targetX: number;
  targetY: number;
  /** Callout box text */
  text: string;
  /** Optional secondary line */
  detail?: string;
  /** Where the callout box sits relative to target */
  boxPosition?: "above" | "below";
  at?: number;
}

/**
 * ArrowCallout — Clean informational callout with terracotta arrow
 * pointing to a target location. Portrait 1080x1920 canvas.
 * Box has P.light border, cream bg, sans text.
 */
export const ArrowCallout: React.FC<ArrowCalloutProps> = ({
  targetX,
  targetY,
  text,
  detail,
  boxPosition = "above",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const isAbove = boxPosition === "above";

  /* ── box position ── */
  const boxX = Math.max(80, Math.min(targetX - 160, 1080 - 400));
  const boxY = isAbove ? targetY - 220 : targetY + 80;

  /* ── arrow geometry: line from box edge to target ── */
  const arrowStartX = Math.min(Math.max(targetX, boxX + 40), boxX + 320);
  const arrowStartY = isAbove ? boxY + 140 : boxY;

  /* ── animations ── */
  const boxSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const boxOpacity = interpolate(boxSpring, [0, 1], [0, 1], C);
  const boxScale = interpolate(boxSpring, [0, 1], [0.92, 1], C);

  // Arrow draws after box settles
  const arrowProgress = interpolate(f, [14, 30], [0, 1], C);
  const arrowOpacity = interpolate(f, [14, 20], [0, 1], C);

  // Current arrow tip (animates toward target)
  const curTipX = arrowStartX + (targetX - arrowStartX) * arrowProgress;
  const curTipY = arrowStartY + (targetY - arrowStartY) * arrowProgress;

  // Triangle head direction
  const dx = targetX - arrowStartX;
  const dy = targetY - arrowStartY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // Target dot pulse
  const dotScale =
    f > 28
      ? 1 + 0.12 * Math.sin((f - 28) * 0.2) * Math.max(0, 1 - (f - 28) / 80)
      : 0;

  return (
    <AbsoluteFill>
      {/* Arrow SVG layer */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Shaft */}
        <line
          x1={arrowStartX}
          y1={arrowStartY}
          x2={curTipX}
          y2={curTipY}
          stroke={P.terracotta}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={arrowOpacity}
        />

        {/* Triangle head */}
        {arrowProgress > 0.85 && (
          <polygon
            points={`
              ${targetX},${targetY}
              ${targetX - ux * 16 + uy * 7},${targetY - uy * 16 - ux * 7}
              ${targetX - ux * 16 - uy * 7},${targetY - uy * 16 + ux * 7}
            `}
            fill={P.terracotta}
            opacity={interpolate(arrowProgress, [0.85, 1], [0, 1], C)}
          />
        )}

        {/* Target dot */}
        {f > 28 && (
          <circle
            cx={targetX}
            cy={targetY}
            r={4 * Math.max(1, dotScale)}
            fill={P.terracotta}
            opacity={0.7}
          />
        )}
      </svg>

      {/* Callout box */}
      <div
        style={{
          position: "absolute",
          left: boxX,
          top: boxY,
          width: 360,
          opacity: boxOpacity,
          transform: `scale(${boxScale})`,
          transformOrigin: isAbove ? "bottom left" : "top left",
        }}
      >
        <div
          style={{
            backgroundColor: P.bg,
            border: `1.5px solid ${P.light}`,
            borderRadius: 8,
            padding: "22px 28px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 26,
              fontWeight: 600,
              color: P.text,
              lineHeight: 1.35,
            }}
          >
            {text}
          </div>
          {detail && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 400,
                color: P.sub,
                marginTop: 8,
                lineHeight: 1.4,
              }}
            >
              {detail}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-arrow-callout",
  props: {
    targetX: 764,
    targetY: 492,
    text: "Watch this point",
    detail: "This is the part that changes the read.",
    boxPosition: "above"
  },
  durationInFrames: 180,
};
