import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface Message {
  text: string;
  sender: "left" | "right";
}

export interface ChatBubbleProps extends BaseProps {
  /** Array of chat messages */
  messages: Message[];
  /** Contact name shown in top bar */
  contactName?: string;
  /** Frame when element appears */
  at?: number;
}

const BUBBLE_SPACING = 16;
const FRAMES_PER_MESSAGE = 28;
const TYPING_DURATION = 18;

/**
 * iMessage/WhatsApp style chat interface.
 * Alternating left (gray) and right (terracotta) chat bubbles.
 * Each bubble springs in from its side with a typing indicator beforehand.
 * Dark top bar with contact name and status.
 * Canvas: 1080×1920 portrait.
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  messages,
  contactName = "Contact",
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const msgStart = (i: number) => i * FRAMES_PER_MESSAGE;

  /** Spring reveal for a bubble — slides in from its side */
  const bubbleReveal = (i: number, sender: "left" | "right") => {
    const start = msgStart(i) + TYPING_DURATION;
    const progress = spring({
      frame: Math.max(0, f - start),
      fps: FPS,
      config: { damping: 14, stiffness: 120, mass: 0.8 },
      from: 0,
      to: 1,
    });
    const offsetX = sender === "left" ? -40 : 40;
    return {
      opacity: f >= start ? progress : 0,
      transform: `translateX(${interpolate(progress, [0, 1], [offsetX, 0])}px)`,
    };
  };

  /** Typing indicator visibility */
  const showTyping = (i: number) => {
    const start = msgStart(i);
    const end = start + TYPING_DURATION;
    return f >= start && f < end;
  };

  /** Dot animation for typing indicator */
  const typingDotOpacity = (dotIndex: number) => {
    const cycle = (frame + dotIndex * 5) % 20;
    return interpolate(cycle, [0, 10, 20], [0.3, 1, 0.3], C);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Dark top bar — contact info */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          backgroundColor: P.dark,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 20,
          ...reveal(frame, at),
        }}
      >
        {/* Back chevron */}
        <div
          style={{
            position: "absolute",
            left: 32,
            bottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
            <path
              d="M12 2L3 12L12 22"
              stroke={P.terracotta}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Contact avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: P.terracotta,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: sans,
            fontSize: 24,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          {contactName.charAt(0).toUpperCase()}
        </div>

        <span
          style={{
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          {contactName}
        </span>
      </div>

      {/* Chat area */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          bottom: 120,
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: BUBBLE_SPACING,
          overflow: "hidden",
        }}
      >
        {messages.map((msg, i) => {
          const isLeft = msg.sender === "left";
          const bubbleBg = isLeft ? "#D6D3CC" : P.terracotta;
          const bubbleColor = isLeft ? P.text : "#FFFFFF";
          const visible = f >= msgStart(i) + TYPING_DURATION;
          const typing = showTyping(i);

          return (
            <div key={i}>
              {/* Typing indicator */}
              {typing && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: isLeft ? "flex-start" : "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isLeft ? "#D6D3CC" : "rgba(193,122,72,0.3)",
                      borderRadius: 20,
                      padding: "14px 22px",
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: isLeft ? P.sub : P.terracotta,
                          opacity: typingDotOpacity(d),
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actual bubble */}
              {visible && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: isLeft ? "flex-start" : "flex-end",
                    ...bubbleReveal(i, msg.sender),
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      backgroundColor: bubbleBg,
                      borderRadius: isLeft
                        ? "6px 24px 24px 24px"
                        : "24px 6px 24px 24px",
                      padding: "18px 26px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 28,
                        lineHeight: 1.45,
                        color: bubbleColor,
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom input bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          backgroundColor: "#FFFFFF",
          borderTop: `1px solid ${P.light}`,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          gap: 16,
          ...reveal(frame, at + 4),
        }}
      >
        {/* Camera icon placeholder */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: P.light,
            flexShrink: 0,
          }}
        />
        {/* Input field */}
        <div
          style={{
            flex: 1,
            height: 48,
            borderRadius: 24,
            border: `1.5px solid ${P.light}`,
            backgroundColor: P.bg,
          }}
        />
        {/* Send icon placeholder */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: P.terracotta,
            flexShrink: 0,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-chat-bubble",
  props: {
    messages: [{ text: "We need to cut costs", sender: "left" }, { text: "Build a GCC instead?", sender: "right" }, { text: "In India?", sender: "left" }, { text: "1,850 companies already did", sender: "right" }],
    contactName: "Strategy",
    at: 15,
  },
  durationInFrames: 180,
};
