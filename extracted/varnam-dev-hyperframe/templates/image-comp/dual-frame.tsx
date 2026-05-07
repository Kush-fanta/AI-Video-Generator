import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DualFrameProps extends BaseProps {
  leftImage: ImageRef;
  leftLabel: string;
  rightImage: ImageRef;
  rightLabel: string;
  connector?: string;
  at?: number;
}

/**
 * Two FRAMED images side by side for comparison.
 * Each in bounded container (540x360, rounded 14px, Ken Burns).
 * Labels below each. Divider between. Optional connector text (e.g. "vs", arrow).
 */
export const DualFrame: React.FC<DualFrameProps> = ({
  leftImage,
  leftLabel,
  rightImage,
  rightLabel,
  connector,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const leftScale = kenBurns(f, FPS * 6, 1.03, 1.08);
  const rightScale = kenBurns(f, FPS * 6, 1.08, 1.03); // opposite drift — starts zoomed in, slowly pulls back
  const dividerHeight = lineGrow(frame, at + 10, 22);

  // Asymmetric layout — intentional. Left image is the "anchor" (primary subject),
  // right image is the "response" (secondary/consequence). The 140px width delta
  // creates a deliberate visual hierarchy that reads as cause → effect or before → after.
  // Left: wider, taller — dominant. Right: narrower, slightly shorter — subordinate.
  const imgWLeft = 600;
  const imgWRight = 460;
  const imgHLeft = 400;
  const imgHRight = 320;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Centered two-up layout */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
        }}
      >
        {/* Left frame + label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...reveal(frame, at + 4),
          }}
        >
          <div
            style={{
              width: imgWLeft,
              height: imgHLeft,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
              backgroundColor: P.light,
            }}
          >
            <Img
              src={staticFile(leftImage)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${leftScale})`,
                opacity: 0.9,
              }}
            />
          </div>
          <div
            style={{
              ...reveal(frame, at + 16),
              fontFamily: sans,
              fontSize: 22,
              lineHeight: 1.4,
              color: P.sub,
              marginTop: 20,
              textAlign: "center",
              maxWidth: imgWLeft - 40,
            }}
          >
            {leftLabel}
          </div>
          {/* Dominant-side indicator — small terracotta dot under primary label */}
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: P.terracotta, marginTop: 10,
            opacity: reveal(frame, at + 18).opacity,
          }} />
        </div>

        {/* Center divider + connector */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {/* Vertical divider */}
          <div
            style={{
              width: 2,
              height: `${dividerHeight * 2.4}px`,
              maxHeight: 240,
              backgroundColor: P.light,
              borderRadius: 1,
            }}
          />

          {/* Connector text */}
          {connector && (
            <div
              style={{
                ...reveal(frame, at + 12),
                fontFamily: serif,
                fontSize: 64,
                color: P.terracotta,
                fontStyle: "italic",
              }}
            >
              {connector}
            </div>
          )}

          {/* Matching bottom divider */}
          <div
            style={{
              width: 2,
              height: `${dividerHeight * 2.4}px`,
              maxHeight: 240,
              backgroundColor: P.light,
              borderRadius: 1,
            }}
          />
        </div>

        {/* Right frame + label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...reveal(frame, at + 8),
          }}
        >
          <div
            style={{
              width: imgWRight,
              height: imgHRight,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 6px 28px rgba(0,0,0,0.08)",
              backgroundColor: P.light,
            }}
          >
            <Img
              src={staticFile(rightImage)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${rightScale})`,
                opacity: 0.75,
              }}
            />
          </div>
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 22,
              lineHeight: 1.4,
              color: P.sub,
              marginTop: 20,
              textAlign: "center",
              maxWidth: imgWRight - 40,
              opacity: 0.7,
            }}
          >
            {rightLabel}
          </div>
        </div>
      </div>

      {/* Decorative terracotta dot — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          ...(() => { const r = reveal(frame, at + 26); return { ...r, transform: `translateX(-50%) ${r.transform}` }; })(),
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-dual-frame",
  "props": {
    "leftImage": "demo.png",
    "leftLabel": "New York",
    "rightImage": "demo.png",
    "rightLabel": "Bangalore",
    "connector": "→",
    "at": 15
  },
  "durationInFrames": 150
};
