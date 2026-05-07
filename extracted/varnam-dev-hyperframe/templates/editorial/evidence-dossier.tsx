import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

interface Finding {
  date: string;
  text: string;
  source?: string;
}

interface EvidenceDossierProps extends BaseProps {
  title: string;
  findings: Finding[];
  palette?: Partial<typeof P>;
  at?: number;
}

/* Confidential stamp color — terracotta at reduced opacity */
const STAMP_COLOR = "rgba(193,122,72,0.12)";

/**
 * EvidenceDossier — Investigative journalism dossier page.
 * "CONFIDENTIAL" stamped diagonally at low opacity.
 * Structured list of findings: date, finding, source.
 * Dark bg (P.dark) with light text. Serious investigative feel.
 */
export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  title,
  findings,
  palette,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);
  const pal = { ...P, ...palette };

  /* Stamp opacity — fades in early */
  const stampOpacity = interpolate(frame, [at, at + 20], [0, 1], C);

  /* Title entrance */
  const titleSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 80, mass: 1 },
  });

  /* Stagger for findings */
  const stagger = 8;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.dark }}>
      {/* CONFIDENTIAL stamp — diagonal */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-35deg)",
          fontFamily: sans,
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: STAMP_COLOR,
          opacity: stampOpacity,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        CONFIDENTIAL
      </div>

      {/* Content layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "100px 80px 80px 80px",
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* Classification bar */}
        <div style={{ ...reveal(frame, at), display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pal.terracotta }} />
          <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: pal.terracotta }}>
            Restricted
          </span>
        </div>

        {/* Top rule */}
        <div style={{ width: `${lineGrow(frame, at + 2, 24)}%`, height: 1, backgroundColor: "rgba(200,194,182,0.2)", marginBottom: 36 }} />

        {/* Title */}
        <div
          style={{
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [16, 0], C)}px)`,
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              fontFamily: serif,
              fontSize: 64,
              lineHeight: 1.1,
              color: pal.bg,
              margin: 0,
              maxWidth: 800,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Findings list */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {findings.map((finding, i) => {
            const itemAt = at + 14 + i * stagger;

            return (
              <div key={i} style={reveal(frame, itemAt)}>
                {/* Separator */}
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "rgba(200,194,182,0.12)",
                    marginBottom: 20,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 28,
                    marginBottom: 24,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Date column */}
                  <div
                    style={{
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: 22,
                        fontWeight: 600,
                        color: pal.terracotta,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {finding.date}
                    </span>
                  </div>

                  {/* Finding text */}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: 32,
                        lineHeight: 1.4,
                        color: pal.light,
                        margin: 0,
                        maxWidth: 660,
                      }}
                    >
                      {finding.text}
                    </p>

                    {/* Source */}
                    {finding.source && (
                      <span
                        style={{
                          fontFamily: sans,
                          fontSize: 20,
                          color: "rgba(155,148,139,0.7)",
                          marginTop: 8,
                          display: "inline-block",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {finding.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom rule + ref */}
        <div style={{ width: `${lineGrow(frame, at + 14 + findings.length * stagger + 4, 18)}%`, height: 1, backgroundColor: "rgba(200,194,182,0.2)", marginTop: 16, marginBottom: 16 }} />
        <div style={reveal(frame, at + 14 + findings.length * stagger + 8)}>
          <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 500, letterSpacing: "0.1em", color: "rgba(155,148,139,0.5)", textTransform: "uppercase" }}>
            Dossier ref. 4782
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "edit-evidence-dossier",
  props: {
    title: "GCC Evidence",
    findings: [{ date: "2019", text: "Revenue crosses $30B", source: "NASSCOM" }, { date: "2024", text: "Revenue hits $100B", source: "Economic Survey" }],
    at: 15,
  },
  durationInFrames: 180,
};
