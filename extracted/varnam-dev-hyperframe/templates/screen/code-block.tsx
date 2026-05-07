import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface CodeBlockProps extends BaseProps {
  /** Array of code lines to display */
  lines: string[];
  /** Language label shown in header */
  language?: string;
  /** Line numbers to highlight (1-indexed) */
  highlightLines?: number[];
  /** Frame when element appears */
  at?: number;
}

const LINE_HEIGHT = 42;
const LINE_STAGGER = 6;
const MONO = "'Menlo', 'Monaco', 'Courier New', monospace";

/**
 * Syntax-highlighted code block with line numbers.
 * Dark bg (P.dark). Lines appear in sequence with fade.
 * Key tokens colored: terracotta for strings, sage for keywords, slate for comments.
 * Cursor blinks at end.
 * Canvas: 1080×1920 portrait.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  lines,
  language = "code",
  highlightLines = [],
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Window entrance
  const windowScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0.94,
    to: 1.0,
  });
  const windowOpacity = interpolate(f, [0, 10], [0, 1], C);

  // Per-line fade
  const lineOpacity = (i: number) => {
    const start = 14 + i * LINE_STAGGER;
    return interpolate(f, [start, start + 10], [0, 1], C);
  };

  // Cursor blink
  const showCursor = frame % 30 < 15;
  const allLinesVisible =
    f >= 14 + (lines.length - 1) * LINE_STAGGER + 10;

  /** Basic syntax coloring — keyword detection */
  const colorize = (line: string) => {
    const tokens: Array<{ text: string; color: string }> = [];
    // Simple tokenizer: comments, strings, keywords, rest
    const KEYWORDS =
      /\b(const|let|var|function|return|import|export|from|if|else|for|while|class|def|async|await|type|interface|new|this|true|false|null|None|self|print|console)\b/g;
    const STRING_RE = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const COMMENT_RE = /(\/\/.*|#.*|\/\*.*?\*\/)/g;

    // Check if entire line is a comment
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
      return [{ text: line, color: P.slate }];
    }

    // Simple split: process left to right
    let remaining = line;
    let idx = 0;

    while (remaining.length > 0) {
      // Check for string at current position
      const strMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
      if (strMatch) {
        tokens.push({ text: strMatch[0], color: P.terracotta });
        remaining = remaining.slice(strMatch[0].length);
        continue;
      }

      // Check for keyword at current position (word boundary)
      const kwMatch = remaining.match(
        /^(const|let|var|function|return|import|export|from|if|else|for|while|class|def|async|await|type|interface|new|this|true|false|null|None|self|print|console)\b/,
      );
      if (kwMatch && (idx === 0 || /\W/.test(line[idx - 1] || " "))) {
        tokens.push({ text: kwMatch[0], color: P.sage });
        remaining = remaining.slice(kwMatch[0].length);
        idx += kwMatch[0].length;
        continue;
      }

      // Inline comment
      if (remaining.startsWith("//") || remaining.startsWith("#")) {
        tokens.push({ text: remaining, color: P.slate });
        break;
      }

      // Regular character
      tokens.push({ text: remaining[0], color: "#D4D0C8" });
      remaining = remaining.slice(1);
      idx++;
    }

    // Merge adjacent same-color tokens
    const merged: Array<{ text: string; color: string }> = [];
    for (const t of tokens) {
      if (merged.length > 0 && merged[merged.length - 1].color === t.color) {
        merged[merged.length - 1].text += t.text;
      } else {
        merged.push({ ...t });
      }
    }
    return merged;
  };

  const highlightSet = new Set(highlightLines);

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111" }}>
      {/* Code window */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 48,
          right: 48,
          bottom: 400,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: P.dark,
          boxShadow:
            "0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          transform: `scale(${windowScale})`,
          opacity: windowOpacity,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 52,
            backgroundColor: "#1A1A1A",
            borderBottom: "1px solid #2A2A2A",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          {/* Window controls */}
          <div style={{ display: "flex", gap: 9, marginRight: 20 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#FF5F57",
              }}
            />
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#FFBD2E",
              }}
            />
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#28C840",
              }}
            />
          </div>

          {/* Language tab */}
          <div
            style={{
              backgroundColor: P.dark,
              borderRadius: "6px 6px 0 0",
              padding: "6px 16px",
              fontFamily: sans,
              fontSize: 20,
              color: P.muted,
            }}
          >
            {language}
          </div>
        </div>

        {/* Code area */}
        <div
          style={{
            flex: 1,
            padding: "24px 0",
            overflow: "hidden",
          }}
        >
          {lines.map((line, i) => {
            const isHighlighted = highlightSet.has(i + 1);
            const opacity = lineOpacity(i);
            const tokens = colorize(line);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: LINE_HEIGHT,
                  opacity,
                  backgroundColor: isHighlighted
                    ? "rgba(193,122,72,0.08)"
                    : "transparent",
                  borderLeft: isHighlighted
                    ? `3px solid ${P.terracotta}`
                    : "3px solid transparent",
                }}
              >
                {/* Line number */}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 20,
                    color: isHighlighted ? P.terracotta : "#444",
                    width: 60,
                    textAlign: "right",
                    paddingRight: 20,
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  {i + 1}
                </span>

                {/* Code content */}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 24,
                    letterSpacing: "0.01em",
                    whiteSpace: "pre",
                  }}
                >
                  {tokens.map((t, ti) => (
                    <span key={ti} style={{ color: t.color }}>
                      {t.text}
                    </span>
                  ))}

                  {/* Cursor on last line */}
                  {i === lines.length - 1 && allLinesVisible && showCursor && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 24,
                        backgroundColor: P.terracotta,
                        opacity: 0.9,
                        marginLeft: 4,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Label below — editorial serif */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 72,
          right: 72,
          ...reveal(frame, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 48,
            color: P.bg,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {language}
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 36, 24)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 16,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-code-block",
  props: {
    lines: ["const gccCount = 1850;", "const revenue = \"$100B\";", "// back office → brain centre", "console.log(revenue);"],
    language: "typescript",
    highlightLines: [2],
    at: 15,
  },
  durationInFrames: 180,
};
