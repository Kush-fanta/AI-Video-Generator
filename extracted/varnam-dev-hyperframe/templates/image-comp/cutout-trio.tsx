import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TrioItem {
  image: ImageRef;
  label?: string;
}

export interface CutoutTrioProps extends BaseProps {
  items: [TrioItem, TrioItem, TrioItem];
  heading?: string;
  at?: number;
}

/**
 * Three images in editorial grid. One large left, two stacked right.
 * Rounded corners, slight Ken Burns on each. Minimal labels below images.
 * Staggered reveal timing. Terracotta accent on heading.
 */
export const CutoutTrio: React.FC<CutoutTrioProps> = ({
  items,
  heading,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const scale0 = kenBurns(Math.max(0, frame - at - 6), FPS * 6);
  const scale1 = kenBurns(Math.max(0, frame - at - 14), FPS * 6);
  const scale2 = kenBurns(Math.max(0, frame - at - 22), FPS * 6);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Heading top-left */}
      {heading && (
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
              fontFamily: serif,
              fontSize: 48,
              lineHeight: 1.1,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 500,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 8, 20)}%`,
              maxWidth: 80,
              height: 2.5,
              backgroundColor: P.terracotta,
              marginTop: 16,
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Large image — left, takes 60% width */}
      <div
        style={{
          position: "absolute",
          top: heading ? 240 : 160,
          left: 80,
          width: 560,
          height: 780,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 56px rgba(0,0,0,0.07)",
          zIndex: 1,
          ...reveal(frame, at + 6),
        }}
      >
        <Img
          src={staticFile(items[0].image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale0})`,
          }}
        />
      </div>

      {/* Label for large image */}
      {items[0].label && (
        <div
          style={{
            position: "absolute",
            top: heading ? 1040 : 960,
            left: 80,
            ...reveal(frame, at + 16),
            fontFamily: sans,
            fontSize: 18,
            color: P.sub,
            fontWeight: 500,
            letterSpacing: "0.04em",
            zIndex: 2,
          }}
        >
          {items[0].label}
        </div>
      )}

      {/* Top-right image — stacked smaller */}
      <div
        style={{
          position: "absolute",
          top: heading ? 240 : 160,
          right: 80,
          width: 340,
          height: 370,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
          zIndex: 1,
          ...reveal(frame, at + 14),
        }}
      >
        <Img
          src={staticFile(items[1].image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale1})`,
          }}
        />
      </div>

      {/* Label for top-right */}
      {items[1].label && (
        <div
          style={{
            position: "absolute",
            top: heading ? 620 : 540,
            right: 80,
            ...reveal(frame, at + 24),
            fontFamily: sans,
            fontSize: 16,
            color: P.muted,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textAlign: "right",
            zIndex: 2,
            width: 340,
          }}
        >
          {items[1].label}
        </div>
      )}

      {/* Bottom-right image — stacked below */}
      <div
        style={{
          position: "absolute",
          top: heading ? 660 : 580,
          right: 80,
          width: 340,
          height: 360,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
          zIndex: 1,
          ...reveal(frame, at + 22),
        }}
      >
        <Img
          src={staticFile(items[2].image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale2})`,
          }}
        />
      </div>

      {/* Label for bottom-right */}
      {items[2].label && (
        <div
          style={{
            position: "absolute",
            top: heading ? 1040 : 960,
            right: 80,
            ...reveal(frame, at + 30),
            fontFamily: sans,
            fontSize: 16,
            color: P.muted,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textAlign: "right",
            width: 340,
            zIndex: 2,
          }}
        >
          {items[2].label}
        </div>
      )}

      {/* Bottom-left decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          width: `${lineGrow(frame, at + 28, 24) * 0.3}%`,
          maxWidth: 200,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />

      {/* Terracotta dot bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 76,
          left: 80,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          ...reveal(frame, at + 32),
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-trio",
  "props": {
    "items": [
      {
        "image": "demo.png",
        "label": "Customer Support"
      },
      {
        "image": "demo.png",
        "label": "Payroll"
      },
      {
        "image": "demo.png",
        "label": "Tickets"
      }
    ],
    "heading": "India was the call.",
    "at": 15
  },
  "durationInFrames": 180
};
