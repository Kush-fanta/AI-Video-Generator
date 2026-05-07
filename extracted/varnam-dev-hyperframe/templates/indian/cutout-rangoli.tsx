import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, ease } from "../shared/primitives";
import { TEMPLE } from "../shared/indian/palettes";
import { KolamGrid } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CutoutRangoliProps extends BaseProps {
  /** Transparent PNG cutout — the subject becomes the rangoli center */
  image: ImageRef;
  /** Optional caption below */
  caption?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Bgless PNG at center, surrounded by animated KolamGrid pattern that draws
 * around it. The subject IS the center of the rangoli. TEMPLE palette.
 */
export const CutoutRangoli: React.FC<CutoutRangoliProps> = ({
  image,
  caption,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imageScale = interpolate(frame, [at + 6, at + 20], [0.85, 1], { ...C, easing: ease });
  const imageOpacity = interpolate(frame, [at + 6, at + 18], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.offWhite }}>
      {/* Kolam rings at multiple sizes */}
      <KolamGrid
        color={TEMPLE.vermillion}
        opacity={0.12}
        size={700}
        at={at}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      <KolamGrid
        color={TEMPLE.turmeric}
        opacity={0.08}
        size={900}
        at={at + 8}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(45deg)" }}
      />
      <KolamGrid
        color={TEMPLE.brass}
        opacity={0.06}
        size={1100}
        at={at + 16}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(22deg)" }}
      />

      {/* Center cutout — the subject */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -52%) scale(${imageScale})`,
          opacity: imageOpacity,
          zIndex: 2,
        }}
      >
        <Img
          src={image}
          style={{
            maxWidth: 480,
            maxHeight: 540,
            objectFit: "contain",
          }}
        />
      </div>

      {/* Caption */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            width: "100%",
            textAlign: "center",
            zIndex: 3,
            ...reveal(frame, at + 30),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 32,
              color: TEMPLE.charcoal,
              letterSpacing: "-0.01em",
            }}
          >
            {caption}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
