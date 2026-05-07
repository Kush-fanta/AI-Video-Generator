import { AbsoluteFill, useCurrentFrame, Img, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export interface CutoutShatterProps extends BaseProps {
  /** Transparent PNG that shatters */
  bglessImageSrc: ImageRef;
  headline: string;
  label?: string;
  /** Frame at which shatter occurs */
  pivotAt?: number;
  at?: number;
}

/**
 * Image enters clean, then at pivotAt splits into 4 quadrants that drift apart
 * while new text appears in the gaps. Destruction metaphor.
 */
export const CutoutShatter: React.FC<CutoutShatterProps> = ({
  bglessImageSrc,
  headline,
  label,
  pivotAt = 50,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [at, at + 5], [0, 1], C);
  const enterScale = interpolate(frame, [at, at + 5], [1.1, 1.0], C);

  // Shatter drift distance
  const drift = interpolate(frame, [pivotAt, pivotAt + 20], [0, 1], C);
  const shattered = frame >= pivotAt;

  // 4 quadrant offsets: [x, y] directions
  const quadrants: [number, number, string, string][] = [
    [-1, -1, "0%", "0%"],   // top-left
    [1, -1, "50%", "0%"],   // top-right
    [-1, 1, "0%", "50%"],   // bottom-left
    [1, 1, "50%", "50%"],   // bottom-right
  ];

  const driftPx = drift * 80;
  const quadRotation = drift * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Image container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${enterScale})`,
          width: 560,
          height: 560,
          opacity: enterOpacity,
          zIndex: 1,
        }}
      >
        {!shattered ? (
          <Img
            src={bglessImageSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          quadrants.map(([dx, dy, left, top], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top,
                width: "50%",
                height: "50%",
                overflow: "hidden",
                transform: `translate(${dx * driftPx}px, ${dy * driftPx}px) rotate(${dx * dy * quadRotation}deg)`,
                opacity: interpolate(frame, [pivotAt + 15, pivotAt + 30], [1, 0.7], C),
              }}
            >
              <Img
                src={bglessImageSrc}
                style={{
                  position: "absolute",
                  left: left === "0%" ? 0 : "-100%",
                  top: top === "0%" ? 0 : "-100%",
                  width: 560,
                  height: 560,
                  objectFit: "contain",
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Text appears in the gaps after shatter */}
      {shattered && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 2,
            textAlign: "center",
            ...reveal(frame, pivotAt + 10),
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 60,
              color: P.terracotta,
              lineHeight: 1.1,
              maxWidth: 500,
            }}
          >
            {headline}
          </div>
          {label && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 24,
                color: P.sub,
                marginTop: 16,
                ...reveal(frame, pivotAt + 20),
              }}
            >
              {label}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-shatter",
  "props": {
    "bglessImageSrc": "demo.png",
    "headline": "Everything breaks",
    "label": "And something new appears",
    "pivotAt": 50,
    "at": 15
  },
  "durationInFrames": 180
};
