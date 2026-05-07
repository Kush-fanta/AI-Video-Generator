import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, COUNTRY_PATHS, GEO_VIEWBOX } from "./geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/**
 * TerritoryExpansion — sequential territory expansion across time stages,
 * with a timeline scrubber bar and year callout. Past stages fade to ghost
 * as the next stage activates.
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). Default: 3-stage South Asian demo — India → India+Pakistan → South Asia.
 * With exactly 2 stages, the second is automatically scaled 1.25× to dramatize the delta.
 */
interface TerritoryStage {
  year: string;
  /** SVG path for territory at this stage — must be in the same space as mapViewBox */
  path: string;
  label?: string;
}

export interface TerritoryExpansionProps extends BaseProps {
  stages?: TerritoryStage[];
  title?: string;
  fillColor?: string;
  /** SVG path for background map outline */
  mapPath?: string;
  mapViewBox?: string;
  source?: string;
  at?: number;
}

const _defaultStages: TerritoryStage[] = [
  { year: "Stage 1", path: COUNTRY_PATHS.India, label: "India" },
  {
    year: "Stage 2",
    path: [COUNTRY_PATHS.India, COUNTRY_PATHS.Pakistan].join(" "),
    label: "India + Pakistan",
  },
  {
    year: "Stage 3",
    path: [
      COUNTRY_PATHS.India,
      COUNTRY_PATHS.Pakistan,
      COUNTRY_PATHS.Bangladesh,
      COUNTRY_PATHS.SriLanka,
    ].join(" "),
    label: "South Asia",
  },
];

export const TerritoryExpansion: React.FC<TerritoryExpansionProps> = ({
  stages = _defaultStages,
  title,
  fillColor = P.terracotta,
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const totalDur = 180;
  const stageDur = stages.length > 1 ? Math.floor((totalDur - 30) / stages.length) : totalDur - 30;

  const yearScale = overshootScale(frame, at + 10);

  const activeIndex = Math.min(
    stages.length - 1,
    Math.floor(interpolate(f, [10, totalDur - 20], [0, stages.length], C)),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {title && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 80,
            right: 80,
            ...reveal(frame, at + 2),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              color: P.text,
              lineHeight: 1.15,
              maxWidth: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 20)}%`,
              maxWidth: 120,
              height: 3,
              backgroundColor: fillColor,
              marginTop: 12,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <svg
        style={{ position: "absolute", top: 100, left: 120 }}
        width={1400}
        height={700}
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {mapPath && (
          <path
            d={mapPath}
            fill="none"
            stroke={P.light}
            strokeWidth={1.2}
          />
        )}

        {stages.map((stage, i) => {
            const stageStart = at + 10 + i * stageDur;
            const stageF = Math.max(0, frame - stageStart);
            const fillAnim = spring({
              frame: stageF,
              fps: FPS,
              config: { damping: 16, stiffness: 55, mass: 0.9 },
            });

            const isActive = i <= activeIndex;
            const isCurrent = i === activeIndex;
            const opacity = isActive
              ? isCurrent
                ? fillAnim * 0.85
                : interpolate(fillAnim, [0, 1], [0.85, 0.35], C)
              : 0;

            // When exactly 2 stages, scale the second stage up for dramatic delta
            const expansionScale = stages.length === 2 && i === 1 ? 1.25 : 1;

            return (
              <g key={i} transform={expansionScale !== 1 ? `scale(${expansionScale})` : undefined}>
                <path
                  d={stage.path}
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={isCurrent ? fillColor : P.muted}
                  strokeWidth={isCurrent ? 2 : 0.8}
                  strokeOpacity={isActive ? 1 : 0}
                  strokeDasharray={isCurrent ? "none" : "4 3"}
                />
              </g>
            );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 340,
          textAlign: "right",
        }}
      >
        {stages.map((stage, i) => {
          const stageStart = at + 12 + i * stageDur;
          const isCurrent = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <div
              key={i}
              style={{
                ...reveal(frame, stageStart),
                marginBottom: 24,
                opacity: isCurrent ? 1 : isPast ? 0.35 : 0,
                transition: "none",
              }}
            >
              <div
                style={{
                  fontFamily: serif,
                  fontSize: isCurrent ? 72 : 40,
                  color: isCurrent ? P.text : P.muted,
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  transform: isCurrent ? `scale(${yearScale})` : "none",
                  transformOrigin: "right center",
                }}
              >
                {stage.year}
              </div>
              {stage.label && isCurrent && (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    color: P.sub,
                    marginTop: 8,
                    lineHeight: 1.4,
                  }}
                >
                  {stage.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 820,
          left: 80,
          right: 80,
          paddingRight: 80,
          display: "flex",
          alignItems: "center",
          gap: 0,
          ...reveal(frame, at + 15),
        }}
      >
        {stages.map((stage, i) => {
          const isCurrent = i === activeIndex;
          const isPast = i < activeIndex;
          const totalBarW = 1760 - 80;
          const barW = (totalBarW - (stages.length - 1) * 4) / stages.length;

          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: barW,
                  height: 6,
                  backgroundColor: isPast || isCurrent ? fillColor : P.light,
                  opacity: isPast ? 0.4 : isCurrent ? 1 : 0.3,
                  borderRadius: 3,
                }}
              />
              {i < stages.length - 1 && <div style={{ width: 4 }} />}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 836,
          left: 80,
          display: "flex",
          justifyContent: "space-between",
          width: 1760 - 80,
        }}
      >
        {stages.map((stage, i) => (
          <div
            key={i}
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: i === activeIndex ? 700 : 600,
              color: i === activeIndex ? P.text : P.muted,
              letterSpacing: "0.06em",
              textAlign: "center",
              flex: 1,
            }}
          >
            {stage.year}
          </div>
        ))}
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 80,
            ...reveal(frame, at + 30),
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
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "geo-territory-expansion",
  durationInFrames: 180,
  props: {
    stages: [
      { year: "1526", path: "M400,200 L500,190 L520,240 L480,260 L400,250 Z", label: "Babur's conquest" },
      { year: "1600", path: "M350,180 L550,170 L580,260 L520,300 L340,280 Z", label: "Akbar's empire" },
      { year: "1700", path: "M300,160 L600,150 L640,300 L560,380 L280,340 Z", label: "Aurangzeb's peak" },
    ],
    title: "Mughal Territorial Expansion",
    source: "Historical Atlas",
    at: 0,
  } satisfies TerritoryExpansionProps,
};
