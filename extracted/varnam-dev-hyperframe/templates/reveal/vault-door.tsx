import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface VaultDoorProps extends BaseProps {
  content: string;
  label?: string;
  openAt?: number;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * VaultDoor — A circular vault door with radiating bolt lines.
 * The door swings open (rotate + scale shrink to reveal) content behind it.
 * Heavy, metallic feel. Content inside is terracotta serif on dark bg.
 */
export const VaultDoor: React.FC<VaultDoorProps> = ({
  content,
  label,
  openAt = 25,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  const pal = { ...P, ...palette };

  // Vault door radius
  const doorRadius = 420;

  // Door entrance: subtle scale from 0.95
  const doorEntrance = f >= 0
    ? spring({
        frame: Math.max(0, f),
        fps,
        config: { damping: 20, stiffness: 80, mass: 1.0 },
        from: 0.95,
        to: 1.0,
      })
    : 0.95;

  // Pre-open: door rotates slightly (lock mechanism turning)
  const preRotate = f >= openAt - 10 && f < openAt
    ? interpolate(f, [openAt - 10, openAt], [0, -15], C)
    : 0;

  // Door opening: rotates away and scales down (swinging to the side)
  const openProgress = f >= openAt
    ? spring({
        frame: f - openAt,
        fps,
        config: { damping: 14, stiffness: 40, mass: 1.4 },
        from: 0,
        to: 1,
      })
    : 0;

  const doorRotation = preRotate + interpolate(openProgress, [0, 1], [0, -120]);
  const doorScale = interpolate(openProgress, [0, 1], [1, 0.6], C);
  const doorX = interpolate(openProgress, [0, 1], [0, -500], C);
  const doorOpacity = interpolate(openProgress, [0.7, 1], [1, 0], C);

  // Content behind vault
  const contentOpacity = interpolate(openProgress, [0.3, 0.7], [0, 1], C);
  const contentScale = f >= openAt + 15
    ? spring({
        frame: f - openAt - 15,
        fps,
        config: { damping: 12, stiffness: 90, mass: 0.8 },
        from: 0.94,
        to: 1.0,
      })
    : 0.94;

  // Accent line
  const accentWidth = lineGrow(frame, at + openAt + 25, 22);

  // Bolt positions — 8 bolts radiating from center
  const bolts = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const innerR = doorRadius * 0.55;
    const outerR = doorRadius * 0.85;
    return { angle, innerR, outerR };
  });

  // Handle — horizontal bar across center
  const handleWidth = 200;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.dark }}>
      {/* Vault interior glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: doorRadius * 2,
          height: doorRadius * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(193,122,72,0.12) 0%, transparent 70%)`,
          opacity: openProgress,
        }}
      />

      {/* Content behind the vault */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              color: pal.muted,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              marginBottom: 28,
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontFamily: serif,
            fontSize: 108,
            lineHeight: 1.1,
            color: pal.terracotta,
            textAlign: "center",
            maxWidth: 860,
            padding: "0 80px",
            letterSpacing: "-0.02em",
          }}
        >
          {content}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 240,
            height: 3,
            backgroundColor: pal.terracotta,
            marginTop: 36,
            borderRadius: 2,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Vault door — circular with bolts */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: doorRadius * 2,
          height: doorRadius * 2,
          transform: `translate(-50%, -50%) translateX(${doorX}px) rotate(${doorRotation}deg) scale(${doorScale * doorEntrance})`,
          opacity: doorOpacity,
        }}
      >
        {/* Door circle */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#1A1A1A",
            border: `4px solid #2A2A2A`,
            boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Concentric ring */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: doorRadius * 1.4,
              height: doorRadius * 1.4,
              borderRadius: "50%",
              border: `2px solid #2A2A2A`,
            }}
          />

          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: doorRadius * 0.9,
              height: doorRadius * 0.9,
              borderRadius: "50%",
              border: `2px solid #2A2A2A`,
            }}
          />

          {/* Bolt lines — radiating from center */}
          {bolts.map((bolt, i) => {
            const x1 = doorRadius + Math.cos(bolt.angle) * bolt.innerR;
            const y1 = doorRadius + Math.sin(bolt.angle) * bolt.innerR;
            const x2 = doorRadius + Math.cos(bolt.angle) * bolt.outerR;
            const y2 = doorRadius + Math.sin(bolt.angle) * bolt.outerR;
            const length = bolt.outerR - bolt.innerR;
            const angleDeg = (bolt.angle * 180) / Math.PI;

            return (
              <div key={i}>
                {/* Bolt line */}
                <div
                  style={{
                    position: "absolute",
                    left: x1,
                    top: y1,
                    width: length,
                    height: 3,
                    backgroundColor: "#333",
                    transform: `rotate(${angleDeg}deg)`,
                    transformOrigin: "0 50%",
                  }}
                />
                {/* Bolt head */}
                <div
                  style={{
                    position: "absolute",
                    left: x2 - 10,
                    top: y2 - 10,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#2A2A2A",
                    border: "2px solid #333",
                  }}
                />
              </div>
            );
          })}

          {/* Center handle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: handleWidth,
              height: 16,
              backgroundColor: "#333",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
          {/* Handle vertical */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 16,
              height: handleWidth,
              backgroundColor: "#333",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "reveal-vault-door",
  props: {
    content: "67%",
    label: "Fortune 30 penetration",
    openAt: 35,
    at: 15,
  },
  durationInFrames: 180,
};
