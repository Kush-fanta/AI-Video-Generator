import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C as Clamp } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StatHeroProps extends BaseProps {
  value: string;
  label: string;
  supportingStat?: string;
  supportingLabel?: string;
  source?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Pure stat hero. Giant number (280px) left with overshoot scale pulse.
 * Label below in sans. Optional supporting stat pinned right at smaller scale.
 * Ghost value as massive backdrop. Terracotta accent. Vertical divider if supporting stat.
 * Source anchored bottom-left.
 */
export const StatHero: React.FC<StatHeroProps> = ({
  value,
  label,
  supportingStat,
  supportingLabel,
  source,
  categoryLabel,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(palette);
  const heroScale = overshootScale(frame, at + 5);
  const accentW = lineGrow(frame, at + 12, 22);
  const ghostOpacity = interpolate(frame, [at + 8, at + 24], [0, 0.04], Clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* Ghost value — fills background */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: -40,
          transform: "translateY(-50%)",
          fontFamily: serif,
          fontSize: 640,
          lineHeight: 0.8,
          color: CP.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.08em",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {value}
      </div>

      {/* Category label top-left */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            zIndex: 3,
          }}
        >
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: CP.muted,
            }}
          >
            {categoryLabel}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 14)}%`,
              maxWidth: 52,
              height: 2,
              backgroundColor: CP.terracotta,
              marginTop: 10,
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Main stat block — left */}
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
        {/* Hero number */}
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
              fontSize: 280,
              lineHeight: 0.88,
              color: CP.text,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </div>
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 110,
            height: 3.5,
            backgroundColor: CP.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 16),
            fontFamily: sans,
            fontSize: 34,
            lineHeight: 1.4,
            color: CP.sub,
            marginTop: 22,
            maxWidth: 460,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Vertical divider — only with supporting stat */}
      {supportingStat && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: 620,
            width: 1,
            height: `${lineGrow(frame, at + 14, 24) * 0.4}%`,
            maxHeight: 380,
            backgroundColor: CP.terracotta,
            opacity: 0.3,
            zIndex: 2,
          }}
        />
      )}

      {/* Supporting stat — right side */}
      {supportingStat && (
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
                fontSize: 88,
                lineHeight: 1,
                color: CP.terracotta,
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
                color: CP.muted,
                marginTop: 14,
                textAlign: "right",
                maxWidth: 280,
                lineHeight: 1.4,
              }}
            >
              {supportingLabel}
            </div>
          )}
        </div>
      )}

      {/* Bottom chrome — horizontal rule + source */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 100,
          width: `${lineGrow(frame, at + 20, 28) * 0.35}%`,
          maxWidth: 300,
          height: 1,
          backgroundColor: CP.light,
          opacity: 0.35,
        }}
      />

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
            color: CP.muted,
            textTransform: "uppercase",
            zIndex: 3,
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Top-right decorative dot pair */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 100,
          display: "flex",
          gap: 10,
          ...reveal(frame, at + 18),
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: CP.light,
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: CP.terracotta,
            opacity: 0.6,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-stat-hero",
  "props": {
    "value": "$100B",
    "label": "IT Services Industry",
    "supportingStat": "1,850",
    "supportingLabel": "GCCs in India",
    "source": "NASSCOM 2024",
    "categoryLabel": "THE SCALE",
    "at": 15
  },
  "durationInFrames": 150
};
