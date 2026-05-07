import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../../shared/palette";
import { reveal, lineGrow, dimTo, C, FPS } from "../../shared/primitives";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

// Scene durations in frames
const S1_DUR = 180;
const S2_DUR = 240;
const S3_DUR = 180;
const S4_DUR = 300;
const S5_DUR = 210;

export const RESEARCH_B_DURATION = S1_DUR + S2_DUR + S3_DUR + S4_DUR + S5_DUR;

/* ─────────────────────────────────────────────
   Scene 1: "520 Million" — The Anchor
   Big number reveal. Left-anchored. Stillness IS the design.
   ───────────────────────────────────────────── */
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  const accentWidth = lineGrow(frame, 20, 30);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Hero number — left of center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 120,
          transform: "translateY(-55%)",
          width: 1100,
        }}
      >
        {/* The number */}
        <div
          style={{
            ...reveal(frame, 8),
            fontFamily: serif,
            fontSize: 140,
            lineHeight: 1,
            color: P.terracotta,
            letterSpacing: "-0.03em",
          }}
        >
          520M
        </div>

        {/* Accent line between number and label */}
        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 280,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 28,
            borderRadius: 2,
          }}
        />

        {/* Label */}
        <div
          style={{
            ...reveal(frame, 22),
            fontFamily: sans,
            fontSize: 36,
            color: P.sub,
            marginTop: 24,
            lineHeight: 1.35,
            maxWidth: 600,
          }}
        >
          Bank accounts opened under Jan Dhan Yojana
        </div>

        {/* Source — last, almost an afterthought */}
        <div
          style={{
            ...reveal(frame, 36),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            marginTop: 48,
            textTransform: "uppercase" as const,
          }}
        >
          Source: Reserve Bank of India, 2024
        </div>
      </div>

      {/* Right side — thin vertical terracotta accent line at 60% height */}
      {(() => {
        const r = reveal(frame, 14);
        return (
          <div
            style={{
              position: "absolute",
              right: 120,
              top: "50%",
              width: 2,
              height: "60%",
              backgroundColor: P.terracotta,
              borderRadius: 1,
              opacity: r.opacity,
              transform: `translateY(-50%) ${r.transform}`,
            }}
          />
        );
      })()}
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────
   Scene 2: "Old vs New" — The Contrast
   Two columns, cleanly divided. Right column terracotta.
   ───────────────────────────────────────────── */
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Headline — above */}
      <div
        style={{
          ...reveal(frame, 4),
          position: "absolute",
          top: 100,
          left: 120,
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: P.muted,
          textTransform: "uppercase" as const,
        }}
      >
        Settlement speed
      </div>

      {/* Two columns container */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left column — Traditional Banking */}
        <div
          style={{
            ...reveal(frame, 10),
            flex: 1,
            paddingLeft: 120,
            paddingRight: 60,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: P.muted,
              textTransform: "uppercase" as const,
              marginBottom: 16,
            }}
          >
            Traditional Banking
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.05,
              color: P.text,
              letterSpacing: "-0.02em",
            }}
          >
            3–5 days
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 12,
              lineHeight: 1.35,
            }}
          >
            NEFT/RTGS settlement
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: "40%",
            backgroundColor: P.light,
            flexShrink: 0,
          }}
        />

        {/* Right column — UPI */}
        <div
          style={{
            ...reveal(frame, 30),
            flex: 1,
            paddingLeft: 60,
            paddingRight: 120,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: P.muted,
              textTransform: "uppercase" as const,
              marginBottom: 16,
            }}
          >
            UPI
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              lineHeight: 1.05,
              color: P.terracotta,
              letterSpacing: "-0.02em",
            }}
          >
            Instant
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 28,
              color: P.sub,
              marginTop: 12,
              lineHeight: 1.35,
            }}
          >
            24/7, including holidays
          </div>
        </div>
      </div>

      {/* Source — bottom left */}
      <div
        style={{
          ...reveal(frame, 50),
          position: "absolute",
          bottom: 60,
          left: 120,
          fontFamily: sans,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: P.muted,
          textTransform: "uppercase" as const,
        }}
      >
        Source: RBI Payment Systems Report
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────
   Scene 3: "The Shift" — The Turn
   Before/after reframe. Italic → regular weight. Page turn, not crossfade.
   ───────────────────────────────────────────── */
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  const pivotAt = 70;

  // Before text: reveal at 0, dims fast at pivot (8 frames — a cut, not a dissolve)
  const beforeOpacity =
    frame < pivotAt
      ? interpolate(frame, [0, 18], [0, 1], C)
      : interpolate(frame, [pivotAt, pivotAt + 8], [1, 0.15], C);

  // After text: enters at pivot+2 with reveal, slightly overlapping before's exit
  const afterStyle = reveal(frame, pivotAt + 2);

  // Accent line grows below after text
  const accentWidth = lineGrow(frame, pivotAt + 15, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Before text — muted serif italic, centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: beforeOpacity,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 52,
            color: P.sub,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
            fontStyle: "italic",
          }}
        >
          India was a cash economy. 98% of transactions were physical.
        </div>
      </div>

      {/* After text — regular serif, darker, slightly larger, same center position */}
      {frame >= pivotAt && (
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
          }}
        >
          <div
            style={{
              ...afterStyle,
              fontFamily: serif,
              fontSize: 58,
              color: P.text,
              textAlign: "center",
              maxWidth: 950,
              lineHeight: 1.3,
            }}
          >
            Today, India leads the world in digital payments — by a factor of 5.
          </div>

          {/* Terracotta accent line — punctuation, not decoration */}
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: 320,
              height: 3,
              backgroundColor: P.terracotta,
              marginTop: 28,
              borderRadius: 2,
              opacity: interpolate(
                frame,
                [pivotAt + 15, pivotAt + 22],
                [0, 1],
                C,
              ),
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────
   Scene 4: "The Stack" — The Architecture
   4 numbered steps, vertical, spine line, spring physics on circles.
   ───────────────────────────────────────────── */
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { num: 1, title: "Aadhaar", desc: "Biometric identity for 1.4 billion" },
    {
      num: 2,
      title: "Jan Dhan",
      desc: "Zero-balance bank accounts at scale",
    },
    { num: 3, title: "Mobile", desc: "Smartphones below \u20B95,000" },
    {
      num: 4,
      title: "UPI",
      desc: "Open, interoperable payment rail",
    },
  ];

  const STAGGER = 25;
  const CIRCLE_SIZE = 56;
  const STEP_HEIGHT = 120;
  const START_Y = 160;
  const LEFT_X = 160;

  // Spine line progress — grows as steps appear
  const lastStepAt = (steps.length - 1) * STAGGER;
  const spineProgress = interpolate(
    frame,
    [0, lastStepAt + 20],
    [0, 100],
    C,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label */}
      <div
        style={{
          ...reveal(frame, 0),
          position: "absolute",
          top: 80,
          left: LEFT_X,
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: P.muted,
          textTransform: "uppercase" as const,
        }}
      >
        India Stack
      </div>

      {/* Spine line — connects all circles */}
      <div
        style={{
          position: "absolute",
          left: LEFT_X + CIRCLE_SIZE / 2 - 1,
          top: START_Y + CIRCLE_SIZE / 2,
          width: 2,
          height: `${(spineProgress / 100) * (STEP_HEIGHT * (steps.length - 1))}px`,
          backgroundColor: P.light,
          borderRadius: 1,
        }}
      />

      {/* Steps */}
      {steps.map((step, i) => {
        const stepAt = i * STAGGER;

        // Circle scales in with spring physics
        const circleScale =
          frame >= stepAt
            ? spring({
                frame: frame - stepAt,
                fps,
                config: { damping: 14, stiffness: 90, mass: 0.5 },
                from: 0,
                to: 1,
              })
            : 0;

        // Description reveals 10 frames after circle lands
        const descStyle = reveal(frame, stepAt + 10);

        return (
          <div
            key={step.num}
            style={{
              position: "absolute",
              top: START_Y + i * STEP_HEIGHT,
              left: LEFT_X,
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
            }}
          >
            {/* Numbered circle */}
            <div
              style={{
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
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
                  fontFamily: sans,
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {step.num}
              </span>
            </div>

            {/* Title + description */}
            <div style={{ paddingTop: 4 }}>
              <div
                style={{
                  ...reveal(frame, stepAt + 4),
                  fontFamily: serif,
                  fontSize: 42,
                  lineHeight: 1.1,
                  color: P.text,
                  letterSpacing: "-0.02em",
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  ...descStyle,
                  fontFamily: sans,
                  fontSize: 28,
                  color: P.sub,
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                {step.desc}
              </div>
            </div>
          </div>
        );
      })}

      {/* Source — bottom left */}
      <div
        style={{
          ...reveal(frame, lastStepAt + 30),
          position: "absolute",
          bottom: 60,
          left: LEFT_X,
          fontFamily: sans,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: P.muted,
          textTransform: "uppercase" as const,
        }}
      >
        Source: iSPIRT / NPCI
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────
   Scene 5: "The Thesis" — The Slam
   Two-phase. Cream setup → HARD CUT to dark. Spring overshoot punch.
   ───────────────────────────────────────────── */
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punchAt = 70;
  const isSetupPhase = frame < punchAt;

  // Setup text — muted italic serif on cream
  const setupOpacity = interpolate(
    frame,
    [0, 18, punchAt - 2, punchAt],
    [0, 0.7, 0.7, 0],
    C,
  );

  // Punch text — spring scale from 1.14 → 1.0
  const punchProgress = frame - punchAt;
  const punchScale =
    punchProgress >= 0
      ? spring({
          frame: punchProgress,
          fps,
          config: { damping: 12, stiffness: 90, mass: 0.85 },
          from: 1.14,
          to: 1.0,
        })
      : 1.14;

  // 3-frame instant cut opacity
  const punchOpacity = interpolate(frame, [punchAt, punchAt + 3], [0, 1], C);

  // Accent line below punch
  const accentWidth = lineGrow(frame, punchAt + 10, 20);

  // Subtitle at punch + 30
  const subtitleAt = punchAt + 30;

  return (
    <AbsoluteFill
      style={{ backgroundColor: isSetupPhase ? P.bg : P.dark }}
    >
      {/* Phase 1: Setup — muted italic on cream */}
      {isSetupPhase && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: setupOpacity,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 56,
              color: P.sub,
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.3,
              fontStyle: "italic",
            }}
          >
            When the infrastructure is free...
          </div>
        </div>
      )}

      {/* Phase 2: Punch — terracotta on dark */}
      {!isSetupPhase && (
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
          }}
        >
          {/* Punch text — SLAMS in */}
          <div
            style={{
              opacity: punchOpacity,
              transform: `scale(${punchScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 136,
                lineHeight: 1.05,
                color: P.terracotta,
                textAlign: "center",
                letterSpacing: "-0.03em",
                maxWidth: 1400,
                padding: "0 80px",
              }}
            >
              everyone builds on it.
            </div>
          </div>

          {/* Terracotta accent line */}
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: 480,
              height: 4,
              backgroundColor: P.terracotta,
              marginTop: 36,
              borderRadius: 2,
              opacity: interpolate(
                frame,
                [punchAt + 10, punchAt + 16],
                [0, 0.9],
                C,
              ),
            }}
          />

          {/* Subtitle — proof */}
          <div
            style={{
              ...reveal(frame, subtitleAt),
              fontFamily: sans,
              fontSize: 28,
              color: P.muted,
              marginTop: 28,
              letterSpacing: "0.04em",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            UPI processed 16.6 billion transactions in March 2025
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────
   Composition: 5 scenes in Sequences
   ───────────────────────────────────────────── */
export const ResearchB: React.FC = () => {
  let offset = 0;
  const scenes = [
    { Component: Scene1, dur: S1_DUR },
    { Component: Scene2, dur: S2_DUR },
    { Component: Scene3, dur: S3_DUR },
    { Component: Scene4, dur: S4_DUR },
    { Component: Scene5, dur: S5_DUR },
  ];

  return (
    <AbsoluteFill>
      {scenes.map(({ Component, dur }, i) => {
        const from = offset;
        offset += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Component />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
