import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import { resolveIdentity, resolveImageCompTokens } from "../shared/identity/resolve";
import type { IdentityPack, ImageCompTokens } from "../shared/identity/types";
import type { ImageRef } from "../shared/types";

export interface FullBleedOverlayProps {
  image: ImageRef;
  headline: string;
  subtitle?: string;
  categoryLabel?: string;
  badge?: string;
  /** Use condensed sans-serif equivalent for headline */
  condensedMode?: boolean;
  /** Highlight specific words in the headline with accent color */
  accentWords?: string[];
  identity?: IdentityPack;
  preset?: string;
  tokens?: Partial<ImageCompTokens>;
  at?: number;
}

/**
 * Full-bleed image fills the entire 1920x1080 frame.
 * Dark gradient holds text overlay.
 *
 * Two styles:
 * - Default: 80px cream serif headline, bottom gradient.
 * - condensedMode: bold condensed sans-serif, category label with
 *   red rule above headline, mid-left placement. For dark ops-room channels.
 */
export const FullBleedOverlay: React.FC<FullBleedOverlayProps> = ({
  image,
  headline,
  subtitle,
  categoryLabel,
  badge,
  condensedMode = false,
  accentWords = [],
  identity,
  preset,
  tokens: tokenOverride,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const resolved = resolveIdentity(identity);
  const tokens = resolveImageCompTokens(resolved, preset, tokenOverride);
  const revealDur = resolved.motion.revealDuration;
  const lineGrowDur = resolved.motion.lineGrowDuration;
  const bgColor = resolved.colors.canvasStrong;

  const imgScale = kenBurns(
    f,
    FPS * 6,
    resolved.motion.kenBurnsFrom,
    resolved.motion.kenBurnsTo,
  );
  const accentWidth = lineGrow(frame, at + 14, lineGrowDur);

  const headlineFamily = condensedMode
    ? resolved.typography.display.family
    : resolved.typography.title.family;
  const headlineSize = condensedMode
    ? Math.round(tokens.overlayHeadlineSize * 1.2)
    : tokens.overlayHeadlineSize;
  const headlineLineHeight = condensedMode
    ? resolved.typography.display.lineHeight
    : resolved.typography.title.lineHeight;
  const headlineWeight = condensedMode
    ? resolved.typography.display.weight
    : resolved.typography.title.weight;

  /** Render headline with accent-colored words */
  const renderHeadline = () => {
    if (accentWords.length === 0) return headline;
    const parts: React.ReactNode[] = [];
    let remaining = headline;
    let key = 0;
    for (const word of accentWords) {
      const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) continue;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(
        <span key={key++} style={{ color: resolved.colors.accentPrimary }}>
          {remaining.slice(idx, idx + word.length)}
        </span>,
      );
      remaining = remaining.slice(idx + word.length);
    }
    if (remaining) parts.push(remaining);
    return parts.length > 0 ? <>{parts}</> : headline;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Full-bleed image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            opacity: tokens.imageOpacity,
          }}
        />
      </div>

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: condensedMode ? `${tokens.overlayHeightPct + 15}%` : `${tokens.overlayHeightPct}%`,
          background: condensedMode
            ? `linear-gradient(to top, ${resolved.ornament.overlayGradientStart} 0%, ${resolved.ornament.overlayGradientMid} 40%, ${resolved.ornament.overlayGradientEnd} 100%)`
            : `linear-gradient(to top, ${resolved.ornament.overlayGradientStart} 0%, ${resolved.ornament.overlayGradientMid} 50%, ${resolved.ornament.overlayGradientEnd} 100%)`,
        }}
      />

      {/* Badge — top right */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            ...reveal(frame, at + 2, revealDur),
            backgroundColor: resolved.ornament.badgeBackground,
            padding: "8px 16px",
            fontFamily: resolved.typography.meta.family,
            fontSize: tokens.badgeSize,
            fontWeight: resolved.typography.meta.weight,
            letterSpacing: `${resolved.typography.meta.letterSpacingEm ?? 0}em`,
            color: resolved.ornament.badgeForeground,
            zIndex: 4,
            borderRadius: 4,
          }}
        >
          {badge}
        </div>
      )}

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          bottom: condensedMode ? 120 : 80,
          left: 80,
          right: 80,
          zIndex: 2,
        }}
      >
        {/* Category label with accent rule */}
        {categoryLabel && (
          <div style={{ ...reveal(frame, at + 4, revealDur), marginBottom: resolved.spacing.contentGap }}>
            <div
              style={{
                fontFamily: resolved.typography.meta.family,
                fontSize: resolved.typography.meta.size,
                fontWeight: resolved.typography.meta.weight,
                letterSpacing: `${resolved.typography.meta.letterSpacingEm ?? 0}em`,
                textTransform: "uppercase",
                color: condensedMode
                  ? resolved.colors.accentPrimary
                  : resolved.colors.textInverse,
              }}
            >
              {categoryLabel}
            </div>
            <div
              style={{
                width: `${lineGrow(frame, at + 6, 18)}%`,
                maxWidth: tokens.accentLineMaxWidth,
                height: resolved.spacing.borderThick,
                backgroundColor: resolved.colors.accentSecondary,
                marginTop: resolved.spacing.tightGap,
                borderRadius: 1.5,
              }}
            />
          </div>
        )}

        {/* Headline */}
        <div style={reveal(frame, at + 8, revealDur)}>
        <div
          style={{
            fontFamily: headlineFamily,
            fontSize: headlineSize,
            fontWeight: headlineWeight,
            lineHeight: headlineLineHeight,
            color: resolved.colors.textInverse,
            letterSpacing: `${condensedMode ? 0.02 : (resolved.typography.title.letterSpacingEm ?? 0)}em`,
            textTransform: condensedMode ? ("uppercase" as const) : resolved.typography.title.textTransform,
            maxWidth: 1200,
          }}
        >
          {renderHeadline()}
        </div>
        </div>

        {/* Accent line (non-condensed mode) */}
        {!condensedMode && (
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: tokens.accentLineMaxWidth,
              height: tokens.accentLineHeight,
              backgroundColor: resolved.colors.accentPrimary,
              marginTop: 20,
              borderRadius: resolved.ornament.dividerRadius,
            }}
          />
        )}

        {subtitle && (
        <div
          style={{
              ...reveal(frame, at + 20, revealDur),
              fontFamily: resolved.typography.subtitle.family,
              fontSize: tokens.overlaySubtitleSize,
              fontWeight: resolved.typography.subtitle.weight,
              lineHeight: resolved.typography.subtitle.lineHeight,
              color: resolved.colors.textInverse,
              marginTop: resolved.spacing.contentGap,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-full-bleed-overlay",
  "props": {
    "image": "demo.png",
    "headline": "Bangalore",
    "subtitle": "The epicentre of India's GCC transformation.",
    "categoryLabel": "THE CITY",
    "at": 15
  },
  "durationInFrames": 150
};
