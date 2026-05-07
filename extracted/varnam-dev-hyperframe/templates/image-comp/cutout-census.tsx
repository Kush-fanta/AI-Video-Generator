import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, overshootScale, C, ease } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface CensusItem {
  image: ImageRef;
  stat: string;
  label: string;
}

export interface CutoutCensusProps extends BaseProps {
  items: [CensusItem, CensusItem] | [CensusItem, CensusItem, CensusItem];
  headline?: string;
  source?: string;
  stagger?: number;
  at?: number;
}

/**
 * Census/survey layout: 2-3 bgless PNGs in a horizontal row, each with
 * a stat number below. Editorial data viz meets portraiture.
 * Each cutout enters with spring, stat number with overshoot.
 */
export const CutoutCensus: React.FC<CutoutCensusProps> = ({
  items,
  headline,
  source,
  stagger = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = items.length;

  const colWidth = count === 3 ? "28%" : "36%";
  const gap = count === 3 ? 60 : 120;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline top-left */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 72,
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
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: P.muted,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 16)}%`,
              maxWidth: 60,
              height: 2,
              backgroundColor: P.terracotta,
              marginTop: 10,
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Items row */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: 0,
          width: "100%",
          height: "72%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap,
          padding: "0 80px",
        }}
      >
        {items.map((item, i) => {
          const enterAt = at + 8 + i * stagger;
          const s = spring({
            frame: Math.max(0, frame - enterAt),
            fps,
            config: { damping: 14, stiffness: 80, mass: 0.5 },
          });
          const numScale = overshootScale(frame, enterAt + 14);

          return (
            <div
              key={i}
              style={{
                width: colWidth,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: interpolate(frame, [enterAt, enterAt + 12], [0, 1], C),
                transform: `scale(${s})`,
                transformOrigin: "bottom center",
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: "100%",
                  height: count === 3 ? 380 : 440,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Img
                  src={staticFile(item.image)}
                  style={{
                    maxWidth: "90%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>

              {/* Stat */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 56,
                  lineHeight: 1,
                  color: i === 0 ? P.terracotta : P.text,
                  marginTop: 24,
                  letterSpacing: "-0.02em",
                  transform: `scale(${numScale})`,
                  transformOrigin: "center center",
                }}
              >
                {item.stat}
              </div>

              {/* Label */}
              <div
                style={{
                  ...reveal(frame, enterAt + 20),
                  fontFamily: sans,
                  fontSize: 20,
                  color: P.sub,
                  marginTop: 10,
                  textAlign: "center",
                  lineHeight: 1.4,
                  maxWidth: 280,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 100,
            ...reveal(frame, at + 8 + count * stagger + 10),
            fontFamily: sans,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-census",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "stat": "520M",
        "label": "Jan Dhan accounts"
      },
      {
        "image": "demo.png",
        "stat": "1.4B",
        "label": "Aadhaar registrations"
      },
      {
        "image": "demo.png",
        "stat": "16.6B",
        "label": "UPI transactions/mo"
      }
    ],
    "headline": "The Numbers",
    "source": "RBI, UIDAI, NPCI",
    "at": 15
  },
  "durationInFrames": 180
};
