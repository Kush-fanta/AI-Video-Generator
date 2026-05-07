import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, C, FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface EndTitleProps extends BaseProps {
  /** Channel name — 80px serif, muted on dark */
  channelName: string;
  /** Topic or video title below accent line */
  title?: string;
  /** "Next video" tease text at very bottom */
  teaser?: string;
  /** Frame when elements begin appearing (default 0) */
  at?: number;
}

/**
 * EndTitle — closing title card on dark bg.
 * Channel name 80px serif muted, centered. Terracotta accent line grows to 400px.
 * Title in 36px sans muted below. Optional teaser text at very bottom in 16px.
 * Holds for 3+ seconds.
 */
export const EndTitle: React.FC<EndTitleProps> = ({
  channelName,
  title,
  teaser,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Channel name spring — scale from 0.88 with overshoot
  const nameSpring = spring({
    frame: Math.max(0, frame - at - 4),
    fps: FPS,
    config: { damping: 16, stiffness: 60, mass: 1.2 },
  });
  const nameScale = interpolate(nameSpring, [0, 1], [0.88, 1.0], C);
  const nameOpacity = interpolate(nameSpring, [0, 0.12], [0, 1], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Channel name — spring scale entrance, typographic weight carries it */}
        <div
          style={{
            fontFamily: serif,
            fontSize: 96,
            lineHeight: 1.0,
            color: P.muted,
            textAlign: "center",
            letterSpacing: "-0.03em",
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
          }}
        >
          {channelName}
        </div>

        {/* Title / topic — delayed fade-in, lighter weight underneath */}
        {title && (
          <div
            style={{
              ...reveal(frame, at + 20),
              fontFamily: sans,
              fontSize: 40,
              color: P.muted,
              marginTop: 36,
              textAlign: "center",
              maxWidth: 800,
              fontWeight: 300,
              lineHeight: 1.4,
              letterSpacing: "0.04em",
              opacity: interpolate(frame, [at + 20, at + 38], [0, 0.55], C),
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Teaser — "Next video" at very bottom */}
      {teaser && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            ...reveal(frame, at + 40),
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              color: P.sub,
              letterSpacing: "0.06em",
              opacity: 0.6,
              textAlign: "center",
              maxWidth: 600,
            }}
          >
            {teaser}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-end-title",
  props: {
    channelName: "Varnam Improviser",
    title: "Templates for editorial motion",
    teaser: "Next: callouts and lower-thirds"
  },
  durationInFrames: 180,
};
