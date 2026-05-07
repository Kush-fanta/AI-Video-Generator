import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { PICHWAI } from "../shared/indian/palettes";
import { LotusMotif } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PichwaiHeroProps extends BaseProps {
  /** Transparent PNG cutout */
  image: ImageRef;
  /** Caption in serif below the subject */
  caption?: string;
  /** Subtitle line */
  subtitle?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Large cutout PNG with LotusMotif blooming around the base. PICHWAI palette
 * (dark ground, lotus green, gold). Caption in serif. Painting-like composition.
 */
export const PichwaiHero: React.FC<PichwaiHeroProps> = ({
  image,
  caption,
  subtitle,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgSlide = interpolate(frame, [at + 4, at + 18], [30, 0], { ...C, easing: ease });
  const imgOpacity = interpolate(frame, [at + 4, at + 14], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: PICHWAI.darkGround }}>
      {/* Lotus blooms around the base */}
      {[-200, -80, 40, 160, 280].map((x, i) => (
        <LotusMotif
          key={i}
          color={PICHWAI.lotusPink}
          centerColor={PICHWAI.gold}
          size={100 + (i % 2) * 30}
          at={at + 10 + i * 4}
          style={{
            bottom: 20 + (i % 3) * 15,
            left: `calc(50% + ${x}px)`,
            transform: "translateX(-50%)",
          }}
        />
      ))}

      {/* Additional green lotus accents */}
      {[-260, 0, 340].map((x, i) => (
        <LotusMotif
          key={`g-${i}`}
          color={PICHWAI.lotusGreen}
          centerColor={PICHWAI.gold}
          size={70}
          at={at + 20 + i * 5}
          style={{
            bottom: 60 + (i % 2) * 20,
            left: `calc(50% + ${x}px)`,
            transform: "translateX(-50%)",
          }}
        />
      ))}

      {/* Central cutout */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: `translateX(-50%) translateY(${imgSlide}px)`,
          opacity: imgOpacity,
          zIndex: 2,
        }}
      >
        <Img
          src={image}
          style={{
            maxWidth: 600,
            maxHeight: 580,
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Caption block — top area */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 3,
        }}
      >
        {caption && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: serif,
              fontSize: 56,
              color: PICHWAI.cream,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {caption}
          </div>
        )}
        {/* Gold accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 28, 18)}%`,
            maxWidth: 100,
            height: 2,
            backgroundColor: PICHWAI.gold,
            margin: "16px auto 0",
            borderRadius: 1,
          }}
        />
        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 32),
              fontFamily: sans,
              fontSize: 20,
              color: PICHWAI.cream,
              opacity: 0.6,
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
