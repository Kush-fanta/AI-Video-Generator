import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PeelBackProps extends BaseProps {
  topContent: string;
  revealedContent: string;
  peelAt?: number;
  at?: number;
}

/**
 * PeelBack — Top-right corner of the "page" peels back (triangular clip path
 * growing), revealing different-colored content underneath. The peeled corner
 * shows the back of the page (slightly darker). New content is terracotta on cream.
 * Feels like turning a page.
 */
export const PeelBack: React.FC<PeelBackProps> = ({
  topContent,
  revealedContent,
  peelAt = 25,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Top content entrance
  const topReveal = reveal(frame, at + 5);

  // Peel progress — spring-driven, starts from corner and grows
  const peelProgress = f >= peelAt
    ? spring({
        frame: f - peelAt,
        fps,
        config: { damping: 16, stiffness: 40, mass: 1.2 },
        from: 0,
        to: 1,
      })
    : 0;

  // Peel size — from 0 to full page coverage
  // The triangle grows from top-right corner
  const peelSize = interpolate(peelProgress, [0, 1], [0, 2800]); // diagonal px

  // Top page clip — inverse of peel (top page gets eaten away)
  // Triangle from top-right: the peel line goes from (1080-peelSize, 0) to (1080, peelSize)
  const px = Math.max(0, 1080 - peelSize);
  const py = Math.min(1920, peelSize);
  const topClip = `polygon(0% 0%, ${(px / 1080) * 100}% 0%, 0% ${(py / 1920) * 100}%, 0% 100%, 100% 100%, 100% 0%)`;

  // Revealed area clip — triangle in top-right
  const revealClip = `polygon(${(px / 1080) * 100}% 0%, 100% 0%, 100% ${(py / 1920) * 100}%)`;

  // Peel fold — the folded triangle (back of page)
  // It mirrors along the peel line — positioned as a smaller triangle
  const foldSize = peelSize * 0.35;
  const foldPx = Math.max(0, 1080 - foldSize);
  const foldPy = Math.min(1920, foldSize);

  // Fold opacity
  const foldOpacity = interpolate(peelProgress, [0, 0.1, 0.8, 1], [0, 0.8, 0.6, 0.5], C);

  // Revealed content opacity
  const revealedOpacity = interpolate(peelProgress, [0.2, 0.5], [0, 1], C);

  // Revealed content scale
  const revealedScale = f >= peelAt + 20
    ? spring({
        frame: f - peelAt - 20,
        fps,
        config: { damping: 14, stiffness: 80, mass: 0.8 },
        from: 0.95,
        to: 1.0,
      })
    : 0.95;

  // Top content fades as peel grows
  const topOpacity = interpolate(peelProgress, [0, 0.4, 0.8], [1, 0.7, 0.3], C);

  // Accent line under revealed content
  const accentWidth = lineGrow(frame, at + peelAt + 30, 25);

  // Shadow along the peel line
  const shadowOpacity = interpolate(peelProgress, [0, 0.3, 1], [0, 0.15, 0.08], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Revealed layer (underneath) — terracotta content */}
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
          opacity: revealedOpacity,
          transform: `scale(${revealedScale})`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.1,
            color: P.terracotta,
            textAlign: "center",
            maxWidth: 860,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {revealedContent}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 200,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 32,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Top page layer — clips away as peel grows */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: P.bg,
          clipPath: topClip,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: topOpacity,
        }}
      >
        <div style={topReveal}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.15,
              color: P.text,
              textAlign: "center",
              maxWidth: 800,
              padding: "0 80px",
              letterSpacing: "-0.02em",
            }}
          >
            {topContent}
          </div>
        </div>
      </div>

      {/* Peel fold — back of the page (darker shade) */}
      {peelProgress > 0.02 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: `polygon(${(foldPx / 1080) * 100}% 0%, 100% 0%, 100% ${(foldPy / 1920) * 100}%)`,
            backgroundColor: "#D5D0C8",
            opacity: foldOpacity,
          }}
        >
          {/* Subtle gradient on the fold */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, rgba(0,0,0,0.06) 0%, transparent 60%)`,
            }}
          />
        </div>
      )}

      {/* Shadow along the peel line */}
      {peelProgress > 0.02 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: peelSize * 0.08,
            height: peelSize * 0.08,
            background: `radial-gradient(ellipse at top right, rgba(0,0,0,${shadowOpacity}), transparent 70%)`,
            transform: `translate(${-peelSize * 0.3}px, ${peelSize * 0.3}px)`,
            pointerEvents: "none" as const,
          }}
        />
      )}

      {/* Corner curl hint — pre-peel teaser */}
      {peelProgress < 0.05 && f > 10 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 60,
            height: 60,
            background: `linear-gradient(135deg, transparent 50%, #D5D0C8 50%)`,
            opacity: interpolate(f, [10, 18], [0, 0.5], C),
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-peel-back",
  props: {
    topContent: "The Old Story",
    revealedContent: "The Real Story",
    peelAt: 35,
    at: 15,
  },
  durationInFrames: 180,
};
