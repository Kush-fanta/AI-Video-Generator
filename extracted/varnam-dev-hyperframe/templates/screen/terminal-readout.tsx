import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

type TerminalTheme = "green" | "amber";

export interface TerminalReadoutProps extends BaseProps {
  /** Array of terminal lines to type out sequentially */
  lines: string[];
  /** Color theme: green-on-dark or amber-on-dark */
  theme?: TerminalTheme;
  /** Terminal window title */
  windowTitle?: string;
  /** Editorial label rendered outside the terminal */
  label?: string;
  /** Frame when typing starts */
  at?: number;
}

const THEME_COLORS: Record<TerminalTheme, { text: string; dim: string; glow: string }> = {
  green: { text: "#00FF00", dim: "#00AA00", glow: "rgba(0,255,0,0.08)" },
  amber: { text: "#FFA500", dim: "#CC8400", glow: "rgba(255,165,0,0.08)" },
};

/**
 * Monospace terminal that types out text character by character.
 * Dark background (#0A0A0A), green or amber text, blinking cursor.
 * macOS-style window chrome on the terminal frame.
 * Each line types fully before the next begins.
 *
 * Line brightness rules:
 *   - Lines starting with `$`  → command prompt → full brightness (text)
 *   - Lines starting with `> ` followed by data → full brightness (text)
 *   - All other lines (metadata, [INFO], etc.) → dim
 */
export const TerminalReadout: React.FC<TerminalReadoutProps> = ({
  lines,
  theme = "green",
  windowTitle = "terminal",
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const colors = THEME_COLORS[theme];

  // Calculate typing: each line gets a proportional chunk of frames
  const CHARS_PER_FRAME = 1.2;
  const LINE_GAP_FRAMES = 8; // pause between lines

  // Determine which characters are visible
  const getVisibleLines = () => {
    let elapsed = f;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineFrames = line.length / CHARS_PER_FRAME;

      if (elapsed <= 0) break;

      const charsVisible = Math.floor(
        interpolate(
          elapsed,
          [0, lineFrames],
          [0, line.length],
          C,
        ),
      );
      result.push(line.slice(0, Math.min(charsVisible, line.length)));

      elapsed -= lineFrames + LINE_GAP_FRAMES;
    }

    return result;
  };

  /** Determine colour for a terminal line */
  const lineColor = (line: string): string => {
    if (line.startsWith("$")) return colors.text;
    // Data lines: "> Records…", "> Revenue…", "> Export complete…"
    if (line.startsWith(">") && !/^\[/.test(line)) return colors.text;
    return colors.dim;
  };

  const visibleLines = getVisibleLines();
  const showCursor = frame % 30 < 15; // blink at 2Hz
  const isStillTyping = visibleLines.length > 0 &&
    visibleLines.length <= lines.length &&
    (visibleLines.length < lines.length || visibleLines[visibleLines.length - 1].length < lines[visibleLines.length - 1].length);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Subtle scanline overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          )`,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Terminal window — offset left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 80,
          right: 420,
          bottom: 80,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: `0 20px 80px rgba(0,0,0,0.5), 0 0 120px ${colors.glow}`,
          ...reveal(frame, at + 2),
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 40,
            backgroundColor: "#1E1E1E",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 16,
            borderBottom: "1px solid #333",
          }}
        >
          {/* Window controls */}
          <div style={{ display: "flex", gap: 8, marginRight: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFBD2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#28C840" }} />
          </div>

          <span
            style={{
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontSize: 20,
              color: "#888",
              flex: 1,
              textAlign: "center",
            }}
          >
            {windowTitle}
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            backgroundColor: "#0A0A0A",
            height: "calc(100% - 40px)",
            padding: "24px 28px",
            overflow: "hidden",
          }}
        >
          {visibleLines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                fontSize: 22,
                lineHeight: 1.7,
                color: lineColor(line),
                whiteSpace: "pre-wrap",
                letterSpacing: "0.02em",
              }}
            >
              {line}
              {/* Cursor on the last visible line while still typing */}
              {i === visibleLines.length - 1 && (isStillTyping || showCursor) && (
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 22,
                    backgroundColor: colors.text,
                    opacity: showCursor ? 0.9 : 0,
                    marginLeft: 2,
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </div>
          ))}

          {/* Cursor when no lines yet */}
          {visibleLines.length === 0 && (
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 22,
                  backgroundColor: colors.text,
                  opacity: showCursor ? 0.9 : 0,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right editorial column */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 380,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 32,
          paddingRight: 64,
        }}
      >
        {label && (
          <div style={reveal(frame, at + 12)}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 42,
                lineHeight: 1.15,
                color: P.bg,
                letterSpacing: "-0.02em",
                maxWidth: 320,
              }}
            >
              {label}
            </div>
          </div>
        )}

        {/* Terracotta accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 18, 24)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Decorative vertical hairline */}
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 400,
          width: 1,
          height: 180,
          backgroundColor: "#333",
          opacity: lineGrow(frame, at + 20, 18) / 100,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-terminal-readout",
  props: {
    lines: [
      "$ npm run build",
      "> Compiling templates...",
      "> 18 files transformed",
      "> Build complete"
    ],
    theme: "amber",
    windowTitle: "deploy log",
    label: "Build signal"
  },
  durationInFrames: 210,
};
