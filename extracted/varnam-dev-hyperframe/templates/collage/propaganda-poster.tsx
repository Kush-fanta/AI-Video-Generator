import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { PaperBg } from "./paper-bg";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: oswald } = loadFont();

interface PropagandaPosterProps extends BaseProps {
  /** Hero subject — transparent PNG cutout. Will dominate the frame. */
  subject: string;
  /** Primary headline — BIG, bold */
  headline: string;
  /** Optional subheadline */
  subheadline?: string;
  /** Accent color for geometric shapes and highlights */
  accentColor?: string;
  /** Accent shape behind subject */
  accentShape?: "circle" | "stripe" | "triangle" | "none";
  /** Subject position */
  subjectPosition?: "center" | "left" | "right";
  /** Paper color */
  paperColor?: string;
  /** Dark mode (inverts paper to dark) */
  dark?: boolean;
  /** Make subject B&W */
  grayscale?: boolean;
  /** Frame to start */
  at?: number;
}

/**
 * PROPAGANDA POSTER — giant subject, bold text, geometric accent.
 * Think: Soviet poster, Obey Giant, Shepard Fairey.
 *
 * Layout (baked):
 * - Subject fills 70% of frame height, anchored at bottom
 * - Geometric accent shape behind subject (circle, stripe, or triangle)
 * - Headline: massive condensed type, positioned ABOVE or BESIDE subject
 * - Subheadline: smaller, muted
 * - Paper texture or dark canvas with grain
 *
 * The subject IS the composition. Everything else serves it.
 */
export const PropagandaPoster: React.FC<PropagandaPosterProps> = ({
  subject,
  headline,
  subheadline,
  accentColor = "#C23028",
  accentShape = "circle",
  subjectPosition = "center",
  paperColor,
  dark = false,
  grayscale = true,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const bg = dark ? "#0D0F14" : (paperColor || "#F0EBE0");
  const textColor = dark ? "#FFFFFF" : "#1A1612";
  const subTextColor = dark ? "rgba(255,255,255,0.5)" : "rgba(26,22,18,0.45)";

  const imgFilter = [
    grayscale ? "grayscale(1)" : "",
    "contrast(1.2)",
    `drop-shadow(${dark ? "0 0 40px rgba(0,0,0,0.6)" : "5px 6px 4px rgba(0,0,0,0.12)"})`,
  ].filter(Boolean).join(" ");

  // Subject entrance — rise from bottom
  const subjectY = interpolate(f, [0, 16], [60, 0], { ...C, easing: ease });
  const subjectOpacity = interpolate(f, [0, 8], [0, 1], C);

  // Accent entrance — scale in from center
  const accentScale = interpolate(f, [4, 18], [0.3, 1.0], { ...C, easing: ease });
  const accentOpacity = interpolate(f, [4, 12], [0, 1], C);

  // Text entrance — stamp
  const textScale = interpolate(f, [12, 16, 20, 24], [1.2, 0.96, 1.03, 1.0], C);
  const textOpacity = interpolate(f, [12, 16], [0, 1], C);

  // Position configs — baked
  const subjectStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    zIndex: 3,
    opacity: subjectOpacity,
    transform: `translateY(${subjectY}px)`,
  };

  const textBlock: React.CSSProperties = {
    position: "absolute",
    zIndex: 4,
    opacity: textOpacity,
    transform: `scale(${textScale})`,
    pointerEvents: "none",
  };

  // Subject + text placement based on position
  if (subjectPosition === "center") {
    Object.assign(subjectStyle, { left: "50%", transform: `translateX(-50%) translateY(${subjectY}px)` });
    Object.assign(textBlock, { top: "8%", left: "50%", transform: `translateX(-50%) scale(${textScale})`, textAlign: "center" as const });
  } else if (subjectPosition === "left") {
    Object.assign(subjectStyle, { left: 20, transform: `translateY(${subjectY}px)` });
    Object.assign(textBlock, { top: "15%", right: 80, textAlign: "right" as const });
  } else {
    Object.assign(subjectStyle, { right: 20, transform: `translateY(${subjectY}px)` });
    Object.assign(textBlock, { top: "15%", left: 80, textAlign: "left" as const });
  }

  // Accent shape position — always behind subject center
  const accentPos = subjectPosition === "center"
    ? { left: "50%", top: "30%", transform: `translate(-50%, -50%) scale(${accentScale})` }
    : subjectPosition === "left"
    ? { left: "22%", top: "35%", transform: `translate(-50%, -50%) scale(${accentScale})` }
    : { right: "22%", top: "35%", transform: `translate(50%, -50%) scale(${accentScale})` };

  return (
    <PaperBg
      color={bg}
      grain={dark ? 0.04 : 0.07}
      vignette={dark ? 0.2 : 0.12}
    >
      {/* Accent shape — behind subject */}
      {accentShape !== "none" && (
        <div
          style={{
            position: "absolute",
            ...accentPos,
            zIndex: 2,
            opacity: accentOpacity,
          }}
        >
          {accentShape === "circle" && (
            <div
              style={{
                width: 600,
                height: 600,
                borderRadius: "50%",
                backgroundColor: accentColor,
                opacity: 0.85,
              }}
            />
          )}
          {accentShape === "stripe" && (
            <div
              style={{
                width: 1200,
                height: 180,
                backgroundColor: accentColor,
                transform: "rotate(-8deg)",
                opacity: 0.85,
              }}
            />
          )}
          {accentShape === "triangle" && (
            <svg width="700" height="700" viewBox="0 0 100 100">
              <polygon points="50,5 95,95 5,95" fill={accentColor} opacity={0.85} />
            </svg>
          )}
        </div>
      )}

      {/* Subject — THE HERO */}
      <div style={subjectStyle}>
        <Img
          src={subject}
          style={{
            height: "72vh",
            maxHeight: 780,
            objectFit: "contain",
            filter: imgFilter,
          }}
        />
      </div>

      {/* Headline */}
      <div style={textBlock}>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 88,
            fontWeight: 700,
            color: textColor,
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            lineHeight: 1.0,
            maxWidth: 700,
          }}
        >
          {headline}
        </div>
        {subheadline && (
          <div
            style={{
              fontFamily: oswald,
              fontSize: 28,
              fontWeight: 400,
              color: subTextColor,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              marginTop: 20,
            }}
          >
            {subheadline}
          </div>
        )}
      </div>
    </PaperBg>
  );
};

export const demo = {
  compositionId: "collage-propaganda-poster",
  props: { subject: "demo-cutout.png", headline: "THE FUTURE IS NOW", at: 15 },
  durationInFrames: 180,
};
