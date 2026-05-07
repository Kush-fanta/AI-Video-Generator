import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import { MUGHAL } from "../shared/indian/palettes";
import { PaisleyBorder } from "../shared/indian/patterns";
import type { BaseProps, ImageRef } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface MiniatureFrameProps extends BaseProps {
  /** Path to bgless PNG image */
  image: ImageRef;
  /** Caption below the image */
  caption?: string;
  /** Optional title above the image */
  title?: string;
  /** Frame offset */
  at?: number;
}

/**
 * Image (bgless PNG) inside a Mughal miniature painting-style double border.
 * Inner border gold, outer jade. PaisleyBorder on left side.
 * Caption below in serif italic.
 */
export const MiniatureFrame: React.FC<MiniatureFrameProps> = ({
  image,
  caption,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: MUGHAL.ivory }}>
      {/* Paisley border left */}
      <PaisleyBorder color={MUGHAL.jade} opacity={0.2} side="left" at={at + 5} />

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: "100%",
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <div
            style={{
              ...reveal(frame, at + 2),
              fontFamily: serif,
              fontSize: 36,
              color: MUGHAL.onyx,
              fontStyle: "italic",
            }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Miniature frame — centered */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Outer border — jade */}
        <div
          style={{
            ...reveal(frame, at + 4),
            border: `4px solid ${MUGHAL.jade}`,
            padding: 8,
            borderRadius: 4,
          }}
        >
          {/* Inner border — gold */}
          <div
            style={{
              border: `2.5px solid ${MUGHAL.gold}`,
              padding: 12,
              borderRadius: 2,
              backgroundColor: MUGHAL.ivory,
            }}
          >
            <Img
              src={staticFile(image)}
              style={{
                width: 460,
                height: 380,
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Caption */}
        {caption && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: serif,
              fontSize: 22,
              fontStyle: "italic",
              color: MUGHAL.onyx,
              opacity: 0.7,
              marginTop: 24,
              textAlign: "center",
              maxWidth: 500,
              lineHeight: 1.4,
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
