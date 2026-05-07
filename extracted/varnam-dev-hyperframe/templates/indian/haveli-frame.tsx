import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C } from "../shared/primitives";
import { ScallopedBorder, PaisleyBorder } from "../shared/indian/patterns";
import { RAJASTHAN, MUGHAL } from "../shared/indian/palettes";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface HaveliFrameProps {
  /** Title displayed below the frame */
  title?: string;
  /** Caption text */
  caption?: string;
  /** Image filename in public/ */
  image?: string;
  /** Frame offset */
  at?: number;
  /** Children rendered inside the frame */
  children?: React.ReactNode;
}

/**
 * Image/content in a decorative haveli-style frame with ScallopedBorder on
 * all 4 sides plus PaisleyBorder on left. RAJASTHAN.sand background. Gold accents.
 */
export const HaveliFrame: React.FC<HaveliFrameProps> = ({
  title,
  caption,
  image,
  at = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const frameScale = interpolate(frame, [at, at + 10], [0.92, 1], { ...C, easing: ease });
  const frameOpacity = interpolate(frame, [at, at + 8], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: RAJASTHAN.sand }}>
      {/* PaisleyBorder left */}
      <PaisleyBorder color={MUGHAL.gold} opacity={0.25} side="left" at={at + 5} />

      {/* Main frame area */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          right: 80,
          bottom: 120,
          opacity: frameOpacity,
          transform: `scale(${frameScale})`,
          transformOrigin: "center",
        }}
      >
        {/* Scalloped borders on all 4 sides */}
        <ScallopedBorder color={MUGHAL.gold} opacity={0.4} side="top" at={at + 3} scallops={10} />
        <ScallopedBorder color={MUGHAL.gold} opacity={0.4} side="bottom" at={at + 6} scallops={10} />

        {/* Left/right scalloped via rotated SVGs */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -10,
            width: 30,
            height: "100%",
            borderLeft: `2px solid ${MUGHAL.gold}33`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: -10,
            width: 30,
            height: "100%",
            borderRight: `2px solid ${MUGHAL.gold}33`,
          }}
        />

        {/* Gold corner accents */}
        {[
          { top: -4, left: -4 },
          { top: -4, right: -4 },
          { bottom: -4, left: -4 },
          { bottom: -4, right: -4 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 16,
              height: 16,
              border: `2px solid ${MUGHAL.gold}`,
              opacity: interpolate(frame, [at + 8 + i * 3, at + 12 + i * 3], [0, 0.6], C),
            }}
          />
        ))}

        {/* Content area */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image && (
            <img
              src={image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${interpolate(frame, [0, 180], [1.02, 1.08], C)})`,
              }}
            />
          )}
          {children}
        </div>
      </div>

      {/* Title below frame */}
      {title && (
        <div
          style={{
            position: "absolute",
            bottom: 65,
            left: 100,
            right: 100,
            textAlign: "center",
            ...reveal(frame, at + 16),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 38,
              color: RAJASTHAN.blue,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
          {caption && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 18,
                color: RAJASTHAN.rust,
                marginTop: 8,
                fontWeight: 400,
              }}
            >
              {caption}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
