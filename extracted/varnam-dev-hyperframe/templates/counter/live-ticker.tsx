import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface TickerItem {
  key: string;
  value: string;
  /** Optional: sage for positive, mauve for negative, terracotta for neutral */
  color?: string;
}

export interface LiveTickerProps extends BaseProps {
  items: TickerItem[];
  /** Headline above the ticker tape — used when heroItem is NOT provided */
  headline?: string;
  /**
   * The specific item to spotlight as a HERO.
   * When provided: renders a large hero value (150px+ serif) center-left,
   * and moves the ticker tape to the bottom of the frame as context.
   * The hero item "emerges" from the tape with a spring animation.
   * When omitted: falls back to the classic headline + tape layout.
   */
  heroItem?: TickerItem;
  /** Scrolling speed in pixels per frame. Default: 3 */
  speed?: number;
  source?: string;
  at?: number;
}

const TICKER_HEIGHT = 84;
const ITEM_GAP = 80;
const DOT_SIZE = 8;

/**
 * LiveTicker — Horizontal scrolling ticker tape, stock-market style.
 *
 * heroItem mode: The tape moves to the bottom as context. The spotlighted
 * key=value pair emerges from the tape using spring physics and becomes the
 * hero: value at 160px serif, key label at 40px sans, anchored center-left.
 *
 * fallback mode (no heroItem): Classic headline + centered tape layout.
 */
export const LiveTicker: React.FC<LiveTickerProps> = ({
  items,
  headline,
  heroItem,
  speed = 3,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Ticker bar slides in from bottom
  const barRevealSpring = spring({
    frame: Math.max(0, frame - at - 4),
    fps: FPS,
    config: { damping: 18, stiffness: 70, mass: 0.8 },
  });
  const barY = interpolate(barRevealSpring, [0, 1], [120, 0], C);

  // Seamless scroll
  const estimatedItemWidth = 300;
  const totalSetWidth = items.length * (estimatedItemWidth + ITEM_GAP);
  const scrollOffset = (frame - at - 10) * speed;
  const wrappedOffset = scrollOffset > 0 ? scrollOffset % totalSetWidth : 0;

  const accentWidth = lineGrow(frame, at + 8, 30);

  // ─── Hero mode ────────────────────────────────────────────────────────────
  // The hero value starts at the tape's vertical center and springs up to its
  // final resting position. Scale begins at 0.3 (tape-sized) and grows to 1.0.
  const TAPE_BOTTOM = heroItem ? 84 : 0; // tape sits at bottom of frame
  const TAPE_CENTER_Y = 1080 - TAPE_BOTTOM - TICKER_HEIGHT / 2; // absolute Y of tape center
  const HERO_Y = 420; // final resting absolute Y of hero center-left block

  const heroSpring = spring({
    frame: Math.max(0, frame - at - 14),
    fps: FPS,
    config: { damping: 22, stiffness: 55, mass: 1.2 },
  });

  // Y travel: starts at tape center, rises to HERO_Y
  const heroTranslateY = interpolate(
    heroSpring,
    [0, 1],
    [TAPE_CENTER_Y - HERO_Y, 0],
    C
  );
  // Scale: starts tiny (tape-sized text / 160px ≈ 0.2), grows to 1
  const heroScale = interpolate(heroSpring, [0, 1], [0.18, 1], C);
  const heroOpacity = interpolate(heroSpring, [0, 0.15], [0, 1], C);

  const heroValueColor = heroItem?.color ?? P.terracotta;

  // ─── Shared tape renderer ─────────────────────────────────────────────────
  const renderTape = (bottomOffset: number) => (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 0,
        width: "100%",
        height: TICKER_HEIGHT,
        backgroundColor: P.dark,
        transform: `translateY(${barY}px)`,
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 2,
          backgroundColor: P.terracotta,
          opacity: 0.6,
        }}
      />

      {/* Scrolling items — three copies for seamless loop */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: TICKER_HEIGHT,
          transform: `translateX(-${wrappedOffset}px)`,
          willChange: "transform",
        }}
      >
        {[0, 1, 2].map((setIndex) => (
          <div
            key={setIndex}
            style={{
              display: "flex",
              alignItems: "center",
              height: TICKER_HEIGHT,
              flexShrink: 0,
            }}
          >
            {items.map((item, i) => {
              const valueColor = item.color || P.terracotta;
              // Dim items that match the hero so the hero "leaves" the tape
              const isDimmed =
                heroItem &&
                item.key === heroItem.key &&
                item.value === heroItem.value;
              return (
                <div
                  key={`${setIndex}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginRight: ITEM_GAP,
                    flexShrink: 0,
                    opacity: isDimmed
                      ? interpolate(heroSpring, [0, 0.6], [1, 0.2], C)
                      : 1,
                  }}
                >
                  {/* Separator dot */}
                  <div
                    style={{
                      width: DOT_SIZE,
                      height: DOT_SIZE,
                      borderRadius: DOT_SIZE / 2,
                      backgroundColor: P.muted,
                      opacity: 0.4,
                      flexShrink: 0,
                    }}
                  />

                  {/* Key */}
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 20,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: P.light,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.key}
                  </div>

                  {/* Value */}
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 32,
                      color: valueColor,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Hero mode layout ─────────────────────────────────────────────────────
  if (heroItem) {
    return (
      <AbsoluteFill style={{ backgroundColor: P.bg }}>
        {/* Tape at the very bottom — context strip */}
        {renderTape(0)}

        {/* Hero block — emerges from the tape */}
        <div
          style={{
            position: "absolute",
            top: HERO_Y,
            left: 120,
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
            transformOrigin: "left center",
          }}
        >
          {/* Key label */}
          <div
            style={{
              fontFamily: sans,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: P.muted,
              marginBottom: 12,
            }}
          >
            {heroItem.key}
          </div>

          {/* Hero value — the one thing on this frame */}
          <div
            style={{
              fontFamily: serif,
              fontSize: 160,
              lineHeight: 0.9,
              color: heroValueColor,
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
            }}
          >
            {heroItem.value}
          </div>
        </div>

        {/* Terracotta accent line — appears after hero settles */}
        <div
          style={{
            position: "absolute",
            top: HERO_Y + 220,
            left: 120,
            width: interpolate(
              heroSpring,
              [0.7, 1],
              [0, 200],
              { ...C, easing: (t) => 1 - Math.pow(1 - t, 3) }
            ),
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            opacity: interpolate(heroSpring, [0.6, 0.8], [0, 1], C),
          }}
        />

        {/* Source */}
        {source && (
          <div
            style={{
              position: "absolute",
              bottom: TICKER_HEIGHT + 20,
              left: 120,
              ...reveal(frame, at + 40),
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: P.muted,
              textTransform: "uppercase",
            }}
          >
            Source: {source}
          </div>
        )}

        {/* Live indicator */}
        <div
          style={(() => {
            const r = reveal(frame, at + 12);
            return {
              position: "absolute",
              top: 48,
              right: 60,
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: r.opacity,
              transform: r.transform,
            };
          })()}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: P.terracotta,
              opacity: interpolate(frame % 30, [0, 15, 30], [1, 0.3, 1], C),
            }}
          />
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: P.muted,
              textTransform: "uppercase",
            }}
          >
            LIVE
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ─── Fallback: headline anchored directly above the tape ─────────────────
  // The headline is NOT a floating caption — it grows directly out of the tape.
  // Tape sits at a fixed bottom position; headline hugs tight above it.
  const TAPE_BOTTOM_FALLBACK = 220;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Ticker bar — sits at a fixed bottom position */}
      {renderTape(TAPE_BOTTOM_FALLBACK)}

      {/* Headline — anchored to tape top edge, feels like it erupts upward */}
      {headline && (() => {
        const headlineSpring = spring({
          frame: Math.max(0, frame - at - 4),
          fps: FPS,
          config: { damping: 18, stiffness: 60, mass: 1.3 },
        });
        const headlineY = interpolate(headlineSpring, [0, 1], [60, 0], C);
        const headlineOpacity = interpolate(headlineSpring, [0, 0.1], [0, 1], C);
        const headlineScale = interpolate(headlineSpring, [0, 0.7, 1], [0.92, 1.03, 1.0], C);

        return (
          <div
            style={{
              position: "absolute",
              // Pin bottom of headline to just above the tape
              bottom: TAPE_BOTTOM_FALLBACK + TICKER_HEIGHT + 32,
              left: 0,
              width: "100%",
              paddingLeft: 120,
              paddingRight: 120,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px) scale(${headlineScale})`,
              transformOrigin: "left bottom",
            }}
          >
            {/* Terracotta connector bar — visual bridge from tape to headline */}
            <div
              style={{
                width: `${accentWidth}%`,
                maxWidth: 80,
                height: 4,
                backgroundColor: P.terracotta,
                borderRadius: 2,
                marginBottom: 20,
              }}
            />
            <div
              style={{
                fontFamily: serif,
                fontSize: 96,
                color: P.text,
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                maxWidth: 1400,
              }}
            >
              {headline}
            </div>
          </div>
        );
      })()}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 120,
            ...reveal(frame, at + 20),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}

      {/* Right panel — live indicator */}
      <div
        style={(() => {
          const r = reveal(frame, at + 12);
          return {
            position: "absolute",
            top: 48,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: r.opacity,
            transform: r.transform,
          };
        })()}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: P.terracotta,
            opacity: interpolate(frame % 30, [0, 15, 30], [1, 0.3, 1], C),
          }}
        />
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: P.muted,
            textTransform: "uppercase",
          }}
        >
          LIVE
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const demo = {
  compositionId: "counter-live-ticker",
  props: {
    "items": [
      {
        "key": "revenue",
        "value": "$12.8M"
      },
      {
        "key": "users",
        "value": "2.4M"
      },
      {
        "key": "retention",
        "value": "91%"
      },
      {
        "key": "latency",
        "value": "38ms"
      }
    ],
    "heroItem": {
      "key": "revenue",
      "value": "$12.8M"
    },
    "speed": 3,
    "source": "Sample data",
    "at": 15
  },
  durationInFrames: 210,
};
