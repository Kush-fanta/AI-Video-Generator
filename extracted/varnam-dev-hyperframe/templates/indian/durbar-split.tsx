import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { MughalArch, JaliPattern } from "../shared/indian/patterns";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface DurbarSplitProps extends BaseProps {
  /** Left subject — transparent PNG cutout */
  leftImage: ImageRef;
  /** Right subject — transparent PNG cutout */
  rightImage: ImageRef;
  /** Left name */
  leftName: string;
  /** Right name */
  rightName: string;
  /** Center label (e.g. "vs", "and") */
  centerLabel?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Two cutout PNGs facing each other (left/right), MughalArch framing each.
 * Vs/comparison format. JaliPattern center divider. MUGHAL palette.
 * Royal court face-off energy.
 */
export const DurbarSplit: React.FC<DurbarSplitProps> = ({
  leftImage,
  rightImage,
  leftName,
  rightName,
  centerLabel = "vs",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const leftSlide = interpolate(frame, [at + 4, at + 16], [-40, 0], { ...C, easing: ease });
  const rightSlide = interpolate(frame, [at + 6, at + 18], [40, 0], { ...C, easing: ease });
  const leftOpacity = interpolate(frame, [at + 4, at + 14], [0, 1], C);
  const rightOpacity = interpolate(frame, [at + 6, at + 16], [0, 1], C);

  const archSide = (
    image: ImageRef,
    name: string,
    slideX: number,
    opacity: number,
    archAt: number,
    nameAt: number,
    align: "left" | "right",
  ) => (
    <div
      style={{
        position: "absolute",
        top: 40,
        [align]: 40,
        width: "42%",
        height: "calc(100% - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MughalArch color={MUGHAL.gold} at={archAt} style={{ width: "100%", height: "80%", flex: "1 1 auto" }}>
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
          <div
            style={{
              transform: `translateX(${slideX}px)`,
              opacity,
            }}
          >
            <Img
              src={image}
              style={{
                maxWidth: 380,
                maxHeight: 440,
                objectFit: "contain",
                objectPosition: "bottom center",
              }}
            />
          </div>
        </div>
      </MughalArch>
      <div
        style={{
          ...reveal(frame, nameAt),
          fontFamily: serif,
          fontSize: 34,
          color: MUGHAL.ivory,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {name}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Background jali */}
      <JaliPattern color={MUGHAL.gold} opacity={0.04} rows={8} cols={12} at={at} />

      {/* Left arch */}
      {archSide(leftImage, leftName, leftSlide, leftOpacity, at + 3, at + 24, "left")}

      {/* Right arch */}
      {archSide(rightImage, rightName, rightSlide, rightOpacity, at + 5, at + 26, "right")}

      {/* Center divider — jali strip + label */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 60,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        {/* Vertical gold line */}
        <div
          style={{
            position: "absolute",
            width: 1.5,
            height: `${lineGrow(frame, at + 10, 30)}%`,
            backgroundColor: MUGHAL.gold,
            opacity: 0.3,
          }}
        />
        {/* Center label */}
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: MUGHAL.gold,
            backgroundColor: MUGHAL.onyx,
            padding: "8px 12px",
            zIndex: 4,
          }}
        >
          {centerLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};
