import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { MUGHAL, TEMPLE, PICHWAI } from "./palettes";

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// ── Jali Lattice ──────────────────────────────────────────────
// Mughal perforated stone screen — works as overlay or clip mask

interface JaliPatternProps {
  color?: string;
  opacity?: number;
  rows?: number;
  cols?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const JaliPattern: React.FC<JaliPatternProps> = ({
  color = MUGHAL.gold,
  opacity = 0.12,
  rows = 6,
  cols = 8,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const drawProgress = interpolate(frame, [at, at + 40], [0, 1], { ...C, easing: ease });

  const cells: React.ReactNode[] = [];
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const total = rows * cols;
      const cellProgress = interpolate(drawProgress, [idx / total, Math.min(1, (idx + 3) / total)], [0, 1], C);
      const cx = cellW * c + cellW / 2;
      const cy = cellH * r + cellH / 2;
      const rx = cellW * 0.32 * cellProgress;
      const ry = cellH * 0.32 * cellProgress;

      cells.push(
        <ellipse
          key={`${r}-${c}`}
          cx={`${cx}%`}
          cy={`${cy}%`}
          rx={`${rx}%`}
          ry={`${ry}%`}
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          opacity={cellProgress}
        />
      );
      // Inner diamond
      if (cellProgress > 0.5) {
        const d = Math.min(rx, ry) * 0.5;
        cells.push(
          <polygon
            key={`d-${r}-${c}`}
            points={`${cx},${cy - d * 0.6} ${cx + d * 0.6},${cy} ${cx},${cy + d * 0.6} ${cx - d * 0.6},${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={(cellProgress - 0.5) * 2}
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity, pointerEvents: "none", ...style }}
    >
      {cells}
    </svg>
  );
};

// ── Kolam Grid ────────────────────────────────────────────────
// South Indian dot-grid line drawing — stroke animates in

interface KolamGridProps {
  color?: string;
  opacity?: number;
  size?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const KolamGrid: React.FC<KolamGridProps> = ({
  color = TEMPLE.vermillion,
  opacity = 0.15,
  size = 400,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 60], [0, 1], { ...C, easing: ease });
  const totalLen = 2400;
  const dashOffset = totalLen * (1 - draw);

  // Symmetrical looping kolam path
  const path = "M 50,10 C 30,20 20,40 30,50 C 20,60 30,80 50,90 C 70,80 80,60 70,50 C 80,40 70,20 50,10 Z M 50,30 C 40,35 35,45 40,50 C 35,55 40,65 50,70 C 60,65 65,55 60,50 C 65,45 60,35 50,30 Z M 10,50 C 20,30 40,20 50,30 M 90,50 C 80,30 60,20 50,30 M 10,50 C 20,70 40,80 50,70 M 90,50 C 80,70 60,80 50,70";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ position: "absolute", opacity, pointerEvents: "none", ...style }}
    >
      {/* Dots */}
      {[
        [50, 10], [30, 30], [70, 30], [10, 50], [50, 50], [90, 50],
        [30, 70], [70, 70], [50, 90],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={1.5}
          fill={color}
          opacity={interpolate(draw, [i * 0.08, i * 0.08 + 0.1], [0, 1], C)}
        />
      ))}
      {/* Path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray={totalLen}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
};

// ── Paisley Border ────────────────────────────────────────────
// Animated growing paisley vine border

interface PaisleyBorderProps {
  color?: string;
  opacity?: number;
  side?: "left" | "right" | "top" | "bottom";
  at?: number;
  style?: React.CSSProperties;
}

export const PaisleyBorder: React.FC<PaisleyBorderProps> = ({
  color = MUGHAL.gold,
  opacity = 0.18,
  side = "left",
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [at, at + 50], [0, 100], { ...C, easing: ease });
  const isVertical = side === "left" || side === "right";

  const posStyle: React.CSSProperties = {
    position: "absolute",
    [side]: 0,
    ...(isVertical
      ? { top: 0, width: 40, height: `${grow}%` }
      : { left: 0, height: 40, width: `${grow}%` }),
  };

  // Repeating paisley motifs along the border
  const count = Math.floor(grow / 12);
  const motifs: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const pos = i * 12 + 6;
    motifs.push(
      <g key={i} transform={isVertical ? `translate(20, ${pos})` : `translate(${pos}, 20)`}>
        <path
          d="M 0,-4 C 3,-4 5,-2 5,1 C 5,4 2,6 0,6 C -2,6 -5,4 -5,1 C -5,-2 -3,-4 0,-4 Z M 0,-4 C 0,-7 2,-8 3,-7"
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <div style={{ ...posStyle, opacity, pointerEvents: "none", overflow: "hidden", ...style }}>
      <svg
        viewBox={isVertical ? "0 0 40 100" : "0 0 100 40"}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        {motifs}
      </svg>
    </div>
  );
};

// ── Mughal Arch ───────────────────────────────────────────────
// Pointed arch clip path / frame

interface MughalArchProps {
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  at?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const MughalArch: React.FC<MughalArchProps> = ({
  color = MUGHAL.gold,
  opacity = 1,
  strokeWidth = 2,
  at = 0,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 30], [0, 1], { ...C, easing: ease });
  const totalLen = 800;

  return (
    <div style={{ position: "relative", ...style }}>
      {children && (
        <div
          style={{
            clipPath: "polygon(50% 0%, 95% 8%, 100% 100%, 0% 100%, 5% 8%)",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      )}
      <svg
        viewBox="0 0 200 280"
        preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity }}
      >
        <path
          d="M 10,280 L 10,60 Q 10,10 100,5 Q 190,10 190,60 L 190,280"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={totalLen}
          strokeDashoffset={totalLen * (1 - draw)}
        />
        {/* Inner arch line */}
        <path
          d="M 20,280 L 20,65 Q 20,20 100,15 Q 180,20 180,65 L 180,280"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 0.5}
          strokeLinecap="round"
          strokeDasharray={totalLen}
          strokeDashoffset={totalLen * (1 - draw * 0.9)}
          opacity={0.5}
        />
      </svg>
    </div>
  );
};

// ── Scalloped Border ──────────────────────────────────────────
// Mughal/Rajput scalloped edge

interface ScallopedBorderProps {
  color?: string;
  opacity?: number;
  scallops?: number;
  side?: "top" | "bottom";
  at?: number;
  style?: React.CSSProperties;
}

export const ScallopedBorder: React.FC<ScallopedBorderProps> = ({
  color = MUGHAL.gold,
  opacity = 0.2,
  scallops = 12,
  side = "bottom",
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 30], [0, 1], { ...C, easing: ease });

  const w = 100 / scallops;
  let d = side === "top" ? `M 0,20 ` : `M 0,0 `;
  for (let i = 0; i < scallops; i++) {
    const x1 = w * i;
    const x2 = w * (i + 0.5);
    const x3 = w * (i + 1);
    if (side === "top") {
      d += `Q ${x2},0 ${x3},20 `;
    } else {
      d += `Q ${x2},20 ${x3},0 `;
    }
  }

  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        [side]: 0,
        left: 0,
        width: "100%",
        height: 30,
        opacity: opacity * draw,
        pointerEvents: "none",
        ...style,
      }}
    >
      <path d={d} fill="none" stroke={color} strokeWidth={1} />
    </svg>
  );
};

// ── Lotus Motif ───────────────────────────────────────────────
// Animated lotus bloom — petals open outward

interface LotusMotifProps {
  color?: string;
  centerColor?: string;
  size?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const LotusMotif: React.FC<LotusMotifProps> = ({
  color = PICHWAI.lotusPink,
  centerColor = PICHWAI.gold,
  size = 120,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const bloom = interpolate(frame, [at, at + 35], [0, 1], { ...C, easing: ease });
  const petals = 8;

  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      style={{ position: "absolute", pointerEvents: "none", ...style }}
    >
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (360 / petals) * i;
        const petalBloom = interpolate(bloom, [i * 0.08, i * 0.08 + 0.3], [0, 1], C);
        return (
          <ellipse
            key={i}
            cx={0}
            cy={-22 * petalBloom}
            rx={8 * petalBloom}
            ry={18 * petalBloom}
            fill={color}
            opacity={0.7 * petalBloom}
            transform={`rotate(${angle})`}
          />
        );
      })}
      {/* Center */}
      <circle cx={0} cy={0} r={8 * bloom} fill={centerColor} opacity={bloom} />
    </svg>
  );
};

// ── Chakra Spinner ────────────────────────────────────────────
// Ashoka Chakra — 24 spokes, rotates continuously

interface ChakraSpinnerProps {
  color?: string;
  size?: number;
  rpm?: number;
  opacity?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const ChakraSpinner: React.FC<ChakraSpinnerProps> = ({
  color = TEMPLE.brass,
  size = 80,
  rpm = 4,
  opacity = 0.15,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [at, at + 20], [0, 1], C);
  const rotation = (frame / 30) * rpm * 360;

  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      style={{
        position: "absolute",
        opacity: opacity * fadeIn,
        pointerEvents: "none",
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    >
      <circle cx={0} cy={0} r={45} fill="none" stroke={color} strokeWidth={2} />
      <circle cx={0} cy={0} r={8} fill="none" stroke={color} strokeWidth={1.5} />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 24;
        return (
          <line
            key={i}
            x1={8 * Math.cos(angle)}
            y1={8 * Math.sin(angle)}
            x2={45 * Math.cos(angle)}
            y2={45 * Math.sin(angle)}
            stroke={color}
            strokeWidth={0.8}
          />
        );
      })}
    </svg>
  );
};

// ── Meander Vine ──────────────────────────────────────────────
// Growing vine/scroll border — animated stroke

interface MeanderVineProps {
  color?: string;
  opacity?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const MeanderVine: React.FC<MeanderVineProps> = ({
  color = MUGHAL.jade,
  opacity = 0.15,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [at, at + 50], [0, 1], { ...C, easing: ease });
  const pathLen = 600;

  return (
    <svg
      viewBox="0 0 200 30"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        width: "100%",
        height: 40,
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    >
      <path
        d="M 0,15 C 10,5 15,5 20,15 C 25,25 30,25 35,15 C 40,5 45,5 50,15 C 55,25 60,25 65,15 C 70,5 75,5 80,15 C 85,25 90,25 95,15 C 100,5 105,5 110,15 C 115,25 120,25 125,15 C 130,5 135,5 140,15 C 145,25 150,25 155,15 C 160,5 165,5 170,15 C 175,25 180,25 185,15 C 190,5 195,5 200,15"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen * (1 - grow)}
      />
      {/* Leaf accents */}
      {[20, 50, 80, 110, 140, 170].map((x, i) => {
        const leafProgress = interpolate(grow, [(i + 1) * 0.12, (i + 1) * 0.12 + 0.1], [0, 1], C);
        return (
          <ellipse
            key={i}
            cx={x}
            cy={i % 2 === 0 ? 8 : 22}
            rx={4 * leafProgress}
            ry={2 * leafProgress}
            fill={color}
            opacity={leafProgress * 0.6}
            transform={`rotate(${i % 2 === 0 ? -30 : 30}, ${x}, ${i % 2 === 0 ? 8 : 22})`}
          />
        );
      })}
    </svg>
  );
};

// ── Diamond Lattice ───────────────────────────────────────────
// Repeating diamond/hira pattern — common in Indian textiles

interface DiamondLatticeProps {
  color?: string;
  opacity?: number;
  rows?: number;
  cols?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const DiamondLattice: React.FC<DiamondLatticeProps> = ({
  color = TEMPLE.turmeric,
  opacity = 0.08,
  rows = 8,
  cols = 12,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 35], [0, 1], { ...C, easing: ease });

  const diamonds: React.ReactNode[] = [];
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const total = rows * cols;
      const p = interpolate(draw, [idx / total, Math.min(1, (idx + 2) / total)], [0, 1], C);
      const cx = cellW * c + cellW / 2;
      const cy = cellH * r + cellH / 2;
      const dx = cellW * 0.35 * p;
      const dy = cellH * 0.35 * p;

      diamonds.push(
        <polygon
          key={`${r}-${c}`}
          points={`${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={0.4}
          opacity={p}
        />
      );
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity, pointerEvents: "none", ...style }}
    >
      {diamonds}
    </svg>
  );
};

// ── Temple Gopuram ────────────────────────────────────────────
// Simplified temple tower silhouette as background texture

interface TempleGopuramProps {
  color?: string;
  opacity?: number;
  at?: number;
  style?: React.CSSProperties;
}

export const TempleGopuram: React.FC<TempleGopuramProps> = ({
  color = TEMPLE.charcoal,
  opacity = 0.06,
  at = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [at, at + 30], [0, 1], { ...C, easing: ease });

  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute",
        height: "80%",
        opacity: opacity * fadeIn,
        pointerEvents: "none",
        ...style,
      }}
    >
      {/* Base */}
      <rect x={40} y={240} width={120} height={60} fill={color} />
      {/* Tier 1 */}
      <rect x={50} y={190} width={100} height={50} fill={color} />
      <path d="M 50,190 L 45,195 L 45,240 L 50,240 Z" fill={color} opacity={0.7} />
      <path d="M 150,190 L 155,195 L 155,240 L 150,240 Z" fill={color} opacity={0.7} />
      {/* Tier 2 */}
      <rect x={60} y={145} width={80} height={45} fill={color} />
      {/* Tier 3 */}
      <rect x={70} y={105} width={60} height={40} fill={color} />
      {/* Tier 4 */}
      <rect x={80} y={70} width={40} height={35} fill={color} />
      {/* Shikhara (top) */}
      <path d="M 90,70 L 100,20 L 110,70 Z" fill={color} />
      {/* Kalash */}
      <circle cx={100} cy={15} r={6} fill={color} />
      <line x1={100} y1={9} x2={100} y2={2} stroke={color} strokeWidth={2} />
      {/* Window details */}
      {[200, 155, 115, 78].map((y, i) => (
        <rect
          key={i}
          x={95}
          y={y}
          width={10}
          height={14}
          rx={5}
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          opacity={0.5}
        />
      ))}
    </svg>
  );
};
