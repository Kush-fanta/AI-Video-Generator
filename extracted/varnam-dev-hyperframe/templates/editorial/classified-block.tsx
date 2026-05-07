import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface ClassifiedItem {
  title: string;
  body: string;
}

interface ClassifiedBlockProps extends BaseProps {
  items: ClassifiedItem[];
  highlightIndex?: number;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * ClassifiedBlock — Dense classified ad layout.
 * Multiple small text blocks separated by thin rules.
 * Bold headers, smaller body text. One block highlighted
 * with terracotta border. Newspaper classifieds page feel.
 */
export const ClassifiedBlock: React.FC<ClassifiedBlockProps> = ({
  items,
  highlightIndex = 0,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  /* Page header entrance */
  const headerSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 90, mass: 1 },
  });

  /* Stagger per item — 6 frames apart */
  const stagger = 6;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "80px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Page header */}
        <div
          style={{
            opacity: headerSpring,
            transform: `translateY(${interpolate(headerSpring, [0, 1], [14, 0], C)}px)`,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: pal.text,
            }}
          >
            Classifieds
          </span>
        </div>

        {/* Double rule under header */}
        <div
          style={{
            width: `${lineGrow(frame, at + 2, 22)}%`,
            height: 2,
            backgroundColor: pal.text,
            marginBottom: 4,
          }}
        />
        <div
          style={{
            width: `${lineGrow(frame, at + 2, 22)}%`,
            height: 1,
            backgroundColor: pal.light,
            marginBottom: 32,
          }}
        />

        {/* Classified items — two-column layout */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            alignContent: "flex-start",
          }}
        >
          {items.map((item, i) => {
            const itemAt = at + 8 + i * stagger;
            const isHighlighted = i === highlightIndex;

            /* Highlight border spring */
            const highlightSpring = isHighlighted
              ? spring({
                  frame: Math.max(0, frame - itemAt - 4),
                  fps: FPS,
                  config: { damping: 12, stiffness: 80, mass: 1 },
                })
              : 0;

            return (
              <div
                key={i}
                style={{
                  width: "48%",
                  marginRight: i % 2 === 0 ? "4%" : 0,
                  marginBottom: 0,
                  ...reveal(frame, itemAt),
                }}
              >
                {/* Thin rule above each item */}
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: pal.light,
                    marginBottom: 16,
                  }}
                />

                <div
                  style={{
                    paddingLeft: isHighlighted ? 16 : 0,
                    borderLeft: isHighlighted
                      ? `3px solid rgba(193,122,72,${highlightSpring})`
                      : "3px solid transparent",
                    paddingBottom: 24,
                  }}
                >
                  {/* Item title */}
                  <h3
                    style={{
                      fontFamily: sans,
                      fontSize: 26,
                      fontWeight: 700,
                      color: isHighlighted ? pal.terracotta : pal.text,
                      margin: 0,
                      marginBottom: 8,
                      lineHeight: 1.2,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Item body */}
                  <p
                    style={{
                      fontFamily: serif,
                      fontSize: 22,
                      color: pal.sub,
                      margin: 0,
                      lineHeight: 1.45,
                      maxWidth: 400,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer rule */}
        <div
          style={{
            width: `${lineGrow(frame, at + 8 + items.length * stagger + 6, 20)}%`,
            height: 1,
            backgroundColor: pal.text,
            marginTop: 16,
          }}
        />

        {/* Page number feel */}
        <div
          style={{
            ...reveal(frame, at + 8 + items.length * stagger + 10),
            marginTop: 12,
            textAlign: "right",
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: pal.muted,
              letterSpacing: "0.08em",
            }}
          >
            Section C
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-classified-block",
  props: {
    items: [{ title: "AI Research Lead", body: "Bangalore. $200K+." }, { title: "Product Director", body: "Hyderabad. Global P&L." }, { title: "Staff Engineer", body: "Pune. Platform arch." }],
    highlightIndex: 0,
    at: 15,
  },
  durationInFrames: 180,
};
