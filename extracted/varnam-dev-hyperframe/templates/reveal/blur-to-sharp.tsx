import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BlurToSharpProps extends BaseProps {
  content: string;
  sublabel?: string;
  focusAt?: number;
  at?: number;
}

/**
 * BlurToSharp — Content starts with heavy CSS blur and springs to clarity.
 * The moment of sharpening feels like a camera pulling focus.
 * Opacity transitions alongside blur for added depth.
 */
export const BlurToSharp: React.FC<BlurToSharpProps> = ({
  content,
  sublabel,
  focusAt = 18,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Blur starts heavy (24px) and springs to 0
  const focusProgress = f >= focusAt
    ? spring({
        frame: f - focusAt,
        fps,
        config: { damping: 14, stiffness: 70, mass: 1.0 },
        from: 0,
        to: 1,
      })
    : 0;

  // Pre-focus: content is visible but blurry (like out-of-focus bokeh)
  const preFocusOpacity = interpolate(f, [0, 8], [0, 0.6], C);

  // Blur amount: 24px -> 0px
  const blurAmount = interpolate(focusProgress, [0, 1], [24, 0]);

  // Opacity sharpens alongside focus
  const focusOpacity = interpolate(focusProgress, [0, 0.3, 1], [0.6, 0.85, 1]);

  // Combined opacity: pre-focus fade-in then focus sharpen
  const opacity = f < focusAt ? preFocusOpacity : focusOpacity;

  // Slight scale shift — camera rack focus often has slight zoom
  const scale = f >= focusAt
    ? spring({
        frame: f - focusAt,
        fps,
        config: { damping: 18, stiffness: 60, mass: 0.9 },
        from: 1.03,
        to: 1.0,
      })
    : 1.03;

  // Accent line after focus locks
  const accentWidth = lineGrow(frame, at + focusAt + 20, 22);

  // Background bokeh circles — large, soft, out of focus (decorative)
  const bokehCircles = [
    { x: 160, y: 400, size: 180, delay: 0 },
    { x: 780, y: 300, size: 120, delay: 4 },
    { x: 400, y: 1400, size: 200, delay: 2 },
    { x: 850, y: 1200, size: 100, delay: 6 },
    { x: 200, y: 1600, size: 140, delay: 3 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Bokeh circles — decorative bg elements that also blur */}
      {bokehCircles.map((circle, i) => {
        const cOpacity = interpolate(
          f,
          [circle.delay, circle.delay + 10, focusAt, focusAt + 20],
          [0, 0.08, 0.08, 0.03],
          C,
        );
        const cBlur = interpolate(focusProgress, [0, 1], [40, 60]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: circle.x,
              top: circle.y,
              width: circle.size,
              height: circle.size,
              borderRadius: "50%",
              backgroundColor: P.terracotta,
              opacity: cOpacity,
              filter: `blur(${cBlur}px)`,
            }}
          />
        );
      })}

      {/* Main content — blur-to-sharp */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          filter: `blur(${blurAmount}px)`,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 100,
            lineHeight: 1.1,
            color: P.text,
            textAlign: "center",
            maxWidth: 880,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {content}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 180,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {sublabel && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 24,
              textAlign: "center",
              maxWidth: 700,
              letterSpacing: "0.02em",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-blur-to-sharp",
  props: {
    content: "Brain Centre",
    sublabel: "India's new identity",
    focusAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
