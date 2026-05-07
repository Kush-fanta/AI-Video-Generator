/**
 * StatWithIcon — Large stat number paired with an illustration/icon image.
 *
 * Ref frame: /tmp/swarajya-study/frames/Rc7Knnuai-Q/120s.png
 * Purpose: Number + illustration composition. Icon sits right of number (landscape)
 *          or above (portrait). Small label below the number. Icon supplied by caller.
 *
 * Props: {
 *   number: string; label: string; iconSrc: string;
 *   iconPosition?: "right" | "above";
 *   durationInFrames: number; bg?: "navy" | "black"
 * }
 */

import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { SK } from "./_tokens";
import { fadeEnvelope, subtleScale } from "./_anim";

loadInter();
loadSpaceGrotesk();

export interface StatWithIconProps {
  number: string;
  label: string;
  iconSrc?: string;
  iconPosition?: "right" | "above";
  durationInFrames: number;
  bg?: "navy" | "black";
}

const ICON_SIZE = 240;
const NUMBER_SIZE = 120;
const DEMO_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'%3E%3Crect width='320' height='320' rx='32' fill='%23131f33'/%3E%3Cpath d='M76 220 L140 148 L184 188 L244 108' fill='none' stroke='%23d74545' stroke-width='22' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='244' cy='108' r='20' fill='%23d74545'/%3E%3C/svg%3E";

export const StatWithIcon: React.FC<StatWithIconProps> = ({
  number,
  label,
  iconSrc,
  iconPosition = "right",
  durationInFrames,
  bg = "navy",
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeEnvelope(frame, durationInFrames, SK.motion.fadeFrames);
  const scale = subtleScale(frame, 0, 18);

  const isAbove = iconPosition === "above";
  const hasIcon = typeof iconSrc === "string" && iconSrc.length > 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg === "black" ? SK.bg.black : SK.bg.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isAbove ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isAbove ? 24 : 48,
          maxWidth: SK.safe.columnWidth,
          width: "100%",
        }}
      >
        {/* Icon above: render before number */}
        {isAbove && hasIcon && (
          <Img
            src={iconSrc}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              objectFit: "contain",
            }}
          />
        )}

        {/* Number + label column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <span
            style={{
              fontFamily: SK.font.display,
              fontWeight: SK.weight.bold,
              fontSize: NUMBER_SIZE,
              color: SK.text.white,
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {number}
          </span>
          <span
            style={{
              fontFamily: SK.font.sans,
              fontWeight: SK.weight.medium,
              fontSize: SK.size.label,
              color: SK.text.mute,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {label}
          </span>
        </div>

        {/* Icon right: render after number */}
        {!isAbove && hasIcon && (
          <Img
            src={iconSrc}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default StatWithIcon;

export const demo = {
  compositionId: "sk-stat-with-icon",
  durationInFrames: 150,
  props: {
    number: "2,100",
    label: "Shaded drones unleashed",
    iconSrc: DEMO_ICON,
    iconPosition: "right" as const,
    durationInFrames: 150,
    bg: "navy" as const,
  },
};
