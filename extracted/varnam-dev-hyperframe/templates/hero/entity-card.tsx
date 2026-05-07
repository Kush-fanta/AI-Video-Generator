import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EntityCardProps extends BaseProps {
  name: string;
  role?: string;
  image: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Person/entity profile: bgless PNG left, name large right, title/role small.
 * Terracotta accent divider. Portrait editorial style.
 * Image snaps in first (object priming), then text follows.
 */
export const EntityCard: React.FC<EntityCardProps> = ({
  name,
  role,
  image,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const imgOpacity = interpolate(frame, [at + 2, at + 8], [0, 1], C);
  const imgScale = interpolate(frame, [at + 2, at + 8], [1.04, 1.0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label top-right */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* PNG cutout — left half */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 60,
          width: 480,
          height: "85%",
          opacity: imgOpacity,
          transform: `scale(${imgScale})`,
          transformOrigin: "bottom center",
        }}
      >
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Text block — right side */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 100,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          maxWidth: 520,
        }}
      >
        {/* Name */}
        <div style={reveal(frame, at + 12)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.0,
              color: P.text,
              textAlign: "right",
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </div>
        </div>

        {/* Terracotta accent */}
        <div
          style={{
            width: `${lineGrow(frame, at + 16, 18)}%`,
            maxWidth: 80,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 20,
            borderRadius: 2,
            alignSelf: "flex-end",
          }}
        />

        {/* Role */}
        {role && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.4,
              color: P.sub,
              marginTop: 16,
              textAlign: "right",
              fontWeight: 500,
            }}
          >
            {role}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "hero-entity-card",
  "props": {
    "name": "Nandan Nilekani",
    "role": "Co-founder, Infosys · Architect of Aadhaar",
    "image": "demo-cutout.png",
    "categoryLabel": "THE ARCHITECT",
    "at": 15
  },
  "durationInFrames": 150
};
