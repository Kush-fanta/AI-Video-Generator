import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { StatHero } from "../../hero/stat-hero";
import { PivotReframe } from "../../narrative/pivot-reframe";
import { ObjectFocus } from "../../diagram/object-focus";
import { PathJourney } from "../../diagram/path-journey";
import { FeatureSpotlight } from "../../screen/feature-spotlight";

const S1 = 180;
const S2 = 210;
const S3 = 210;
const S4 = 210;
const S5 = 180;

export const MOTION_EXPLAINER_DEMO_DURATION = S1 + S2 + S3 + S4 + S5;

export const MotionExplainerDemo: React.FC = () => {
  let offset = 0;

  return (
    <AbsoluteFill>
      <Sequence from={offset} durationInFrames={S1} name="S1-Pivot">
        <PivotReframe
          before="A weak explainer redraws the whole world every sentence."
          after="A strong explainer keeps the frame stable and mutates one thing at a time."
          pivotAt={68}
          at={0}
        />
      </Sequence>

      <Sequence from={(offset += S1)} durationInFrames={S2} name="S2-Anchor">
        <ObjectFocus
          category="ANCHOR OBJECT"
          headline="Start with one object the viewer can hold onto."
          anchorValue="01"
          anchorLabel="One claim"
          anchorDetail="Do not swap the universe every beat. Keep the reference object alive while the meaning changes around it."
          mutations={[
            {
              label: "Actor",
              detail: "Name who is moving the system.",
              x: 180,
              y: 310,
            },
            {
              label: "Pressure",
              detail: "Show the variable that changes the object.",
              x: 1430,
              y: 276,
              tone: "sage",
            },
            {
              label: "Constraint",
              detail: "Mark what limits or shapes the move.",
              x: 212,
              y: 760,
              tone: "slate",
            },
            {
              label: "Consequence",
              detail: "Land what becomes newly true.",
              x: 1404,
              y: 736,
            },
          ]}
          payoff="This is the Motion trick that actually transfers: object continuity does the comprehension work."
          source="Motion featured videos, sampled April 9, 2026"
          at={0}
        />
      </Sequence>

      <Sequence from={(offset += S2)} durationInFrames={S3} name="S3-Journey">
        <PathJourney
          category="TRACK THE TOKEN"
          headline="Move one token through the mechanism."
          travelerLabel="IDEA"
          nodes={[
            { label: "Anchor", detail: "Plant the object early.", x: 230, y: 700 },
            { label: "Mutation", detail: "Change one property only.", x: 690, y: 500 },
            { label: "Contrast", detail: "Flip the frame when the thesis hits.", x: 1170, y: 560 },
            { label: "Payoff", detail: "Arrive at the sentence that matters.", x: 1620, y: 330 },
          ]}
          payoff="The audience should follow a payload through the system, not decode a fresh diagram every cut."
          source="Storyboard grammar adapted for varnam"
          at={0}
        />
      </Sequence>

      <Sequence from={(offset += S3)} durationInFrames={S4} name="S4-Spotlight">
        <FeatureSpotlight
          category="THESIS MOMENT"
          headline="Use darkness as punctuation, not default style."
          subheadline="Motion flips into a dark stage when the sentence itself becomes the event. That inversion works because the rest of the piece stayed disciplined."
          featureName="Contrast Beat"
          heroValue="1"
          heroLabel="structural punch when the thesis lands"
          chips={[
            { label: "Silence", detail: "Leave most of the frame quiet.", x: 1438, y: 278 },
            { label: "Focus", detail: "One active accent color.", x: 260, y: 766 },
            { label: "Payoff", detail: "The line becomes the moment.", x: 1422, y: 742 },
          ]}
          source="Motion featured videos, sampled April 9, 2026"
          at={0}
        />
      </Sequence>

      <Sequence from={(offset += S4)} durationInFrames={S5} name="S5-Rule">
        <StatHero
          value="60–80%"
          label="of the frame can stay quiet in this mode"
          supportingStat="1"
          supportingLabel="main idea per screen"
          source="Motion featured videos, analyzed April 9, 2026"
          categoryLabel="WHAT TO STEAL"
          at={0}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
