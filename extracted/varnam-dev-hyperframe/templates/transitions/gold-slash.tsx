import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface GoldSlashProps extends BaseProps {
  /**
   * Frame when the gold wipe begins. Default: 0.
   * The wipe takes 8 frames to cross the canvas (config: transition_whip_gold).
   */
  at?: number;
  /**
   * Whether to add a 2-frame white flash punch at peak impact.
   * Default: true. Config: transition_flash.
   */
  flash?: boolean;
  /**
   * Direction of wipe: left-to-right or right-to-left.
   * Default: "ltr".
   */
  direction?: "ltr" | "rtl";
}

/**
 * GoldSlash — Swarajya channel signature 8-frame horizontal gold wipe.
 * Config: transition_whip_gold = "8-frame horizontal wipe in accent_gold".
 * Config: transition_flash = "2-frame white flash punch for impact beats".
 *
 * The leading edge of the gold bar crosses the full 1920px canvas in 8 frames.
 * The trailing edge follows 8 frames behind, so the bar sweeps and exits.
 * A 2-frame white flash peaks at the frame the leading edge hits 100%.
 *
 * Usage — compose over any two adjacent scenes:
 *   <Sequence from={cutPoint - 4}><GoldSlash at={0} /></Sequence>
 *
 * Exports both GoldSlash (the full composition) and FlashPunch (isolated flash).
 */
export const GoldSlash: React.FC<GoldSlashProps> = ({
  at = 0,
  flash = true,
  direction = "ltr",
}) => {
  const frame = useCurrentFrame();

  // Swarajya accent_gold: #D4A264
  const gold = "#D4A264";
  const white = "#FFFFFF";

  // Leading edge crosses canvas in 8 frames (config: transition_whip_gold)
  const leadPct = interpolate(frame, [at, at + 8], [0, 100], { ...C, easing: ease });
  // Trailing edge follows 8 frames behind
  const trailPct = interpolate(frame, [at + 8, at + 16], [0, 100], { ...C, easing: ease });

  // Flash: peaks at frame at+8 (leading edge hits 100%), lasts 2 frames
  // Config: transition_flash = "2-frame white flash punch"
  const flashOpacity = interpolate(frame, [at + 7, at + 8, at + 9, at + 10], [0, 0.85, 0.85, 0], C);

  // For rtl: flip the geometry
  const barLeft = direction === "ltr" ? `${trailPct}%` : `${100 - leadPct}%`;
  const barWidth = `${Math.max(0, leadPct - trailPct)}%`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      {/* Gold wipe bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: barLeft,
          width: barWidth,
          height: "100%",
          backgroundColor: gold,
        }}
      />

      {/* White flash punch — 2-frame impact at peak */}
      {flash && flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: white,
            opacity: flashOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── FlashPunch — isolated 2-frame white flash ────────────────────────────────

export interface FlashPunchProps {
  /** Frame when the flash peaks. Default: 0. */
  at?: number;
  /** Intensity of the flash (0–1). Default: 0.9. */
  intensity?: number;
}

/**
 * FlashPunch — Isolated white flash for impact beats.
 * Config: transition_flash = "2-frame white flash punch for impact beats".
 * Use standalone when you need a flash without the gold wipe.
 */
export const FlashPunch: React.FC<FlashPunchProps> = ({ at = 0, intensity = 0.9 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [at - 1, at, at + 1, at + 2],
    [0, intensity, intensity, 0],
    C
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 200 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

export const defaultProps: GoldSlashProps = {
  at: 0,
  flash: true,
  direction: "ltr",
};

/** Demo wrapper — shows the wipe over a two-panel scene so the effect is visible */
export const GoldSlashDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const navy = "#192841";
  const dark = "#1A1A1A";
  const gold = "#D4A264";
  const cream = "#F5F2EA";
  const dim = "#A0A8B4";

  const textOpacity = interpolate(frame, [0, 12], [0, 1], C);
  const afterOpacity = interpolate(frame, [40, 52], [0, 1], C);

  return (
    <AbsoluteFill>
      {/* Before panel — navy */}
      <AbsoluteFill style={{ backgroundColor: navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: textOpacity, textAlign: "center" }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 120, color: cream, letterSpacing: 4 }}>SCENE ONE</div>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 40, color: dim, marginTop: 12 }}>Before the cut</div>
        </div>
      </AbsoluteFill>

      {/* After panel — dark, fades in after wipe */}
      <AbsoluteFill style={{ backgroundColor: dark, opacity: afterOpacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 120, color: gold, letterSpacing: 4 }}>SCENE TWO</div>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 40, color: dim, marginTop: 12 }}>After the cut</div>
        </div>
      </AbsoluteFill>

      {/* The gold slash */}
      <GoldSlash at={20} flash direction="ltr" />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-gold-slash",
  component: GoldSlashDemo,
  props: {},
  durationInFrames: 90,
};
