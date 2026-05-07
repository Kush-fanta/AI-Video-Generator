import type {
  IdentityOverride,
  TypographyRoleTokens,
} from "./types";

type TypographyMap = Record<string, Partial<TypographyRoleTokens>>;

const extractFrontMatter = (markdown: string): string => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? "";
};

const extractSection = (yaml: string, section: string): string => {
  const match = yaml.match(new RegExp(`^${section}:\\n([\\s\\S]*?)(?=^[A-Za-z0-9_-]+:|$)`, "m"));
  return match?.[1] ?? "";
};

const extractScalar = (block: string, key: string): string | undefined => {
  const match = block.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match?.[1]?.trim();
};

const parsePx = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseColors = (yaml: string): Record<string, string> => {
  const colors: Record<string, string> = {};
  for (const match of extractSection(yaml, "colors").matchAll(/^\s*([A-Za-z0-9_-]+):\s*"(#[0-9A-Fa-f]{6})"/gm)) {
    colors[match[1]] = match[2];
  }
  return colors;
};

const parseSpacing = (yaml: string): Record<string, number> => {
  const spacing: Record<string, number> = {};
  for (const match of extractSection(yaml, "spacing").matchAll(/^\s*([A-Za-z0-9_-]+):\s*"?([^"\n]+)"?/gm)) {
    const parsed = parsePx(match[2]);
    if (parsed !== undefined) spacing[match[1]] = parsed;
  }
  return spacing;
};

const parseRounded = (yaml: string): Record<string, number> => {
  const rounded: Record<string, number> = {};
  for (const match of extractSection(yaml, "rounded").matchAll(/^\s*([A-Za-z0-9_-]+):\s*"?([^"\n]+)"?/gm)) {
    const parsed = parsePx(match[2]);
    if (parsed !== undefined) rounded[match[1]] = parsed;
  }
  return rounded;
};

const parseTypography = (yaml: string): TypographyMap => {
  const typography: TypographyMap = {};
  const section = extractSection(yaml, "typography");
  const tokenPattern = /^  ([A-Za-z0-9_-]+):\n((?:    [A-Za-z0-9_-]+:.*\n?)*)/gm;

  for (const match of section.matchAll(tokenPattern)) {
    const token = match[1];
    const block = match[2];
    const familyName = extractScalar(block, "fontFamily");
    const size = parsePx(extractScalar(block, "fontSize"));
    const weight = parseNumber(extractScalar(block, "fontWeight"));
    const lineHeight = parseNumber(extractScalar(block, "lineHeight"));
    const letterSpacing = extractScalar(block, "letterSpacing");
    const letterSpacingEm = letterSpacing?.endsWith("em") ? parseNumber(letterSpacing.replace("em", "")) : undefined;

    typography[token] = {
      family: familyName,
      size,
      weight,
      lineHeight,
      letterSpacingEm,
    };
  }

  return typography;
};

export const identityFromDesignMd = (markdown: string): IdentityOverride => {
  const yaml = extractFrontMatter(markdown);
  const colors = parseColors(yaml);
  const typography = parseTypography(yaml);
  const spacing = parseSpacing(yaml);
  const rounded = parseRounded(yaml);

  return {
    id: extractScalar(yaml, "name")?.toLowerCase() ?? "channel",
    colors: {
      canvas: colors["canvas-navy"],
      canvasStrong: colors["surface-navy"],
      surface: colors["surface-navy"],
      surfaceMuted: colors["surface-navy"],
      textPrimary: colors["text-cream"],
      textSecondary: colors["text-muted"],
      textMuted: colors["text-muted"],
      textInverse: colors["surface-navy"],
      lineSubtle: colors["text-muted"],
      accentPrimary: colors["authority-gold"],
      accentSecondary: colors["accusation-red"],
      accentPositive: colors["authority-gold"],
      accentNegative: colors["accusation-red"],
      neutral: colors["text-muted"],
    },
    typography: {
      display: {
        ...typography["headline-display"],
        textTransform: "uppercase",
      },
      title: {
        ...typography["headline-md"],
        textTransform: "uppercase",
      },
      subtitle: typography["body-md"],
      body: typography["body-md"],
      label: {
        ...typography["label-md"],
        textTransform: "uppercase",
      },
      meta: {
        ...typography["label-md"],
        textTransform: "uppercase",
      },
      number: {
        ...typography["number-display"],
        textTransform: "uppercase",
      },
    },
    spacing: {
      pageInsetX: spacing["safe-x"],
      pageInsetY: spacing["safe-y"],
      sectionGap: spacing["panel-gap"],
      panelGap: spacing["panel-gap"],
      safeZone: spacing["safe-x"],
      radiusSm: rounded.sm,
      radiusMd: rounded.md,
      radiusLg: rounded.md,
    },
    ornament: {
      badgeBackground: colors["accusation-red"],
      badgeForeground: colors["text-cream"],
      overlayGradientStart: "rgba(15,30,56,0.92)",
      overlayGradientMid: "rgba(15,30,56,0.7)",
      overlayGradientEnd: "transparent",
    },
    families: {
      hero: {
        titleSize: typography["headline-display"]?.size,
        numberSize: typography["number-display"]?.size,
        accentLineMaxWidth: 56,
        coldOpenSize: 160,
        coldOpenDashWidth: 72,
      },
      imageComp: {
        frameRadius: rounded.md,
        categoryLabelSize: typography["label-md"]?.size,
        overlayHeadlineSize: typography["headline-display"]?.size,
        overlaySubtitleSize: typography["body-md"]?.size,
        badgeSize: 20,
        accentLineMaxWidth: 56,
      },
      dataViz: {
        layoutInsetX: 120,
        panelGap: 96,
        numberSize: typography["number-display"]?.size,
        accentLineMaxWidth: 240,
      },
    },
  };
};
