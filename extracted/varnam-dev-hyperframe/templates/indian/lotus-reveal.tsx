import { AbsoluteFill, useCurrentFrame, interpolate, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { LotusMotif } from "../shared/indian/patterns";
import { PICHWAI } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LotusRevealProps extends BaseProps {
  /** Text content revealed behind the lotus */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional background image (public/ path) */
  image?: string;
  /** Animation start frame */
  at?: number;
}

/**
 * Content starts hidden behind PICHWAI.darkGround. LotusMotif blooms at center,
 * then scales outward as a circular mask, revealing the content (text/image) behind it.
 * PICHWAI palette. Hard snap transitions.
 */
export const LotusReveal: React.FC<LotusRevealProps> = ({
  title,
  subtitle,
  image,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Phase 1: lotus blooms (frames at → at+40)
  // Phase 2: mask expands (frames at+40 → at+70)
  const maskRadius = interpolate(
    frame,
    [at + 40, at + 70],
    [0, 120],
    { ...C, easing: ease },
  );

  const lotusScale = interpolate(
    frame,
    [at + 38, at + 55],
    [1, 8],
    { ...C, easing: ease },
  );

  const lotusOpacity = interpolate(
    frame,
    [at + 45, at + 58],
    [1, 0],
    C,
  );

  const showContent = frame >= at + 40;

  return (
    <AbsoluteFill style={{ backgroundColor: PICHWAI.darkGround }}>
      {/* Revealed content layer — clipped by expanding circle */}
      <AbsoluteFill
        style={{
          clipPath: showContent
            ? `circle(${maskRadius}% at 50% 50%)`
            : "circle(0% at 50% 50%)",
        }}
      >
        <AbsoluteFill
          style={{
            backgroundColor: PICHWAI.cream,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image && (
            <Img
              src={image}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.25,
              }}
            />
          )}
          <div
            style={{
              ...reveal(frame, at + 52),
              fontFamily: serif,
              fontSize: 100,
              lineHeight: 1,
              color: PICHWAI.darkGround,
              textAlign: "center",
              maxWidth: 800,
              letterSpacing: "-0.03em",
              zIndex: 2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                ...reveal(frame, at + 62),
                fontFamily: sans,
                fontSize: 28,
                color: PICHWAI.terracotta,
                marginTop: 24,
                textAlign: "center",
                maxWidth: 600,
                fontWeight: 500,
                zIndex: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Lotus motif — blooms then scales up as it fades */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${lotusScale})`,
          opacity: lotusOpacity,
          zIndex: 3,
        }}
      >
        <LotusMotif
          color={PICHWAI.lotusPink}
          centerColor={PICHWAI.gold}
          size={160}
          at={at}
          style={{ position: "relative" }}
        />
      </div>
    </AbsoluteFill>
  );
};
