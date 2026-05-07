/**
 * Legacy palette helpers for unmigrated templates.
 * Token-first templates should use shared/identity instead.
 */
export const P = {
  bg: "#EDEAE4",       // warm cream — the canvas
  dark: "#0A0A0A",     // DarkPunch backgrounds
  text: "#2A2622",     // primary text
  sub: "#5C5650",      // secondary text
  muted: "#9B948B",    // tertiary / context text
  light: "#C8C2B6",    // borders, dividers, tracks
  terracotta: "#C17A48", // accent — emphasis, the new, punchlines
  sage: "#6D917D",     // positive, growth, green data
  mauve: "#907070",    // old model, warm muted contrast
  slate: "#7A8999",    // neutral data, cool accent
} as const;

export type Palette = {
  [K in keyof typeof P]: string;
};

/** Merge a partial channel palette over the default */
export const mergePalette = (override?: Partial<Palette>): Palette =>
  override ? { ...P, ...override } : P;
