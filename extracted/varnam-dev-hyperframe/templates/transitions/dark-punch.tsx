import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface DarkPunchProps extends BaseProps {
  /** Setup text shown first — muted serif that fades away */
  setupText?: string;
  /** The punch line — terracotta, massive, scale-in. THE moment. */
  punchText: string;
  /** Optional subtitle that arrives after the punch */
  subtitle?: string;
  /** Frame when setup text appears (default 0) */
  setupAt?: number;
  /** Frame when punch hits — hard cut to dark bg */
  punchAt: number;
}

/**
 * DarkPunch — the signature transition.
 * Hard cut to P.dark. Phase 1: setup fades in muted serif, then dissolves.
 * Phase 2: punch text SLAMS in terracotta (130-140px), scale 1.08→1.0 with spring.
 * Thin terracotta accent line grows below. Optional subtitle 30 frames later.
 */
export const DarkPunch: React.FC<DarkPunchProps> = ({
  setupText,
  punchText,
  subtitle,
  setupAt = 0,
  punchAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: setup text (cream bg, muted serif)
  const isSetupPhase = frame < punchAt;
  const setupOpacity = setupText
    ? interpolate(frame, [setupAt, setupAt + 18, punchAt - 12, punchAt], [0, 0.7, 0.7, 0], C)
    : 0;

  // Phase 2: punch (dark bg, terracotta)
  // Spring: damping 12 = bouncy settle, stiffness 90 = snappy but not rigid, mass 0.85
  // from: 1.14 → hard over-scale on entry so the SLAM is felt before it settles to 1.0
  const punchProgress = frame - punchAt;
  const punchScale = punchProgress >= 0
    ? spring({ frame: punchProgress, fps, config: { damping: 12, stiffness: 90, mass: 0.85 }, from: 1.14, to: 1.0 })
    : 1.14;
  // Instant cut — opacity jumps in 3 frames, not 6
  const punchOpacity = interpolate(frame, [punchAt, punchAt + 3], [0, 1], C);

  // Accent line grows below punch — wider and faster than before
  const accentWidth = lineGrow(frame, punchAt + 10, 20);

  // Subtitle appears 30 frames after punch
  const subtitleAt = punchAt + 30;

  return (
    <AbsoluteFill style={{ backgroundColor: isSetupPhase ? P.bg : P.dark }}>
      {/* Phase 1: Setup text — muted serif on cream */}
      {setupText && isSetupPhase && (
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
            {setupText}
          </div>
        </div>
      )}

      {/* Phase 2: Punch text — terracotta on dark */}
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
          {/* Punch text — THE moment */}
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
              {punchText}
            </div>
          </div>

          {/* Terracotta accent line — wider, bolder, slams in with the punch */}
          <div
            style={{
              width: `${accentWidth}%`,
              maxWidth: 480,
              height: 4,
              backgroundColor: P.terracotta,
              marginTop: 36,
              borderRadius: 2,
              opacity: interpolate(frame, [punchAt + 10, punchAt + 16], [0, 0.9], C),
            }}
          />

          {/* Subtitle — arrives 30 frames after punch */}
          {subtitle && (
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
              {subtitle}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-dark-punch",
  props: {
    setupText: "We kept adding more.",
    punchText: "The answer is subtraction.",
    subtitle: "The cleanest frame is the one that stops early.",
    setupAt: 0,
    punchAt: 54
  },
  durationInFrames: 180,
};
