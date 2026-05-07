import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const DEFAULT_COLORS = ["#F5E6A3", "#F0D0D0", "#D0E0F0", "#D4E8D0"];

interface NoteItem {
  text: string;
  color?: string;
}

interface PostItStackProps extends BaseProps {
  notes: NoteItem[];
  at?: number;
}

/**
 * PostItStack — 2-4 overlapping sticky notes at slight rotations.
 * Each appears with spring scale (0->1) in sequence. Warm shadow
 * for depth. Colors: yellow, pink, blue, green defaults.
 * Portrait 1080x1920.
 */
export const PostItStack: React.FC<PostItStackProps> = ({
  notes,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const count = Math.min(notes.length, 4);
  const stagger = 12;

  // Predefined positions & rotations for up to 4 notes — scattered naturally
  const layouts = [
    { x: 140, y: 520, rot: -4 },
    { x: 540, y: 580, rot: 3 },
    { x: 200, y: 960, rot: 2 },
    { x: 500, y: 1020, rot: -5 },
  ];

  // Note dimensions
  const noteW = 400;
  const noteH = 380;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {notes.slice(0, count).map((note, i) => {
        const noteAt = i * stagger;
        const scaleSpring = spring({
          frame: Math.max(0, f - noteAt),
          fps: FPS,
          config: { damping: 12, stiffness: 120, mass: 0.6 },
        });
        const opacity = interpolate(f, [noteAt, noteAt + 8], [0, 1], C);
        const layout = layouts[i];
        const color = note.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: layout.x,
              top: layout.y,
              width: noteW,
              height: noteH,
              transform: `rotate(${layout.rot}deg) scale(${scaleSpring})`,
              transformOrigin: "50% 50%",
              opacity,
              zIndex: i + 1,
            }}
          >
            {/* Shadow layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              }}
            />

            {/* Note body */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: color,
                borderRadius: 4,
                padding: 36,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Subtle tape strip at top */}
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: noteW / 2 - 30,
                  width: 60,
                  height: 20,
                  backgroundColor: "rgba(255,255,255,0.45)",
                  borderRadius: 2,
                  transform: `rotate(${layout.rot > 0 ? -2 : 2}deg)`,
                }}
              />

              <div
                style={{
                  fontFamily: sans,
                  fontSize: 40,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: "#2A2622",
                  letterSpacing: "-0.01em",
                  wordWrap: "break-word",
                }}
              >
                {note.text}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-post-it-stack",
  props: {
    notes: [{ text: "Check NASSCOM data" }, { text: "Verify Fortune 30 claim" }, { text: "Add Zinnov source" }],
    at: 15,
  },
  durationInFrames: 180,
};
