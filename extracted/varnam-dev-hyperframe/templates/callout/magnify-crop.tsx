import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface MagnifyCropProps extends BaseProps {
  /** Image URL or path */
  src: string;
  /** Left edge x of the crop region in source pixels */
  cropX: number;
  /** Top edge y of the crop region in source pixels */
  cropY: number;
  /** Width of the crop region in source pixels */
  cropW: number;
  /** Height of the crop region in source pixels */
  cropH: number;
  /** Scale factor for the magnified PiP */
  zoomFactor?: number;
  /** Optional label text */
  label?: string;
  /** Frame offset */
  at?: number;
}

/**
 * MagnifyCrop — Full image shown as background. A dashed terracotta crop
 * rectangle (SVG) marks the region of interest. A PiP panel on the right
 * shows the actual zoomed crop using clipPath + transform. A thin connecting
 * line links the crop rect to the PiP edge. No full-frame dimming.
 */
export const MagnifyCrop: React.FC<MagnifyCropProps> = ({
  src,
  cropX,
  cropY,
  cropW,
  cropH,
  zoomFactor = 2.5,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Canvas size
  const W = 1920;
  const H = 1080;

  // Crop border draws in
  const borderProgress = interpolate(f, [0, 22], [0, 1], C);

  // PiP scales in with spring
  const pipSpring = spring({
    frame: Math.max(0, f - 12),
    fps: FPS,
    config: { damping: 14, stiffness: 70, mass: 0.8 },
  });
  const pipOpacity = interpolate(f, [12, 22], [0, 1], C);

  // Label reveals after PiP
  const labelOpacity = interpolate(f, [28, 38], [0, 1], C);
  const labelSpring = spring({
    frame: Math.max(0, f - 28),
    fps: FPS,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  // PiP panel dimensions on screen
  const pipW = cropW * zoomFactor;
  const pipH = cropH * zoomFactor;
  const pipPadding = 60;
  const pipX = W - pipW - pipPadding;
  const pipY = pipPadding;

  // Crop rect dashed perimeter animation
  const cropPerimeter = 2 * (cropW + cropH);
  const cropDashOffset = cropPerimeter * (1 - borderProgress);

  // Connecting line: from right edge of crop rect to left edge of PiP
  const lineProgress = interpolate(f, [18, 28], [0, 1], C);
  const cropRightX = cropX + cropW;
  const cropMidY = cropY + cropH / 2;
  const pipLeftX = pipX;
  const pipMidY = pipY + pipH / 2;

  // For the zoomed image inside PiP:
  // The full source image is rendered at 1920x1080.
  // We clip to the PiP panel, then scale up by zoomFactor and shift so
  // the crop region lands in the visible area.
  // offsetX/Y: where the top-left of the crop region should appear within the PiP panel.
  // We center the crop in the PiP, so translate = pipCenter - cropCenter * zoomFactor
  const pipCenterX = pipW / 2;
  const pipCenterY = pipH / 2;
  const cropCenterInSrc = { x: cropX + cropW / 2, y: cropY + cropH / 2 };
  const imgTranslateX = pipCenterX - cropCenterInSrc.x * zoomFactor;
  const imgTranslateY = pipCenterY - cropCenterInSrc.y * zoomFactor;

  return (
    <AbsoluteFill>
      {/* Full background image — no dimming overlay */}
      <Img
        src={src}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          objectFit: "cover",
        }}
      />

      {/* SVG layer: crop rect + connecting line */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {/* Dashed terracotta crop rectangle */}
        <rect
          x={cropX}
          y={cropY}
          width={cropW}
          height={cropH}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={4}
          strokeDasharray={`${cropPerimeter}`}
          strokeDashoffset={cropDashOffset}
          rx={2}
        />

        {/* Thin connecting line from crop rect right-center to PiP left-center */}
        {lineProgress > 0 && (
          <line
            x1={cropRightX}
            y1={cropMidY}
            x2={cropRightX + (pipLeftX - cropRightX) * lineProgress}
            y2={cropMidY + (pipMidY - cropMidY) * lineProgress}
            stroke={P.terracotta}
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.75}
          />
        )}
      </svg>

      {/* PiP panel — actual zoomed crop via CSS clip + scale */}
      <div
        style={{
          position: "absolute",
          left: pipX,
          top: pipY,
          width: pipW,
          height: pipH,
          opacity: pipOpacity,
          transform: `scale(${0.8 + 0.2 * pipSpring})`,
          transformOrigin: "center center",
          overflow: "hidden",
          borderRadius: 4,
          border: `4px solid ${P.terracotta}`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.45), 0 0 0 2px ${P.dark}`,
        }}
      >
        {/* Zoomed image: translate so crop region is centered in the PiP */}
        <Img
          src={src}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W * zoomFactor,
            height: H * zoomFactor,
            transform: `translate(${imgTranslateX}px, ${imgTranslateY}px)`,
            transformOrigin: "0 0",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Corner brackets on PiP */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {(() => {
          const bl = 24;
          const bst = 4;
          const ops = pipOpacity;
          return (
            <>
              <polyline points={`${pipX},${pipY + bl} ${pipX},${pipY} ${pipX + bl},${pipY}`}
                fill="none" stroke={P.terracotta} strokeWidth={bst} strokeLinecap="round" opacity={ops} />
              <polyline points={`${pipX + pipW - bl},${pipY} ${pipX + pipW},${pipY} ${pipX + pipW},${pipY + bl}`}
                fill="none" stroke={P.terracotta} strokeWidth={bst} strokeLinecap="round" opacity={ops} />
              <polyline points={`${pipX},${pipY + pipH - bl} ${pipX},${pipY + pipH} ${pipX + bl},${pipY + pipH}`}
                fill="none" stroke={P.terracotta} strokeWidth={bst} strokeLinecap="round" opacity={ops} />
              <polyline points={`${pipX + pipW - bl},${pipY + pipH} ${pipX + pipW},${pipY + pipH} ${pipX + pipW},${pipY + pipH - bl}`}
                fill="none" stroke={P.terracotta} strokeWidth={bst} strokeLinecap="round" opacity={ops} />
            </>
          );
        })()}
      </svg>

      {/* Label below PiP */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: pipX,
            top: pipY + pipH + 14,
            width: pipW,
            textAlign: "center",
            opacity: labelOpacity,
            transform: `translateY(${(1 - labelSpring) * 8}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              color: P.muted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {zoomFactor}× DETAIL
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 600,
              color: P.terracotta,
              letterSpacing: "0.04em",
              marginTop: 2,
            }}
          >
            {label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "callout-magnify-crop",
  props: {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&h=1080&fit=crop",
    cropX: 700,
    cropY: 260,
    cropW: 420,
    cropH: 240,
    zoomFactor: 2.5,
    label: "Detail crop"
  },
  durationInFrames: 220,
};
