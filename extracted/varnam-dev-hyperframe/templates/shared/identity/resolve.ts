import { defaultDataVizTokens, dataVizPresets } from "./components/data-viz";
import { defaultHeroTokens, heroPresets } from "./components/hero";
import { defaultImageCompTokens, imageCompPresets } from "./components/image-comp";
import { defaultIdentityPack } from "./base";
import type {
  DataVizTokens,
  DeepPartial,
  HeroTokens,
  IdentityOverride,
  IdentityPack,
  ImageCompTokens,
} from "./types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function deepMerge<T extends object>(
  base: T,
  override?: DeepPartial<T>,
): T {
  if (!override) return { ...base } as T;
  const next: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;
    const current = next[key];
    if (isObject(current) && isObject(value)) {
      next[key] = deepMerge(current, value);
      continue;
    }
    next[key] = value;
  }

  return next as T;
}

export function resolveIdentity(
  ...overrides: Array<IdentityPack | IdentityOverride | undefined>
): IdentityPack {
  let resolved: IdentityPack = defaultIdentityPack;

  for (const override of overrides) {
    if (!override) continue;
    resolved = deepMerge<IdentityPack>(
      resolved,
      override as DeepPartial<IdentityPack>,
    );
  }

  return resolved;
}

export function resolveHeroTokens(
  identity: IdentityPack | undefined,
  preset = "default",
  override?: Partial<HeroTokens>,
): HeroTokens {
  return deepMerge<HeroTokens>(
    deepMerge<HeroTokens>(defaultHeroTokens, identity?.families?.hero),
    deepMerge<Partial<HeroTokens>>(heroPresets[preset] ?? {}, override),
  );
}

export function resolveImageCompTokens(
  identity: IdentityPack | undefined,
  preset = "default",
  override?: Partial<ImageCompTokens>,
): ImageCompTokens {
  return deepMerge<ImageCompTokens>(
    deepMerge<ImageCompTokens>(
      defaultImageCompTokens,
      identity?.families?.imageComp,
    ),
    deepMerge<Partial<ImageCompTokens>>(imageCompPresets[preset] ?? {}, override),
  );
}

export function resolveDataVizTokens(
  identity: IdentityPack | undefined,
  preset = "default",
  override?: Partial<DataVizTokens>,
): DataVizTokens {
  return deepMerge<DataVizTokens>(
    deepMerge<DataVizTokens>(defaultDataVizTokens, identity?.families?.dataViz),
    deepMerge<Partial<DataVizTokens>>(dataVizPresets[preset] ?? {}, override),
  );
}
