import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

interface StripItem {
  image: ImageRef;
  label?: string;
}

export interface CutoutStripProps extends BaseProps {
  /** 4-5 cutout images shown as vertical strips */
  items: StripItem[];
  headline?: string;
  at?: number;
}

/**
 * 4-5 narrow vertical strips, each a different cutout, staggered reveal
 * left to right. Film-strip / contact-sheet energy.
 */
export const CutoutStrip: React.FC<CutoutStripProps> = ({
  items,
  headline,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const count = items.length;
  const stripWidth = 100 / count;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline top-left */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            zIndex: 10,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            color: P.muted,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            opacity: interpolate(frame, [at, at + 10], [0, 1], C),
          }}
        >
          {headline}
        </div>
      )}

      {/* Strips */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          gap: 6,
          padding: "0 40px",
        }}
      >
        {items.map((item, i) => {
          const stagger = at + i * 8;
          const clipY = interpolate(frame, [stagger, stagger + 6], [100, 0], C);
          const opacity = interpolate(frame, [stagger, stagger + 4], [0, 1], C);

          return (
            <div
              key={i}
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                opacity,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `translateY(${clipY}%)`,
                }}
              >
                <Img
                  src={item.image}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              {item.label && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 12,
                    right: 12,
                    fontFamily: sans,
                    fontSize: 16,
                    color: P.bg,
                    textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                    opacity: interpolate(frame, [stagger + 10, stagger + 14], [0, 1], C),
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-strip",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "label": "AI"
      },
      {
        "image": "demo.png",
        "label": "Cyber"
      },
      {
        "image": "demo.png",
        "label": "Platform"
      },
      {
        "image": "demo.png",
        "label": "Product"
      }
    ],
    "headline": "CAPABILITIES",
    "at": 15
  },
  "durationInFrames": 180
};
