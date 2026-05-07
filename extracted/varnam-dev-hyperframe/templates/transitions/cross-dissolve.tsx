import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { lineGrow, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface CrossDissolveProps extends BaseProps {
  /** Optional small text — chapter number, ellipsis, or short phrase */
  text?: string;
  /** Duration of the dark hold in frames before line starts */
  holdFrames?: number;
  at?: number;
}

/**
 * CrossDissolve — Minimal structural transition.
 * Dark P.dark background. A thin horizontal line grows from center outward.
 * Optional small muted text. Meditative, clean beat.
 * Portrait 1080x1920 canvas.
 */
export const CrossDissolve: React.FC<CrossDissolveProps> = ({
  text,
  holdFrames = 10,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  /* ── background fade in ── */
  const bgOpacity = interpolate(f, [0, 8], [0, 1], C);

  /* ── center line grows outward from center ── */
  const lineStart = holdFrames;
  const lineW = lineGrow(f, lineStart, 35);

  /* ── text fades in after line begins ── */
  const textDelay = lineStart + 12;
  const textOpacity = interpolate(f, [textDelay, textDelay + 16], [0, 1], C);
  const textY = interpolate(
    f,
    [textDelay, textDelay + 16],
    [8, 0],
    { ...C, easing: ease },
  );

  /* ── everything fades out near end ── */
  const outStart = at + 80;
  const fadeOut = interpolate(frame, [outStart, outStart + 15], [1, 0], C);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.dark,
        opacity: bgOpacity * fadeOut,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Center horizontal line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${lineW * 0.6}%`,
          maxWidth: 400,
          height: 1.5,
          backgroundColor: P.muted,
          borderRadius: 1,
        }}
      />

      {/* Optional text below line */}
      {text && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, 24px) translateY(${textY}px)`,
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.14em",
            color: P.muted,
            textTransform: "uppercase",
            opacity: textOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-cross-dissolve",
  props: {
    text: "Chapter 2",
    holdFrames: 12
  },
  durationInFrames: 120,
};
