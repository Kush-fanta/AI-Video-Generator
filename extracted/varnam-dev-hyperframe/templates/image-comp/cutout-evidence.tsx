import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

interface EvidenceItem {
  image: ImageRef;
  label: string;
}

export interface CutoutEvidenceProps extends BaseProps {
  /** 1-4 evidence items pinned to board */
  items: EvidenceItem[];
  headline?: string;
  at?: number;
}

// Pin dot colors cycle through palette accents
const PIN_COLORS = [P.terracotta, P.sage, P.mauve, P.slate];

// Polaroid positions: tilts and offsets for up to 4 items
const POSITIONS: { x: number; y: number; rotate: number }[] = [
  { x: 120, y: 100, rotate: -4 },
  { x: 560, y: 80, rotate: 3 },
  { x: 200, y: 380, rotate: 2 },
  { x: 620, y: 360, rotate: -3 },
];

/**
 * Polaroid / evidence-board style: images in tilted white-bordered frames,
 * pinned with colored dots, handwritten-style labels below. Multiple items stack.
 */
export const CutoutEvidence: React.FC<CutoutEvidenceProps> = ({
  items,
  headline,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 10,
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: P.muted,
            opacity: interpolate(frame, [at, at + 8], [0, 1], C),
          }}
        >
          {headline}
        </div>
      )}

      {/* Evidence items */}
      {items.map((item, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        const stagger = at + i * 10;
        const dropY = interpolate(frame, [stagger, stagger + 5], [-40, 0], C);
        const opacity = interpolate(frame, [stagger, stagger + 4], [0, 1], C);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              transform: `translateY(${dropY}px) rotate(${pos.rotate}deg)`,
              opacity,
              zIndex: i + 1,
            }}
          >
            {/* Polaroid frame */}
            <div
              style={{
                backgroundColor: "#fff",
                padding: 10,
                paddingBottom: 40,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                width: 240,
              }}
            >
              <Img
                src={item.image}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Label */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 16,
                  color: P.text,
                  marginTop: 10,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {item.label}
              </div>
            </div>

            {/* Pin dot */}
            <div
              style={{
                position: "absolute",
                top: -8,
                left: "50%",
                marginLeft: -8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: PIN_COLORS[i % PIN_COLORS.length],
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-evidence",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "label": "Exhibit A"
      },
      {
        "image": "demo.png",
        "label": "Exhibit B"
      },
      {
        "image": "demo.png",
        "label": "Exhibit C"
      }
    ],
    "headline": "THE EVIDENCE",
    "at": 15
  },
  "durationInFrames": 180
};
