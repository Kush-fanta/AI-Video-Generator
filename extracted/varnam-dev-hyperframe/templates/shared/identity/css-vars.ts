import type { CSSProperties } from "react";

type CssValue = string | number | undefined | null;
type CssVarStyles = CSSProperties & Record<`--${string}`, string>;

const toKebab = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();

export function createCssVars(prefix: string, values: Record<string, CssValue>): CssVarStyles {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    vars[`--${prefix}-${toKebab(key)}`] = String(value);
  }

  return vars as CssVarStyles;
}
