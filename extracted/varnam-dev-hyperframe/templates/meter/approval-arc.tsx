import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface ApprovalArcProps extends BaseProps {
  approvalPercent: number;
  label: string;
  source?: string;
  at?: number;
}

/**
 * ApprovalArc — Semicircular protractor meter.
 * Green zone on left (approve), red zone on right (disapprove).
 * Needle springs to position. Large percentage in center.
 */
export const ApprovalArc: React.FC<ApprovalArcProps> = ({
  approvalPercent,
  label,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const needleProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 11, stiffness: 55, mass: 1.5 },
  });

  const numScale = overshootScale(frame, at + 10);
  const clamped = Math.min(Math.max(approvalPercent, 0), 100);

  // Arc geometry
  const cx = 540;
  const cy = 1000;
  const r = 360;

  // Needle angle: 0% approval = full right (0 deg), 100% = full left (-180 deg)
  // So needle sweeps from right to left as approval increases
  const targetAngle = -180 + (1 - clamped / 100) * 180;
  const needleAngle = -180 + (1 - (needleProgress * clamped) / 100) * 180;

  const arcPath = (startDeg: number, endDeg: number, radius: number) => {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Disapproval percent
  const disapproval = 100 - clamped;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 2),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: P.text,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {label}
        </div>
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* Green (approve) zone — left half */}
        <path
          d={arcPath(-180, -90, r)}
          fill="none"
          stroke={P.sage}
          strokeWidth={40}
          strokeLinecap="butt"
          opacity={0.35}
        />

        {/* Transition zone — center */}
        <path
          d={arcPath(-90, -90, r)}
          fill="none"
          stroke={P.slate}
          strokeWidth={40}
          strokeLinecap="butt"
          opacity={0.2}
        />

        {/* Red (disapprove) zone — right half */}
        <path
          d={arcPath(-90, 0, r)}
          fill="none"
          stroke={P.terracotta}
          strokeWidth={40}
          strokeLinecap="butt"
          opacity={0.35}
        />

        {/* Active fill — green side */}
        {clamped > 50 && (
          <path
            d={arcPath(-180, -180 + ((clamped - 50) / 50) * 90 * needleProgress, r)}
            fill="none"
            stroke={P.sage}
            strokeWidth={40}
            strokeLinecap="round"
          />
        )}

        {/* Active fill — red side */}
        {clamped < 50 && (
          <path
            d={arcPath(0 - ((50 - clamped) / 50) * 90 * needleProgress, 0, r)}
            fill="none"
            stroke={P.terracotta}
            strokeWidth={40}
            strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = -180 + (i / 10) * 180;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const inner = r + 26;
          const outer = inner + (isMajor ? 24 : 14);
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(rad)}
              y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)}
              y2={cy + outer * Math.sin(rad)}
              stroke={P.muted}
              strokeWidth={isMajor ? 3 : 1.5}
              opacity={0.5}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 50) * Math.cos((needleAngle * Math.PI) / 180)}
          y2={cy + (r - 50) * Math.sin((needleAngle * Math.PI) / 180)}
          stroke={P.text}
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={16} fill={P.text} />
        <circle cx={cx} cy={cy} r={7} fill={P.bg} />
      </svg>

      {/* Approval percentage */}
      <div
        style={{
          position: "absolute",
          top: cy - 130,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...reveal(frame, at + 8),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 140,
            color: clamped >= 50 ? P.sage : P.terracotta,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            transform: `scale(${numScale})`,
          }}
        >
          {Math.round(needleProgress * clamped)}%
        </div>
      </div>

      {/* APPROVE label — left */}
      <div
        style={{
          position: "absolute",
          top: cy + 20,
          left: cx - r - 40,
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            color: P.sage,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Approve
        </div>
      </div>

      {/* DISAPPROVE label — right */}
      <div
        style={{
          position: "absolute",
          top: cy + 20,
          left: cx + r - 120,
          ...reveal(frame, at + 14),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            fontWeight: 700,
            color: P.terracotta,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Disapprove
        </div>
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            top: cy + 100,
            left: 0,
            width: 1080,
            textAlign: "center",
            ...reveal(frame, at + 22),
          }}
        >
          <div
            style={{
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
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "meter-approval-arc",
  props: {
    approvalPercent: 78,
    label: "CEO Approval of GCC Strategy",
    source: "Deloitte Survey",
    at: 15,
  },
  durationInFrames: 180,
};
