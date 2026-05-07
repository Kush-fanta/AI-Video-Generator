import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, overshootScale, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CutoutOverDataProps extends BaseProps {
  cutout: ImageRef;
  stat: string;
  statLabel: string;
  source?: string;
  at?: number;
}

/**
 * Cutout image overlapping a data element. Image left in rounded container with Ken Burns.
 * Data callout (number + label) overlaps bottom-right of the image in a frosted card.
 * Terracotta accent line on the callout. Ghost stat in background.
 */
export const CutoutOverData: React.FC<CutoutOverDataProps> = ({
  cutout,
  stat,
  statLabel,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const numScale = overshootScale(frame, at + 14);
  const imgScale = kenBurns(Math.max(0, frame - at - 4), FPS * 5);
  const accentW = lineGrow(frame, at + 18, 20);
  const ghostOpacity = interpolate(frame, [at + 10, at + 28], [0, 0.035], C);

  // Callout card slides up
  const calloutY = interpolate(frame, [at + 10, at + 24], [30, 0], { ...C, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  const calloutOpacity = interpolate(frame, [at + 10, at + 22], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost stat — background fill */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: -20,
          fontFamily: serif,
          fontSize: 400,
          lineHeight: 0.85,
          color: P.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.06em",
          userSelect: "none",
          pointerEvents: "none",
          textAlign: "right",
        }}
      >
        {stat}
      </div>

      {/* Top-left editorial marks */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          ...reveal(frame, at + 2),
          zIndex: 3,
        }}
      >
        <div style={{ width: 28, height: 1.5, backgroundColor: P.muted, opacity: 0.4 }} />
        <div style={{ width: 16, height: 1.5, backgroundColor: P.terracotta, opacity: 0.6 }} />
      </div>

      {/* Image — left side, large rounded container */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 80,
          width: 620,
          height: 740,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
          zIndex: 1,
          ...reveal(frame, at + 4),
        }}
      >
        <Img
          src={staticFile(cutout)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
          }}
        />
      </div>

      {/* Data callout card — overlaps bottom-right of image */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: 480,
          width: 480,
          backgroundColor: P.bg,
          borderRadius: 16,
          padding: "40px 44px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          border: `1px solid ${P.light}44`,
          zIndex: 2,
          opacity: calloutOpacity,
          transform: `translateY(${calloutY}px)`,
        }}
      >
        {/* Stat number */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 110,
            lineHeight: 0.9,
            color: P.text,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {stat}
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 1.5,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 22),
            fontFamily: sans,
            fontSize: 24,
            lineHeight: 1.45,
            color: P.sub,
            marginTop: 16,
            maxWidth: 360,
            fontWeight: 500,
          }}
        >
          {statLabel}
        </div>
      </div>

      {/* Vertical accent line right of callout */}
      <div
        style={{
          position: "absolute",
          top: "56%",
          right: 100,
          width: 1,
          height: `${lineGrow(frame, at + 16, 22) * 0.2}%`,
          maxHeight: 160,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />

      {/* Source bottom-left */}
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

export const demo = {
  "compositionId": "imgcomp-cutout-over-data",
  "props": {
    "cutout": "demo.png",
    "stat": "28%",
    "statLabel": "Global STEM workforce",
    "at": 15
  },
  "durationInFrames": 150
};
