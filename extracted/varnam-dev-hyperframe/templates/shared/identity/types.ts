import type { CSSProperties } from "react";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export interface TypographyRoleTokens {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacingEm?: number;
  textTransform?: CSSProperties["textTransform"];
}

export interface IdentityColorTokens {
  canvas: string;
  canvasStrong: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  lineSubtle: string;
  accentPrimary: string;
  accentSecondary: string;
  accentPositive: string;
  accentNegative: string;
  neutral: string;
}

export interface IdentityTypographyTokens {
  display: TypographyRoleTokens;
  title: TypographyRoleTokens;
  subtitle: TypographyRoleTokens;
  body: TypographyRoleTokens;
  label: TypographyRoleTokens;
  meta: TypographyRoleTokens;
  number: TypographyRoleTokens;
}

export interface IdentitySpacingTokens {
  pageInsetX: number;
  pageInsetY: number;
  sectionGap: number;
  contentGap: number;
  tightGap: number;
  panelGap: number;
  safeZone: number;
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  borderThin: number;
  borderThick: number;
}

export interface IdentityMotionTokens {
  revealDuration: number;
  lineGrowDuration: number;
  kenBurnsFrom: number;
  kenBurnsTo: number;
  emphasisScale: number;
}

export interface IdentityOrnamentTokens {
  shadowSoft: string;
  shadowStrong: string;
  dividerRadius: number;
  badgeBackground: string;
  badgeForeground: string;
  overlayGradientStart: string;
  overlayGradientMid: string;
  overlayGradientEnd: string;
}

export interface HeroTokens {
  titleMaxWidth: number;
  accentLineMaxWidth: number;
  accentLineHeight: number;
  titleSize: number;
  numberSize: number;
  numberMinWidth: number;
  barWidth: number;
  barMaxHeight: number;
  coldOpenSize: number;
  coldOpenMaxWidth: number;
  coldOpenDashWidth: number;
  titleLetterSpacingEm: number;
  coldOpenLetterSpacingEm: number;
}

export interface ImageCompTokens {
  frameRadius: number;
  frameShadow: string;
  imageOpacity: number;
  categoryLabelSize: number;
  categoryLetterSpacingEm: number;
  splitImageWidthPct: number;
  splitTextWidthPct: number;
  splitTextMaxWidth: number;
  headlineSize: number;
  bodySize: number;
  accentLineMaxWidth: number;
  accentLineHeight: number;
  overlayHeightPct: number;
  overlayHeadlineSize: number;
  overlaySubtitleSize: number;
  badgeSize: number;
  badgePaddingX: number;
  badgePaddingY: number;
  hairlineHeight: number;
  hairlineOpacity: number;
}

export interface DataVizTokens {
  layoutInsetX: number;
  panelGap: number;
  waffleCellSize: number;
  waffleGap: number;
  numberSize: number;
  numberLetterSpacingEm: number;
  labelSize: number;
  sourceSize: number;
  accentLineMaxWidth: number;
  accentLineHeight: number;
}

export interface IdentityPack {
  id: string;
  colors: IdentityColorTokens;
  typography: IdentityTypographyTokens;
  spacing: IdentitySpacingTokens;
  motion: IdentityMotionTokens;
  ornament: IdentityOrnamentTokens;
  families?: {
    hero?: DeepPartial<HeroTokens>;
    imageComp?: DeepPartial<ImageCompTokens>;
    dataViz?: DeepPartial<DataVizTokens>;
    narrative?: Record<string, never>;
    overlays?: Record<string, never>;
  };
}

export type IdentityOverride = DeepPartial<Omit<IdentityPack, "id">> & {
  id?: string;
};
