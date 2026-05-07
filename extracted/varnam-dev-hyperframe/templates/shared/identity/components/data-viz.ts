import type { DataVizTokens } from "../types";

export const defaultDataVizTokens: DataVizTokens = {
  layoutInsetX: 160,
  panelGap: 120,
  waffleCellSize: 52,
  waffleGap: 6,
  numberSize: 200,
  numberLetterSpacingEm: -0.03,
  labelSize: 32,
  sourceSize: 20,
  accentLineMaxWidth: 200,
  accentLineHeight: 4,
};

export const dataVizPresets: Record<string, Partial<DataVizTokens>> = {
  default: {},
  minimal: {
    panelGap: 88,
    waffleCellSize: 44,
    waffleGap: 4,
    numberSize: 168,
    labelSize: 28,
  },
  ops: {
    layoutInsetX: 120,
    panelGap: 96,
    numberSize: 240,
    accentLineMaxWidth: 240,
  },
};
