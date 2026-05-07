import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BeforeAfterWipeProps extends BaseProps {
  beforeLabel: string;
  afterLabel: string;
  beforeStat?: string;
  afterStat?: string;
  beforeDetail?: string;
  afterDetail?: string;
  category?: string;
  source?: string;
  at?: number;
}

/**
 * BeforeAfterWipe — Portrait 1080×1920 before/after comparison.
 * Top half shows "Before" state, bottom half "After". A horizontal
 * wipe line sweeps downward, revealing the after state beneath.
 * Clean editorial typography with terracotta accent on the wipe edge.
 */
export const BeforeAfterWipe: React.FC<BeforeAfterWipeProps> = ({
  beforeLabel,
  afterLabel,
  beforeStat,
  afterStat,
  beforeDetail,
  afterDetail,
  category = "COMPARISON",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Wipe sweeps vertically — starts near top, sweeps to midpoint
  const wipeSpring = spring({
    frame: Math.max(0, f - 25),
    fps: FPS,
    config: { damping: 22, stiffness: 35, mass: 1.0 },
  });
  const wipeY = interpolate(wipeSpring, [0, 1], [280, 960], C);

  const marginL = 100;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      {/* Category */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: marginL,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
          zIndex: 10,
        }}
      >
        {category}
      </div>

      {/* ===== BEFORE region — visible above wipe ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          clipPath: `inset(0 0 ${1920 - wipeY}px 0)`,
          backgroundColor: "#E2DED7",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 400,
            left: marginL,
            right: marginL,
          }}
        >
          {/* Before tag */}
          <div
            style={{
              ...reveal(frame, at + 6),
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.slate,
              marginBottom: 20,
            }}
          >
            BEFORE
          </div>

          {/* Before stat */}
          {beforeStat && (
            <div
              style={{
                ...reveal(frame, at + 10),
                fontFamily: serif,
                fontSize: 90,
                color: P.text,
                lineHeight: 1.05,
                marginBottom: 16,
              }}
            >
              {beforeStat}
            </div>
          )}

          {/* Before label */}
          <div
            style={{
              ...reveal(frame, at + 14),
              fontFamily: serif,
              fontSize: 48,
              color: P.text,
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            {beforeLabel}
          </div>

          {/* Before detail */}
          {beforeDetail && (
            <div
              style={{
                ...reveal(frame, at + 18),
                fontFamily: sans,
                fontSize: 28,
                color: P.sub,
                lineHeight: 1.5,
                maxWidth: 700,
              }}
            >
              {beforeDetail}
            </div>
          )}

          {/* Accent bar */}
          <div
            style={{
              width: `${lineGrow(frame, at + 16, 20)}%`,
              maxWidth: 80,
              height: 3,
              backgroundColor: P.slate,
              borderRadius: 2,
              marginTop: 24,
            }}
          />
        </div>
      </div>

      {/* ===== AFTER region — visible below wipe ===== */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          clipPath: `inset(${wipeY}px 0 0 0)`,
          backgroundColor: P.bg,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 1060,
            left: marginL,
            right: marginL,
          }}
        >
          {/* After tag */}
          <div
            style={{
              ...reveal(frame, at + 35),
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.terracotta,
              marginBottom: 20,
            }}
          >
            AFTER
          </div>

          {/* After stat */}
          {afterStat && (
            <div
              style={{
                ...reveal(frame, at + 38),
                fontFamily: serif,
                fontSize: 90,
                color: P.text,
                lineHeight: 1.05,
                marginBottom: 16,
              }}
            >
              {afterStat}
            </div>
          )}

          {/* After label */}
          <div
            style={{
              ...reveal(frame, at + 42),
              fontFamily: serif,
              fontSize: 48,
              color: P.text,
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            {afterLabel}
          </div>

          {/* After detail */}
          {afterDetail && (
            <div
              style={{
                ...reveal(frame, at + 46),
                fontFamily: sans,
                fontSize: 28,
                color: P.sub,
                lineHeight: 1.5,
                maxWidth: 700,
              }}
            >
              {afterDetail}
            </div>
          )}

          {/* Accent bar */}
          <div
            style={{
              width: `${lineGrow(frame, at + 44, 20)}%`,
              maxWidth: 80,
              height: 3,
              backgroundColor: P.terracotta,
              borderRadius: 2,
              marginTop: 24,
            }}
          />
        </div>
      </div>

      {/* ===== Wipe edge — terracotta horizontal line ===== */}
      <div
        style={{
          position: "absolute",
          top: wipeY - 2,
          left: 0,
          width: 1080,
          height: 4,
          backgroundColor: P.terracotta,
          boxShadow: `0 0 24px ${P.terracotta}44`,
          zIndex: 5,
        }}
      />

      {/* Wipe handle dot */}
      <div
        style={{
          position: "absolute",
          top: wipeY - 16,
          left: 540 - 16,
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: P.terracotta,
          border: `3px solid ${P.bg}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          zIndex: 6,
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: marginL,
            ...reveal(frame, at + 60),
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
            zIndex: 10,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
