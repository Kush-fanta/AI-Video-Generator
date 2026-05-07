import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface EnvelopeOpenProps extends BaseProps {
  message: string;
  sender?: string;
  openAt?: number;
  at?: number;
}

/**
 * EnvelopeOpen — An envelope with a triangular flap that rotates open
 * (CSS rotateX with perspective), then a card rises out with spring physics.
 * The card contains the message. Cream envelope on a slightly darker bg.
 */
export const EnvelopeOpen: React.FC<EnvelopeOpenProps> = ({
  message,
  sender,
  openAt = 20,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;

  // Envelope dimensions
  const envW = 720;
  const envH = 480;
  const flapH = 200;

  // Envelope entrance: slides up from bottom
  const envEntrance = f >= 0
    ? spring({
        frame: Math.max(0, f),
        fps,
        config: { damping: 16, stiffness: 70, mass: 1.0 },
        from: 200,
        to: 0,
      })
    : 200;
  const envOpacity = interpolate(f, [0, 10], [0, 1], C);

  // Flap opens: rotates from 0 (closed) to 180 degrees
  const flapProgress = f >= openAt
    ? spring({
        frame: f - openAt,
        fps,
        config: { damping: 14, stiffness: 50, mass: 1.1 },
        from: 0,
        to: 180,
      })
    : 0;

  // Card rises out of envelope after flap is mostly open
  const cardAt = openAt + 18;
  const cardRise = f >= cardAt
    ? spring({
        frame: f - cardAt,
        fps,
        config: { damping: 12, stiffness: 60, mass: 0.9 },
        from: 0,
        to: 320,
      })
    : 0;
  const cardOpacity = interpolate(f, [cardAt, cardAt + 8], [0, 1], C);

  // Card shadow grows as it rises
  const cardShadow = interpolate(cardRise, [0, 320], [0, 20], C);

  // Flap is behind the card when open (z-index logic via opacity)
  const flapBehind = flapProgress > 90;

  // Envelope body color — warm cream
  const envColor = "#D9D3CA";
  const envDarker = "#C8C1B5";
  const cardColor = P.bg;

  return (
    <AbsoluteFill style={{ backgroundColor: "#DDD8D0" }}>
      {/* Envelope group — centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${envEntrance}px)`,
          opacity: envOpacity,
          width: envW,
          height: envH + flapH,
        }}
      >
        {/* Card — rises out of envelope */}
        <div
          style={{
            position: "absolute",
            bottom: flapH - 20,
            left: 40,
            right: 40,
            height: 400,
            backgroundColor: cardColor,
            borderRadius: 12,
            transform: `translateY(${-cardRise}px)`,
            opacity: cardOpacity,
            boxShadow: `0 ${cardShadow}px ${cardShadow * 2}px rgba(0,0,0,0.1)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1.2,
              color: P.text,
              textAlign: "center",
              maxWidth: 560,
              letterSpacing: "-0.02em",
            }}
          >
            {message}
          </div>

          {sender && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 24,
                color: P.muted,
                marginTop: 24,
                letterSpacing: "0.04em",
              }}
            >
              — {sender}
            </div>
          )}

          {/* Terracotta seal */}
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              marginTop: 20,
            }}
          />
        </div>

        {/* Envelope body */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: envW,
            height: envH,
            backgroundColor: envColor,
            borderRadius: 16,
            zIndex: 3,
            overflow: "hidden",
          }}
        >
          {/* Inner shadow at top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              background: `linear-gradient(to bottom, ${envDarker}, transparent)`,
              opacity: 0.4,
            }}
          />

          {/* Diagonal fold lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.03) 50%, transparent 60%)`,
            }}
          />
        </div>

        {/* Flap — triangular with perspective rotation */}
        <div
          style={{
            position: "absolute",
            bottom: envH - 2,
            left: 0,
            width: envW,
            height: flapH,
            perspective: 800,
            zIndex: flapBehind ? 1 : 4,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "bottom center",
              transform: `rotateX(${flapProgress}deg)`,
              backfaceVisibility: "hidden" as const,
            }}
          >
            {/* Triangle flap shape using clip-path */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: envDarker,
                clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
                borderRadius: "16px 16px 0 0",
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-envelope-open",
  props: {
    message: "Promoted to Global P&L Owner",
    sender: "HQ, New York",
    openAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
