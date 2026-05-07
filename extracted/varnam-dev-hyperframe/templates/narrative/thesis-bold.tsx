import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ThesisBoldProps extends BaseProps {
  thesis: string;
  support?: string;
  at?: number;
  palette?: Partial<typeof P>;
}

/**
 * ThesisBold — A single bold thesis statement. Large sans (64px+), bold weight,
 * centered vertically with generous padding. A thin terracotta rule above.
 * Below: a supporting line in smaller serif italic. Academic authority, TED talk energy.
 */
export const ThesisBold: React.FC<ThesisBoldProps> = ({
  thesis,
  support,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const t = frame - at;

  // Terracotta rule above thesis — grows from center
  const ruleWidth = lineGrow(frame, at + 4, 22);

  // Thesis entrance — spring slide up
  const thesisProgress = t >= 6
    ? spring({ frame: t - 6, fps: FPS, config: { damping: 14, mass: 1.2, stiffness: 100 } })
    : 0;
  const thesisY = interpolate(thesisProgress, [0, 1], [28, 0], C);
  const thesisOpacity = interpolate(thesisProgress, [0, 0.3], [0, 1], C);

  // Support line entrance — arrives later with subtlety
  const supportDelay = 28;
  const supportReveal = reveal(frame, at + supportDelay, 18);

  // Decorative em dash above support
  const dashOpacity = interpolate(t, [supportDelay - 4, supportDelay + 4], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {/* Full-screen centered layout */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        {/* Terracotta rule — centered */}
        <div
          style={{
            width: `${ruleWidth}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: pal.terracotta,
            borderRadius: 2,
            marginBottom: 48,
          }}
        />

        {/* Thesis statement */}
        <div
          style={{
            opacity: thesisOpacity,
            transform: `translateY(${thesisY}px)`,
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 68,
              fontWeight: 700,
              color: pal.text,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {thesis}
          </div>
        </div>

        {/* Em dash separator */}
        {support && (
          <div
            style={{
              marginTop: 40,
              marginBottom: 20,
              opacity: dashOpacity,
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 32,
                color: pal.terracotta,
              }}
            >
              —
            </span>
          </div>
        )}

        {/* Supporting line */}
        {support && (
          <div
            style={{
              ...supportReveal,
              textAlign: "center",
              maxWidth: 700,
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 36,
                fontStyle: "italic",
                color: pal.sub,
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}
            >
              {support}
            </div>
          </div>
        )}
      </div>

      {/* Ghost thesis word — massive background text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: sans,
          fontSize: 320,
          fontWeight: 900,
          color: pal.dark,
          opacity: interpolate(t, [4, 20], [0, 0.025], C),
          lineHeight: 0.8,
          letterSpacing: "-0.06em",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {thesis.split(" ")[0]}
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: `${lineGrow(frame, at + 10, 30)}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: pal.light,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "narr-thesis-bold",
  props: {
    thesis: "The GCC model made outsourcing obsolete.",
    support: "When you can own the talent, why rent it?",
    at: 15,
  },
  durationInFrames: 180,
};
