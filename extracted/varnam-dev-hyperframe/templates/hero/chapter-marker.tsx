import { AbsoluteFill, useCurrentFrame } from "remotion";
import { lineGrow, reveal } from "../shared/primitives";
import { createCssVars } from "../shared/identity/css-vars";
import {
  resolveHeroTokens,
  resolveIdentity,
} from "../shared/identity/resolve";
import type { HeroTokens, IdentityPack } from "../shared/identity/types";

export interface BaseTemplateProps {
  identity?: IdentityPack;
  preset?: string;
}

type ChapterMarkerIdentityOverrides = Partial<HeroTokens> & {
  paddingX?: number;
  gap?: number;
};

export interface ChapterMarkerProps extends BaseTemplateProps {
  number: string;
  title: string;
  at?: number;
  tokens?: ChapterMarkerIdentityOverrides;
}

export interface ChapterMarkerComponentProps {
  number: string;
  title: string;
  barHeight: number;
  numberRevealStyle: React.CSSProperties;
  titleRevealStyle: React.CSSProperties;
  styleVars: React.CSSProperties;
}

const ChapterMarkerComponent: React.FC<ChapterMarkerComponentProps> = ({
  number,
  title,
  barHeight,
  numberRevealStyle,
  titleRevealStyle,
  styleVars,
}) => {
  return (
    <AbsoluteFill className="vm-chapter-marker" style={styleVars}>
      <style>{CHAPTER_MARKER_CSS}</style>
      <div className="vm-chapter-marker-shell">
        <div className="vm-chapter-marker-number" style={numberRevealStyle}>
          {number}
        </div>
        <div className="vm-chapter-marker-bar" style={{ height: `${barHeight}%` }} />
        <div className="vm-chapter-marker-title-wrap">
          <div className="vm-chapter-marker-title" style={titleRevealStyle}>
            {title}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CHAPTER_MARKER_CSS = `
.vm-chapter-marker {
  background: var(--cm-bg);
}
.vm-chapter-marker-shell {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 var(--cm-padding-x, 120px);
}
.vm-chapter-marker-number {
  font-family: var(--cm-serif);
  font-size: var(--cm-number-size, 200px);
  line-height: 1;
  color: var(--cm-light);
  margin-right: var(--cm-gap, 56px);
  min-width: var(--cm-number-min-width, 200px);
  text-align: right;
  user-select: none;
}
.vm-chapter-marker-bar {
  width: var(--cm-bar-width, 4px);
  max-height: var(--cm-bar-max-height, 120px);
  background: var(--cm-terracotta);
  border-radius: 2px;
  margin-right: var(--cm-gap, 56px);
  flex-shrink: 0;
}
.vm-chapter-marker-title-wrap {
  flex: 1;
}
.vm-chapter-marker-title {
  font-family: var(--cm-serif);
  font-size: var(--cm-title-size, 72px);
  line-height: 1.1;
  color: var(--cm-text);
  max-width: var(--cm-title-max-width, 800px);
  letter-spacing: var(--cm-title-letter-spacing, -0.02em);
}
`;

/**
 * Brief chapter transition (2-3 seconds). Full cream bg.
 * Large chapter number in 200px muted serif, positioned left.
 * Terracotta vertical bar divider. Chapter title in 72px serif right.
 * One short accent line below title.
 */
export const ChapterMarker: React.FC<ChapterMarkerProps> = ({
  number,
  title,
  at = 0,
  identity,
  preset = "default",
  tokens = {},
}) => {
  const frame = useCurrentFrame();
  const { paddingX, gap, ...heroTokenOverrides } = tokens;
  const resolvedIdentity = resolveIdentity(identity);
  const heroTokens = resolveHeroTokens(
    resolvedIdentity,
    preset,
    heroTokenOverrides,
  );

  const barHeight = lineGrow(frame, at + 6, 28);
  const styleVars = createCssVars("cm", {
    bg: resolvedIdentity.colors.canvas,
    light: resolvedIdentity.colors.surface,
    terracotta: resolvedIdentity.colors.accentPrimary,
    text: resolvedIdentity.colors.textPrimary,
    serif: resolvedIdentity.typography.title.family,
    paddingX: `${paddingX ?? resolvedIdentity.spacing.pageInsetX}px`,
    numberSize: `${heroTokens.numberSize}px`,
    numberMinWidth: `${heroTokens.numberMinWidth}px`,
    titleSize: `${heroTokens.titleSize}px`,
    titleMaxWidth: `${heroTokens.titleMaxWidth}px`,
    barWidth: `${heroTokens.barWidth}px`,
    barMaxHeight: `${heroTokens.barMaxHeight}px`,
    gap: `${gap ?? resolvedIdentity.spacing.sectionGap}px`,
    titleLetterSpacing: `${heroTokens.titleLetterSpacingEm}em`,
  });

  return (
    <ChapterMarkerComponent
      number={number}
      title={title}
      barHeight={barHeight}
      numberRevealStyle={reveal(frame, at + 2)}
      titleRevealStyle={reveal(frame, at + 10)}
      styleVars={styleVars}
    />
  );
};

export const demo = {
  "compositionId": "hero-chapter-marker",
  "props": {
    "number": "03",
    "title": "The Scale",
    "at": 15
  },
  "durationInFrames": 90
};
