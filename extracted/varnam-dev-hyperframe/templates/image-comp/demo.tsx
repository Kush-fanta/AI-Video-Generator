import { Composition } from "remotion";
import {
  FramedLeftTextRight,
  FramedRightTextLeft,
  FullBleedOverlay,
  CutoutHero,
  CutoutOverData,
  DualFrame,
  EditorialGrid,
  SplitScreenPush,
  ImageWithQuote,
  CutoutTrio,
} from "./index";

// ─── Demo wrappers ────────────────────────────────────────────────────────────

const FramedLeftDemo = () => (
  <FramedLeftTextRight
    image="demo-engineers.png"
    headline="Engineering India's Global Edge"
    body="Indian GCC centres now lead global R&D initiatives across AI, cybersecurity, and platform architecture."
    categoryLabel="THE MECHANISM"
    at={15}
  />
);

const FramedRightDemo = () => (
  <FramedRightTextLeft
    image="demo-skyline.png"
    headline="Bengaluru at the Centre of the World"
    body="More than 1,700 global capability centres call India home — the highest concentration outside the United States."
    categoryLabel="GEOGRAPHY"
    at={10}
  />
);

const FullBleedDemo = () => (
  <FullBleedOverlay
    image="demo-data-centre.png"
    headline="Infrastructure That Scales at National Speed"
    subtitle="India added 40 new hyperscale data centres in 2024 alone — more than any other emerging market."
    categoryLabel="INFRASTRUCTURE"
    at={8}
  />
);

const CutoutHeroDemo = () => (
  <CutoutHero
    bglessImageSrc="demo-cutout-brain.png"
    headline="The Intelligence Behind the Growth"
    label="AI and machine-learning talent in India grew 47% year-on-year, outpacing every other geography."
    at={10}
  />
);

const CutoutOverDataDemo = () => (
  <CutoutOverData
    cutout="demo-cutout-worker.png"
    stat="1.4M"
    statLabel="skilled professionals working in global capability centres across India"
    at={8}
  />
);

const DualFrameDemo = () => (
  <DualFrame
    leftImage="demo-old-office.png"
    leftLabel="Cost arbitrage centres — routine processing and back-office tasks"
    rightImage="demo-modern-lab.png"
    rightLabel="High-value innovation hubs — product, platform, and R&D ownership"
    connector="→"
    at={12}
  />
);

const EditorialGridDemo = () => (
  <EditorialGrid
    images={[
      { image: "demo-team-meeting.png", caption: "Cross-functional product sprints in Hyderabad" },
      { image: "demo-chip-lab.png", caption: "Semiconductor design centres in Bengaluru" },
      { image: "demo-cybersecurity.png", caption: "24/7 security operations from Chennai" },
      { image: "demo-analytics-dashboard.png", caption: "Real-time analytics hubs in Pune" },
    ]}
    categoryLabel="INSIDE THE GCC"
    at={8}
  />
);

const SplitScreenPushDemo = () => (
  <SplitScreenPush
    image="demo-innovation-hub.png"
    title="From Outsourcing to Ownership"
    body="In-house GCC — full IP ownership, senior engineering leadership on ground, product roadmap co-owned with HQ."
    stat="1,700+"
    at={10}
  />
);

const ImageWithQuoteDemo = () => (
  <ImageWithQuote
    image="demo-executive-portrait.png"
    quote="India is no longer the back office of the world. It is the engine room of global innovation."
    attribution="Salil Parekh, CEO, Infosys"
    source="Economic Times, 2024"
    at={10}
  />
);

const CutoutTrioDemo = () => (
  <CutoutTrio
    items={[
      {
        image: "demo-cutout-chip.png",
        label: "Semiconductor Design",
      },
      {
        image: "demo-cutout-cloud.png",
        label: "Cloud Infrastructure",
      },
      {
        image: "demo-cutout-ai.png",
        label: "Artificial Intelligence",
      },
    ]}
    heading="Three pillars reshaping India's role in the global technology stack."
    at={0}
  />
);

// ─── Compositions ─────────────────────────────────────────────────────────────

export const ImageCompDemos = () => (
  <>
    <Composition
      id="imgcomp-framed-left"
      component={FramedLeftDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-framed-right"
      component={FramedRightDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-full-bleed"
      component={FullBleedDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-cutout-hero"
      component={CutoutHeroDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-cutout-over-data"
      component={CutoutOverDataDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-dual-frame"
      component={DualFrameDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={160}
    />
    <Composition
      id="imgcomp-editorial-grid"
      component={EditorialGridDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={180}
    />
    <Composition
      id="imgcomp-split-screen-push"
      component={SplitScreenPushDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={180}
    />
    <Composition
      id="imgcomp-image-with-quote"
      component={ImageWithQuoteDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
    <Composition
      id="imgcomp-cutout-trio"
      component={CutoutTrioDemo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={180}
    />
  </>
);
