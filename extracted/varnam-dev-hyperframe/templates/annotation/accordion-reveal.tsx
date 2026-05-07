import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface AccordionSection {
  title: string;
  content: string;
}

interface AccordionRevealProps extends BaseProps {
  sections: AccordionSection[];
  at?: number;
}

/**
 * AccordionReveal — Vertical accordion. Collapsed headers stacked,
 * expanding one by one to reveal content. Spring physics on expansion.
 * Active section highlighted with terracotta left border. 3-5 sections.
 * Portrait 1080x1920.
 */
export const AccordionReveal: React.FC<AccordionRevealProps> = ({
  sections,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const count = Math.min(sections.length, 5);

  // Timing: each section opens in sequence
  const headerStagger = 10; // frames between header appearances
  const expandDelay = 24; // frames after first header before expansion begins
  const expandStagger = 28; // frames between each section expanding

  // Collapsed header height, expanded content height
  const headerH = 100;
  const contentMaxH = 200;

  // Total container width
  const containerW = 920;
  const containerX = (1080 - containerW) / 2;

  // Calculate vertical layout dynamically
  const getItemLayout = (index: number) => {
    const headerAt = 6 + index * headerStagger;
    const openAt = expandDelay + index * expandStagger;

    // Header slide-in spring
    const headerSpring = spring({
      frame: Math.max(0, f - headerAt),
      fps: FPS,
      config: { damping: 14, stiffness: 110, mass: 0.5 },
    });

    // Expansion spring
    const expandSpring = spring({
      frame: Math.max(0, f - openAt),
      fps: FPS,
      config: { damping: 13, stiffness: 60, mass: 0.8 },
    });

    const isExpanding = f >= openAt;
    const expandedH = interpolate(expandSpring, [0, 1], [0, contentMaxH], C);

    return { headerSpring, expandSpring, expandedH, isExpanding, headerAt };
  };

  // Calculate cumulative Y positions
  let cumulativeY = 300; // start from upper area

  const items = sections.slice(0, count).map((section, i) => {
    const layout = getItemLayout(i);
    const itemY = cumulativeY;

    // Advance Y by header height + any expanded content
    cumulativeY += headerH + layout.expandedH + 8; // 8px gap

    return { section, index: i, itemY, ...layout };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {items.map(({
        section, index, itemY, headerSpring, expandSpring,
        expandedH, isExpanding, headerAt,
      }) => {
        const headerOpacity = interpolate(headerSpring, [0, 0.3], [0, 1], C);
        const slideX = interpolate(headerSpring, [0, 1], [-30, 0], C);

        // Active border color
        const borderColor = isExpanding
          ? P.terracotta
          : P.light;
        const borderWidth = interpolate(expandSpring, [0, 1], [2, 4], C);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: containerX,
              top: itemY,
              width: containerW,
              opacity: headerOpacity,
              transform: `translateX(${slideX}px)`,
            }}
          >
            {/* Left border accent */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: borderWidth,
                height: headerH + expandedH,
                backgroundColor: borderColor,
                borderRadius: 2,
                transition: "background-color 0.1s",
              }}
            />

            {/* Header */}
            <div
              style={{
                paddingLeft: 28,
                height: headerH,
                display: "flex",
                alignItems: "center",
                cursor: "default",
              }}
            >
              {/* Section number */}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 22,
                  fontWeight: 700,
                  color: P.muted,
                  letterSpacing: "0.06em",
                  width: 56,
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 52,
                  lineHeight: 1.1,
                  color: isExpanding ? P.text : P.sub,
                  letterSpacing: "-0.01em",
                  flex: 1,
                }}
              >
                {section.title}
              </div>

              {/* Expand indicator */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  transform: `rotate(${interpolate(expandSpring, [0, 1], [0, 90], C)}deg)`,
                }}
              >
                <svg width={24} height={24} viewBox="0 0 24 24">
                  <path
                    d="M9 6L15 12L9 18"
                    fill="none"
                    stroke={P.muted}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Content — expands with spring */}
            <div
              style={{
                height: expandedH,
                overflow: "hidden",
                paddingLeft: 84,
                paddingRight: 24,
              }}
            >
              <div
                style={{
                  opacity: interpolate(expandSpring, [0.3, 0.8], [0, 1], C),
                  paddingTop: 8,
                  paddingBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 40,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: P.sub,
                    letterSpacing: "0.01em",
                  }}
                >
                  {section.content}
                </div>
              </div>
            </div>

            {/* Bottom divider */}
            <div
              style={{
                marginLeft: 28,
                height: 1,
                backgroundColor: P.light,
                opacity: 0.6,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "annot-accordion-reveal",
  props: {
    sections: [{ title: "What are GCCs?", content: "Company-owned offshore operations." }, { title: "Why India?", content: "Talent, cost, English." }, { title: "What changed?", content: "Support to ownership." }],
    at: 15,
  },
  durationInFrames: 180,
};
