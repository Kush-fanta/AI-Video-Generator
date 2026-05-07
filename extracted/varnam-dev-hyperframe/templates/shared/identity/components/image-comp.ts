import type { ImageCompTokens } from "../types";

export const defaultImageCompTokens: ImageCompTokens = {
  frameRadius: 16,
  frameShadow: "0 8px 40px rgba(0,0,0,0.08)",
  imageOpacity: 0.85,
  categoryLabelSize: 20,
  categoryLetterSpacingEm: 0.18,
  splitImageWidthPct: 46,
  splitTextWidthPct: 48,
  splitTextMaxWidth: 640,
  headlineSize: 64,
  bodySize: 28,
  accentLineMaxWidth: 160,
  accentLineHeight: 3,
  overlayHeightPct: 45,
  overlayHeadlineSize: 80,
  overlaySubtitleSize: 32,
  badgeSize: 20,
  badgePaddingX: 16,
  badgePaddingY: 8,
  hairlineHeight: 180,
  hairlineOpacity: 1,
};

export const imageCompPresets: Record<string, Partial<ImageCompTokens>> = {
  default: {},
  "frame-heavy": {
    frameRadius: 20,
    frameShadow: "0 12px 48px rgba(0,0,0,0.16)",
    accentLineMaxWidth: 200,
  },
  "overlay-heavy": {
    overlayHeightPct: 60,
    overlayHeadlineSize: 96,
    overlaySubtitleSize: 36,
    badgeSize: 22,
  },
};
