import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface MythVsFactProps extends BaseProps {
  myth: string;
  fact: string;
  /** Frame when FACT appears (default: 40) */
  factAt?: number;
  at?: number;
  palette?: Partial<typeof P>;
}

/**
 * MythVsFact — "MYTH" appears in uppercase sans with a big X stamp (mauve),
 * then dims. "FACT" appears below in terracotta with checkmark.
 * Two-beat rhetorical device. Myth text gets crossed out, fact text is bold.
 */
export const MythVsFact: React.FC<MythVsFactProps> = ({
  myth,
  fact,
  factAt = 40,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const t = frame - at;

  /* --- MYTH SECTION --- */
  const mythOpacity = interpolate(t, [0, 10], [0, 1], C);
  const mythScale = interpolate(t, [0, 6, 10], [1.06, 0.98, 1.0], C);

  // X stamp slams in at t+18
  const xEntry = t - 18;
  const xScale = xEntry >= 0
    ? interpolate(xEntry, [0, 3, 6], [1.5, 0.95, 1.0], C)
    : 0;
  const xOpacity = interpolate(t, [18, 20], [0, 1], C);
  const xRotation = xEntry >= 0
    ? interpolate(xEntry, [0, 3, 6], [-20, 2, 0], C)
    : -20;

  // Strikethrough grows across myth text after X appears
  const strikeWidth = interpolate(t, [22, 36], [0, 100], { ...C, easing: ease });

  // Myth dims when fact arrives
  const mythDim = interpolate(t, [factAt - 4, factAt + 6], [1, 0.25], C);

  /* --- FACT SECTION --- */
  const factT = t - factAt;
  const factOpacity = interpolate(factT, [0, 12], [0, 1], C);

  const factSpring = factT >= 0
    ? spring({ frame: factT, fps: FPS, config: { damping: 12, mass: 1.1, stiffness: 120 } })
    : 0;

  // Checkmark draws in
  const checkOpacity = interpolate(factT, [8, 14], [0, 1], C);
  const checkScale = factT >= 8
    ? spring({ frame: factT - 8, fps: FPS, config: { damping: 14, mass: 0.8, stiffness: 140 } })
    : 0;

  // Accent line above MYTH label
  const accentW = lineGrow(frame, at + 4, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Terracotta accent line top */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 100,
          width: `${accentW}%`,
          maxWidth: 80,
          height: 3,
          backgroundColor: pal.terracotta,
          borderRadius: 2,
        }}
      />

      {/* MYTH block — upper half */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          paddingRight: 100,
          opacity: mythDim,
        }}
      >
        {/* MYTH label */}
        <div
          style={{
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            color: pal.mauve,
            marginBottom: 24,
          }}
        >
          MYTH
        </div>

        {/* Myth text with strikethrough + X */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 52,
              fontWeight: 600,
              color: pal.text,
              lineHeight: 1.3,
              opacity: mythOpacity,
              transform: `scale(${mythScale})`,
              transformOrigin: "left center",
            }}
          >
            {myth}
          </div>

          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikeWidth}%`,
              height: 4,
              backgroundColor: pal.mauve,
              borderRadius: 2,
              transform: "translateY(-50%)",
            }}
          />

          {/* X stamp */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: -20,
              transform: `translate(0, -50%) scale(${xScale}) rotate(${xRotation}deg)`,
              fontFamily: sans,
              fontSize: 160,
              fontWeight: 800,
              color: pal.mauve,
              opacity: xOpacity,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ✕
          </div>
        </div>
      </div>

      {/* Horizontal divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          width: `${lineGrow(frame, at + factAt - 6, 18)}%`,
          maxWidth: 880,
          height: 1,
          backgroundColor: pal.light,
          opacity: 0.5,
        }}
      />

      {/* FACT block — lower half */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
          paddingRight: 100,
          opacity: factOpacity,
        }}
      >
        {/* FACT label with checkmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              color: pal.terracotta,
            }}
          >
            FACT
          </span>
          <span
            style={{
              fontSize: 40,
              color: pal.terracotta,
              opacity: checkOpacity,
              transform: `scale(${checkScale})`,
              transformOrigin: "center",
              lineHeight: 1,
            }}
          >
            ✓
          </span>
        </div>

        {/* Fact text */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 52,
            fontWeight: 700,
            color: pal.terracotta,
            lineHeight: 1.3,
            transform: `translateY(${interpolate(factSpring, [0, 1], [20, 0], C)}px)`,
          }}
        >
          {fact}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-myth-vs-fact",
  props: {
    myth: "India only does cheap IT support",
    fact: "73% work on core product",
    factAt: 45,
    at: 15,
  },
  durationInFrames: 180,
};
