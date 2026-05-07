import React from "react";
import { Composition } from "remotion";
import {
  TitleWithFrame,
  TitleWithCutout,
  SectionHeader,
  StatHero,
  StatHeroWithImage,
  QuoteCard,
  ChannelBadge,
  ChapterMarker,
  ClosingCard,
  TopicHero,
} from "./index";

// --- Demo wrappers -----------------------------------------------------------

const TitleWithFrameDemo = () => (
  <TitleWithFrame
    title="India"
    subtitle="The world's back office is becoming its boardroom."
    categoryLabel="THE OLD STORY"
    image="demo-skyline.png"
    at={15}
  />
);

const TitleWithCutoutDemo = () => (
  <TitleWithCutout
    title="The Engineer Who Stayed"
    subtitle="Why a generation chose Bengaluru over Bay Area."
    cutout="demo-cutout.png"
    at={15}
  />
);

const SectionHeaderDemo = () => (
  <SectionHeader
    number="02"
    name="The Infrastructure Gap"
    description="Roads, ports, and power — what three decades of neglect actually cost."
    categoryLabel="GROUND TRUTH"
    at={15}
  />
);

const StatHeroDemo = () => (
  <StatHero
    value="1.4B"
    label="people added to the formal economy since 2005"
    supportingStat="38%"
    supportingLabel="share of global growth, next decade"
    source="World Bank 2024"
    categoryLabel="Population"
    at={15}
  />
);

const StatHeroWithImageDemo = () => (
  <StatHeroWithImage
    value="67%"
    label="of India's workforce still in agriculture"
    image="demo-field-worker.png"
    source="NSSO 2023"
    categoryLabel="LABOUR"
    at={15}
  />
);

const QuoteCardDemo = () => (
  <QuoteCard
    quote="We are not a poor country with a space programme. We are a frugal country that learned to do more with less."
    source="ISRO Chairman, 2023"
    highlights={["frugal country", "more with less"]}
    image="demo-rocket-cutout.png"
    at={15}
  />
);

const ChannelBadgeDemo = () => (
  <div
    style={{
      width: 1920,
      height: 1080,
      backgroundColor: "#F5F0E8",
      position: "relative",
    }}
  >
    <ChannelBadge name="Varnam" />
  </div>
);

const ChapterMarkerDemo = () => (
  <ChapterMarker
    number="03"
    title="The Demographic Window"
    at={15}
  />
);

const ClosingCardDemo = () => (
  <ClosingCard
    channelName="Varnam"
    cta="New essays every week — subscribe"
    at={15}
  />
);

const TopicHeroDemo = () => (
  <TopicHero
    title="The Monsoon Economy"
    image="demo-monsoon-fields.png"
    categoryLabel="SEASON II"
    at={15}
  />
);

// --- Compositions ------------------------------------------------------------

export const HeroDemos: React.FC = () => (
  <>
    <Composition
      id="hero-title-with-frame"
      component={TitleWithFrameDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-title-with-cutout"
      component={TitleWithCutoutDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-section-header"
      component={SectionHeaderDemo}
      durationInFrames={120}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-stat-hero"
      component={StatHeroDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-stat-hero-with-image"
      component={StatHeroWithImageDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-quote-card"
      component={QuoteCardDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-channel-badge"
      component={ChannelBadgeDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-chapter-marker"
      component={ChapterMarkerDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-closing-card"
      component={ClosingCardDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="hero-topic-hero"
      component={TopicHeroDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
