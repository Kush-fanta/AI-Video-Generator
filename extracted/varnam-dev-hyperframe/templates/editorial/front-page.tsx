import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface FrontPageProps extends BaseProps {
  headline: string;
  subhead: string;
  byline?: string;
  date?: string;
  image?: string;
  palette?: Partial<typeof P>;
  at?: number;
}

/**
 * FrontPage — Newspaper front page layout.
 * Large serif headline, thin horizontal rules, subhead in sans,
 * photo slot area, byline with date. All elements reveal with stagger.
 * FT / Economist aesthetic.
 */
export const FrontPage: React.FC<FrontPageProps> = ({
  headline,
  subhead,
  byline,
  date,
  image,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  const topRuleWidth = lineGrow(frame, at + 2, 30);
  const midRuleWidth = lineGrow(frame, at + 14, 25);
  const bottomRuleWidth = lineGrow(frame, at + 28, 20);

  /* Spring-driven headline scale for authority */
  const headlineScale = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          padding: "100px 80px 80px 80px",
        }}
      >
        {/* Masthead area — date + edition line */}
        <div
          style={{
            ...reveal(frame, at),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: pal.muted,
            }}
          >
            {date || ""}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: pal.muted,
            }}
          >
            EDITORIAL
          </span>
        </div>

        {/* Top rule */}
        <div
          style={{
            width: `${topRuleWidth}%`,
            height: 2,
            backgroundColor: pal.text,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: `${topRuleWidth}%`,
            height: 1,
            backgroundColor: pal.light,
            marginBottom: 48,
          }}
        />

        {/* Headline */}
        <div
          style={{
            ...reveal(frame, at + 6),
            transform: `scale(${headlineScale})`,
            transformOrigin: "left top",
          }}
        >
          <h1
            style={{
              fontFamily: serif,
              fontSize: 84,
              lineHeight: 1.02,
              color: pal.text,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: 880,
            }}
          >
            {headline}
          </h1>
        </div>

        {/* Mid rule */}
        <div
          style={{
            width: `${midRuleWidth}%`,
            maxWidth: 200,
            height: 2,
            backgroundColor: pal.terracotta,
            marginTop: 32,
            marginBottom: 28,
            borderRadius: 1,
          }}
        />

        {/* Subhead */}
        <div style={reveal(frame, at + 16)}>
          <p
            style={{
              fontFamily: sans,
              fontSize: 32,
              lineHeight: 1.45,
              color: pal.sub,
              margin: 0,
              maxWidth: 780,
            }}
          >
            {subhead}
          </p>
        </div>

        {/* Photo slot */}
        <div
          style={{
            ...reveal(frame, at + 22),
            flex: 1,
            marginTop: 48,
            borderRadius: 8,
            overflow: "hidden",
            minHeight: 400,
            maxHeight: 700,
          }}
        >
          {image ? (
            <Img
              src={staticFile(image)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: pal.light,
                opacity: 0.4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  color: pal.muted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Photograph
              </span>
            </div>
          )}
        </div>

        {/* Bottom rule */}
        <div
          style={{
            width: `${bottomRuleWidth}%`,
            height: 1,
            backgroundColor: pal.light,
            marginTop: 32,
            marginBottom: 16,
          }}
        />

        {/* Byline */}
        {byline && (
          <div style={reveal(frame, at + 30)}>
            <span
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 600,
                color: pal.sub,
                letterSpacing: "0.04em",
              }}
            >
              By {byline}
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-front-page",
  props: {
    headline: "India Becomes World's GCC Capital",
    subhead: "1,850 global capability centres now call India home",
    byline: "Data Desk",
    date: "April 2024",
    at: 15,
  },
  durationInFrames: 180,
};
