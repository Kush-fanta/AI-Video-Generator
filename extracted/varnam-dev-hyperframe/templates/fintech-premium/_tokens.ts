/**
 * Fintech Premium Kit — design tokens.
 * Dark glossy black world with neon cyan, violet, and acid yellow accents.
 * Premium SaaS / fintech product ad feel: Stripe, Linear, Arc, Ramp, Mercury.
 * All visual values flow from here — no magic numbers in component bodies.
 */

const rgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const safe =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const v = Number.parseInt(safe, 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export const FP = {
  bg: {
    /** Pure black — deepest surface */
    black: "#000000",
    /** Near-black with very slight blue cast — default scene base */
    blackDeep: "#020208",
    /** Glossy dark surface for cards, panels, elevated elements */
    blackGlossy: "#0A0A0F",
    /** Slightly elevated over blackGlossy — secondary surface */
    surface: "#111118",
    /** Subtle elevation — hover states, borders */
    surfaceHigh: "#1A1A24",
  },

  accent: {
    cyan: "#00E5FF",
    violet: "#A855F7",
    yellow: "#E6FF00",
    /** Softer cyan for secondary usage */
    cyanSoft: "#33EEFF",
    /** Deep violet for fills */
    violetDeep: "#7C3AED",
    /** Muted yellow for secondary usage */
    yellowSoft: "#D4EB00",
  },

  text: {
    white: "#FFFFFF",
    offwhite: "#F0F0F8",
    mute: rgba("#F0F0F8", 0.6),
    dim: rgba("#F0F0F8", 0.35),
    /** Ultra-dim — gridlines, hairlines, ghost text */
    ghost: rgba("#F0F0F8", 0.12),
  },

  /**
   * Glow recipes — use as CSS boxShadow or filter: drop-shadow().
   * Each is a ready-made string for a single spread.
   */
  glow: {
    cyan: `0 0 24px ${rgba("#00E5FF", 0.55)}, 0 0 8px ${rgba("#00E5FF", 0.35)}`,
    cyanTight: `0 0 12px ${rgba("#00E5FF", 0.6)}, 0 0 4px ${rgba("#00E5FF", 0.4)}`,
    violet: `0 0 24px ${rgba("#A855F7", 0.55)}, 0 0 8px ${rgba("#A855F7", 0.35)}`,
    violetTight: `0 0 12px ${rgba("#A855F7", 0.6)}, 0 0 4px ${rgba("#A855F7", 0.4)}`,
    yellow: `0 0 20px ${rgba("#E6FF00", 0.5)}, 0 0 6px ${rgba("#E6FF00", 0.3)}`,
    yellowTight: `0 0 10px ${rgba("#E6FF00", 0.55)}, 0 0 3px ${rgba("#E6FF00", 0.35)}`,
    white: `0 0 16px ${rgba("#FFFFFF", 0.25)}, 0 0 6px ${rgba("#FFFFFF", 0.15)}`,
  },

  font: {
    /** Primary UI font — Inter, tight tracking */
    sans: "Inter",
    /** Display / hero font — Space Grotesk */
    display: "Space Grotesk",
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  size: {
    /** Footnote / metadata */
    micro: 14,
    /** Labels, caps, badges */
    label: 18,
    /** Body / descriptor */
    body: 24,
    /** Sub-headlines */
    sub: 36,
    /** Headlines */
    headline: 56,
    /** Display — large title cards */
    display: 88,
    /** Mega — dominant stat numbers */
    mega: 160,
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 32,
    full: 9999,
  },

  border: {
    /** Hairline 1px — e.g. glass card borders */
    hairline: `1px solid ${rgba("#FFFFFF", 0.08)}`,
    /** Slightly more visible glass edge */
    glass: `1px solid ${rgba("#FFFFFF", 0.14)}`,
    /** Accent-tinted border */
    cyanHairline: `1px solid ${rgba("#00E5FF", 0.25)}`,
    violetHairline: `1px solid ${rgba("#A855F7", 0.25)}`,
    yellowHairline: `1px solid ${rgba("#E6FF00", 0.2)}`,
  },

  motion: {
    /** Standard micro-motion envelope — 12 frames (~0.4s @ 30fps) */
    fadeFrames: 12,
    /** Longer reveal — 20 frames (~0.67s @ 30fps) */
    revealFrames: 20,
    /** Spring settle duration — 18 frames */
    springFrames: 18,
    /** Streak sweep duration — 24 frames */
    streakFrames: 24,
    /** Pulse cycle — 45 frames (~1.5s) */
    pulseFrames: 45,
    /** Minimum hold — 60 frames (2s) */
    holdMin: 60,
    /** Orbit rotation — 180 frames (6s full rotation) */
    orbitFrames: 180,
  },

  safe: {
    /** Full-width safe column (1920-wide frame) */
    columnWidth: 1440,
    /** Narrow safe column for centered text */
    columnWidthNarrow: 960,
    /** Side margin */
    sideMargin: 120,
    /** Bottom lower-third clearance */
    bottomLowerThird: 80,
  },
} as const;

export type FPTokens = typeof FP;

/** Accent color union type */
export type FPAccentColor = "cyan" | "violet" | "yellow";

/** Resolve an accent color string from the token union */
export const resolveAccent = (accent: FPAccentColor = "cyan"): string =>
  FP.accent[accent];

/** Resolve a glow recipe string from the token union */
export const resolveGlow = (accent: FPAccentColor = "cyan"): string =>
  FP.glow[accent];

/** Resolve a tight glow recipe string from the token union */
export const resolveGlowTight = (accent: FPAccentColor = "cyan"): string =>
  FP.glow[`${accent}Tight`];

/** Resolve a hairline border string from the token union */
export const resolveHairline = (accent: FPAccentColor = "cyan"): string =>
  FP.border[`${accent}Hairline`];

export const fpRgba = rgba;
