import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface BarItem {
  label: string;
  height: number; // 0-100 percentage of max height
}

export interface AscendingBarsProps extends BaseProps {
  bars: BarItem[];
  heroNumber?: string;
  heroLabel?: string;
  subtitle?: string;
  source?: string;
  at?: number;
}

/** Spring-based reveal: fade + translateY with spring physics (no linear on entrances) */
const springReveal = (frame: number, at: number, fps: number) => {
  const f = Math.max(0, frame - at);
  const prog = spring({ frame: f, fps, config: { damping: 18, stiffness: 120, mass: 0.6 } });
  return {
    opacity: prog,
    transform: `translateY(${(1 - prog) * 18}px)`,
  };
};

/** Spring overshoot for hero numbers — real spring physics */
const heroSpring = (frame: number, at: number, fps: number) => {
  const f = Math.max(0, frame - at);
  const s = spring({ frame: f, fps, config: { damping: 10, stiffness: 140, mass: 0.7 } });
  // spring overshoots naturally with low damping
  return s;
};

/**
 * AscendingBars — Vertical bars ascending in height (like Q1-Q4 quarters).
 * Each bar springs up from bottom with stagger. Labels below.
 * Hero number + text on LEFT, bars on RIGHT — asymmetric editorial layout.
 * Canvas: 1920x1080 landscape (16:9).
 */
export const AscendingBars: React.FC<AscendingBarsProps> = ({
  bars,
  heroNumber,
  heroLabel,
  subtitle,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Canvas: 1920x1080 landscape
  const maxBarHeight = 560;
  const barWidth = 80;
  const barGap = 24;
  const stagger = 10;
  const totalBarsWidth = bars.length * barWidth + (bars.length - 1) * barGap;

  // Asymmetric layout: text LEFT (cols 80–700), bars RIGHT (cols 760–1840)
  const barsLeft = 1840 - totalBarsWidth; // right-aligned within right zone
  const barsBottom = 200; // baseline from bottom

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* LEFT column — hero text, asymmetric editorial */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 100,
          width: 600,
        }}
      >
        {heroNumber && (
          <div
            style={{
              ...springReveal(frame, at + 4, FPS),
              fontFamily: serif,
              fontSize: 128, // hero: well above 64px floor
              color: P.text,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              transform: `scale(${heroSpring(frame, at + 8, FPS)})`,
              transformOrigin: "left bottom",
            }}
          >
            {heroNumber}
          </div>
        )}

        {heroLabel && (
          <div
            style={{
              ...springReveal(frame, at + 14, FPS),
              fontFamily: sans,
              fontSize: 44, // label: above 40px floor
              fontWeight: 500,
              color: P.sub,
              marginTop: 20,
              lineHeight: 1.3,
              maxWidth: 520,
            }}
          >
            {heroLabel}
          </div>
        )}

        {subtitle && (
          <div
            style={{
              ...springReveal(frame, at + 22, FPS),
              fontFamily: sans,
              fontSize: 24, // secondary: above 20px floor
              color: P.muted,
              marginTop: 16,
              maxWidth: 480,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* RIGHT column — bars, anchored at baseline, growing upward */}
      <div
        style={{
          position: "absolute",
          left: barsLeft,
          bottom: barsBottom,
          width: totalBarsWidth + 72, // extra for y-axis labels
          height: maxBarHeight + 80,
        }}
      >
        {/* Horizontal baseline */}
        <div
          style={{
            ...springReveal(frame, at + 6, FPS),
            position: "absolute",
            bottom: 36,
            left: -16,
            width: totalBarsWidth + 32,
            height: 1,
            backgroundColor: P.light,
          }}
        />

        {/* Tick mark lines + Y-axis labels */}
        {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                bottom: 36 + maxBarHeight * frac,
                left: -16,
                width: totalBarsWidth + 32,
                height: 1,
                backgroundColor: P.light,
                opacity: frac === 1.0 ? 0.6 : 0.35,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 36 + maxBarHeight * frac - 8,
                left: -60,
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 600,
                color: P.muted,
                letterSpacing: "0.06em",
                textAlign: "right",
                width: 40,
                ...springReveal(frame, at + 6, FPS),
              }}
            >
              {Math.round(frac * 100)}%
            </div>
          </div>
        ))}

        {bars.map((bar, i) => {
          const barAt = at + 8 + i * stagger;
          const f = Math.max(0, frame - barAt);

          // Spring physics for bar height — bouncy entrance
          const heightProgress = spring({
            frame: f,
            fps: FPS,
            config: { damping: 14, stiffness: 100, mass: 0.7 },
          });

          const barH = (bar.height / 100) * maxBarHeight * heightProgress;
          const x = i * (barWidth + barGap);

          // Color gradient: earlier bars muted, later bars intensify
          const colors = [P.light, P.slate, P.sage, P.terracotta];
          const color = colors[Math.min(i, colors.length - 1)];

          return (
            <div key={i}>
              {/* Bar */}
              <div
                style={{
                  position: "absolute",
                  left: x,
                  bottom: 37,
                  width: barWidth,
                  height: barH,
                  backgroundColor: color,
                  borderRadius: "6px 6px 0 0",
                }}
              />

              {/* Label below baseline */}
              <div
                style={{
                  ...springReveal(frame, barAt + 6, FPS),
                  position: "absolute",
                  left: x,
                  bottom: 4,
                  width: barWidth,
                  textAlign: "center",
                  fontFamily: sans,
                  fontSize: 28, // secondary label — above 20px floor
                  fontWeight: 600,
                  color: P.sub,
                }}
              >
                {bar.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source — bottom left */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 100,
            ...springReveal(frame, at + bars.length * stagger + 25, FPS),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase" as const,
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "dataviz-ascending-bars",
  props: {
    "bars": [
      {
        "label": "India",
        "height": 42
      },
      {
        "label": "UAE",
        "height": 58
      },
      {
        "label": "US",
        "height": 71
      },
      {
        "label": "UK",
        "height": 84
      }
    ],
    "heroNumber": "1.25M",
    "heroLabel": "Annual hires",
    "subtitle": "Bars grow in height from left to right",
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 180,
};
