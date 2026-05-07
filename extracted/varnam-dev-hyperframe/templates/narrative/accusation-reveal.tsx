import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCondensed } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { C, ease, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: condensed } = loadCondensed();
const { fontFamily: sans } = loadSans();

export interface AccusationRevealProps extends BaseProps {
  /**
   * Context line — sets up the frame before the accusation (e.g. "IN 2023, THE MINISTRY CLAIMED:")
   * Appears first, fades in softly.
   */
  contextLine: string;
  /**
   * The full accusation text (verbatim). Initially redacted, then revealed.
   * (e.g. "WE HAVE NO KNOWLEDGE OF ANY SUCH TRANSFER")
   */
  accusation: string;
  /**
   * Optional source or attribution line (e.g. "— Press Trust of India, March 2023")
   */
  attribution?: string;
  /**
   * Channel badge. Default: "#SWARAJYA"
   */
  badge?: string;
  /**
   * Frame when animation sequence starts. Default: 0.
   * Beat 1 (context): at + 0–20
   * Beat 2 (redacted blur): at + 30–50
   * Beat 3 (reveal slam): at + 70–90
   */
  at?: number;
  /**
   * Duration of the blur-to-reveal transition in frames. Default: 18.
   */
  revealDuration?: number;
}

/**
 * AccusationReveal — 3-beat dark editorial reveal.
 *
 * Beat 1: Context line fades in on navy canvas.
 * Beat 2: Accusation appears blurred/redacted — black rectangles over key words,
 *          simulated using a high-blur layer and dark overlay boxes.
 * Beat 3: Redaction wipes away, full accusation slams in — red accent on key words.
 *
 * Canvas: #192841 (channel canvas — navy, not dark).
 * Text animation: soft fade-in only (channel rule).
 * Accusation revealed text uses red accent (#D8323E) on the full line.
 * Attribution fades in last in text_dim.
 */
export const AccusationReveal: React.FC<AccusationRevealProps> = ({
  contextLine,
  accusation,
  attribution,
  badge = "#SWARAJYA",
  at = 0,
  revealDuration = 18,
}) => {
  const frame = useCurrentFrame();

  // Swarajya palette
  const canvas = "#192841";
  const gold = "#D4A264";
  const red = "#D8323E";
  const textPrimary = "#F5F2EA";
  const textDim = "#A0A8B4";
  const canvasDark = "#0F1E38";

  // Safe area
  const safeH = 96;
  const safeV = 54;

  // ── Beat timing ──
  // Beat 1: context line
  const contextIn = at + 4;
  const contextOpacity = interpolate(frame, [contextIn, contextIn + 20], [0, 1], C);

  // Beat 2: redacted state appears
  const redactedIn = at + 36;
  const redactedOpacity = interpolate(frame, [redactedIn, redactedIn + 16], [0, 1], C);

  // Beat 3: reveal — blur dissolves, full accusation slams
  const revealAt = at + 70;
  // Redaction fades out as reveal comes in
  const redactionFade = interpolate(frame, [revealAt, revealAt + revealDuration], [1, 0], C);
  // Revealed text fades in (soft fade-in, channel rule)
  const revealOpacity = interpolate(frame, [revealAt + 4, revealAt + revealDuration + 8], [0, 1], C);
  // Attribution arrives last
  const attributionOpacity = interpolate(
    frame,
    [revealAt + revealDuration + 12, revealAt + revealDuration + 28],
    [0, 1],
    C
  );

  // Gold rule under context line — grows from left
  const ruleW = interpolate(frame, [contextIn + 10, contextIn + 28], [0, 160], { ...C, easing: ease });

  // Red accent line that appears with the reveal
  const accentW = interpolate(frame, [revealAt + 6, revealAt + 20], [0, 240], { ...C, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: canvas }}>
      {/* Dark gradient at bottom — depth */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 300,
          background: `linear-gradient(to top, ${canvasDark}, transparent)`,
          pointerEvents: "none",
        }}
      />

      {/* Channel badge — top-right */}
      <div
        style={{
          position: "absolute",
          top: safeV,
          right: safeH,
          backgroundColor: red,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 6,
          paddingBottom: 6,
          opacity: interpolate(frame, [at, at + 12], [0, 1], C),
        }}
      >
        <span
          style={{
            fontFamily: condensed,
            fontSize: 28,
            color: textPrimary,
            letterSpacing: "0.12em",
          }}
        >
          {badge}
        </span>
      </div>

      {/* ── BEAT 1: Context line ── */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: safeH,
          right: safeH,
          opacity: contextOpacity,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 500,
            color: textDim,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            lineHeight: 1.3,
          }}
        >
          {contextLine}
        </div>
        {/* Gold rule below context */}
        <div
          style={{
            width: ruleW,
            height: 2,
            backgroundColor: gold,
            marginTop: 20,
          }}
        />
      </div>

      {/* ── BEAT 2: Redacted accusation ── */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: safeH,
          right: safeH,
          opacity: redactedOpacity * redactionFade,
        }}
      >
        {/* Blurred/redacted text — accusation behind a blur filter */}
        <div
          style={{
            fontFamily: condensed,
            fontSize: 96,
            color: textPrimary,
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            filter: "blur(12px)",
            userSelect: "none" as const,
          }}
        >
          {accusation}
        </div>
        {/* Black redaction bar overlay — sits on top of blurred text */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column" as const,
            gap: 12,
            paddingTop: 8,
          }}
        >
          {/* Simulate redaction with dark bars — three lines of varying width */}
          {[0.9, 0.75, 0.55].map((w, i) => (
            <div
              key={i}
              style={{
                width: `${w * 100}%`,
                height: 80,
                backgroundColor: "#050D1A",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── BEAT 3: Revealed accusation ── */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: safeH,
          right: safeH,
          opacity: revealOpacity,
        }}
      >
        {/* Red accent line above revealed text */}
        <div
          style={{
            width: accentW,
            height: 4,
            backgroundColor: red,
            marginBottom: 24,
          }}
        />

        {/* Full accusation — red accent on the entire line, bold condensed */}
        <div
          style={{
            fontFamily: condensed,
            fontSize: 96,
            color: red,
            lineHeight: 1.1,
            letterSpacing: "0.04em",
          }}
        >
          {accusation}
        </div>

        {/* Attribution line */}
        {attribution && (
          <div
            style={{
              marginTop: 40,
              opacity: attributionOpacity,
              fontFamily: sans,
              fontSize: 32,
              color: textDim,
              fontStyle: "italic",
              letterSpacing: "0.06em",
            }}
          >
            {attribution}
          </div>
        )}
      </div>

      {/* Thin bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: safeV + 40,
          left: safeH,
          right: safeH,
          height: 1,
          backgroundColor: textDim,
          opacity: interpolate(frame, [revealAt + 20, revealAt + 36], [0, 0.25], C),
        }}
      />
    </AbsoluteFill>
  );
};

export const defaultProps: AccusationRevealProps = {
  contextLine: "IN 2023, THE MINISTRY OF DEFENCE CLAIMED:",
  accusation: "WE HAVE NO KNOWLEDGE OF ANY SUCH TRANSFER",
  attribution: "— Press Trust of India, March 14 2023",
  badge: "#SWARAJYA",
  at: 0,
  revealDuration: 18,
};

export const demo = {
  compositionId: "narr-accusation-reveal",
  props: {
    contextLine: "IN 2023, THE MINISTRY OF DEFENCE CLAIMED:",
    accusation: "WE HAVE NO KNOWLEDGE OF ANY SUCH TRANSFER",
    attribution: "— Press Trust of India, March 14 2023",
    badge: "#SWARAJYA", at: 15, revealDuration: 18,
  },
  durationInFrames: 180,
};
