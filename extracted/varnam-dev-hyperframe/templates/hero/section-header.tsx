import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SectionHeaderProps extends BaseProps {
  number: string;
  name: string;
  description?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Section transition card.
 * Optional category label top-left with terracotta accent below.
 * Section number in 200px muted serif. Section name 80px serif. Brief description 28px sans muted.
 * Terracotta vertical bar between number and name.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  name,
  description,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const numberAccent = lineGrow(frame, at + 16, 30);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* Large section number */}
        <div
          style={{
            ...reveal(frame, at + 8),
            fontFamily: serif,
            fontSize: 200,
            lineHeight: 1,
            color: P.light,
            marginRight: 48,
            minWidth: 180,
            textAlign: "right",
            userSelect: "none",
          }}
        >
          {number}
        </div>

        {/* Vertical terracotta bar between number and name */}
        <div
          style={{
            width: 3,
            height: `${numberAccent}%`,
            maxHeight: 120,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginRight: 48,
            flexShrink: 0,
          }}
        />

        {/* Name + description */}
        <div style={{ flex: 1, maxWidth: 820 }}>
          <div
            style={{
              ...reveal(frame, at + 12),
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.08,
              color: P.text,
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </div>
          {description && (
            <div
              style={{
                ...reveal(frame, at + 20),
                fontFamily: sans,
                fontSize: 26,
                lineHeight: 1.5,
                color: P.muted,
                marginTop: 16,
                maxWidth: 640,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-section-header",
  "props": {
    "number": "02",
    "name": "The Mechanism",
    "description": "How GCCs replaced outsourcing contracts with company-owned operations.",
    "categoryLabel": "PART TWO",
    "at": 15
  },
  "durationInFrames": 120
};
