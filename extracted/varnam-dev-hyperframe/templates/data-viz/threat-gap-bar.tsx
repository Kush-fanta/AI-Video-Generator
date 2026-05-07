import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

interface ThreatGapBarProps extends BaseProps {
  /** Label for the threat/adversary bar (e.g. "CHINA THREAT RANGE") */
  threatLabel: string;
  /** Percentage fill for the threat bar, 0–100 */
  threatValue: number;
  /** Display value string for the threat bar (e.g. "3,500 KM") */
  threatDisplay: string;

  /** Label for India/capability bar (e.g. "INDIA INTERCEPT RANGE") */
  capabilityLabel: string;
  /** Percentage fill for the capability bar, 0–100 */
  capabilityValue: number;
  /** Display value string for capability bar (e.g. "1,200 KM") */
  capabilityDisplay: string;

  /** Label describing the gap between them (e.g. "2,300 KM GAP") */
  gapLabel: string;

  /** Title above the chart */
  title?: string;
  /** Source citation */
  source?: string;
  /** Channel badge text. Default: "#SWARAJYA" */
  badge?: string;
  /** Frame when animation starts. Default: 0 */
  at?: number;
}

/**
 * ThreatGapBar — Asymmetric threat/capability comparison.
 * Two horizontal bars on a #1A1A1A (canvas_dark) canvas — scale: dwarfing.
 * Red bar = threat/adversary. Gold bar = India/capability.
 * The gap between them is labeled and animated.
 *
 * Scale: dwarfing (from config):
 *   dominant_viewport_w_pct: 90  → bars fill 90% of canvas width
 *   canvas: canvas_dark #1A1A1A
 * Motion primitive: block_fill
 *   fill_duration_frames: 48
 *   fill_easing: cubic-bezier(0.16, 1, 0.3, 1)
 *
 * Text: soft fade-in only per channel rules.
 */
export const ThreatGapBar: React.FC<ThreatGapBarProps> = ({
  threatLabel,
  threatValue,
  threatDisplay,
  capabilityLabel,
  capabilityValue,
  capabilityDisplay,
  gapLabel,
  title,
  source,
  badge = "#SWARAJYA",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Swarajya palette — channel-specific, not default P
  const canvasDark = "#1A1A1A";
  const gold = "#D4A264";
  const red = "#D8323E";
  const textPrimary = "#F5F2EA";
  const textDim = "#A0A8B4";
  const navy = "#192841";

  // Safe area: 96px horizontal, 54px vertical for 1920×1080
  const safeH = 96;
  const safeV = 54;

  // Scale: dwarfing — dominant_viewport_w_pct: 90 → bar track = 90% of 1920 = 1728px
  // But we stay within safe area: usable = 1920 - 2*96 = 1728px  — exactly 90%
  const trackW = 1728; // px — matches dwarfing.dominant_viewport_w_pct = 90% of 1920

  // block_fill primitive: fill_duration_frames = 48
  const fillDuration = 48;

  // Custom easing matching block_fill: cubic-bezier(0.16, 1, 0.3, 1)
  // Approximated via spring with matching arrival curve
  const fillEase = (fLocal: number) => {
    const prog = spring({
      frame: fLocal,
      fps: FPS,
      config: { damping: 22, stiffness: 180, mass: 0.5 },
    });
    return Math.min(1, prog);
  };

  // Threat bar fills first (at + 0)
  const threatFill = fillEase(Math.max(0, f));
  const threatBarW = (threatValue / 100) * trackW * threatFill;

  // Capability bar fills slightly after (at + 12 stagger)
  const capFill = fillEase(Math.max(0, f - 14));
  const capBarW = (capabilityValue / 100) * trackW * capFill;

  // Gap label appears after both bars are mostly filled
  const gapRevealAt = at + fillDuration + 10;
  const gapOpacity = interpolate(frame, [gapRevealAt, gapRevealAt + 18], [0, 1], C);

  // Text soft fade-in (channel rule: soft fade-in only)
  const titleOpacity = interpolate(frame, [at + 2, at + 20], [0, 1], C);
  const threatLabelOpacity = interpolate(frame, [at + 6, at + 22], [0, 1], C);
  const capLabelOpacity = interpolate(frame, [at + 18, at + 34], [0, 1], C);
  const sourceOpacity = interpolate(frame, [gapRevealAt + 10, gapRevealAt + 26], [0, 1], C);

  // Bar dimensions: bar_height_px from dense-comparison scale = 140px, but we use larger for dwarfing
  const barH = 100; // px — a block, not a hairline; fits dwarfing weight
  const barGap = 72; // generous gap between bars so gap label has room

  // Layout: centered vertically, bars stacked
  // Total stack height: title + gap + bar + gap + bar + source
  // Roughly centered at y=540
  const titleY = 180;
  const threatBarY = 320;
  const capBarY = threatBarY + barH + barGap;
  const gapBracketY = threatBarY + barH + barGap / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: canvasDark }}>
      {/* Subtle navy texture strip at very top — 8px */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 8,
          backgroundColor: navy,
        }}
      />

      {/* Channel badge — top-right, red box, per channel rule */}
      <div
        style={{
          position: "absolute",
          top: safeV,
          right: safeH,
          backgroundColor: red,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 6,
          paddingBottom: 6,
          opacity: interpolate(frame, [at, at + 12], [0, 1], C),
        }}
      >
        <span
          style={{
            fontFamily: condensed,
            fontSize: 28,
            color: textPrimary,
            letterSpacing: "0.12em",
          }}
        >
          {badge}
        </span>
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: titleY,
            left: safeH,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontFamily: condensed,
              fontSize: 72,
              color: textPrimary,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          {/* Thin red rule under title */}
          <div
            style={{
              width: interpolate(frame, [at + 10, at + 28], [0, 320], { ...C, easing: ease }),
              height: 3,
              backgroundColor: red,
              marginTop: 16,
            }}
          />
        </div>
      )}

      {/* ── Threat bar (RED) ── */}
      <div
        style={{
          position: "absolute",
          top: threatBarY,
          left: safeH,
        }}
      >
        {/* Label above bar */}
        <div
          style={{
            opacity: threatLabelOpacity,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: red,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: 36,
              fontWeight: 700,
              color: textDim,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            {threatLabel}
          </span>
        </div>

        {/* Bar track */}
        <div
          style={{
            position: "relative",
            width: trackW,
            height: barH,
            backgroundColor: "#2A1A1A",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: threatBarW,
              height: "100%",
              backgroundColor: red,
              borderRadius: "4px 0 0 4px",
            }}
          />
        </div>

        {/* Value label — right of fill */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: Math.max(threatBarW + 16, 16),
            opacity: interpolate(frame, [at + fillDuration, at + fillDuration + 14], [0, 1], C),
            fontFamily: condensed,
            fontSize: 56,
            color: red,
            lineHeight: 1,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap" as const,
          }}
        >
          {threatDisplay}
        </div>
      </div>

      {/* ── Capability bar (GOLD) ── */}
      <div
        style={{
          position: "absolute",
          top: capBarY,
          left: safeH,
        }}
      >
        {/* Label above bar */}
        <div
          style={{
            opacity: capLabelOpacity,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: gold,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: sans,
              fontSize: 36,
              fontWeight: 700,
              color: textDim,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            {capabilityLabel}
          </span>
        </div>

        {/* Bar track */}
        <div
          style={{
            position: "relative",
            width: trackW,
            height: barH,
            backgroundColor: "#1A1800",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: capBarW,
              height: "100%",
              backgroundColor: gold,
              borderRadius: "4px 0 0 4px",
            }}
          />
        </div>

        {/* Value label */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: Math.max(capBarW + 16, 16),
            opacity: interpolate(frame, [at + fillDuration + 14, at + fillDuration + 28], [0, 1], C),
            fontFamily: condensed,
            fontSize: 56,
            color: gold,
            lineHeight: 1,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap" as const,
          }}
        >
          {capabilityDisplay}
        </div>
      </div>

      {/* ── Gap bracket + label ── */}
      {/* Vertical bracket line between the two bars' right edges */}
      <div
        style={{
          position: "absolute",
          top: threatBarY + barH,
          left: safeH + Math.min(threatBarW, capBarW) + (Math.abs(threatBarW - capBarW) / 2),
          opacity: gapOpacity,
        }}
      >
        {/* Vertical brace line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 2,
            height: barGap,
            backgroundColor: textDim,
            opacity: 0.5,
          }}
        />
        {/* Gap label */}
        <div
          style={{
            position: "absolute",
            top: barGap / 2 - 18,
            left: 16,
            fontFamily: condensed,
            fontSize: 56,
            color: textPrimary,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap" as const,
          }}
        >
          {gapLabel}
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: safeV + 16,
            left: safeH,
            opacity: sourceOpacity,
            fontFamily: sans,
            fontSize: 28,
            color: textDim,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const defaultProps: ThreatGapBarProps = {
  threatLabel: "CHINA THREAT RANGE",
  threatValue: 85,
  threatDisplay: "3,500 KM",
  capabilityLabel: "INDIA INTERCEPT RANGE",
  capabilityValue: 40,
  capabilityDisplay: "1,200 KM",
  gapLabel: "2,300 KM GAP",
  title: "THE CAPABILITY DEFICIT",
  source: "IISS Military Balance 2024",
  badge: "#SWARAJYA",
  at: 0,
};

export const demo = {
  compositionId: "dataviz-threat-gap-bar",
  props: {
    threatLabel: "CHINA THREAT RANGE", threatValue: 85, threatDisplay: "3,500 KM",
    capabilityLabel: "INDIA INTERCEPT RANGE", capabilityValue: 40, capabilityDisplay: "1,200 KM",
    gapLabel: "2,300 KM GAP", title: "THE CAPABILITY DEFICIT",
    source: "IISS Military Balance 2024", badge: "#SWARAJYA", at: 15,
  },
  durationInFrames: 180,
};
