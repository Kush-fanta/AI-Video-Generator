import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { MughalArch, MeanderVine } from "../shared/indian/patterns";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ArchComparisonProps extends BaseProps {
  /** Left arch value */
  leftValue: string;
  /** Left arch label */
  leftLabel: string;
  /** Right arch value */
  rightValue: string;
  /** Right arch label */
  rightLabel: string;
  /** Optional "vs" or comparison connector text */
  connector?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Two MughalArch frames side by side, each containing a stat or text.
 * Before/after or vs format. Connected by a MeanderVine at the bottom.
 */
export const ArchComparison: React.FC<ArchComparisonProps> = ({
  leftValue,
  leftLabel,
  rightValue,
  rightLabel,
  connector = "vs",
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const archContent = (value: string, label: string, delay: number) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 30px 30px",
      }}
    >
      <div
        style={{
          ...reveal(frame, at + delay),
          fontFamily: serif,
          fontSize: 72,
          lineHeight: 1,
          color: MUGHAL.gold,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          ...reveal(frame, at + delay + 8),
          fontFamily: sans,
          fontSize: 18,
          lineHeight: 1.4,
          color: MUGHAL.ivory,
          opacity: 0.7,
          textAlign: "center",
          marginTop: 16,
          maxWidth: 200,
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.onyx }}>
      {/* Left arch */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          transform: "translateY(-55%)",
          width: 360,
          height: 420,
        }}
      >
        <MughalArch color={MUGHAL.gold} at={at + 3} style={{ width: "100%", height: "100%" }}>
          {archContent(leftValue, leftLabel, 10)}
        </MughalArch>
      </div>

      {/* Connector */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 18),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: MUGHAL.gold,
            opacity: 0.5,
          }}
        >
          {connector}
        </div>
      </div>

      {/* Right arch */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 120,
          transform: "translateY(-55%)",
          width: 360,
          height: 420,
        }}
      >
        <MughalArch color={MUGHAL.gold} at={at + 8} style={{ width: "100%", height: "100%" }}>
          {archContent(rightValue, rightLabel, 16)}
        </MughalArch>
      </div>

      {/* MeanderVine connecting bottom */}
      <MeanderVine color={MUGHAL.jade} opacity={0.15} at={at + 20} style={{ bottom: 80, top: "auto" }} />
    </AbsoluteFill>
  );
};
