import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface Step {
  number: string;
  title: string;
  description?: string;
}

export interface StepSequenceProps extends BaseProps {
  steps: Step[];
  category?: string;
  source?: string;
  at?: number;
}

/**
 * StepSequence — Vertical numbered steps with terracotta number circles,
 * serif titles, and a connecting spine line. Portrait 1080×1920.
 * Steps reveal top-to-bottom with staggered spring entrances.
 * A thin vertical line connects step circles, growing downward.
 */
export const StepSequence: React.FC<StepSequenceProps> = ({
  steps,
  category = "PROCESS",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const count = steps.length;
  const stagger = 25;
  const circleSize = 56;
  const marginLeft = 100;
  const lineX = marginLeft + circleSize / 2;
  const firstStepY = 320;
  const stepSpacing = 280;

  // Spine line grows from first circle to last
  const spineTop = firstStepY + circleSize / 2;
  const spineTotal = (count - 1) * stepSpacing;
  const spineProgress = lineGrow(frame, at + 10, count * stagger + 10);
  const spineHeight = (spineProgress / 100) * spineTotal;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: marginLeft,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        {category}
      </div>

      {/* Vertical connecting spine */}
      <div
        style={{
          position: "absolute",
          left: lineX - 1,
          top: spineTop,
          width: 2,
          height: spineHeight,
          backgroundColor: P.light,
        }}
      />

      {/* Steps */}
      {steps.map((step, i) => {
        const stepAt = at + 12 + i * stagger;
        const y = firstStepY + i * stepSpacing;

        const enterSpring = spring({
          frame: Math.max(0, frame - stepAt),
          fps: FPS,
          config: { damping: 14, stiffness: 90, mass: 0.5 },
        });

        const circleScale = spring({
          frame: Math.max(0, frame - stepAt),
          fps: FPS,
          config: { damping: 10, stiffness: 120, mass: 0.4 },
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: marginLeft,
              top: y,
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
              opacity: interpolate(enterSpring, [0, 0.4], [0, 1], C),
              transform: `translateY(${interpolate(enterSpring, [0, 1], [24, 0], C)}px)`,
            }}
          >
            {/* Number circle */}
            <div
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                backgroundColor: P.terracotta,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: `scale(${circleScale})`,
              }}
            >
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 28,
                  color: P.bg,
                  lineHeight: 1,
                }}
              >
                {step.number}
              </span>
            </div>

            {/* Text content */}
            <div style={{ flex: 1, maxWidth: 740, paddingTop: 4 }}>
              {/* Title */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 42,
                  fontWeight: 700,
                  color: P.text,
                  lineHeight: 1.15,
                  marginBottom: 10,
                }}
              >
                {step.title}
              </div>

              {/* Description */}
              {step.description && (
                <div
                  style={{
                    ...reveal(frame, stepAt + 10),
                    fontFamily: sans,
                    fontSize: 28,
                    color: P.sub,
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </div>
              )}

              {/* Accent underline */}
              <div
                style={{
                  width: `${lineGrow(frame, stepAt + 8, 18)}%`,
                  maxWidth: 60,
                  height: 3,
                  backgroundColor: P.terracotta,
                  borderRadius: 2,
                  marginTop: 16,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: marginLeft,
            ...reveal(frame, at + count * stagger + 30),
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "diagram-step-sequence",
  props: {
    "steps": [
      {
        "number": "01",
        "title": "Capture the signal",
        "description": "Bring the raw input into one place."
      },
      {
        "number": "02",
        "title": "Shape the draft",
        "description": "Make the structure legible."
      },
      {
        "number": "03",
        "title": "Ship the output",
        "description": "Publish the final version."
      }
    ],
    "category": "PROCESS",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
