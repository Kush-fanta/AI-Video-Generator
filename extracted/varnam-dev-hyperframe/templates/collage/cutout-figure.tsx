import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";

interface CutoutFigureProps {
  /** Image source — transparent PNG cutout works best */
  src: string;
  /** Position as percentage of canvas */
  x?: number;
  y?: number;
  /** Max height in px */
  maxHeight?: number;
  /** Max width in px */
  maxWidth?: number;
  /** Desaturate to B&W (0 = full color, 1 = full grayscale, default 1) */
  grayscale?: number;
  /** Contrast boost (default 1.15 — slight pop for vintage look) */
  contrast?: number;
  /** Rough edge shadow to simulate cut-out paper */
  roughEdge?: boolean;
  /** Anchor: where the image sits relative to its position point */
  anchor?: "bottom-center" | "center" | "top-left" | "bottom-left" | "bottom-right";
  /** Animation: entrance style */
  entrance?: "drop" | "slide-left" | "slide-right" | "stamp" | "none";
  /** Frame to start animation */
  at?: number;
  /** Z-index for layering */
  zIndex?: number;
}

/**
 * A B&W photo cutout placed on the collage canvas.
 * Desaturated, slightly boosted contrast, optional rough-edge shadow
 * to simulate physically cut paper. Entrance animations feel tactile —
 * stamp (scale slam), drop (fall + settle), slide.
 */
export const CutoutFigure: React.FC<CutoutFigureProps> = ({
  src,
  x = 50,
  y = 50,
  maxHeight = 600,
  maxWidth = 500,
  grayscale = 1,
  contrast = 1.15,
  roughEdge = true,
  anchor = "bottom-center",
  entrance = "stamp",
  at = 0,
  zIndex = 1,
}) => {
  const frame = useCurrentFrame();

  // Entrance animation
  let opacity = 1;
  let transform = "";
  const dur = 14;

  switch (entrance) {
    case "stamp": {
      const scale = interpolate(frame, [at, at + 6, at + 10, at + dur], [1.15, 0.97, 1.02, 1.0], {
        ...C,
        easing: ease,
      });
      opacity = interpolate(frame, [at, at + 4], [0, 1], C);
      transform = `scale(${scale})`;
      break;
    }
    case "drop": {
      const ty = interpolate(frame, [at, at + dur], [-40, 0], { ...C, easing: ease });
      opacity = interpolate(frame, [at, at + 6], [0, 1], C);
      transform = `translateY(${ty}px)`;
      break;
    }
    case "slide-left": {
      const tx = interpolate(frame, [at, at + dur], [60, 0], { ...C, easing: ease });
      opacity = interpolate(frame, [at, at + 6], [0, 1], C);
      transform = `translateX(${tx}px)`;
      break;
    }
    case "slide-right": {
      const tx = interpolate(frame, [at, at + dur], [-60, 0], { ...C, easing: ease });
      opacity = interpolate(frame, [at, at + 6], [0, 1], C);
      transform = `translateX(${tx}px)`;
      break;
    }
    case "none":
    default:
      break;
  }

  // Anchor positioning
  const anchorStyle: React.CSSProperties = {
    position: "absolute",
    zIndex,
  };

  switch (anchor) {
    case "bottom-center":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        bottom: `${100 - y}%`,
        transform: `translateX(-50%) ${transform}`,
      });
      break;
    case "center":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) ${transform}`,
      });
      break;
    case "top-left":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        top: `${y}%`,
        transform,
      });
      break;
    case "bottom-left":
      Object.assign(anchorStyle, {
        left: `${x}%`,
        bottom: `${100 - y}%`,
        transform,
      });
      break;
    case "bottom-right":
      Object.assign(anchorStyle, {
        right: `${100 - x}%`,
        bottom: `${100 - y}%`,
        transform,
      });
      break;
  }

  return (
    <div style={{ ...anchorStyle, opacity }}>
      <Img
        src={src}
        style={{
          maxHeight,
          maxWidth,
          objectFit: "contain",
          filter: `grayscale(${grayscale}) contrast(${contrast})`,
          // Rough edge: irregular shadow simulating torn paper
          ...(roughEdge
            ? {
                filter: `grayscale(${grayscale}) contrast(${contrast}) drop-shadow(2px 3px 1px rgba(0,0,0,0.15)) drop-shadow(-1px 2px 0px rgba(0,0,0,0.08))`,
              }
            : {}),
        }}
      />
    </div>
  );
};
