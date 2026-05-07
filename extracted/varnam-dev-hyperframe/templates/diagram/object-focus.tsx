import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { C, FPS, lineGrow, reveal } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export const OBJECT_FOCUS_DURATION = 210;

interface Mutation {
  label: string;
  detail: string;
  x: number;
  y: number;
  tone?: "terracotta" | "sage" | "slate";
}

export interface ObjectFocusProps extends BaseProps {
  category?: string;
  headline: string;
  anchorValue?: string;
  anchorLabel: string;
  anchorDetail?: string;
  mutations: Mutation[];
  payoff?: string;
  source?: string;
  at?: number;
}

const toneColor = (tone?: Mutation["tone"]) => {
  if (tone === "sage") {
    return P.sage;
  }

  if (tone === "slate") {
    return P.slate;
  }

  return P.terracotta;
};

const connectorStyle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
  color: string,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    position: "absolute" as const,
    left: x1,
    top: y1,
    width: length,
    height: 2,
    borderRadius: 999,
    backgroundColor: color,
    opacity: 0.8,
    transform: `rotate(${angle}deg) scaleX(${progress})`,
    transformOrigin: "left center",
  };
};

export const ObjectFocus: React.FC<ObjectFocusProps> = ({
  category = "ANCHOR OBJECT",
  headline,
  anchorValue,
  anchorLabel,
  anchorDetail,
  mutations,
  payoff,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const anchorX = 620;
  const anchorY = 288;
  const anchorW = 680;
  const anchorH = 430;
  const anchorCenterX = anchorX + anchorW / 2;
  const anchorCenterY = anchorY + anchorH / 2;

  const anchorScale = spring({
    frame: Math.max(0, frame - (at + 8)),
    fps: FPS,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });

  const anchorGlow = interpolate(frame, [at + 12, at + 34], [0.06, 0.18], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 48,
          border: `1px solid ${P.light}`,
          opacity: 0.45,
          borderRadius: 28,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 88,
          left: 100,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      <div
        style={{
          position: "absolute",
          top: 126,
          left: 100,
          width: `${lineGrow(frame, at + 6, 18)}%`,
          maxWidth: 86,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 999,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 170,
          left: 100,
          maxWidth: 760,
          ...reveal(frame, at + 8),
          fontFamily: serif,
          fontSize: 74,
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          color: P.text,
        }}
      >
        {headline}
      </div>

      <div
        style={{
          position: "absolute",
          left: anchorX,
          top: anchorY,
          width: anchorW,
          height: anchorH,
          borderRadius: 36,
          backgroundColor: "#F7F4EF",
          border: `1px solid ${P.light}`,
          boxShadow: `0 24px 80px rgba(42, 38, 34, ${anchorGlow})`,
          transform: `scale(${anchorScale})`,
          transformOrigin: "center center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 20%, rgba(193,122,72,0.10), transparent 34%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 34,
            left: 38,
            ...reveal(frame, at + 14),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          Keep the object stable
        </div>

        {anchorValue ? (
          <div
            style={{
              position: "absolute",
              top: 86,
              left: 40,
              ...reveal(frame, at + 16),
              fontFamily: serif,
              fontSize: 210,
              lineHeight: 0.9,
              letterSpacing: "-0.08em",
              color: "rgba(42, 38, 34, 0.12)",
            }}
          >
            {anchorValue}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            left: 42,
            right: 42,
            bottom: 138,
            ...reveal(frame, at + 20),
            fontFamily: serif,
            fontSize: 84,
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            color: P.text,
          }}
        >
          {anchorLabel}
        </div>

        {anchorDetail ? (
          <div
            style={{
              position: "absolute",
              left: 42,
              right: 68,
              bottom: 48,
              ...reveal(frame, at + 26),
              fontFamily: sans,
              fontSize: 30,
              lineHeight: 1.45,
              color: P.sub,
            }}
          >
            {anchorDetail}
          </div>
        ) : null}
      </div>

      {mutations.map((mutation, index) => {
        const chipAt = at + 26 + index * 14;
        const color = toneColor(mutation.tone);
        const chipWidth = 312;
        const chipHeight = 118;
        const chipCenterX = mutation.x + chipWidth / 2;
        const chipCenterY = mutation.y + chipHeight / 2;
        const connectorProgress = lineGrow(frame, chipAt, 14) / 100;
        const chipLift = spring({
          frame: Math.max(0, frame - chipAt),
          fps: FPS,
          config: { damping: 16, stiffness: 140, mass: 0.55 },
        });

        return (
          <div key={`${mutation.label}-${index}`}>
            <div
              style={connectorStyle(
                anchorCenterX,
                anchorCenterY,
                chipCenterX,
                chipCenterY,
                connectorProgress,
                color,
              )}
            />

            <div
              style={{
                position: "absolute",
                left: mutation.x,
                top: mutation.y,
                width: chipWidth,
                minHeight: chipHeight,
                padding: "22px 24px 20px",
                borderRadius: 26,
                backgroundColor: "#FFFCF8",
                border: `1px solid ${color}33`,
                boxShadow: "0 10px 26px rgba(42,38,34,0.08)",
                opacity: interpolate(chipLift, [0, 0.4], [0, 1], C),
                transform: `translateY(${interpolate(chipLift, [0, 1], [22, 0], C)}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color,
                  marginBottom: 12,
                }}
              >
                Mutation {index + 1}
              </div>
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 36,
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                  color: P.text,
                  marginBottom: 10,
                }}
              >
                {mutation.label}
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  lineHeight: 1.42,
                  color: P.sub,
                }}
              >
                {mutation.detail}
              </div>
            </div>
          </div>
        );
      })}

      {payoff ? (
        <div
          style={{
            position: "absolute",
            left: 100,
            bottom: 72,
            maxWidth: 760,
            ...reveal(frame, at + 96),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 16,
            }}
          >
            Payoff
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 34,
              lineHeight: 1.28,
              fontWeight: 700,
              color: P.terracotta,
              letterSpacing: "-0.02em",
            }}
          >
            {payoff}
          </div>
        </div>
      ) : null}

      {source ? (
        <div
          style={{
            position: "absolute",
            right: 100,
            bottom: 86,
            ...reveal(frame, at + 110),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          Source: {source}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-object-focus",
  props: {
    "category": "PRODUCT",
    "headline": "Keep the core object stable",
    "anchorValue": "3x",
    "anchorLabel": "Faster launch",
    "anchorDetail": "The object stays anchored while surrounding mutations move",
    "mutations": [
      {
        "label": "Scope",
        "detail": "Trim the edges first",
        "x": 96,
        "y": 720,
        "tone": "sage"
      },
      {
        "label": "Timing",
        "detail": "Land the release window",
        "x": 1380,
        "y": 684,
        "tone": "terracotta"
      },
      {
        "label": "Quality",
        "detail": "Leave the object intact",
        "x": 144,
        "y": 392,
        "tone": "slate"
      }
    ],
    "payoff": "Less churn, clearer focus",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
