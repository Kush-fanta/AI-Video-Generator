import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EmailWindowProps extends BaseProps {
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string;
  /** Email subject line */
  subject: string;
  /** Email body text */
  body: string;
  /** Frame when element appears */
  at?: number;
}

/**
 * Email composition window with typewriter field fill.
 * Clean white window on cream bg with shadow. Toolbar at top with
 * Send button and formatting icons as simple shapes.
 * Canvas: 1080×1920 portrait.
 */
export const EmailWindow: React.FC<EmailWindowProps> = ({
  from,
  to,
  subject,
  body,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Window entrance spring
  const windowScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0.94,
    to: 1.0,
  });
  const windowOpacity = interpolate(f, [0, 10], [0, 1], C);

  // Typewriter: characters visible at a given frame offset
  const typewriter = (text: string, startFrame: number) => {
    const elapsed = Math.max(0, f - startFrame);
    const charsPerFrame = 1.4;
    const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
    return text.slice(0, chars);
  };

  // Staggered field timings
  const FROM_START = 12;
  const TO_START = FROM_START + Math.ceil(from.length / 1.4) + 8;
  const SUBJ_START = TO_START + Math.ceil(to.length / 1.4) + 8;
  const BODY_START = SUBJ_START + Math.ceil(subject.length / 1.4) + 12;

  const showCursor = frame % 30 < 15;

  /** Render a field row with label + typewriter text */
  const fieldRow = (label: string, value: string, startAt: number) => {
    const typed = typewriter(value, startAt);
    const isTyping = f >= startAt && typed.length < value.length;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 40px",
          borderBottom: `1px solid ${P.light}`,
          minHeight: 64,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 500,
            color: P.muted,
            width: 110,
            flexShrink: 0,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: sans,
            fontSize: 24,
            color: P.text,
            flex: 1,
          }}
        >
          {typed}
          {isTyping && showCursor && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 24,
                backgroundColor: P.terracotta,
                marginLeft: 2,
                verticalAlign: "text-bottom",
              }}
            />
          )}
        </span>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Email window */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 60,
          right: 60,
          bottom: 160,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 16px 64px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          transform: `scale(${windowScale})`,
          opacity: windowOpacity,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            height: 72,
            backgroundColor: "#F5F4F0",
            borderBottom: `1px solid ${P.light}`,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 16,
          }}
        >
          {/* Window controls */}
          <div style={{ display: "flex", gap: 10, marginRight: 20 }}>
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

          {/* Title */}
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              color: P.sub,
              flex: 1,
              textAlign: "center",
            }}
          >
            New Message
          </span>

          {/* Send button */}
          <div
            style={{
              backgroundColor: P.terracotta,
              borderRadius: 8,
              padding: "8px 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              Send
            </span>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path
                d="M1 1L15 7L1 13V8L10 7L1 6V1Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div
          style={{
            height: 52,
            backgroundColor: "#FAFAF7",
            borderBottom: `1px solid ${P.light}`,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            gap: 20,
          }}
        >
          {/* Bold */}
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 800,
              color: P.muted,
            }}
          >
            B
          </span>
          {/* Italic */}
          <span
            style={{
              fontFamily: serif,
              fontSize: 22,
              fontStyle: "italic",
              color: P.muted,
            }}
          >
            I
          </span>
          {/* Underline */}
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              textDecoration: "underline",
            }}
          >
            U
          </span>
          {/* Separator */}
          <div
            style={{
              width: 1,
              height: 24,
              backgroundColor: P.light,
            }}
          />
          {/* List icon placeholder */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: P.muted,
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
          {/* Attachment icon placeholder */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              border: `2px solid ${P.muted}`,
            }}
          />
        </div>

        {/* Fields */}
        {fieldRow("From:", from, FROM_START)}
        {fieldRow("To:", to, TO_START)}
        {fieldRow("Subject:", subject, SUBJ_START)}

        {/* Body area */}
        <div
          style={{
            flex: 1,
            padding: "28px 40px",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 26,
              lineHeight: 1.7,
              color: P.text,
            }}
          >
            {typewriter(body, BODY_START)}
            {f >= BODY_START &&
              typewriter(body, BODY_START).length < body.length &&
              showCursor && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 26,
                    backgroundColor: P.terracotta,
                    marginLeft: 2,
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
          </span>
        </div>
      </div>

      {/* Decorative terracotta accent line below window */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 120,
          width: `${lineGrow(frame, at + 20, 30)}%`,
          maxWidth: 200,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-email-window",
  props: {
    from: "CEO",
    to: "Board",
    subject: "India GCC Strategy",
    body: "Bangalore centre now owns global product P&L.",
    at: 15,
  },
  durationInFrames: 180,
};
