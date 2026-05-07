import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface FramedRightTextLeftProps extends BaseProps {
  image: ImageRef;
  headline: string;
  body?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Mirror composition: text LEFT with accent bar on left edge, FRAMED image RIGHT (48%).
 * Not a simple flip — the left-edge accent bar and tighter left padding
 * give this a distinct editorial rhythm from FramedLeftTextRight.
 */
export const FramedRightTextLeft: React.FC<FramedRightTextLeftProps> = ({
  image,
  headline,
  body,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const imgScale = kenBurns(f, FPS * 6);
  const accentWidth = lineGrow(frame, at + 16, 28);
  const barHeight = lineGrow(frame, at + 10, 22);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label top-left */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 80,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.muted,
            zIndex: 3,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Left accent bar — terracotta vertical edge */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: "50%",
          transform: "translateY(-50%)",
          width: 4,
          height: `${barHeight * 2.4}px`,
          maxHeight: 240,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Left column — text block */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "48%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 88,
          paddingRight: 40,
        }}
      >
        <div style={reveal(frame, at + 6)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1.08,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 620,
            }}
          >
            {headline}
          </div>
        </div>

        {/* Terracotta accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 140,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {body && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 28,
              lineHeight: 1.55,
              color: P.sub,
              marginTop: 22,
              maxWidth: 500,
            }}
          >
            {body}
          </div>
        )}
      </div>

      {/* Right column — framed image (46%) */}
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 64,
          bottom: 48,
          width: "46%",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          backgroundColor: P.light,
          ...reveal(frame, at + 4),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            opacity: 0.85,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-framed-right-text-left",
  "props": {
    "image": "demo.png",
    "headline": "Product Ownership",
    "body": "From execution to strategy — Indian leaders now hold global P&L responsibilities.",
    "categoryLabel": "OWNERSHIP",
    "at": 15
  },
  "durationInFrames": 150
};
