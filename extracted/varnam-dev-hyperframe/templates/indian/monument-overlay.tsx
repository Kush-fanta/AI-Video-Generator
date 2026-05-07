import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { TEMPLE } from "../shared/indian/palettes";
import { PaisleyBorder, MughalArch, TempleGopuram } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MonumentOverlayProps extends BaseProps {
  /** Transparent PNG cutout of building/monument — full width */
  image: ImageRef;
  /** Headline text overlaid on frosted bar */
  headline: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Use MughalArch or TempleGopuram accent */
  accent?: "arch" | "gopuram";
  /** Frame offset */
  at?: number;
}

/**
 * Full-width cutout PNG (building/monument) with text overlaid in a frosted bar.
 * PaisleyBorder on sides. TempleGopuram or MughalArch SVG accent. TEMPLE palette.
 * For architecture/heritage content.
 */
export const MonumentOverlay: React.FC<MonumentOverlayProps> = ({
  image,
  headline,
  subtitle,
  accent = "gopuram",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgScale = interpolate(frame, [at, at + 40], [1.02, 1.06], C);
  const imgOpacity = interpolate(frame, [at + 2, at + 12], [0, 1], C);
  const barSlide = interpolate(frame, [at + 14, at + 24], [20, 0], { ...C, easing: ease });
  const barOpacity = interpolate(frame, [at + 14, at + 22], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.charcoal }}>
      {/* Monument image — full width, centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          opacity: imgOpacity,
          transform: `scale(${imgScale})`,
          transformOrigin: "center bottom",
        }}
      >
        <Img
          src={image}
          style={{
            maxWidth: "100%",
            maxHeight: "90%",
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Accent — gopuram or arch silhouette */}
      {accent === "gopuram" ? (
        <TempleGopuram
          color={TEMPLE.brass}
          opacity={0.08}
          at={at + 5}
          style={{ right: 30, bottom: 0 }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 160,
            height: 200,
            opacity: 0.08,
          }}
        >
          <MughalArch color={TEMPLE.brass} at={at + 5} style={{ width: "100%", height: "100%" }} />
        </div>
      )}

      {/* Paisley borders on sides */}
      <PaisleyBorder color={TEMPLE.brass} opacity={0.12} side="left" at={at + 3} />
      <PaisleyBorder color={TEMPLE.brass} opacity={0.12} side="right" at={at + 5} />

      {/* Frosted text bar */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, calc(-50% + ${barSlide}px))`,
          opacity: barOpacity,
          backgroundColor: "rgba(42, 42, 42, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "32px 60px",
          textAlign: "center",
          zIndex: 3,
          maxWidth: "80%",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 52,
            color: TEMPLE.offWhite,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>
        {/* Gold accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 24, 16)}%`,
            maxWidth: 100,
            height: 2,
            backgroundColor: TEMPLE.brass,
            margin: "14px auto 0",
            borderRadius: 1,
          }}
        />
        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 20,
              color: TEMPLE.sandalwood,
              marginTop: 12,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
