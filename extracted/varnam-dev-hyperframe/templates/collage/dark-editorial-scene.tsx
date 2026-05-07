import { AbsoluteFill } from "remotion";
import { DarkCanvas } from "./dark-canvas";
import { GridOverlay } from "./grid-overlay";
import { CutoutFigure } from "./cutout-figure";
import { TrendArrow } from "./trend-arrow";
import { SilhouetteOutline } from "./silhouette-outline";
import { BillboardLabel } from "./billboard-label";
import { BoldStatement } from "./bold-statement";
import type { BaseProps } from "../shared/types";

interface DarkEditorialElement {
  type: "cutout" | "trend" | "silhouette" | "billboard" | "text";
  /** Cutout / Silhouette props */
  src?: string;
  /** Trend props */
  points?: { x: number; y: number }[];
  trendColor?: string;
  /** Billboard / Text props */
  text?: string;
  fontSize?: number;
  rotation?: number;
  bandColor?: string;
  bgColor?: string;
  textColor?: string;
  /** Shared positioning */
  x?: number;
  y?: number;
  at?: number;
  zIndex?: number;
  maxHeight?: number;
  maxWidth?: number;
  anchor?: "bottom-center" | "center" | "top-left" | "bottom-left" | "bottom-right";
  entrance?: "drop" | "slide-left" | "slide-right" | "stamp" | "none";
  grayscale?: number;
  contrast?: number;
  strokeColor?: string;
  perspective?: boolean;
}

interface DarkEditorialSceneProps extends BaseProps {
  /** Array of scene elements — layered in order */
  elements: DarkEditorialElement[];
  /** Canvas background color */
  bgColor?: string;
  /** Show grid overlay */
  showGrid?: boolean;
  /** Grid cell size */
  gridSize?: number;
  /** Grid line color */
  gridColor?: string;
  /** Grid opacity */
  gridOpacity?: number;
  /** Grid start frame */
  gridAt?: number;
  /** Canvas dimensions */
  width?: number;
  height?: number;
}

/**
 * Dark editorial scene compositor — the news/crisis graphic aesthetic.
 * Dark canvas + grid overlay + B&W city cutouts + red trend arrows
 * + white silhouette outlines + billboard labels.
 *
 * Recreates the AIM "IT Sector" thumbnail style:
 * dark bg, chart grid, skyline cutouts, crashing red arrow, person outline.
 */
export const DarkEditorialScene: React.FC<DarkEditorialSceneProps> = ({
  elements,
  bgColor = "#0D0F14",
  showGrid = true,
  gridSize = 80,
  gridColor = "rgba(255,255,255,0.1)",
  gridOpacity = 1,
  gridAt = 0,
  width = 1920,
  height = 1080,
}) => {
  return (
    <DarkCanvas color={bgColor}>
      {/* Grid overlay */}
      {showGrid && (
        <GridOverlay
          cellSize={gridSize}
          color={gridColor}
          opacity={gridOpacity}
          at={gridAt}
          width={width}
          height={height}
        />
      )}

      {/* Scene elements */}
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
                at={el.at ?? i * 6}
                zIndex={el.zIndex ?? i + 1}
                grayscale={el.grayscale ?? 1}
                contrast={el.contrast ?? 1.4}
              />
            );
          case "trend":
            return (
              <TrendArrow
                key={i}
                points={el.points ?? []}
                color={el.trendColor ?? "#E8342E"}
                at={el.at ?? i * 6}
                width={width}
                height={height}
                glow
              />
            );
          case "silhouette":
            return (
              <SilhouetteOutline
                key={i}
                src={el.src ?? ""}
                strokeColor={el.strokeColor ?? "#FFFFFF"}
                x={el.x}
                y={el.y}
                maxHeight={el.maxHeight}
                maxWidth={el.maxWidth}
                at={el.at ?? i * 6}
                zIndex={el.zIndex ?? i + 5}
              />
            );
          case "billboard":
            return (
              <BillboardLabel
                key={i}
                text={el.text ?? ""}
                x={el.x}
                y={el.y}
                fontSize={el.fontSize}
                bgColor={el.bgColor}
                textColor={el.textColor}
                perspective={el.perspective}
                at={el.at ?? i * 6}
                zIndex={el.zIndex ?? i + 8}
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
                color="#FFFFFF"
                at={el.at ?? i * 6}
                zIndex={el.zIndex ?? i + 10}
                bandColor={el.bandColor}
              />
            );
          default:
            return null;
        }
      })}
    </DarkCanvas>
  );
};
