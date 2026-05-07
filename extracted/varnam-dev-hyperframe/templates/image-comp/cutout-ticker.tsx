import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

interface TickerItem {
  image: ImageRef;
  label?: string;
}

export interface CutoutTickerProps extends BaseProps {
  /** 4-6 cutout images for horizontal scroll */
  items: TickerItem[];
  headline?: string;
  at?: number;
}

/**
 * Horizontal scrolling row of cutout images (4-6), continuous movement.
 * News ticker energy for entity lists.
 */
export const CutoutTicker: React.FC<CutoutTickerProps> = ({
  items,
  headline,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [at, at + 8], [0, 1], C);
  // Continuous scroll: moves left over time
  const scrollX = interpolate(frame, [at, at + 200], [0, -items.length * 100], {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "extend" as const,
  });

  const itemWidth = 260;
  const itemGap = 24;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, opacity: fadeIn }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 80,
            zIndex: 2,
            ...reveal(frame, at + 4),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 52,
              color: P.text,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              width: 80,
              height: 3,
              backgroundColor: P.terracotta,
              marginTop: 16,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Ticker row — vertically centered lower half */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          width: "100%",
          height: 300,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: itemGap,
            height: "100%",
            transform: `translateX(${80 + scrollX}px)`,
            willChange: "transform",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: itemWidth,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Img
                src={item.image}
                style={{
                  width: itemWidth,
                  height: 240,
                  objectFit: "contain",
                  objectPosition: "bottom center",
                }}
              />
              {item.label && (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 18,
                    color: P.sub,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-ticker",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "label": "Entity A"
      },
      {
        "image": "demo.png",
        "label": "Entity B"
      },
      {
        "image": "demo.png",
        "label": "Entity C"
      },
      {
        "image": "demo.png",
        "label": "Entity D"
      },
      {
        "image": "demo.png",
        "label": "Entity E"
      }
    ],
    "headline": "The Players",
    "at": 15
  },
  "durationInFrames": 180
};
