import React from "react";
import { Composition } from "remotion";
import {
  ProportionBar,
  RangeViz,
  AscendingBars,
  DotCluster,
  HeroNumber,
  ComparisonSplit,
  DataCardGrid,
  PercentageArc,
  StackedBars,
  TimelineBar,
  WaffleGrid,
} from "./index";

// ── Demo wrapper components ───────────────────────────────────────────────────

const ProportionBarDemo = () => (
  <ProportionBar
    percent={67}
    label="Fortune Global 30 companies use Indian IT services"
    source="NASSCOM Annual Report 2024"
    categoryLabel="PENETRATION"
    at={20}
  />
);

const RangeVizDemo = () => (
  <RangeViz
    min={105}
    max={125}
    current={115}
    unit="B"
    headline="India's IT export revenue forecast for FY 2025–26"
    source="Gartner / NASSCOM 2024"
    at={20}
  />
);

const AscendingBarsDemo = () => (
  <AscendingBars
    bars={[
      { label: "Q1", height: 52 },
      { label: "Q2", height: 63 },
      { label: "Q3", height: 74 },
      { label: "Q4", height: 91 },
    ]}
    heroNumber="$245B"
    heroLabel="Total IT sector revenue, FY 2024"
    subtitle="Sequential growth each quarter; Q4 driven by AI deal closures."
    source="NASSCOM Strategic Review 2024"
    at={15}
  />
);

const DotClusterDemo = () => (
  <DotCluster
    count={430}
    label="Global 2000 companies with active India delivery centres"
    heroNumber="430+"
    source="Everest Group, March 2024"
    at={15}
  />
);

const HeroNumberDemo = () => (
  <HeroNumber
    value="$6T"
    label="Combined market cap of top 10 Indian IT firms, 2024"
    showCurve={true}
    source="BSE / NSE, December 2024"
    at={15}
  />
);

const ComparisonSplitDemo = () => (
  <ComparisonSplit
    left={{
      label: "Legacy Outsourcing",
      value: "$38B",
      barPercent: 34,
    }}
    right={{
      label: "AI-Led Services",
      value: "$112B",
      barPercent: 100,
    }}
    source="McKinsey Global Institute 2024"
    at={10}
  />
);

const DataCardGridDemo = () => (
  <DataCardGrid
    cards={[
      { value: "5.4M", label: "Tech professionals employed", color: "#C9614A" },
      { value: "31%", label: "Revenue from cloud services", color: "#7A9E7E" },
      { value: "$18B", label: "GCC captive market size", color: "#8899AA" },
      { value: "1,580", label: "Active GCCs operating in India", color: "#9E8AA0" },
    ]}
    headline="India IT Sector — Key Metrics 2024"
    source="NASSCOM / Zinnov 2024"
    at={10}
  />
);

const PercentageArcDemo = () => (
  <PercentageArc
    percent={54}
    label="Share of global IT outsourcing"
    supportingText="India accounts for more than half of all offshore IT services globally — a position built over three decades of compounding talent and infrastructure investment."
    source="IDC Global Sourcing Index 2024"
    at={15}
  />
);

const StackedBarsDemo = () => (
  <StackedBars
    bars={[
      { percent: 38, label: "Application development & maintenance" },
      { percent: 27, label: "Infrastructure & cloud managed services" },
      { percent: 19, label: "Business process outsourcing (BPO)" },
      { percent: 16, label: "Engineering R&D and product services" },
    ]}
    categoryLabel="Revenue Mix by Segment — FY 2024"
    source="NASSCOM Strategic Review 2024"
    at={10}
  />
);

const TimelineBarDemo = () => (
  <TimelineBar
    rows={[
      { label: "Founded (1968)", value: 10 },
      { label: "Y2K boom (1999)", value: 30 },
      { label: "CMM Level 5 (2003)", value: 45 },
      { label: "GFC dip (2009)", value: 55 },
      { label: "Cloud pivot (2017)", value: 80 },
      { label: "AI era (2024)", value: 100 },
    ]}
    headline="TCS Timeline"
    source="TCS Annual Report 2024"
    at={15}
  />
);

const WaffleGridDemo = () => (
  <WaffleGrid
    percent={67}
    label="Fortune Global 30 companies with Indian GCCs"
    source="NASSCOM 2024"
    at={15}
  />
);

// ── Compositions registry ─────────────────────────────────────────────────────

export const DataVizDemos: React.FC = () => (
  <>
    <Composition
      id="dataviz-proportion-bar"
      component={ProportionBarDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-range-viz"
      component={RangeVizDemo}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-ascending-bars"
      component={AscendingBarsDemo}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-dot-cluster"
      component={DotClusterDemo}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-hero-number"
      component={HeroNumberDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-comparison-split"
      component={ComparisonSplitDemo}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-data-card-grid"
      component={DataCardGridDemo}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-percentage-arc"
      component={PercentageArcDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-stacked-bars"
      component={StackedBarsDemo}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-timeline-bar"
      component={TimelineBarDemo}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />

    <Composition
      id="dataviz-waffle-grid"
      component={WaffleGridDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
