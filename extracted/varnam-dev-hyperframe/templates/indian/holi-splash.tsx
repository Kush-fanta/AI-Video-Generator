import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import { RAJASTHAN } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const SPLASH_COLORS = [
  RAJASTHAN.pink,
  RAJASTHAN.marigold,
  RAJASTHAN.emerald,
  RAJASTHAN.blue,
  RAJASTHAN.rust,
];

interface HoliSplashProps {
  /** Text revealed after color burst */
  text: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Frame offset */
  at?: number;
}

/**
 * 4-5 color circles (RAJASTHAN palette) burst outward from center at staggered
 * times, text revealed after color settles. Bold kinetic — hard snaps, scale slams.
 */
export const HoliSplash: React.FC<HoliSplashProps> = ({
  text,
  subtitle,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const circles = SPLASH_COLORS.map((color, i) => {
    const delay = at + i * 5;
    const burstScale = interpolate(frame, [delay, delay + 6, delay + 10], [0, 1.3, 1], {
      ...C,
      easing: ease,
    });
    const opacity = interpolate(frame, [delay, delay + 4], [0, 0.7], C);
    // Each circle bursts in a different direction
    const angle = (Math.PI * 2 * i) / SPLASH_COLORS.length - Math.PI / 2;
    const radius = interpolate(frame, [delay, delay + 8], [0, 200], { ...C, easing: ease });
    const tx = Math.cos(angle) * radius;
    const ty = Math.sin(angle) * radius;
    const size = 180 + i * 30;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          opacity,
          transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${burstScale})`,
          filter: "blur(8px)",
        }}
      />
    );
  });

  // Text appears after burst settles
  const textDelay = at + SPLASH_COLORS.length * 5 + 8;
  const textOpacity = interpolate(frame, [textDelay, textDelay + 6], [0, 1], C);
  const textScale = interpolate(frame, [textDelay, textDelay + 5], [1.15, 1], { ...C, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: RAJASTHAN.white, overflow: "hidden" }}>
      {circles}

      {/* Text layer */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${textScale})`,
          opacity: textOpacity,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 80,
            lineHeight: 1.05,
            color: RAJASTHAN.blue,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 20px rgba(255,255,255,0.8)",
          }}
        >
          {text}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 26,
              color: RAJASTHAN.rust,
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
