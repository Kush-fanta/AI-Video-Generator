import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";

interface SilhouetteOutlineProps {
  /** Image source — will be rendered as stroke outline only (no fill) */
  src: string;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width via CSS outline trick */
  strokeWidth?: number;
  /** Position as percentage of canvas */
  x?: number;
  y?: number;
  /** Max height */
  maxHeight?: number;
  /** Max width */
  maxWidth?: number;
  /** Anchor positioning */
  anchor?: "center" | "bottom-center" | "top-center";
  /** Animation: draw-on effect duration */
  at?: number;
  /** Z-index */
  zIndex?: number;
}

/**
 * White stroke outline of a figure — no fill, just the silhouette edge.
 * Uses CSS drop-shadow trick to create outline from transparent PNG,
 * then inverts to show only the stroke.
 *
 * Best with transparent PNG cutouts — the outline traces the alpha edge.
 * For SVG silhouettes, pass an SVG with stroke and no fill directly.
 *
 * Animation: opacity fade-in with slight scale.
 */
export const SilhouetteOutline: React.FC<SilhouetteOutlineProps> = ({
  src,
  strokeColor = "#FFFFFF",
  strokeWidth = 2,
  x = 50,
  y = 50,
  maxHeight = 600,
  maxWidth = 500,
  anchor = "center",
  at = 0,
  zIndex = 3,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [at, at + 12], [0, 1], C);
  const scale = interpolate(frame, [at, at + 12], [0.96, 1.0], {
    ...C,
    easing: ease,
  });

  const anchorStyle: React.CSSProperties = {
    position: "absolute",
    zIndex,
    opacity,
  };

  switch (anchor) {
    case "center":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      });
      break;
    case "bottom-center":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        bottom: `${100 - y}%`,
        transform: `translateX(-50%) scale(${scale})`,
      });
      break;
    case "top-center":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translateX(-50%) scale(${scale})`,
      });
      break;
  }

  // Multiple drop-shadows in all directions to create outline effect
  const shadowSpread = strokeWidth;
  const dropShadows = [
    `drop-shadow(${shadowSpread}px 0 0 ${strokeColor})`,
    `drop-shadow(-${shadowSpread}px 0 0 ${strokeColor})`,
    `drop-shadow(0 ${shadowSpread}px 0 ${strokeColor})`,
    `drop-shadow(0 -${shadowSpread}px 0 ${strokeColor})`,
  ].join(" ");

  return (
    <div style={anchorStyle}>
      {/* Outline layer: drop-shadow creates the stroke */}
      <div
        style={{
          position: "relative",
          filter: dropShadows,
        }}
      >
        {/* Original image made invisible — only the drop-shadow remains visible */}
        <Img
          src={src}
          style={{
            maxHeight,
            maxWidth,
            objectFit: "contain",
            opacity: 0, // hide the image, keep the shadow outline
          }}
        />
      </div>
      {/*
        Alternative approach for when you want just the outline visible:
        Render the image twice — once for shadow, once inverted to cut out fill.
        For simpler cases, just pass an SVG with stroke-only paths.
      */}
    </div>
  );
};

export const demo = {
  compositionId: "collage-silhouette-outline",
  props: { src: "demo-cutout.png", at: 15 },
  durationInFrames: 180,
};
