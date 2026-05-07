import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { mergePalette } from "../shared/palette";
import { reveal, lineGrow, overshootScale, kenBurns, FPS, C as Clamp } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface StatHeroWithImageProps extends BaseProps {
  value: string;
  label: string;
  image: ImageRef;
  source?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Hero stat with image. Top zone: category label. Middle-left: massive number (260px)
 * with overshoot scale, label below. Image in rounded container right side with Ken Burns.
 * Terracotta vertical accent between stat and image. Source bottom-left.
 */
export const StatHeroWithImage: React.FC<StatHeroWithImageProps> = ({
  value,
  label,
  image,
  source,
  categoryLabel,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const CP = mergePalette(palette);
  const heroScale = overshootScale(frame, at + 6);
  const accentW = lineGrow(frame, at + 14, 22);
  const ghostOpacity = interpolate(frame, [at + 10, at + 26], [0, 0.035], Clamp);
  const imgScale = kenBurns(Math.max(0, frame - at - 8), FPS * 5);
  const dividerH = lineGrow(frame, at + 10, 28);

  return (
    <AbsoluteFill style={{ backgroundColor: CP.bg }}>
      {/* Ghost value — massive backdrop */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: -30,
          fontFamily: serif,
          fontSize: 520,
          lineHeight: 0.8,
          color: CP.dark,
          opacity: ghostOpacity,
          letterSpacing: "-0.07em",
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
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CP.muted,
            }}
          >
            {categoryLabel}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 14)}%`,
              maxWidth: 56,
              height: 2,
              backgroundColor: CP.terracotta,
              marginTop: 10,
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Stat block — left, vertically centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 560,
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
            ...reveal(frame, at + 4),
            transform: `scale(${heroScale})`,
            transformOrigin: "left baseline",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 260,
              lineHeight: 0.85,
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
            maxWidth: 100,
            height: 3,
            backgroundColor: CP.terracotta,
            marginTop: 28,
            borderRadius: 1.5,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, at + 16),
            fontFamily: sans,
            fontSize: 30,
            lineHeight: 1.45,
            color: CP.sub,
            marginTop: 20,
            maxWidth: 400,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Vertical terracotta divider between stat and image */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: 560,
          width: 2,
          height: `${dividerH * 0.44}%`,
          maxHeight: 500,
          backgroundColor: CP.terracotta,
          opacity: 0.45,
          borderRadius: 1,
          zIndex: 3,
        }}
      />

      {/* Image — right side, rounded container */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          right: 80,
          width: 420,
          height: 560,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          zIndex: 2,
          ...reveal(frame, at + 8),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
          }}
        />
      </div>

      {/* Small decorative lines top-right of image */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          right: 80,
          display: "flex",
          gap: 6,
          ...reveal(frame, at + 20),
          zIndex: 3,
        }}
      >
        <div style={{ width: 28, height: 2, backgroundColor: CP.light, opacity: 0.5 }} />
        <div style={{ width: 14, height: 2, backgroundColor: CP.terracotta, opacity: 0.6 }} />
      </div>

      {/* Source bottom-left */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 100,
            ...reveal(frame, at + 30),
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

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 100,
          width: `${lineGrow(frame, at + 24, 26)}%`,
          maxWidth: 260,
          height: 1,
          backgroundColor: CP.light,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-stat-hero-with-image",
  "props": {
    "value": "1,850",
    "label": "GCCs in India",
    "image": "demo-cutout.png",
    "source": "Economic Survey 2024-25",
    "categoryLabel": "THE SCALE",
    "at": 15
  },
  "durationInFrames": 150
};
