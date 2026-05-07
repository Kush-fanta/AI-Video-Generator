import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MarginNoteProps extends BaseProps {
  mainText: string;
  annotation: string;
  /** Word index (0-based) in mainText where the connecting line originates */
  annotationAt?: number;
  at?: number;
}

/**
 * MarginNote — Main text on left (70% width) with a handwritten-feel
 * annotation in the right margin. A thin connecting line traces from
 * the anchor word to the margin note. Annotation in italic serif,
 * slightly smaller. Portrait 1080x1920.
 */
export const MarginNote: React.FC<MarginNoteProps> = ({
  mainText,
  annotation,
  annotationAt = 0,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Main text reveal
  const textReveal = reveal(frame, at);

  // Connecting line draws after text settles
  const lineAt = 22;
  const lineProgress = interpolate(f, [lineAt, lineAt + 20], [0, 1], C);

  // Annotation springs in after line is mostly drawn
  const noteAt = lineAt + 14;
  const noteSpring = spring({
    frame: Math.max(0, f - noteAt),
    fps: FPS,
    config: { damping: 14, stiffness: 90, mass: 0.7 },
  });
  const noteOpacity = interpolate(f, [noteAt, noteAt + 12], [0, 1], C);

  // Split mainText into words to find anchor position
  const words = mainText.split(" ");
  const anchorIdx = Math.min(annotationAt, words.length - 1);

  // Approximate anchor Y: assume ~6 words per line at our font size
  const wordsPerLine = 6;
  const anchorLine = Math.floor(anchorIdx / wordsPerLine);
  const lineHeight = 82; // px per line at 64px font
  const textTopOffset = 620; // vertical center area start
  const anchorY = textTopOffset + anchorLine * lineHeight + 40;

  // Line endpoints
  const lineStartX = 680;
  const lineEndX = 780;
  const lineMidX = lineStartX + (lineEndX - lineStartX) * 0.5;
  const noteY = anchorY - 20;

  // Draw the connecting line as an elbow
  const currentX = lineStartX + (lineEndX - lineStartX) * lineProgress;
  const elbowPath = lineProgress > 0
    ? `M ${lineStartX} ${anchorY} L ${Math.min(currentX, lineMidX)} ${anchorY}` +
      (lineProgress > 0.5
        ? ` L ${lineMidX} ${anchorY + (noteY - anchorY) * Math.min(1, (lineProgress - 0.5) * 2)} L ${currentX} ${noteY}`
        : "")
    : "";

  // Render words with the anchor word highlighted
  const renderWords = () =>
    words.map((word, i) => (
      <span
        key={i}
        style={{
          color: i === anchorIdx ? P.terracotta : P.text,
          fontWeight: i === anchorIdx ? 700 : 400,
        }}
      >
        {word}{i < words.length - 1 ? " " : ""}
      </span>
    ));

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Main text — left 70% */}
      <div
        style={{
          position: "absolute",
          top: textTopOffset,
          left: 80,
          width: 600,
          ...textReveal,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            lineHeight: 1.28,
            color: P.text,
            letterSpacing: "-0.01em",
          }}
        >
          {renderWords()}
        </div>
      </div>

      {/* Connecting line — SVG overlay */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {lineProgress > 0 && (
          <>
            <path
              d={elbowPath}
              fill="none"
              stroke={P.terracotta}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
            {/* Small dot at anchor point */}
            <circle
              cx={lineStartX}
              cy={anchorY}
              r={4}
              fill={P.terracotta}
              opacity={lineProgress}
            />
          </>
        )}
      </svg>

      {/* Margin annotation — right side */}
      <div
        style={{
          position: "absolute",
          top: noteY - 10,
          left: 790,
          width: 230,
          opacity: noteOpacity,
          transform: `translateY(${interpolate(noteSpring, [0, 1], [16, 0], C)}px)`,
        }}
      >
        {/* Thin left accent */}
        <div
          style={{
            position: "absolute",
            left: -12,
            top: 4,
            width: 2,
            height: 60,
            backgroundColor: P.terracotta,
            opacity: 0.5,
            borderRadius: 1,
          }}
        />
        <div
          style={{
            fontFamily: serif,
            fontSize: 40,
            fontStyle: "italic",
            lineHeight: 1.35,
            color: P.sub,
            letterSpacing: "0.01em",
          }}
        >
          {annotation}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-margin-note",
  props: {
    mainText: "India's GCC sector grew 3.3x in under a decade.",
    annotation: "Fastest growth rate globally",
    at: 15,
  },
  durationInFrames: 180,
};
