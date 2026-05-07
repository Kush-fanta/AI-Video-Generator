import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PaperBg } from "./paper-bg";
import { HalftoneBeam } from "./halftone-beam";
import { CutoutFigure } from "./cutout-figure";
import { BoldStatement } from "./bold-statement";
import type { BaseProps } from "../shared/types";

interface CollageElement {
  type: "cutout" | "beam" | "text";
  /** Cutout props */
  src?: string;
  /** Beam props */
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  beamColor?: string;
  narrowWidth?: number;
  wideWidth?: number;
  /** Text props */
  text?: string;
  fontSize?: number;
  rotation?: number;
  bandColor?: string;
  /** Shared */
  x?: number;
  y?: number;
  at?: number;
  zIndex?: number;
  maxHeight?: number;
  maxWidth?: number;
  anchor?: "bottom-center" | "center" | "top-left" | "bottom-left" | "bottom-right";
  entrance?: "drop" | "slide-left" | "slide-right" | "stamp" | "none";
  grayscale?: number;
}

interface CollageSceneProps extends BaseProps {
  /** Array of collage elements — layered in order */
  elements: CollageElement[];
  /** Paper background color */
  paperColor?: string;
  /** Paper grain intensity */
  grain?: number;
  /** Canvas dimensions */
  width?: number;
  height?: number;
}

/**
 * Full collage composition — retro editorial style.
 * Combines: aged paper, B&W cutouts, halftone beams, bold typography.
 *
 * Pass an array of elements. Each is a cutout, beam, or text.
 * They layer in order (last = on top). Control timing with `at`.
 *
 * Recreates the Winston Smith / Disposable Ones aesthetic:
 * vintage paper + B&W photos + bold geometry + condensed type.
 */
export const CollageScene: React.FC<CollageSceneProps> = ({
  elements,
  paperColor = "#F2EDE4",
  grain = 0.06,
  width = 1920,
  height = 1080,
}) => {
  return (
    <PaperBg color={paperColor} grain={grain}>
      {elements.map((el, i) => {
        switch (el.type) {
          case "cutout":
            return (
              <CutoutFigure
                key={i}
                src={el.src ?? ""}
                x={el.x}
                y={el.y}
                maxHeight={el.maxHeight}
                maxWidth={el.maxWidth}
                anchor={el.anchor}
                entrance={el.entrance}
                at={el.at ?? i * 8}
                zIndex={el.zIndex ?? i + 1}
                grayscale={el.grayscale}
              />
            );
          case "beam":
            return (
              <HalftoneBeam
                key={i}
                from={el.from ?? { x: 50, y: 50 }}
                to={el.to ?? { x: 80, y: 50 }}
                color={el.beamColor ?? "#E8A828"}
                narrowWidth={el.narrowWidth}
                wideWidth={el.wideWidth}
                at={el.at ?? i * 8}
                width={width}
                height={height}
              />
            );
          case "text":
            return (
              <BoldStatement
                key={i}
                text={el.text ?? ""}
                fontSize={el.fontSize}
                rotation={el.rotation}
                x={el.x}
                y={el.y}
                at={el.at ?? i * 8}
                zIndex={el.zIndex ?? 10 + i}
                bandColor={el.bandColor}
              />
            );
          default:
            return null;
        }
      })}
    </PaperBg>
  );
};
