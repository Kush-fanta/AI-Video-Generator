import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import { KolamGrid } from "../shared/indian/patterns";
import { RAJASTHAN } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface RangoliTransitionProps {
  /** Content text revealed after rangoli fills */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Frame offset */
  at?: number;
  /** Children rendered as the revealed content */
  children?: React.ReactNode;
}

/**
 * Transition: KolamGrid draws from center outward filling screen,
 * then fades to reveal content beneath.
 */
export const RangoliTransition: React.FC<RangoliTransitionProps> = ({
  title,
  subtitle,
  at = 0,
  children,
}) => {
  const frame = useCurrentFrame();

  // Kolam fills screen: scale from small to full
  const kolamScale = interpolate(frame, [at, at + 40], [0.3, 4.5], { ...C, easing: ease });
  // Kolam fades out after drawing
  const kolamOpacity = interpolate(frame, [at, at + 25, at + 50, at + 65], [0, 1, 1, 0], C);
  // Content reveals after kolam fades
  const contentOpacity = interpolate(frame, [at + 50, at + 65], [0, 1], C);
  const contentScale = interpolate(frame, [at + 50, at + 58], [1.06, 1], { ...C, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: RAJASTHAN.white }}>
      {/* Revealed content layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
        {title && (
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              color: RAJASTHAN.blue,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              color: RAJASTHAN.rust,
              marginTop: 16,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Kolam overlay — draws and fades */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${kolamScale})`,
          opacity: kolamOpacity,
          pointerEvents: "none",
        }}
      >
        <KolamGrid
          color={RAJASTHAN.pink}
          opacity={0.6}
          size={300}
          at={at}
          style={{ position: "relative" }}
        />
      </div>

      {/* Secondary kolam ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${kolamScale * 0.7}) rotate(45deg)`,
          opacity: kolamOpacity * 0.5,
          pointerEvents: "none",
        }}
      >
        <KolamGrid
          color={RAJASTHAN.marigold}
          opacity={0.4}
          size={300}
          at={at + 10}
          style={{ position: "relative" }}
        />
      </div>
    </AbsoluteFill>
  );
};
