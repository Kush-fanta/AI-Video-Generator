// Swarajya channel palette — drop-in override for P
export const SP = {
  bg: "#192841",         // deep navy canvas
  dark: "#0F1E38",       // darker navy for title cards
  text: "#F5F2EA",       // off-white cream
  sub: "#A0A8B4",        // muted blue-grey
  muted: "#A0A8B4",      // same as sub
  light: "#2A3F5F",      // subtle divider on navy
  terracotta: "#D4A264", // warm gold — positive data, India assets
  sage: "#D4A264",       // same as gold (no green in Swarajya)
  mauve: "#D8323E",      // alarm red — decline, threat, failure
  slate: "#4DD9E8",      // cyan — used ONCE per video max, tech reveals
} as const;

export type SwarajyaPalette = typeof SP;
