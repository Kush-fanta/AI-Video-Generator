import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DuoTitleProps extends BaseProps {
  line1: string;
  line2: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Two-line title where line 1 is serif and line 2 is sans bold.
 * Different sizes create typographic tension. Line 1 snaps first,
 * line 2 follows 8 frames later with slight left offset.
 */
export const DuoTitle: React.FC<DuoTitleProps> = ({
  line1,
  line2,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Title block */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          transform: "translateY(-50%)",
        }}
      >
        {/* Line 1 — serif, larger */}
        <div style={reveal(frame, at + 5)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 88,
              lineHeight: 1.0,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 900,
            }}
          >
            {line1}
          </div>
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 10, 16)}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 2,
          }}
        />

        {/* Line 2 — sans, bold, smaller */}
        <div
          style={{
            ...reveal(frame, at + 13),
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 52,
              lineHeight: 1.15,
              color: P.sub,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              maxWidth: 800,
            }}
          >
            {line2}
          </div>
        </div>
      </div>

      {/* Decorative dot pair — top right */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 100,
          display: "flex",
          gap: 10,
          ...reveal(frame, at + 16),
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: P.light }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: P.terracotta, opacity: 0.6 }} />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-duo-title",
  "props": {
    "line1": "The Old Story",
    "line2": "Back Office of the World",
    "categoryLabel": "THEN VS NOW",
    "at": 15
  },
  "durationInFrames": 120
};
