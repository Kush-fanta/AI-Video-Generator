import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, ease } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface StackItem {
  image: ImageRef;
  label: string;
}

export interface CutoutStackProps extends BaseProps {
  items: [StackItem, StackItem, StackItem] | [StackItem, StackItem];
  headline: string;
  subtitle?: string;
  /** Stagger in frames between each item's entrance */
  stagger?: number;
  at?: number;
}

/**
 * 2-3 bgless PNGs stacked vertically with overlapping depth.
 * Each enters with staggered spring scale. Labels right-aligned beside each.
 * Creates a visual hierarchy / layers metaphor.
 */
export const CutoutStack: React.FC<CutoutStackProps> = ({
  items,
  headline,
  subtitle,
  stagger = 18,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = items.length;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline — top left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          zIndex: 10,
        }}
      >
        <div style={reveal(frame, at + 2)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1.05,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 500,
            }}
          >
            {headline}
          </div>
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 10, 22)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 1.5,
          }}
        />
        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 16),
              fontFamily: sans,
              fontSize: 22,
              color: P.sub,
              marginTop: 16,
              maxWidth: 400,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Stacked images — center-right, overlapping */}
      {items.map((item, i) => {
        const enterAt = at + 8 + i * stagger;
        const s = spring({
          frame: Math.max(0, frame - enterAt),
          fps,
          config: { damping: 14, stiffness: 80, mass: 0.6 },
        });
        const yOffset = count === 3
          ? [60, 260, 460][i]
          : [120, 380][i];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: yOffset,
              right: 120 + i * 30,
              display: "flex",
              alignItems: "center",
              gap: 32,
              zIndex: count - i,
              opacity: interpolate(frame, [enterAt, enterAt + 12], [0, 1], C),
              transform: `scale(${s})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: i === 0 ? P.terracotta : P.sub,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textAlign: "right",
                minWidth: 140,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                width: 280 - i * 30,
                height: 280 - i * 30,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: `0 ${12 + i * 4}px ${32 + i * 8}px rgba(0,0,0,${0.06 + i * 0.02})`,
                border: `1px solid ${P.light}33`,
                flexShrink: 0,
              }}
            >
              <Img
                src={staticFile(item.image)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Connecting spine line */}
      <div
        style={{
          position: "absolute",
          top: count === 3 ? 90 : 150,
          right: 260,
          width: 1,
          height: `${lineGrow(frame, at + 12, stagger * count + 10) * 0.5}%`,
          maxHeight: count === 3 ? 440 : 320,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-stack",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "label": "Aadhaar"
      },
      {
        "image": "demo.png",
        "label": "Jan Dhan"
      },
      {
        "image": "demo.png",
        "label": "UPI"
      }
    ],
    "headline": "The Stack",
    "subtitle": "Each layer depends on the one below it.",
    "at": 15
  },
  "durationInFrames": 180
};
