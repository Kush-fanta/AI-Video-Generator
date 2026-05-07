import { AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C, ease } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CutoutBeforeAfterProps extends BaseProps {
  beforeImage: ImageRef;
  afterImage: ImageRef;
  beforeLabel: string;
  afterLabel: string;
  headline?: string;
  /** Frame when the "after" side takes over */
  pivotAt?: number;
  at?: number;
}

/**
 * Before/after comparison using two bgless PNGs.
 * Left: "before" image dims at pivot. Right: "after" image enters with spring.
 * Terracotta accent shifts from left to right at pivot.
 */
export const CutoutBeforeAfter: React.FC<CutoutBeforeAfterProps> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  headline,
  pivotAt = 50,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const isPast = frame >= at + pivotAt;

  const beforeOpacity = isPast
    ? interpolate(frame, [at + pivotAt, at + pivotAt + 10], [1, 0.25], C)
    : interpolate(frame, [at + 4, at + 16], [0, 1], C);

  const afterOpacity = interpolate(frame, [at + pivotAt, at + pivotAt + 14], [0, 1], C);
  const afterY = interpolate(frame, [at + pivotAt, at + pivotAt + 14], [20, 0], { ...C, easing: ease });

  const dividerX = isPast
    ? interpolate(frame, [at + pivotAt, at + pivotAt + 18], [50, 38], { ...C, easing: ease })
    : 50;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline top center */}
      {headline && (
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 0,
            width: "100%",
            textAlign: "center",
            ...reveal(frame, at + 2),
            zIndex: 3,
          }}
        >
          <div
            style={{
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
        </div>
      )}

      {/* Before — left side */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: 80,
          width: "38%",
          height: "64%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          opacity: beforeOpacity,
        }}
      >
        <Img
          src={staticFile(beforeImage)}
          style={{
            maxWidth: "100%",
            maxHeight: "82%",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            color: isPast ? P.light : P.sub,
            marginTop: 20,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
            transition: "color 0.3s",
          }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: `${dividerX}%`,
          width: 1,
          height: `${lineGrow(frame, at + 8, 20) * 0.56}%`,
          maxHeight: "56%",
          backgroundColor: P.light,
          opacity: 0.5,
        }}
      />

      {/* After — right side */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          right: 80,
          width: "42%",
          height: "64%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          opacity: afterOpacity,
          transform: `translateY(${afterY}px)`,
        }}
      >
        <Img
          src={staticFile(afterImage)}
          style={{
            maxWidth: "100%",
            maxHeight: "82%",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            color: P.terracotta,
            marginTop: 20,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {afterLabel}
        </div>
      </div>

      {/* Terracotta accent — shifts right at pivot */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: isPast ? "55%" : "15%",
          width: `${lineGrow(frame, at + 14, 22)}%`,
          maxWidth: 120,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 1.5,
          transition: "left 0.5s ease",
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-cutout-before-after",
  "props": {
    "beforeImage": "demo.png",
    "afterImage": "demo.png",
    "beforeLabel": "NEFT, 3-5 days",
    "afterLabel": "UPI, instant",
    "headline": "Settlement Speed",
    "pivotAt": 50,
    "at": 15
  },
  "durationInFrames": 180
};
