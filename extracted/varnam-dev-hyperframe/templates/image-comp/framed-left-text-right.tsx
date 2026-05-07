import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import { resolveIdentity, resolveImageCompTokens } from "../shared/identity/resolve";
import type { IdentityPack, ImageCompTokens } from "../shared/identity/types";
import type { ImageRef } from "../shared/types";

export interface FramedLeftTextRightProps {
  identity?: IdentityPack;
  preset?: string;
  tokens?: Partial<ImageCompTokens>;
  image: ImageRef;
  headline: string;
  body?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Asymmetric split: FRAMED image LEFT (48%), text RIGHT.
 * Ken Burns on image, terracotta accent line, category label top-left.
 * The image anchors attention; the text provides context.
 */
export const FramedLeftTextRight: React.FC<FramedLeftTextRightProps> = ({
  image,
  headline,
  body,
  categoryLabel,
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

  const imgScale = kenBurns(f, FPS * 6, resolved.motion.kenBurnsFrom, resolved.motion.kenBurnsTo);
  const accentWidth = lineGrow(frame, at + 16, lineGrowDur);

  return (
    <AbsoluteFill style={{ backgroundColor: resolved.colors.canvas }}>
      {/* Category label top-left */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            ...reveal(frame, at + 2, revealDur),
            fontFamily: resolved.typography.label.family,
            fontSize: tokens.categoryLabelSize,
            fontWeight: resolved.typography.label.weight,
            letterSpacing: `${resolved.typography.label.letterSpacingEm ?? 0}em`,
            textTransform: "uppercase",
            color: resolved.colors.textMuted,
            zIndex: 3,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Left column — framed image (46%) */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 64,
          bottom: 48,
          width: `${tokens.splitImageWidthPct}%`,
          overflow: "hidden",
          borderRadius: tokens.frameRadius,
          boxShadow: tokens.frameShadow,
          backgroundColor: resolved.colors.surfaceMuted,
          ...reveal(frame, at + 4, revealDur),
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

      {/* Right column — text block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${tokens.splitTextWidthPct}%`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: resolved.spacing.contentGap,
          paddingRight: resolved.spacing.sectionGap,
        }}
      >
        <div style={reveal(frame, at + 8, revealDur)}>
          <div
            style={{
              fontFamily: resolved.typography.title.family,
              fontSize: tokens.headlineSize,
              lineHeight: resolved.typography.title.lineHeight,
              color: resolved.colors.textPrimary,
            letterSpacing: `${resolved.typography.title.letterSpacingEm ?? 0}em`,
              fontWeight: resolved.typography.title.weight,
              maxWidth: tokens.splitTextMaxWidth,
              textTransform: resolved.typography.title.textTransform,
            }}
          >
            {headline}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: tokens.accentLineMaxWidth,
            height: tokens.accentLineHeight,
            backgroundColor: resolved.colors.accentPrimary,
            marginTop: resolved.spacing.contentGap,
            borderRadius: resolved.ornament.dividerRadius,
          }}
        />

        {body && (
          <div
            style={{
              ...reveal(frame, at + 20, revealDur),
              fontFamily: resolved.typography.body.family,
              fontSize: tokens.bodySize,
              lineHeight: resolved.typography.body.lineHeight,
              color: resolved.colors.textSecondary,
              marginTop: resolved.spacing.contentGap,
              fontWeight: resolved.typography.body.weight,
              maxWidth: 540,
            }}
          >
            {body}
          </div>
        )}
      </div>

      {/* Decorative vertical hairline between columns */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: `${tokens.splitImageWidthPct + 1.5}%`,
          width: 1,
          height: tokens.hairlineHeight,
          backgroundColor: resolved.colors.surface,
          opacity: (lineGrow(frame, at + 20, lineGrowDur) / 100) * tokens.hairlineOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-framed-left-text-right",
  "props": {
    "image": "demo-engineers.png",
    "headline": "Engineering Research",
    "body": "Indian GCC centres now lead global R&D across AI, cybersecurity, and platform architecture.",
    "categoryLabel": "THE MECHANISM",
    "at": 15
  },
  "durationInFrames": 150
};
