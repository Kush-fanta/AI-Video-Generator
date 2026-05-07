import { AbsoluteFill, useCurrentFrame, Img, staticFile, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface SplitScreenPushProps extends BaseProps {
  image: ImageRef;
  stat?: string;
  title: string;
  body?: string;
  source?: string;
  at?: number;
}

/**
 * Two-panel split. Left panel: image with Ken Burns. Right panel: text/stat content.
 * Vertical terracotta divider line between panels. Left pushes in from left, right from right.
 * Clean, balanced editorial composition.
 */
export const SplitScreenPush: React.FC<SplitScreenPushProps> = ({
  image,
  stat,
  title,
  body,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const imgScale = kenBurns(f, FPS * 6);

  // Left panel pushes in from left
  const leftPush = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 60, mass: 1 },
  });
  const leftX = interpolate(leftPush, [0, 1], [-200, 0], C);

  // Right panel pushes in from right, slightly delayed
  const rightPush = spring({
    frame: Math.max(0, f - 8),
    fps: FPS,
    config: { damping: 20, stiffness: 60, mass: 1 },
  });
  const rightX = interpolate(rightPush, [0, 1], [200, 0], C);

  // Divider fades in after both panels settle
  const dividerOpacity = interpolate(f, [18, 28], [0, 1], C);
  const dividerH = lineGrow(frame, at + 16, 30);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* Left panel — image */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: 80,
          width: 460,
          height: 700,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 20px 56px rgba(0,0,0,0.07)",
          transform: `translateX(${leftX}px)`,
          zIndex: 1,
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

      {/* Vertical terracotta divider */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 540,
          width: 2,
          height: `${dividerH * 0.36}%`,
          maxHeight: 500,
          backgroundColor: P.terracotta,
          opacity: dividerOpacity * 0.5,
          borderRadius: 1,
          zIndex: 3,
        }}
      />

      {/* Right panel — text/stat content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 580,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 40,
          paddingRight: 80,
          transform: `translateX(${rightX}px)`,
          zIndex: 2,
        }}
      >
        {/* Stat if provided */}
        {stat && (
          <div
            style={{
              ...reveal(frame, at + 12),
              fontFamily: serif,
              fontSize: 120,
              lineHeight: 0.9,
              color: P.text,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            {stat}
          </div>
        )}

        {/* Terracotta accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 16, 22)}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 1.5,
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <div
          style={{
            ...reveal(frame, at + 14),
            fontFamily: serif,
            fontSize: 56,
            lineHeight: 1.1,
            color: P.text,
            letterSpacing: "-0.02em",
            maxWidth: 380,
          }}
        >
          {title}
        </div>

        {/* Body text */}
        {body && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 22,
              lineHeight: 1.55,
              color: P.sub,
              marginTop: 20,
              maxWidth: 360,
            }}
          >
            {body}
          </div>
        )}
      </div>

      {/* Top-left editorial mark */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          ...reveal(frame, at + 4),
          zIndex: 3,
        }}
      >
        <div style={{ width: 24, height: 1.5, backgroundColor: P.muted, opacity: 0.4 }} />
        <div style={{ width: 14, height: 1.5, backgroundColor: P.terracotta, opacity: 0.5 }} />
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
            color: P.muted,
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
          width: `${lineGrow(frame, at + 26, 24) * 0.3}%`,
          maxWidth: 240,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-split-screen-push",
  "props": {
    "image": "demo.png",
    "title": "From Back Office to Brain Centre",
    "body": "Indian GCC centres now lead global R&D across AI, cybersecurity, and platform architecture.",
    "stat": "1,850",
    "at": 15
  },
  "durationInFrames": 180
};
