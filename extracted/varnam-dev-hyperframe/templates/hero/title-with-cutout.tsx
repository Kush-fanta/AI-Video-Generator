import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface TitleWithCutoutProps extends BaseProps {
  title: string;
  subtitle?: string;
  cutout: ImageRef;
  categoryLabel?: string;
  at?: number;
}

/**
 * Title card with cutout image. Category label top-left. Title large serif left (100px).
 * Image right in editorial rounded frame with slight shadow. Terracotta accent line
 * below title. Subtitle in muted sans. Clean asymmetric layout.
 */
export const TitleWithCutout: React.FC<TitleWithCutoutProps> = ({
  title,
  subtitle,
  cutout,
  categoryLabel = "Feature",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const accentW = lineGrow(frame, at + 14, 26);
  const imgScale = kenBurns(Math.max(0, frame - at - 6), FPS * 5, 1.0, 1.04);
  const ghostOpacity = interpolate(frame, [at + 12, at + 28], [0, 0.03], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ghost title — large faded in background */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: -20,
          fontFamily: serif,
          fontSize: 200,
          lineHeight: 0.95,
          color: P.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.05em",
          maxWidth: 900,
          userSelect: "none",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {title}
      </div>

      {/* Category label top-left */}
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
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 5, 14)}%`,
            maxWidth: 56,
            height: 2,
            backgroundColor: P.terracotta,
            marginTop: 10,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Title block — left, upper-center vertical position */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: 100,
          width: 540,
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 6)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 100,
              lineHeight: 1.02,
              color: P.text,
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </div>
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${accentW}%`,
            maxWidth: 140,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 1.5,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 22,
              maxWidth: 440,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Image — right side, editorial rounded frame */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          right: 80,
          width: 400,
          height: 520,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)",
          zIndex: 2,
          ...reveal(frame, at + 8),
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

      {/* Thin vertical rule to right of image frame */}
      <div
        style={{
          position: "absolute",
          top: "36%",
          right: 56,
          width: 1,
          height: `${lineGrow(frame, at + 12, 24) * 0.28}%`,
          maxHeight: 200,
          backgroundColor: P.light,
          opacity: 0.35,
        }}
      />

      {/* Bottom-left decorative dot + rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: P.terracotta,
            ...reveal(frame, at + 26),
          }}
        />
        <div
          style={{
            width: `${lineGrow(frame, at + 24, 22) * 1.8}px`,
            maxWidth: 180,
            height: 1,
            backgroundColor: P.light,
            opacity: 0.4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-title-with-cutout",
  "props": {
    "title": "GCC India",
    "subtitle": "Global Capability Centres",
    "cutout": "demo-cutout.png",
    "at": 15
  },
  "durationInFrames": 150
};
