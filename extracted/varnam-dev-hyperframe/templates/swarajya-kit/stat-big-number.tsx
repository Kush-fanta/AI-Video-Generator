/**
 * StatBigNumber — Single dominant stat number, centered on dark field.
 *
 * Ref frames: /tmp/swarajya-study/frames/Rc7Knnuai-Q/120s.png ("2,100" with illustration)
 *             /tmp/swarajya-study/frames/gPIKnV-kjgY/15s.png ("8 BALLISTIC MISSILES")
 * Purpose: The payload number fills the frame. All-caps label above in muted text.
 *          The number dominates — nothing competes with it.
 *
 * Props: { number: string; label: string; durationInFrames: number; bg?: "navy" | "black" }
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK, resolveSKPalette, type SKPaletteName } from "./_tokens";
import { fadeEnvelope, statScaleOvershoot, countUp } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface StatBigNumberProps {
  number: string;
  label: string;
  durationInFrames: number;
  bg?: "navy" | "black";
  palette?: SKPaletteName;
  /**
   * skipAnimation: when true, the number renders at final scale with no scale-in.
   * Use for re-use beats (e.g. B06) where the number is already earned from the prior beat.
   * Default: false — scale-in plays.
   */
  skipAnimation?: boolean;
  /**
   * countUpTarget: when provided, animates from 0 to this numeric value over 40 frames,
   * formatting with Intl.NumberFormat (comma separators). The `number` prop is used as
   * the fallback display label (e.g. for suffix like "%" — pass "85.6%" as `number` for
   * static display, or pass countUpTarget=85.6 + decimals=1 for animated version).
   * decimals: decimal places to preserve in the count-up display.
   * Default: undefined — static `number` string is rendered.
   */
  countUpTarget?: number;
  countUpDecimals?: number;
  /**
   * tone: "hero" renders the number in the palette's accent color (coral red on navy,
   * coral red on cream). "supporting" uses pal.text (white on navy, ink on cream).
   * Reserve "hero" for anchor/verdict beats where the number is the damning claim —
   * the three film anchors, chapter-anchor figures, opening-claim counts.
   * Default: "supporting".
   */
  tone?: "hero" | "supporting";
}

export const StatBigNumber: React.FC<StatBigNumberProps> = ({
  number,
  label,
  durationInFrames,
  palette = "default",
  skipAnimation = false,
  countUpTarget,
  countUpDecimals = 0,
  tone = "supporting",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  // 0.88→1.04→1.0 overshoot per channel spec. skipAnimation collapses to static 1.0.
  const scale = skipAnimation ? 1.0 : statScaleOvershoot(frame, 0, 18);
  const pal = resolveSKPalette(palette);

  // Preserve suffixes on the original number string (e.g. "%" in "4.16%")
  // so count-up numbers don't lose them. Extract any non-numeric trailing chars.
  const suffixMatch = number.match(/[^\d.,\-]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : "";

  // Resolve display string: count-up when countUpTarget is provided
  const displayNumber = countUpTarget !== undefined
    ? (() => {
        const val = countUp(frame, countUpTarget, 0, 40, countUpDecimals);
        const core = countUpDecimals > 0
          ? val.toFixed(countUpDecimals)
          : Math.round(val).toLocaleString("en-IN");
        return core + suffix;
      })()
    : number;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* All-caps label above */}
        <span
          style={{
            fontFamily: SK.font.sans,
            fontWeight: SK.weight.medium,
            fontSize: SK.size.label,
            color: pal.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </span>

        {/* Dominant number */}
        <span
          style={{
            fontFamily: SK.font.display,
            fontWeight: SK.weight.bold,
            fontSize: SK.size.mega,
            color: tone === "hero" ? pal.accent : pal.text,
            lineHeight: 1,
            textAlign: "center",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            display: "block",
          }}
        >
          {displayNumber}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default StatBigNumber;

export const demo = {
  compositionId: "sk-stat-big-number",
  durationInFrames: 150,
  props: {
    number: "2,100",
    label: "Shaded drones unleashed",
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
