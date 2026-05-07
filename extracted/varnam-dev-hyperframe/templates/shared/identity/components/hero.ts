import type { HeroTokens } from "../types";

export const defaultHeroTokens: HeroTokens = {
  titleMaxWidth: 800,
  accentLineMaxWidth: 180,
  accentLineHeight: 3,
  titleSize: 72,
  numberSize: 200,
  numberMinWidth: 200,
  barWidth: 4,
  barMaxHeight: 120,
  coldOpenSize: 128,
  coldOpenMaxWidth: 1000,
  coldOpenDashWidth: 48,
  titleLetterSpacingEm: -0.02,
  coldOpenLetterSpacingEm: -0.03,
};

export const heroPresets: Record<string, Partial<HeroTokens>> = {
  default: {},
  compact: {
    titleSize: 56,
    numberSize: 150,
    numberMinWidth: 150,
    titleMaxWidth: 680,
    barWidth: 3,
    barMaxHeight: 100,
    coldOpenSize: 96,
    coldOpenMaxWidth: 840,
  },
  bold: {
    titleSize: 88,
    numberSize: 240,
    numberMinWidth: 240,
    titleMaxWidth: 920,
    accentLineMaxWidth: 220,
    barWidth: 6,
    barMaxHeight: 150,
    coldOpenSize: 148,
    coldOpenMaxWidth: 1140,
  },
  tactical: {
    titleSize: 96,
    accentLineHeight: 4,
    accentLineMaxWidth: 56,
    coldOpenSize: 160,
    coldOpenDashWidth: 72,
  },
};
