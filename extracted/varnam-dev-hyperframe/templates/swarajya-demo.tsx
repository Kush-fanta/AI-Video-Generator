/**
 * swarajya-demo.tsx — Swarajya channel template demos.
 * West Bengal decline story data throughout.
 * Run: npx remotion still swarajya-demo.tsx <id> out/<id>.png --frame=60
 */
import React from "react";
import { Composition, registerRoot } from "remotion";
import { RankingRace } from "./data-viz/ranking-race";
import { SlopeChart } from "./data-viz/slope-chart";
import { ThenNowColumns } from "./comparison/then-now-columns";
import { IndiaChoropleth } from "./geo/india-choropleth";
import { SP } from "./shared/swarajya-palette";

// ── Swarajya palette override ────────────────────────────────────────────────
const sw = SP;

// ── 1. RankingRace — WB per capita income rank (3rd → 24th) ─────────────────
const RankingRaceDemo: React.FC = () => (
  <RankingRace
    entries={[
      { label: "Punjab",      values: [100, 95, 88, 80, 72], color: sw.muted },
      { label: "Maharashtra", values: [95,  98, 102, 108, 115], color: sw.terracotta },
      { label: "W. Bengal",   values: [92,  75,  58,  42,  28], color: sw.mauve },
      { label: "Gujarat",     values: [70,  85,  98, 112, 130], color: sw.terracotta },
      { label: "Tamil Nadu",  values: [55,  68,  82,  98, 118], color: sw.terracotta },
    ]}
    keyframes={["1960", "1977", "1991", "2007", "2024"]}
    headline="PER CAPITA INCOME — STATE RANKINGS"
    source="RBI State Finances / Planning Commission"
    palette={sw}
    at={10}
  />
);

// ── 2. SlopeChart — Industrial output share then vs now ──────────────────────
const SlopeChartDemo: React.FC = () => (
  <SlopeChart
    startLabel="1947"
    endLabel="2024"
    items={[
      { label: "West Bengal", start: 27, end: 4 },
      { label: "Maharashtra", start: 18, end: 22 },
      { label: "Gujarat",     start: 8,  end: 18 },
      { label: "Tamil Nadu",  start: 6,  end: 14 },
    ]}
    title="SHARE OF INDIA'S INDUSTRIAL OUTPUT (%)"
    palette={sw}
    at={10}
  />
);

// ── 3. ThenNowColumns — 1947 vs 2024 ────────────────────────────────────────
const ThenNowDemo: React.FC = () => (
  <ThenNowColumns
    thenDate="1947"
    thenContent="3rd richest state. 27% of India's industrial output. The Hooghly belt ran steel, jute, chemicals, paper. Kolkata was the second city of the British Empire."
    nowDate="2024"
    nowContent="24th. 4% of industrial output. Bengal's share of the divisible tax pool: 3.1%. Debt-to-revenue ratio peaked at 396% — highest among all major states."
    palette={sw}
    at={10}
  />
);

// ── 4. IndiaChoropleth — Per capita income as % of national avg ──────────────
const IndiaMapDemo: React.FC = () => (
  <IndiaChoropleth
    data={[
      { state: "Goa",               value: 312 },
      { state: "Sikkim",            value: 289 },
      { state: "Telangana",         value: 185 },
      { state: "Karnataka",         value: 178 },
      { state: "Haryana",           value: 172 },
      { state: "Himachal Pradesh",  value: 168 },
      { state: "Maharashtra",       value: 165 },
      { state: "Gujarat",           value: 162 },
      { state: "Tamil Nadu",        value: 158 },
      { state: "Uttarakhand",       value: 145 },
      { state: "Kerala",            value: 138 },
      { state: "Punjab",            value: 130 },
      { state: "Andhra Pradesh",    value: 122 },
      { state: "Rajasthan",         value: 105 },
      { state: "Madhya Pradesh",    value: 94  },
      { state: "Assam",             value: 88  },
      { state: "West Bengal",       value: 84  },
      { state: "Odisha",            value: 82  },
      { state: "Jharkhand",         value: 78  },
      { state: "Uttar Pradesh",     value: 68  },
      { state: "Bihar",             value: 42  },
    ]}
    title="PER CAPITA INCOME — % OF NATIONAL AVERAGE"
    source="RBI State Finances 2023–24"
    unit="%"
    highlightStates={["West Bengal"]}
    highColor={sw.terracotta}
    lowColor="#1A2E4A"
    noDataColor="#1E3052"
    palette={sw}
    at={10}
  />
);

// ── Root ─────────────────────────────────────────────────────────────────────
const Root: React.FC = () => (
  <>
    <Composition
      id="sw-ranking-race"
      component={RankingRaceDemo}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="sw-slope-chart"
      component={SlopeChartDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="sw-then-now"
      component={ThenNowDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="sw-india-map"
      component={IndiaMapDemo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

registerRoot(Root);
