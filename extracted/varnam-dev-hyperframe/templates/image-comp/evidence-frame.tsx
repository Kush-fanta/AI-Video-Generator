import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { kenBurns, C, ease, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

export interface EvidenceFrameProps extends BaseProps {
  /**
   * Image file in public/ folder. Image fills ~55% of frame on the left.
   * (e.g. "submarine.jpg", "document-scan.png")
   */
  image: ImageRef;
  /**
   * Category label in ALL CAPS, displayed prominently on the right panel.
   * (e.g. "CLASSIFIED", "INTERCEPTED", "EVIDENCE")
   */
  categoryLabel: string;
  /**
   * Main headline — the claim or finding.
   * (e.g. "3 CHINESE SUBMARINES TRACKED NEAR ANDAMAN SEA")
   */
  headline: string;
  /**
   * Body text — context or elaboration. 2–3 sentences max.
   */
  body?: string;
  /**
   * Source citation at bottom of right panel.
   * (e.g. "IISS Strategic Dossier 2024")
   */
  source?: string;
  /**
   * Reference number or document ID — top of right panel, dim.
   * (e.g. "REF: IND/NAV/2024-003")
   */
  refNumber?: string;
  /**
   * Channel badge text. Default: "#SWARAJYA"
   */
  badge?: string;
  /**
   * Frame when animation starts. Default: 0.
   */
  at?: number;
}

/**
 * EvidenceFrame — Documentary dossier entry layout.
 *
 * Left panel (~55%, 1056px of 1920): full-bleed image with Ken Burns + thin gold border.
 * Right panel (~45%, 864px): navy (#192841) background with dossier metadata.
 *   - Ref number (dim, top)
 *   - Category label (red, large condensed)
 *   - Red rule
 *   - Headline (condensed, large, cream)
 *   - Body text (DM Sans)
 *   - Source (dim, bottom)
 *
 * Channel badge top-right.
 * Text: soft fade-in only per channel rules.
 * Image: Ken Burns (slow zoom) per channel visual rules.
 */
export const EvidenceFrame: React.FC<EvidenceFrameProps> = ({
  image,
  categoryLabel,
  headline,
  body,
  source,
  refNumber,
  badge = "#SWARAJYA",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Swarajya palette
  const canvas = "#192841";
  const canvasDark = "#0F1E38";
  const gold = "#D4A264";
  const red = "#D8323E";
  const textPrimary = "#F5F2EA";
  const textDim = "#A0A8B4";

  // Safe area — 960×540 canvas
  const safeV = 28;
  const safeH = 48;

  // Layout: left image 55%, right panel 45% of 960px
  const imgW = 528; // 55% of 960
  const panelW = 432; // 45% of 960

  // Ken Burns — slow zoom over 6 seconds per channel rule
  const imgScale = kenBurns(f, FPS * 7, 1.02, 1.06);

  // Gold border reveals with line grow
  const borderOpacity = interpolate(frame, [at + 4, at + 18], [0, 1], C);

  // Text reveals — soft fade-in (channel rule: no slide, no pop)
  const refOpacity = interpolate(frame, [at + 8, at + 24], [0, 1], C);
  const categoryOpacity = interpolate(frame, [at + 14, at + 30], [0, 1], C);
  const ruleW = interpolate(frame, [at + 22, at + 38], [0, panelW - safeH], { ...C, easing: ease });
  const headlineOpacity = interpolate(frame, [at + 28, at + 46], [0, 1], C);
  const bodyOpacity = interpolate(frame, [at + 42, at + 60], [0, 1], C);
  const sourceOpacity = interpolate(frame, [at + 56, at + 72], [0, 1], C);
  const badgeOpacity = interpolate(frame, [at, at + 12], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: canvasDark }}>
      {/* ── LEFT PANEL: Image ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: imgW,
          height: 540,
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
            transformOrigin: "center center",
          }}
        />
        {/* Dark vignette on right edge of image — blends into panel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: "100%",
            background: `linear-gradient(to right, transparent, ${canvasDark})`,
          }}
        />
        {/* Gold border — thin border on right + top + bottom of image */}
        <div
          style={{
            position: "absolute",
            top: safeV,
            left: safeH,
            right: 0,
            bottom: safeV,
            border: `2px solid ${gold}`,
            borderRight: "none",
            opacity: borderOpacity * 0.7,
            pointerEvents: "none",
          }}
        />
        {/* Corner accents — top-left and bottom-left gold corners */}
        {[
          { top: safeV, left: safeH },
          { bottom: safeV, left: safeH },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 32,
              height: 32,
              borderTop: i === 0 ? `3px solid ${gold}` : undefined,
              borderBottom: i === 1 ? `3px solid ${gold}` : undefined,
              borderLeft: `3px solid ${gold}`,
              opacity: borderOpacity,
            }}
          />
        ))}
      </div>

      {/* ── RIGHT PANEL: Dossier metadata ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: imgW,
          width: panelW,
          height: 540,
          backgroundColor: canvas,
          display: "flex",
          flexDirection: "column" as const,
          paddingLeft: 32,
          paddingRight: safeH,
          paddingTop: safeV + 12,
          paddingBottom: safeV + 12,
          justifyContent: "space-between",
        }}
      >
        {/* Top section */}
        <div>
          {/* Ref number + badge row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            {/* Ref number */}
            {refNumber && (
              <div
                style={{
                  opacity: refOpacity,
                  fontFamily: sans,
                  fontSize: 11,
                  color: textDim,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  lineHeight: 1.4,
                  maxWidth: 180,
                }}
              >
                {refNumber}
              </div>
            )}
            {/* Badge */}
            <div
              style={{
                backgroundColor: red,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 4,
                paddingBottom: 4,
                opacity: badgeOpacity,
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              <span
                style={{
                  fontFamily: condensed,
                  fontSize: 16,
                  color: textPrimary,
                  letterSpacing: "0.1em",
                }}
              >
                {badge}
              </span>
            </div>
          </div>

          {/* Category label — large, red, condensed */}
          <div
            style={{
              opacity: categoryOpacity,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: condensed,
                fontSize: 14,
                color: red,
                letterSpacing: "0.2em",
                lineHeight: 1,
                textTransform: "uppercase" as const,
              }}
            >
              {categoryLabel}
            </div>
          </div>

          {/* Red rule */}
          <div
            style={{
              width: ruleW,
              height: 3,
              backgroundColor: red,
              marginBottom: 16,
            }}
          />

          {/* Headline */}
          <div
            style={{
              opacity: headlineOpacity,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontFamily: condensed,
                fontSize: 44,
                color: textPrimary,
                lineHeight: 1.0,
                letterSpacing: "0.02em",
              }}
            >
              {headline}
            </div>
          </div>

          {/* Body text */}
          {body && (
            <div
              style={{
                opacity: bodyOpacity,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 18,
                  color: textDim,
                  lineHeight: 1.55,
                  fontWeight: 400,
                }}
              >
                {body}
              </div>
            </div>
          )}
        </div>

        {/* Bottom section — source */}
        <div>
          {/* Thin separator line */}
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: textDim,
              opacity: 0.25,
              marginBottom: 10,
            }}
          />
          {source && (
            <div
              style={{
                opacity: sourceOpacity,
                fontFamily: sans,
                fontSize: 12,
                color: textDim,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const defaultProps: EvidenceFrameProps = {
  image: "submarine.jpg",
  categoryLabel: "CLASSIFIED",
  headline: "3 CHINESE SUBMARINES TRACKED NEAR ANDAMAN SEA",
  body: "Multiple sorties detected in Q3 2023. Pattern suggests pre-positioning for strait interdiction, not routine patrol.",
  source: "IISS Strategic Dossier 2024",
  refNumber: "REF: IND/NAV/2024-003",
  badge: "#SWARAJYA",
  at: 0,
};

export const demo = {
  compositionId: "imgcomp-evidence-frame",
  props: {
    image: "submarine.jpg",
    categoryLabel: "CLASSIFIED",
    headline: "3 CHINESE SUBMARINES TRACKED NEAR ANDAMAN SEA",
    body: "Multiple sorties detected in Q3 2023. Pattern suggests pre-positioning for strait interdiction, not routine patrol.",
    source: "IISS Strategic Dossier 2024",
    refNumber: "REF: IND/NAV/2024-003",
    badge: "#SWARAJYA", at: 15,
  },
  durationInFrames: 180,
};
