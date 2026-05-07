import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface ChannelBadgeProps extends BaseProps {
  name: string;
}

/**
 * Reusable badge component. Fixed top-right position.
 * Channel name in 14px bold sans, dark bg, cream text, rounded 7px.
 * Also exportable as standalone overlay.
 */
export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ name }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 40,
        zIndex: 100,
        ...reveal(frame, 4),
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: P.bg,
          backgroundColor: P.dark,
          padding: "7px 16px",
          borderRadius: 7,
          userSelect: "none",
        }}
      >
        {name}
      </div>
    </div>
  );
};
