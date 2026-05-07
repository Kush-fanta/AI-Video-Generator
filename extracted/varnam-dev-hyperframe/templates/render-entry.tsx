import { registerRoot, Composition } from "remotion";
import { ObjectFocus, OBJECT_FOCUS_DURATION } from "./diagram/object-focus";
import { PathJourney, PATH_JOURNEY_DURATION } from "./diagram/path-journey";
import {
  FeatureSpotlight,
  FEATURE_SPOTLIGHT_DURATION,
} from "./screen/feature-spotlight";
import {
  MotionExplainerDemo,
  MOTION_EXPLAINER_DEMO_DURATION,
} from "./src/app/motion-explainer-demo";
import { UpiDemoV2, UPI_DEMO_V2_DURATION } from "./src/app/upi-demo-v2";

const ObjectFocusDemo: React.FC = () => (
  <ObjectFocus
    category="ANCHOR OBJECT"
    headline="Start with one object the viewer can hold onto."
    anchorValue="01"
    anchorLabel="One claim"
    anchorDetail="Keep the reference object alive while the meaning changes around it."
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
        detail: "Mark what limits the move.",
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
    payoff="Object continuity does the comprehension work."
    source="Motion featured videos, sampled April 9, 2026"
    at={0}
  />
);

const PathJourneyDemo: React.FC = () => (
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
    payoff="The viewer should track a payload, not decode a fresh diagram every cut."
    source="Storyboard grammar adapted for varnam"
    at={0}
  />
);

const FeatureSpotlightDemo: React.FC = () => (
  <FeatureSpotlight
    category="THESIS MOMENT"
    headline="Use darkness as punctuation, not default style."
    subheadline="Flip into a dark stage only when the sentence itself becomes the event."
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
);

const Root: React.FC = () => (
  <>
    <Composition
      id="diagram-object-focus"
      component={ObjectFocusDemo}
      durationInFrames={OBJECT_FOCUS_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="diagram-path-journey"
      component={PathJourneyDemo}
      durationInFrames={PATH_JOURNEY_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="screen-feature-spotlight"
      component={FeatureSpotlightDemo}
      durationInFrames={FEATURE_SPOTLIGHT_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="MotionExplainerDemo"
      component={MotionExplainerDemo}
      durationInFrames={MOTION_EXPLAINER_DEMO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="UpiDemoV2"
      component={UpiDemoV2}
      durationInFrames={UPI_DEMO_V2_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

registerRoot(Root);
