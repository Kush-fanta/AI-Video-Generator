import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow } from "../shared/primitives";
import type { BaseProps, ImageRef } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface FadeRevealProps extends BaseProps {
  /** Category label — small, top-left, appears first */
  categoryLabel?: string;
  /** Hero text content — the main reveal */
  heroText: string;
  /** Supporting text below hero */
  supportingText?: string;
  /** Optional image alongside text */
  image?: ImageRef;
  /** Frame when hero text appears (default 20) */
  heroAt?: number;
  /** Frame when supporting elements appear */
  supportAt?: number;
}

/**
 * FadeReveal — editorial document loading sequence.
 * Cream bg. Elements appear with orchestrated timing:
 * category label first (14px, top-left), accent line grows,
 * hero content reveals, then supporting elements. Like a document
 * loading in editorial sequence.
 */
export const FadeReveal: React.FC<FadeRevealProps> = ({
  categoryLabel,
  heroText,
  supportingText,
  image,
  heroAt = 20,
  supportAt,
}) => {
  const frame = useCurrentFrame();
  const resolvedSupportAt = supportAt ?? heroAt + 18;

  // Category label appears first
  const labelAt = 0;
  const accentAt = 8;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label — first to appear, top-left */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 100,
            ...reveal(frame, labelAt),
            fontFamily: sans,
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.muted,
            fontWeight: 500,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: image ? "58%" : "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 100,
        }}
      >
        {/* Accent line — grows before hero */}
        <div
          style={{
            width: `${lineGrow(frame, accentAt, 20)}%`,
            maxWidth: 60,
            height: 3,
            backgroundColor: P.terracotta,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Hero text */}
        <div
          style={{
            ...reveal(frame, heroAt),
            fontFamily: serif,
            fontSize: 68,
            lineHeight: 1.15,
            color: P.text,
            letterSpacing: "-0.02em",
            maxWidth: 800,
          }}
        >
          {heroText}
        </div>

        {/* Supporting text */}
        {supportingText && (
          <div
            style={{
              ...reveal(frame, resolvedSupportAt),
              fontFamily: sans,
              fontSize: 24,
              lineHeight: 1.5,
              color: P.sub,
              marginTop: 24,
              maxWidth: 600,
              fontWeight: 400,
            }}
          >
            {supportingText}
          </div>
        )}
      </div>

      {/* Optional image — right side */}
      {image && (
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: 80,
            width: "35%",
            height: "70%",
            ...reveal(frame, resolvedSupportAt + 6),
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>
      )}

      {/* Bottom decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          width: `${lineGrow(frame, resolvedSupportAt + 4, 30)}%`,
          maxWidth: 300,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-fade-reveal",
  props: {
    categoryLabel: "DOCUMENT",
    heroText: "The record loads in sequence.",
    supportingText: "First the label, then the line, then the page."
  },
  durationInFrames: 180,
};
