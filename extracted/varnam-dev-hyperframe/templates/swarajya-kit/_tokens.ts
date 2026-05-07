/**
 * Swarajya Kit — design tokens extracted from the @Swarajyamag YouTube channel.
 * Source: /tmp/swarajya-study/findings.md (2026-04-18).
 * These override the magazine-print aesthetic in channels/swarajya/visuals.md
 * for ALL video output. Keep narrow, keep dark, keep red.
 */

export const SK = {
  bg: {
    navy: "#0F1B2D",
    black: "#000000",
    red: "#D74545",
    cream: "#F5F5F5",
  },
  text: {
    white: "#FFFFFF",
    offwhite: "#F5F5F5",
    ink: "#0B0F1A",
    red: "#D74545",
    mute: "rgba(255,255,255,0.6)",
  },
  accent: {
    red: "#D74545",
    redDark: "#B43838",
    gold: "#D4A84B",
  },
  font: {
    sans: "Inter",
    display: "Space Grotesk",
    serif: "IBM Plex Serif",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  size: {
    micro: 18,    // was 14 — source microtext, date stamps
    label: 28,    // was 18 — eyebrow, caps labels above hero numbers; mobile-floor
    body: 36,     // was 28 — captions, descriptors
    sub: 44,      // was 36 — subheads
    headline: 72, // was 64 — headlines on split/editorial cards
    display: 110, // was 96  — title cards, chapter titles
    mega: 180,    // was 140 — hero anchor numbers (B05, B12, B36, B64, B68)
  },
  safe: {
    // text occupies 40–50% of a 1920-wide frame — NOT edge-to-edge
    columnWidth: 880,
    columnWidthNarrow: 720,
    sideMargin: 120,
    bottomLowerThird: 120,
  },
  motion: {
    fadeFrames: 12, // ~0.4s at 30fps
    holdMin: 90,    // ~3s
  },
} as const;

export type SKTokens = typeof SK;

export type SKPaletteName = "default" | "slate" | "forest" | "mono" | "white";

export interface SKResolvedPalette {
  name: SKPaletteName;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accentDark: string;
  accentAlt: string;
  chartNeutral: string;
  chartAxis: string;
  chartFill: string;
}

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const safe =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  const value = Number.parseInt(safe, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export const SK_PALETTES: Record<SKPaletteName, SKResolvedPalette> = {
  default: {
    name: "default",
    background: SK.bg.navy,
    surface: SK.bg.black,
    text: SK.text.white,
    textMuted: SK.text.mute,
    accent: SK.accent.red,
    accentDark: SK.accent.redDark,
    accentAlt: SK.accent.gold,
    chartNeutral: rgba("#FFFFFF", 0.28),
    chartAxis: rgba("#FFFFFF", 0.18),
    chartFill: rgba(SK.accent.red, 0.2),
  },
  slate: {
    name: "slate",
    background: "#16263B",
    surface: "#0C1624",
    text: "#F7FAFC",
    textMuted: rgba("#F7FAFC", 0.62),
    accent: "#78B7FF",
    accentDark: "#4F8ED6",
    accentAlt: "#E8F0FF",
    chartNeutral: rgba("#D8E3F0", 0.3),
    chartAxis: rgba("#F7FAFC", 0.16),
    chartFill: rgba("#78B7FF", 0.22),
  },
  forest: {
    name: "forest",
    background: "#13261E",
    surface: "#09140F",
    text: "#F3F7F4",
    textMuted: rgba("#F3F7F4", 0.6),
    accent: "#50C878",
    accentDark: "#2F9A57",
    accentAlt: "#D8F3A5",
    chartNeutral: rgba("#DDE9E2", 0.28),
    chartAxis: rgba("#F3F7F4", 0.16),
    chartFill: rgba("#50C878", 0.22),
  },
  mono: {
    name: "mono",
    background: "#101010",
    surface: "#000000",
    text: "#FAFAFA",
    textMuted: rgba("#FAFAFA", 0.54),
    accent: "#E6E6E6",
    accentDark: "#BEBEBE",
    accentAlt: "#7C7C7C",
    chartNeutral: rgba("#FAFAFA", 0.22),
    chartAxis: rgba("#FAFAFA", 0.14),
    chartFill: rgba("#FAFAFA", 0.14),
  },
  white: {
    name: "white",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#202020",
    textMuted: "rgba(32,32,32,0.55)",
    accent: "#DC7070",
    accentDark: "#B85555",
    accentAlt: "#8A8A8A",
    chartNeutral: "rgba(32,32,32,0.12)",
    chartAxis: "rgba(32,32,32,0.10)",
    chartFill: "rgba(220,112,112,0.14)",
  },
};

export const resolveSKPalette = (
  palette: SKPaletteName | undefined,
): SKResolvedPalette => {
  return SK_PALETTES[palette ?? "default"] ?? SK_PALETTES.default;
};
