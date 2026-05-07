import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface LayerItem {
  label: string;
  content: string;
}

interface LayerExplodeProps extends BaseProps {
  layers: LayerItem[];
  explodeAt?: number;
  at?: number;
}

// Layer colors — muted, desaturated tints for each level
const LAYER_COLORS = [
  "rgba(193,122,72,0.08)",  // terracotta wash
  "rgba(109,145,125,0.10)", // sage wash
  "rgba(144,112,112,0.10)", // mauve wash
  "rgba(122,137,153,0.10)", // slate wash
  "rgba(156,148,139,0.08)", // muted wash
];

/**
 * LayerExplode — 3-5 stacked layers (like cards viewed from slight angle).
 * They start stacked, then explode apart vertically with spring physics.
 * Top layer goes up, bottom goes down, revealing all simultaneously.
 * Each layer has a label + content. Portrait 1080x1920.
 */
export const LayerExplode: React.FC<LayerExplodeProps> = ({
  layers,
  explodeAt = 30,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const count = Math.min(layers.length, 5);

  // Stack reveal — all layers fade in as a stack
  const stackReveal = reveal(frame, at);

  // Explode spring — single spring drives the separation
  const explodeF = Math.max(0, f - explodeAt);
  const explodeSpring = spring({
    frame: explodeF,
    fps: FPS,
    config: { damping: 13, stiffness: 70, mass: 0.9 },
  });

  // Layer dimensions
  const layerW = 860;
  const layerH = 220;
  const centerX = (1080 - layerW) / 2;
  const centerY = 960; // center of 1920

  // Total vertical spread when exploded
  const totalSpread = (count - 1) * (layerH + 40);
  const startY = centerY - totalSpread / 2;

  // When stacked: all centered with small offsets for visual depth
  // When exploded: evenly distributed vertically
  const getLayerY = (i: number) => {
    const stackedY = centerY - (count - 1 - i) * 6; // slight stack offset
    const explodedY = startY + i * (layerH + 40);
    return interpolate(explodeSpring, [0, 1], [stackedY, explodedY], C);
  };

  // When stacked: slight scale differences for depth
  const getLayerScale = (i: number) => {
    const stackedScale = 1 - (count - 1 - i) * 0.03;
    return interpolate(explodeSpring, [0, 1], [stackedScale, 1], C);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div style={stackReveal}>
        {layers.slice(0, count).map((layer, i) => {
          const y = getLayerY(i);
          const scale = getLayerScale(i);

          // Content fades in after explosion
          const contentOpacity = interpolate(
            explodeSpring,
            [0.4, 0.8],
            [0, 1],
            C,
          );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: centerX,
                top: y - layerH / 2,
                width: layerW,
                height: layerH,
                transform: `scale(${scale})`,
                transformOrigin: "50% 50%",
                zIndex: count - i,
              }}
            >
              {/* Layer card */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: P.bg,
                  border: `1.5px solid ${P.light}`,
                  borderRadius: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "28px 36px",
                }}
              >
                {/* Color wash background */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: LAYER_COLORS[i % LAYER_COLORS.length],
                  }}
                />

                {/* Label */}
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: P.terracotta,
                    marginBottom: 12,
                    position: "relative",
                  }}
                >
                  {layer.label}
                </div>

                {/* Content — fades in on explosion */}
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 44,
                    lineHeight: 1.25,
                    color: P.text,
                    letterSpacing: "-0.01em",
                    position: "relative",
                    opacity: contentOpacity,
                  }}
                >
                  {layer.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-layer-explode",
  props: {
    layers: [{ label: "Infrastructure", content: "Aadhaar + Jan Dhan" }, { label: "Platform", content: "UPI + DigiLocker" }, { label: "Apps", content: "PhonePe + GPay" }],
    explodeAt: 30,
    at: 15,
  },
  durationInFrames: 180,
};
