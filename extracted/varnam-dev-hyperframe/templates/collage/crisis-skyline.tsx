import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { DarkCanvas } from "./dark-canvas";
import { GridOverlay } from "./grid-overlay";
import { TrendArrow } from "./trend-arrow";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadFont();

interface CrisisSkylineProps extends BaseProps {
  /** Array of building cutout images (2-5). Will fill bottom edge left-to-right. */
  buildings: string[];
  /** Optional: person silhouette cutout, rendered as white outline, center */
  silhouette?: string;
  /** Label text on a billboard (e.g. "IT SECTOR") */
  label: string;
  /** Trend direction — where the arrow goes */
  trend?: "down" | "up" | "volatile";
  /** Trend line color */
  trendColor?: string;
  /** Background color */
  bgColor?: string;
  /** Grid cell size */
  gridSize?: number;
  /** Frame to start */
  at?: number;
}

/**
 * DARK EDITORIAL CRISIS SCENE — news thumbnail / AIM style.
 *
 * Layout (baked):
 * - Dark canvas with subtle grid overlay (chart paper feel)
 * - Buildings fill bottom 45% as continuous skyline, edge-to-edge, overlapping
 * - Optional person silhouette as white outline, center, head at top-third
 * - Red (or custom) trend arrow crashes through mid-frame
 * - White billboard label sits on the center building
 *
 * Agent passes: building images, label text, optional silhouette. Done.
 * No coordinates, no z-index, no positioning.
 */
export const CrisisSkyline: React.FC<CrisisSkylineProps> = ({
  buildings,
  silhouette,
  label,
  trend = "down",
  trendColor = "#E83030",
  bgColor = "#0C0E16",
  gridSize = 72,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Distribute buildings across the bottom edge
  const buildingCount = Math.min(buildings.length, 5);
  const positions = distributeSkyline(buildingCount);

  // Trend arrow points based on direction
  const trendPoints = getTrendPoints(trend);

  // Building entrance stagger
  const buildingEntrance = (i: number) => ({
    opacity: interpolate(f, [i * 3, i * 3 + 8], [0, 1], C),
    transform: `translateY(${interpolate(f, [i * 3, i * 3 + 10], [30, 0], { ...C, easing: ease })}px)`,
  });

  // Heights vary — center tallest, edges shorter
  const heightPattern = buildingCount <= 2
    ? [560, 500]
    : buildingCount <= 3
    ? [480, 580, 500]
    : buildingCount <= 4
    ? [460, 540, 580, 480]
    : [440, 500, 580, 520, 460];

  return (
    <DarkCanvas color={bgColor} grain={0.04} highlightColor="rgba(25,30,50,0.5)" highlightY={30}>
      {/* Grid */}
      <GridOverlay cellSize={gridSize} color="rgba(255,255,255,0.07)" at={at} />

      {/* Person silhouette outline — if provided */}
      {silhouette && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 30,
            transform: "translateX(-50%)",
            zIndex: 4,
            opacity: interpolate(f, [6, 14], [0, 1], C),
          }}
        >
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <filter id="crisis-outline">
                <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="fat" />
                <feComposite in="fat" in2="SourceAlpha" operator="out" result="outline" />
                <feFlood floodColor="#FFFFFF" floodOpacity="0.75" result="white" />
                <feComposite in="white" in2="outline" operator="in" />
              </filter>
            </defs>
          </svg>
          <Img
            src={silhouette}
            style={{
              height: 650,
              objectFit: "contain",
              filter: "url(#crisis-outline)",
            }}
          />
        </div>
      )}

      {/* Trend arrow */}
      <TrendArrow
        points={trendPoints}
        color={trendColor}
        strokeWidth={6}
        arrowSize={24}
        at={at + 10}
        glow
        glowRadius={10}
      />

      {/* SKYLINE — buildings fill bottom, overlapping, edge-to-edge */}
      {buildings.slice(0, 5).map((src, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: positions[i].left,
            right: positions[i].right,
            bottom: -20,
            zIndex: positions[i].z,
            ...buildingEntrance(i),
          }}
        >
          <Img
            src={src}
            style={{
              height: heightPattern[i] || 500,
              objectFit: "contain",
              filter: `grayscale(1) contrast(1.5) brightness(${positions[i].brightness})`,
            }}
          />
        </div>
      ))}

      {/* Billboard label — centered, above the skyline */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          transform: `translate(-50%, -50%) scale(${interpolate(f, [14, 18, 22, 26], [1.3, 0.95, 1.04, 1.0], C)})`,
          zIndex: 10,
          opacity: interpolate(f, [14, 18], [0, 1], C),
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "14px 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 38,
              fontWeight: 800,
              color: "#1A1A1A",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </DarkCanvas>
  );
};

/** Distribute buildings across the frame. Center gets highest z. Edges bleed off-screen. */
function distributeSkyline(count: number): Array<{
  left?: string | number;
  right?: string | number;
  z: number;
  brightness: number;
}> {
  if (count <= 2) {
    return [
      { left: -40, z: 2, brightness: 0.6 },
      { right: -30, z: 2, brightness: 0.6 },
    ];
  }
  if (count <= 3) {
    return [
      { left: -50, z: 2, brightness: 0.55 },
      { left: "50%", z: 3, brightness: 0.5 },  // center, tallest, darkest
      { right: -40, z: 2, brightness: 0.55 },
    ];
  }
  if (count <= 4) {
    return [
      { left: -50, z: 2, brightness: 0.55 },
      { left: "25%", z: 3, brightness: 0.5 },
      { left: "55%", z: 3, brightness: 0.5 },
      { right: -40, z: 2, brightness: 0.55 },
    ];
  }
  return [
    { left: -50, z: 2, brightness: 0.55 },
    { left: "15%", z: 3, brightness: 0.5 },
    { left: "50%", z: 4, brightness: 0.45 },  // center king
    { left: "68%", z: 3, brightness: 0.5 },
    { right: -40, z: 2, brightness: 0.55 },
  ];
}

/** Generate trend points based on direction */
function getTrendPoints(trend: "down" | "up" | "volatile") {
  switch (trend) {
    case "down":
      return [
        { x: 2, y: 22 }, { x: 15, y: 36 }, { x: 30, y: 14 },
        { x: 50, y: 36 }, { x: 65, y: 24 }, { x: 98, y: 52 },
      ];
    case "up":
      return [
        { x: 2, y: 52 }, { x: 15, y: 40 }, { x: 30, y: 50 },
        { x: 50, y: 30 }, { x: 65, y: 38 }, { x: 98, y: 18 },
      ];
    case "volatile":
      return [
        { x: 2, y: 35 }, { x: 12, y: 20 }, { x: 25, y: 45 },
        { x: 40, y: 15 }, { x: 55, y: 42 }, { x: 70, y: 22 },
        { x: 85, y: 40 }, { x: 98, y: 30 },
      ];
  }
}

export const demo = {
  compositionId: "collage-crisis-skyline",
  props: { buildings: ["demo.png", "demo.png", "demo.png"], label: "ECONOMIC PRESSURE", at: 15 },
  durationInFrames: 180,
};
