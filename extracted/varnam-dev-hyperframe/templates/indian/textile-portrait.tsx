import { AbsoluteFill, useCurrentFrame, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { TEXTILE } from "../shared/indian/palettes";
import { DiamondLattice, ScallopedBorder } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TextilePortraitProps extends BaseProps {
  /** Transparent PNG cutout */
  image: ImageRef;
  /** Name/label below the subject */
  name: string;
  /** Optional secondary label */
  label?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Cutout PNG on TEXTILE.cream background with DiamondLattice pattern overlay
 * at low opacity. Border using ScallopedBorder. Name/label in TEXTILE.indigo.
 * Artisanal feel — like a hand-block-printed textile portrait.
 */
export const TextilePortrait: React.FC<TextilePortraitProps> = ({
  image,
  name,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: TEXTILE.cream }}>
      {/* Diamond lattice overlay */}
      <DiamondLattice color={TEXTILE.indigo} opacity={0.05} rows={10} cols={14} at={at} />

      {/* Scalloped borders top and bottom */}
      <ScallopedBorder color={TEXTILE.indigo} opacity={0.15} scallops={16} side="top" at={at + 5} />
      <ScallopedBorder color={TEXTILE.indigo} opacity={0.15} scallops={16} side="bottom" at={at + 5} />

      {/* Centered cutout */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: 2,
          ...reveal(frame, at + 6),
        }}
      >
        <Img
          src={image}
          style={{
            maxWidth: 500,
            maxHeight: 520,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Name + label */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 3,
        }}
      >
        {/* Accent line */}
        <div
          style={{
            width: `${lineGrow(frame, at + 20, 18)}%`,
            maxWidth: 120,
            height: 2,
            backgroundColor: TEXTILE.madder,
            margin: "0 auto 16px",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            ...reveal(frame, at + 22),
            fontFamily: serif,
            fontSize: 44,
            color: TEXTILE.indigo,
            letterSpacing: "-0.01em",
          }}
        >
          {name}
        </div>
        {label && (
          <div
            style={{
              ...reveal(frame, at + 30),
              fontFamily: sans,
              fontSize: 18,
              color: TEXTILE.iron,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
