import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface PollOption {
  text: string;
  percent: number;
  winner?: boolean;
}

export interface PollResultProps extends BaseProps {
  /** Poll question */
  question: string;
  /** 2-4 poll options with percentages */
  options: PollOption[];
  /** Total votes label */
  totalVotes?: string;
  /** Frame when element appears */
  at?: number;
}

const BAR_STAGGER = 16;
const BAR_HEIGHT = 72;

/**
 * Social media poll results. Question at top. 2-4 options, each with a
 * horizontal bar filling to its percentage. Winner highlighted in terracotta.
 * Vote count shown. Bars fill with spring physics.
 * Social media card frame (rounded corners, shadow).
 * Canvas: 1080×1920 portrait.
 */
export const PollResult: React.FC<PollResultProps> = ({
  question,
  options,
  totalVotes,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Card entrance
  const cardScale = spring({
    frame: Math.max(0, f),
    fps: FPS,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0.94,
    to: 1.0,
  });
  const cardOpacity = interpolate(f, [0, 10], [0, 1], C);

  /** Bar fill for each option — spring physics */
  const barFill = (i: number, percent: number) => {
    const start = 24 + i * BAR_STAGGER;
    const progress = spring({
      frame: Math.max(0, f - start),
      fps: FPS,
      config: { damping: 18, stiffness: 80, mass: 1.2 },
      from: 0,
      to: 1,
    });
    return f >= start ? progress * percent : 0;
  };

  /** Option text and percent reveal */
  const optionReveal = (i: number) => {
    const start = 24 + i * BAR_STAGGER;
    const progress = spring({
      frame: Math.max(0, f - start),
      fps: FPS,
      config: { damping: 14, stiffness: 120, mass: 0.8 },
      from: 0,
      to: 1,
    });
    return {
      opacity: f >= start ? progress : 0,
      transform: `translateY(${f >= start ? interpolate(progress, [0, 1], [12, 0]) : 12}px)`,
    };
  };

  // Check mark for winner
  const CheckMark = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill={P.terracotta} />
      <path
        d="M8 12L11 15L16 9"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Poll card */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 56,
          right: 56,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          padding: "48px 44px 40px",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
        }}
      >
        {/* Poll icon + header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
            ...reveal(frame, at + 4),
          }}
        >
          {/* Bar chart icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="16" width="6" height="10" rx="1.5" fill={P.terracotta} />
            <rect x="11" y="8" width="6" height="18" rx="1.5" fill={P.terracotta} opacity="0.7" />
            <rect x="20" y="2" width="6" height="24" rx="1.5" fill={P.terracotta} opacity="0.4" />
          </svg>
          <span
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: P.muted,
            }}
          >
            Poll
          </span>
        </div>

        {/* Question */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 44,
            lineHeight: 1.2,
            color: P.text,
            marginBottom: 40,
            ...reveal(frame, at + 8),
          }}
        >
          {question}
        </div>

        {/* Options */}
        {options.map((opt, i) => {
          const isWinner = opt.winner === true;
          const fillWidth = barFill(i, opt.percent);
          const barColor = isWinner ? P.terracotta : P.light;
          const textColor = isWinner ? P.text : P.sub;

          return (
            <div
              key={i}
              style={{
                marginBottom: 20,
                ...optionReveal(i),
              }}
            >
              {/* Bar track */}
              <div
                style={{
                  position: "relative",
                  height: BAR_HEIGHT,
                  borderRadius: 12,
                  backgroundColor: "#F5F4F0",
                  overflow: "hidden",
                }}
              >
                {/* Fill */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${fillWidth}%`,
                    backgroundColor: barColor,
                    borderRadius: 12,
                    opacity: isWinner ? 1 : 0.5,
                  }}
                />

                {/* Text overlay */}
                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {isWinner && <CheckMark />}
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 28,
                        fontWeight: isWinner ? 700 : 500,
                        color: textColor,
                      }}
                    >
                      {opt.text}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: sans,
                      fontSize: 28,
                      fontWeight: 700,
                      color: isWinner ? P.terracotta : P.sub,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Math.round(fillWidth)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Total votes */}
        {totalVotes && (
          <div
            style={{
              marginTop: 16,
              fontFamily: sans,
              fontSize: 22,
              color: P.muted,
              ...reveal(frame, at + 24 + options.length * BAR_STAGGER),
            }}
          >
            {totalVotes} votes · Final results
          </div>
        )}
      </div>

      {/* Editorial accent below card */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 80,
          ...reveal(frame, at + 40 + options.length * BAR_STAGGER),
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 64,
            color: P.text,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: 600,
          }}
        >
          {options.find((o) => o.winner)?.text || options[0].text}
        </div>
        <div
          style={{
            width: `${lineGrow(frame, at + 50, 24)}%`,
            maxWidth: 120,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 16,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "screen-poll-result",
  props: {
    question: "Top GCC destination?",
    options: [{ text: "India", percent: 67, winner: true }, { text: "Shared", percent: 22 }, { text: "Shifting", percent: 11 }],
    totalVotes: "12,847",
    at: 15,
  },
  durationInFrames: 180,
};
