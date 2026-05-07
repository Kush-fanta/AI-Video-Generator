import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface WantedPosterProps extends BaseProps {
  name: string;
  charge: string;
  reward?: string;
  image?: string;
  at?: number;
}

/**
 * WantedPoster — "WANTED" in large distressed-feel uppercase sans at top.
 * A frame/border area for image (or gray placeholder). Subject name below
 * in serif. "For:" followed by the charge/description. Reward at bottom.
 * Dark bg (P.dark), aged paper feel with warm tones.
 */
export const WantedPoster: React.FC<WantedPosterProps> = ({
  name,
  charge,
  reward,
  image,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;

  // "WANTED" slams in with scale overshoot
  const wantedT = t - 4;
  const wantedScale = wantedT >= 0
    ? interpolate(wantedT, [0, 3, 7, 12], [1.3, 0.96, 1.02, 1.0], C)
    : 0;
  const wantedOpacity = interpolate(wantedT, [0, 3], [0, 1], C);

  // Image frame springs in
  const frameProgress = t >= 16
    ? spring({ frame: t - 16, fps: FPS, config: { damping: 14, mass: 1.0, stiffness: 110 } })
    : 0;
  const frameOpacity = interpolate(frameProgress, [0, 0.3], [0, 1], C);
  const frameScale = interpolate(frameProgress, [0, 1], [0.95, 1.0], C);

  // Name entrance
  const nameReveal = reveal(frame, at + 30, 16);

  // Charge entrance
  const chargeReveal = reveal(frame, at + 38, 16);

  // Reward entrance
  const rewardReveal = reveal(frame, at + 48, 14);

  // Horizontal rules
  const topRuleW = lineGrow(frame, at + 10, 18);
  const bottomRuleW = lineGrow(frame, at + 44, 18);

  // Aged paper overlay — subtle noise-like pattern via multiple faded dots
  const paperGrain = interpolate(t, [0, 20], [0, 0.04], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Aged paper warm overlay */}
      <div
        style={{
          position: "absolute",
          inset: 60,
          backgroundColor: "#2A2420",
          borderRadius: 4,
          opacity: interpolate(t, [0, 14], [0, 0.6], C),
        }}
      />

      {/* Content container — poster layout */}
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
          paddingTop: 140,
          paddingBottom: 120,
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        {/* "WANTED" header */}
        <div
          style={{
            fontFamily: sans,
            fontSize: 100,
            fontWeight: 900,
            color: P.terracotta,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            lineHeight: 1,
            opacity: wantedOpacity,
            transform: `scale(${wantedScale})`,
            transformOrigin: "center center",
          }}
        >
          WANTED
        </div>

        {/* Top horizontal rule */}
        <div
          style={{
            width: `${topRuleW}%`,
            maxWidth: 700,
            height: 2,
            backgroundColor: P.terracotta,
            opacity: 0.5,
            marginTop: 24,
            marginBottom: 40,
          }}
        />

        {/* Image frame / placeholder */}
        <div
          style={{
            width: 560,
            height: 560,
            border: `3px solid ${P.muted}`,
            borderRadius: 4,
            overflow: "hidden",
            opacity: frameOpacity,
            transform: `scale(${frameScale})`,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(90, 80, 70, 0.3)",
          }}
        >
          {image ? (
            <Img
              src={image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            /* Gray placeholder with silhouette feel */
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                backgroundColor: "rgba(155, 148, 139, 0.2)",
                border: `2px dashed ${P.muted}`,
              }}
            />
          )}
        </div>

        {/* Subject name */}
        <div
          style={{
            ...nameReveal,
            marginTop: 40,
          }}
        >
          <span
            style={{
              fontFamily: serif,
              fontSize: 72,
              color: P.bg,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            {name}
          </span>
        </div>

        {/* Charge */}
        <div
          style={{
            ...chargeReveal,
            marginTop: 20,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              color: P.terracotta,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
            }}
          >
            FOR:{" "}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 34,
              fontWeight: 500,
              color: P.light,
              lineHeight: 1.4,
            }}
          >
            {charge}
          </span>
        </div>

        {/* Bottom horizontal rule */}
        <div
          style={{
            width: `${bottomRuleW}%`,
            maxWidth: 600,
            height: 1,
            backgroundColor: P.muted,
            opacity: 0.3,
            marginTop: 36,
            marginBottom: 28,
          }}
        />

        {/* Reward */}
        {reward && (
          <div
            style={{
              ...rewardReveal,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 700,
                color: P.muted,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                marginBottom: 8,
              }}
            >
              REWARD
            </div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 52,
                color: P.terracotta,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {reward}
            </div>
          </div>
        )}
      </div>

      {/* Corner decorations — aged poster feel */}
      {[
        { top: 60, left: 60 },
        { top: 60, right: 60 },
        { bottom: 60, left: 60 },
        { bottom: 60, right: 60 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 20,
            height: 20,
            borderTop: i < 2 ? `2px solid ${P.muted}` : "none",
            borderBottom: i >= 2 ? `2px solid ${P.muted}` : "none",
            borderLeft: i % 2 === 0 ? `2px solid ${P.muted}` : "none",
            borderRight: i % 2 === 1 ? `2px solid ${P.muted}` : "none",
            opacity: interpolate(t, [8, 18], [0, 0.4], C),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-wanted-poster",
  props: {
    name: "The Outsourcing Model",
    charge: "Making India a cost centre for 20 years",
    reward: "Replaced by GCC innovation",
    at: 15,
  },
  durationInFrames: 180,
};
