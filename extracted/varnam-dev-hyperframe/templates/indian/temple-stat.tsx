import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, ease } from "../shared/primitives";
import { TempleGopuram } from "../shared/indian/patterns";
import { TEMPLE } from "../shared/indian/palettes";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TempleStatProps extends BaseProps {
  /** Main stat value */
  value: string;
  /** Label describing the stat */
  label: string;
  /** Optional supporting stat */
  supportingStat?: string;
  /** Supporting stat label */
  supportingLabel?: string;
  /** Source attribution */
  source?: string;
  /** Animation start frame */
  at?: number;
}

/**
 * Stat hero with TempleGopuram silhouette as faint background texture on the right.
 * Number rendered in TEMPLE.brass with overshoot scale. Turmeric accent line.
 * TEMPLE palette throughout.
 */
export const TempleStat: React.FC<TempleStatProps> = ({
  value,
  label,
  supportingStat,
  supportingLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const heroScale = overshootScale(frame, at + 5);
  const accentW = lineGrow(frame, at + 12, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: TEMPLE.offWhite }}>
      {/* Gopuram silhouette — right side, faint */}
      <TempleGopuram
        color={TEMPLE.charcoal}
        opacity={0.05}
        at={at}
        style={{ right: 40, bottom: 0 }}
      />

      {/* Main stat block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: supportingStat ? 600 : "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          zIndex: 2,
        }}
      >
        {/* Hero number in brass */}
        <div
          style={{
            ...reveal(frame, at + 3),
            transform: `scale(${heroScale})`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 0.88,
              color: TEMPLE.brass,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </div>
        </div>

        {/* Turmeric accent line */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 110,
            height: 3.5,
            backgroundColor: TEMPLE.turmeric,
            marginTop: 30,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 16),
            fontFamily: sans,
            fontSize: 32,
            lineHeight: 1.4,
            color: P.sub,
            marginTop: 22,
            maxWidth: 440,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Supporting stat — right */}
      {supportingStat && (
        <>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: 620,
              width: 1,
              height: `${lineGrow(frame, at + 14, 22) * 0.4}%`,
              maxHeight: 360,
              backgroundColor: TEMPLE.turmeric,
              opacity: 0.3,
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: 100,
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              zIndex: 2,
            }}
          >
            <div style={reveal(frame, at + 22)}>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 84,
                  lineHeight: 1,
                  color: TEMPLE.vermillion,
                  textAlign: "right",
                  letterSpacing: "-0.02em",
                }}
              >
                {supportingStat}
              </div>
            </div>
            {supportingLabel && (
              <div
                style={{
                  ...reveal(frame, at + 28),
                  fontFamily: sans,
                  fontSize: 20,
                  color: P.muted,
                  marginTop: 14,
                  textAlign: "right",
                  maxWidth: 260,
                  lineHeight: 1.4,
                }}
              >
                {supportingLabel}
              </div>
            )}
          </div>
        </>
      )}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 32),
            fontFamily: sans,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: P.muted,
            textTransform: "uppercase",
            zIndex: 3,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
