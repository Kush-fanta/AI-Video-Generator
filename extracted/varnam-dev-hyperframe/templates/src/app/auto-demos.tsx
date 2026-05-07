/**
 * Auto-discovery: scans all template .tsx files for `export const demo` configs.
 * Templates that export a `demo` object are automatically registered in the catalog.
 *
 * To add a new template to the catalog, just export a `demo` from your .tsx file:
 *
 *   export const demo = {
 *     compositionId: "prefix-name",
 *     props: { value: "42", label: "The answer" },
 *     durationInFrames: 180,
 *   };
 *
 * No need to edit demos.tsx, registry.json, or any other file.
 */
import React from "react";

export interface DemoConfig {
  compositionId: string;
  props: Record<string, unknown>;
  durationInFrames: number;
}

interface TemplateModule {
  demo?: DemoConfig;
  [key: string]: unknown;
}

export interface DemoEntry {
  component: React.FC<any>;
  durationInFrames: number;
  inputProps?: Record<string, unknown>;
}

// Eagerly import all .tsx files from template directories (excludes src/, shared/, node_modules/)
type GlobFunction = <T>(paths: string | string[], options?: { eager?: boolean }) => T;

const loadTemplateModules = (): Record<string, TemplateModule> | null => {
  const glob = (import.meta as ImportMeta & { glob?: GlobFunction }).glob;
  if (typeof glob !== "function") return null;

  return glob<TemplateModule>(
    [
      "../../hero/*.tsx",
      "../../data-viz/*.tsx",
      "../../image-comp/*.tsx",
      "../../narrative/*.tsx",
      "../../transitions/*.tsx",
      "../../geo/*.tsx",
      "../../lower-thirds/*.tsx",
      "../../callout/*.tsx",
      "../../counter/*.tsx",
      "../../diagram/*.tsx",
      "../../timeline/*.tsx",
      "../../cinematic/*.tsx",
      "../../screen/*.tsx",
      "../../social-proof/*.tsx",
      "../../kinetic-text/*.tsx",
      "../../collage/*.tsx",
      "../../indian/*.tsx",
      "../../comparison/*.tsx",
      "../../meter/*.tsx",
      "../../editorial/*.tsx",
      "../../reveal/*.tsx",
      "../../abstract/*.tsx",
      "../../annotation/*.tsx",
      "../../swarajya-kit/*.tsx",
    ],
    { eager: true },
  ) as Record<string, TemplateModule>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object";
};

const isDemoConfig = (value: unknown): value is DemoConfig => {
  if (!isRecord(value)) return false;
  return (
    typeof value.compositionId === "string" &&
    typeof value.durationInFrames === "number" &&
    isRecord(value.props)
  );
};

/**
 * Build auto-discovered demo map from templates that export `demo` config.
 *
 * For each module that exports both a component and a `demo` object,
 * we create a DemoEntry with the component rendered using demo.props.
 */
export function buildAutoDemoMap(): Record<string, DemoEntry> {
  const map: Record<string, DemoEntry> = {};
  const templateModules = loadTemplateModules();

  if (!templateModules) return map;

  for (const [, mod] of Object.entries(templateModules)) {
    if (!isDemoConfig(mod.demo)) continue;

    const { compositionId, props, durationInFrames } = mod.demo;

    // If demo explicitly names a component, use it. Otherwise find first capitalized export.
    let Component: React.FC<any> | null =
      typeof (mod.demo as any).component === "function"
        ? (mod.demo as any).component
        : null;

    if (!Component) {
      for (const [key, value] of Object.entries(mod)) {
        if (
          key !== "demo" &&
          key !== "default" &&
          typeof value === "function" &&
          key[0] === key[0].toUpperCase()
        ) {
          Component = value as React.FC<any>;
          break;
        }
      }
    }

    if (!Component) continue;

    // Capture in closure
    map[compositionId] = {
      component: Component,
      durationInFrames,
      inputProps: props,
    };
  }

  return map;
}
