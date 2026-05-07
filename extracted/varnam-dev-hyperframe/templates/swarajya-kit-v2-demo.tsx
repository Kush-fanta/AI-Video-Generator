/**
 * swarajya-kit-v2-demo.tsx — Render stills of the 6 new Swarajya templates.
 *
 * Render all:
 *   npx remotion still swarajya-kit-v2-demo.tsx ThreatGapBarDemo --frame=60 --props='{}' out/kit-threat-gap.png
 *   npx remotion still swarajya-kit-v2-demo.tsx TimelineStripDemo --frame=60 --props='{}' out/kit-timeline.png
 *   npx remotion still swarajya-kit-v2-demo.tsx EvidenceCardDemo --frame=60 --props='{}' out/kit-evidence.png
 *   npx remotion still swarajya-kit-v2-demo.tsx StatGridDemo --frame=60 --props='{}' out/kit-statgrid.png
 *   npx remotion still swarajya-kit-v2-demo.tsx StackedStatDemo --frame=60 --props='{}' out/kit-stacked.png
 *   npx remotion still swarajya-kit-v2-demo.tsx PullQuoteDemo --frame=60 --props='{}' out/kit-pullquote.png
 */
import React from "react";
import { Composition, registerRoot } from "remotion";
import { ThreatGapBar } from "./image-comp/threat-gap-bar";
import { TimelineStrip } from "./image-comp/timeline-strip";
import { EvidenceCard } from "./image-comp/evidence-card";
import { StatGrid } from "./image-comp/stat-grid";
import { StackedStatBuild } from "./image-comp/stacked-stat-build";
import { PullQuoteOverlay } from "./image-comp/pull-quote-overlay";
import { SP } from "./shared/swarajya-palette";

const FPS = 30;

const ThreatGapBarDemo: React.FC = () => (
  <ThreatGapBar
    image="swarajya-missile.png"
    title="THE CAPABILITY DEFICIT"
    categoryLabel="THREAT ASSESSMENT"
    bars={[
      { label: "CHINA THREAT RANGE", value: 4000, displayValue: "4,000 KM", color: "threat" },
      { label: "INDIA INTERCEPT RANGE", value: 1200, displayValue: "1,200 KM", color: "accent" },
    ]}
    source="SIPRI / CSIS Missile Defense Project, 2024"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const TimelineStripDemo: React.FC = () => (
  <TimelineStrip
    image="swarajya-map.png"
    title="THE ESCALATION LADDER"
    categoryLabel="INDO-PAK BORDER"
    events={[
      { year: "1971", label: "SIMLA AGREEMENT", sublabel: "India & Pakistan" },
      { year: "1999", label: "KARGIL WAR", sublabel: "LoC infiltration" },
      { year: "2003", label: "CEASEFIRE LINE", sublabel: "Violations begin", isInflection: true },
      { year: "2016", label: "SURGICAL STRIKES", sublabel: "Cross-LoC response" },
      { year: "2019", label: "BALAKOT", sublabel: "Air strikes inside Pakistan" },
    ]}
    source="Ministry of External Affairs"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const EvidenceCardDemo: React.FC = () => (
  <EvidenceCard
    image="swarajya-sample.png"
    headline="THE AUDIT"
    categoryLabel="GOVERNMENT REPORT"
    quote="The fleet's operational availability dropped below 60% for the first time in three decades. Maintenance backlogs compounded at 14% annually."
    attribution="— Comptroller and Auditor General, Report No. 17 of 2023"
    accentWords={["60%", "14% annually"]}
    badge="#SWARAJYA"
    palette={SP}
  />
);

const StatGridDemo: React.FC = () => (
  <StatGrid
    image="swarajya-jets.png"
    title="THE NUMBERS"
    categoryLabel="IAF SQUADRON STRENGTH"
    stats={[
      { value: "42", label: "SANCTIONED SQUADRONS", accent: true },
      { value: "31", label: "CURRENT STRENGTH", negative: true },
      { value: "83", label: "TEJAS MK1A ORDERED", accent: true },
      { value: "2029", label: "FULL DELIVERY TARGET" },
    ]}
    source="Indian Air Force / Parliamentary Standing Committee on Defence"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const StackedStatDemo: React.FC = () => (
  <StackedStatBuild
    image="swarajya-pilot.png"
    title="THE DECLINE"
    categoryLabel="WEST BENGAL PER CAPITA INCOME"
    stats={[
      { value: "127.5", label: "% of national average, 1960" },
      { value: "109.2", label: "% of national average, 1980" },
      { value: "95.4", label: "% of national average, 2000", negative: true },
      { value: "83.7", label: "% of national average, 2023", negative: true },
    ]}
    source="RBI Handbook of Statistics / MOSPI"
    badge="#SWARAJYA"
    palette={SP}
  />
);

const PullQuoteDemo: React.FC = () => (
  <PullQuoteOverlay
    image="swarajya-sub.png"
    quote="We are not building for the war we want. We are building for the war we can afford. And the gap between the two is growing."
    attribution="— Former Chief of Naval Staff, Admiral Karambir Singh"
    accentWords={["the war we can afford", "growing"]}
    badge="#SWARAJYA"
    imageDim={0.18}
    palette={SP}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ThreatGapBarDemo" component={ThreatGapBarDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
    <Composition id="TimelineStripDemo" component={TimelineStripDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
    <Composition id="EvidenceCardDemo" component={EvidenceCardDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
    <Composition id="StatGridDemo" component={StatGridDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
    <Composition id="StackedStatDemo" component={StackedStatDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
    <Composition id="PullQuoteDemo" component={PullQuoteDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
  </>
);

registerRoot(RemotionRoot);
