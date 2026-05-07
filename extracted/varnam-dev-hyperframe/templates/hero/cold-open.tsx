import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { createCssVars } from "../shared/identity/css-vars";
import { reveal } from "../shared/primitives";
import {
  resolveHeroTokens,
  resolveIdentity,
} from "../shared/identity/resolve";
import type { HeroTokens, IdentityPack } from "../shared/identity/types";

export interface BaseTemplateProps {
  identity?: IdentityPack;
  preset?: string;
}

export interface ColdOpenProps extends BaseTemplateProps {
  line: string;
  at?: number;
  tokens?: Partial<HeroTokens>;
}

/**
 * Single provocative line, huge serif (120px+), centered on dark bg.
 * No label, no source. Maximum impact for opening lines.
 * Hard snap entry — opacity from 0→1 in 6 frames with slight scale punch.
 */
export const ColdOpen: React.FC<ColdOpenProps> = ({
  line,
  at = 0,
  identity,
  preset = "default",
  tokens,
}) => {
  const frame = useCurrentFrame();
  const resolvedIdentity = resolveIdentity(identity);
  const heroTokens = resolveHeroTokens(resolvedIdentity, preset, tokens);

  const opacity = interpolate(frame, [at + 4, at + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(
    frame,
    [at + 4, at + 10, at + 16],
    [resolvedIdentity.motion.emphasisScale, 1.0, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const styleVars = createCssVars("co", {
    bg: resolvedIdentity.colors.canvasStrong,
    text: resolvedIdentity.colors.textInverse,
    titleFamily: resolvedIdentity.typography.display.family,
    titleSize: `${heroTokens.coldOpenSize}px`,
    titleMaxWidth: `${heroTokens.coldOpenMaxWidth}px`,
    dashWidth: `${heroTokens.coldOpenDashWidth}px`,
    letterSpacing: `${heroTokens.coldOpenLetterSpacingEm}em`,
    lineHeight: 1.05,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: styleVars["--co-bg"] }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${resolvedIdentity.spacing.pageInsetX}px`,
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            fontFamily: styleVars["--co-title-family"],
            fontSize: styleVars["--co-title-size"],
            lineHeight: styleVars["--co-line-height"],
            color: styleVars["--co-text"],
            textAlign: "center",
            letterSpacing: styleVars["--co-letter-spacing"],
            maxWidth: styleVars["--co-title-max-width"],
          }}
        >
          {line}
        </div>
      </div>

      {/* Terracotta dash — anchors bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: resolvedIdentity.spacing.safeZone / 0.8,
          left: "50%",
          ...reveal(frame, at + 18),
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            width: styleVars["--co-dash-width"],
            height: "3px",
            backgroundColor: resolvedIdentity.colors.accentPrimary,
            borderRadius: "2px",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-cold-open",
  "props": {
    "line": "What if everything you knew was wrong?",
    "at": 15
  },
  "durationInFrames": 120
};
