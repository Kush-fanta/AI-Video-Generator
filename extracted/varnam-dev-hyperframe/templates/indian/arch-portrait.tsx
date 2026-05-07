import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { MughalArch, JaliPattern } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ArchPortraitProps extends BaseProps {
  /** Transparent PNG cutout of the subject */
  image: ImageRef;
  /** Name displayed below the arch */
  name: string;
  /** Title/role displayed below the name */
  title?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Person/entity cutout PNG framed inside a MughalArch. Name and title below
 * the arch. JaliPattern as background. MUGHAL palette. The arch frames the
 * subject like a Mughal court portrait.
 */
export const ArchPortrait: React.FC<ArchPortraitProps> = ({
  image,
  name,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Jali background */}
      <JaliPattern color={MUGHAL.gold} opacity={0.05} rows={10} cols={14} at={at} />

      {/* Centered arch with cutout inside */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
          width: 520,
          height: 580,
        }}
      >
        <MughalArch color={MUGHAL.gold} at={at + 3} style={{ width: "100%", height: "100%" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div style={reveal(frame, at + 8)}>
              <Img
                src={image}
                style={{
                  maxWidth: 440,
                  maxHeight: 520,
                  objectFit: "contain",
                  objectPosition: "bottom center",
                }}
              />
            </div>
          </div>
        </MughalArch>
      </div>

      {/* Name + title below arch */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 3,
        }}
      >
        {/* Gold line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 18, 20)}%`,
            maxWidth: 140,
            height: 2,
            backgroundColor: MUGHAL.gold,
            margin: "0 auto 18px",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            ...reveal(frame, at + 20),
            fontFamily: serif,
            fontSize: 48,
            color: MUGHAL.ivory,
            letterSpacing: "-0.01em",
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              ...reveal(frame, at + 28),
              fontFamily: sans,
              fontSize: 20,
              color: MUGHAL.gold,
              opacity: 0.8,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: 10,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
