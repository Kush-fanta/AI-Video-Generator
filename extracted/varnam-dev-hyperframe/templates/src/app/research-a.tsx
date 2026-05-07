import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Odometer } from "../../counter/odometer";
import { SplitArgument } from "../../narrative/split-argument";
import { PivotReframe } from "../../narrative/pivot-reframe";
import { StepSequence } from "../../diagram/step-sequence";
import { DarkPunch } from "../../transitions/dark-punch";

const FPS = 30;

// Scene durations in frames
const S1 = 180; // 6s — Data Hero
const S2 = 240; // 8s — Comparison
const S3 = 180; // 6s — Narrative Pivot
const S4 = 300; // 10s — Step Sequence
const S5 = 210; // 7s — Climax

export const RESEARCH_A_DURATION = S1 + S2 + S3 + S4 + S5; // 1110 frames = 37s

export const ResearchA: React.FC = () => {
  let offset = 0;

  return (
    <AbsoluteFill>
      {/* Scene 1: Data Hero — "520 Million" */}
      <Sequence from={offset} durationInFrames={S1} name="S1-DataHero">
        <Odometer
          value={520}
          suffix="M"
          label="Bank accounts opened under Jan Dhan Yojana"
          source="Reserve Bank of India, 2024"
          at={0}
        />
      </Sequence>

      {/* Scene 2: Comparison — "Old vs New" */}
      <Sequence from={(offset += S1)} durationInFrames={S2} name="S2-Comparison">
        <SplitArgument
          leftHeader="Traditional Banking"
          leftPoints={["3–5 days", "NEFT/RTGS settlement"]}
          rightHeader="UPI"
          rightPoints={["Instant", "24/7, including holidays"]}
          accentSide="right"
          at={0}
        />
      </Sequence>

      {/* Scene 3: Narrative Pivot — "The Shift" */}
      <Sequence from={(offset += S2)} durationInFrames={S3} name="S3-Pivot">
        <PivotReframe
          before="India was a cash economy. 98% of transactions were physical."
          after="Today, India leads the world in digital payments — by a factor of 5."
          pivotAt={70}
          at={0}
        />
      </Sequence>

      {/* Scene 4: Step Sequence — "The Stack" */}
      <Sequence from={(offset += S3)} durationInFrames={S4} name="S4-Steps">
        <StepSequence
          category="INDIA STACK"
          steps={[
            { number: "1", title: "Aadhaar", description: "Biometric identity for 1.4 billion" },
            { number: "2", title: "Jan Dhan", description: "Zero-balance bank accounts at scale" },
            { number: "3", title: "Mobile", description: "Smartphones below ₹5,000" },
            { number: "4", title: "UPI", description: "Open, interoperable payment rail" },
          ]}
          source="iSPIRT / NPCI"
          at={0}
        />
      </Sequence>

      {/* Scene 5: Climax — "The Thesis" */}
      <Sequence from={(offset += S4)} durationInFrames={S5} name="S5-Climax">
        <DarkPunch
          setupText="When the infrastructure is free..."
          punchText="everyone builds on it."
          subtitle="UPI processed 16.6 billion transactions in March 2025"
          setupAt={0}
          punchAt={70}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
