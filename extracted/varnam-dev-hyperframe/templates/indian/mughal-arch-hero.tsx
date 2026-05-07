import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { MughalArch, JaliPattern } from "../shared/indian/patterns";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MughalArchHeroProps extends BaseProps {
  /** Main headline displayed inside the arch */
  headline: string;
  /** Optional subtitle below headline */
  subtitle?: string;
  /** Category label above the arch */
  categoryLabel?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Title card framed inside an animated MughalArch. Headline in large serif
 * inside the arch, MUGHAL palette. JaliPattern as background texture.
 * Category label top.
 */
export const MughalArchHero: React.FC<MughalArchHeroProps> = ({
  headline,
  subtitle,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Jali background texture */}
      <JaliPattern color={MUGHAL.gold} opacity={0.06} rows={8} cols={12} at={at} />

      {/* Category label */}
      {categoryLabel && (
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
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: sans,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: MUGHAL.gold,
            }}
          >
            {categoryLabel}
          </div>
        </div>
      )}

      {/* Arch frame centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 580,
          height: 620,
        }}
      >
        <MughalArch color={MUGHAL.gold} at={at + 5} style={{ width: "100%", height: "100%" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 50px 40px",
            }}
          >
            {/* Headline */}
            <div
              style={{
                ...reveal(frame, at + 14),
                fontFamily: serif,
                fontSize: 72,
                lineHeight: 1.05,
                color: MUGHAL.ivory,
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {headline}
            </div>

            {/* Gold accent line */}
            <div
              style={{
                width: `${lineGrow(frame, at + 22, 18)}%`,
                maxWidth: 120,
                height: 2.5,
                backgroundColor: MUGHAL.gold,
                marginTop: 28,
                borderRadius: 1,
              }}
            />

            {/* Subtitle */}
            {subtitle && (
              <div
                style={{
                  ...reveal(frame, at + 28),
                  fontFamily: sans,
                  fontSize: 22,
                  lineHeight: 1.5,
                  color: MUGHAL.ivory,
                  opacity: 0.7,
                  textAlign: "center",
                  marginTop: 20,
                  maxWidth: 400,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </MughalArch>
      </div>
    </AbsoluteFill>
  );
};
