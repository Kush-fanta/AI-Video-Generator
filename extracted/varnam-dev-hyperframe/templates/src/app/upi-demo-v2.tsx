/**
 * UPI Demo V2 — Motion-quality composition.
 * ~130 seconds (3900 frames @ 30fps), 20 cuts, 13 template categories.
 *
 * V2 improvements:
 * - More visual variety: dot-cluster, ascending-bars, staccato-list, zoom-punch, weight-contrast, step-sequence
 * - Better pacing: varied hold times, breathing moments, DarkPunch at structural climax
 * - Narrative arc: hook → mechanism → scale → global comparison → implication → closing
 * - Two DarkPunch moments (midpoint climax + closing thesis)
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";

// Hero
import { SectionHeader } from "../../hero/section-header";
import { StatHero } from "../../hero/stat-hero";

// Data Viz
import { ProportionBar } from "../../data-viz/proportion-bar";
import { ComparisonSplit } from "../../data-viz/comparison-split";
import { AscendingBars } from "../../data-viz/ascending-bars";
import { DotCluster } from "../../data-viz/dot-cluster";

// Image Comp
import { FramedLeftTextRight } from "../../image-comp/framed-left-text-right";
import { CutoutOverData } from "../../image-comp/cutout-over-data";

// Counter
import { Odometer } from "../../counter/odometer";

// Narrative
import { PivotReframe } from "../../narrative/pivot-reframe";
import { ProgressiveBuild } from "../../narrative/progressive-build";
import { StaccatoList } from "../../narrative/staccato-list";
import { WeightContrast } from "../../narrative/weight-contrast";

// Transitions
import { DarkPunch } from "../../transitions/dark-punch";
import { BreathBeat } from "../../transitions/breath-beat";
import { ZoomPunch } from "../../transitions/zoom-punch";

// Timeline
import { EventTimeline } from "../../timeline/event-timeline";

// Geo
import { CountryHighlight } from "../../geo/country-highlight";

// Diagram
import { StepSequence } from "../../diagram/step-sequence";

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

// Cumulative timeline — each cut's start = previous cut's end
const T = {
  c1:  0,     // SectionHeader: 6s
  c2:  6,     // FramedLeftTextRight: 7s
  c3:  13,    // ZoomPunch: 5s
  c4:  18,    // StepSequence: 10s
  c5:  28,    // EventTimeline: 8s
  c6:  36,    // Odometer: 6s
  c7:  42,    // DotCluster: 7s
  c8:  49,    // CutoutOverData: 6s
  c9:  55,    // DarkPunch (climax): 7s
  c10: 62,    // AscendingBars: 6s
  c11: 68,    // ComparisonSplit: 8s
  c12: 76,    // WeightContrast: 6s
  c13: 82,    // CountryHighlight: 6s
  c14: 88,    // StatHero: 6s
  c15: 94,    // StaccatoList: 8s
  c16: 102,   // PivotReframe: 6s
  c17: 108,   // ProportionBar: 5s
  c18: 113,   // ProgressiveBuild: 7s
  c19: 120,   // DarkPunch (closing thesis): 5s
  c20: 125,   // BreathBeat: 5s
  end: 130,
};

export const UpiDemoV2: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* ═══ ACT 1: THE HOOK (0-18s) ═══ */}

      {/* CUT 1 — Open with scale. The number IS the hook. */}
      <Sequence from={s(T.c1)} durationInFrames={s(T.c2 - T.c1)}>
        <SectionHeader
          number="16.6B"
          name="Transactions Per Month"
          description="Inside the world's largest real-time payment system — and it's free"
          categoryLabel="INDIA PILL"
          at={10}
        />
      </Sequence>

      {/* CUT 2 — Personal entry: a specific moment, November 2016. */}
      <Sequence from={s(T.c2)} durationInFrames={s(T.c3 - T.c2)}>
        <FramedLeftTextRight
          image="demo.png"
          headline="November 8, 2016"
          body="Overnight, 86% of India's currency became worthless. The queues lasted weeks. But the same year, something else launched — quietly."
          categoryLabel="THE CATALYST"
          at={10}
        />
      </Sequence>

      {/* CUT 3 — The name EXPLODES. Spring overshoot. */}
      <Sequence from={s(T.c3)} durationInFrames={s(T.c4 - T.c3)}>
        <ZoomPunch
          text="Unified Payments Interface"
          subtitle="April 2016 — 21 banks, NPCI backbone"
          at={10}
        />
      </Sequence>

      {/* ═══ ACT 2: THE MECHANISM (18-42s) ═══ */}

      {/* CUT 4 — The gears: four layers that made UPI possible. */}
      <Sequence from={s(T.c4)} durationInFrames={s(T.c5 - T.c4)}>
        <StepSequence
          category="THE STACK"
          steps={[
            { number: "1", title: "Aadhaar", description: "1.4 billion digital identities" },
            { number: "2", title: "Jan Dhan", description: "520 million bank accounts opened" },
            { number: "3", title: "Smartphones", description: "Dropped below ₹5,000" },
            { number: "4", title: "NPCI Rail", description: "Open, interoperable — not a walled garden" },
          ]}
          source="India Stack / NPCI"
          at={10}
        />
      </Sequence>

      {/* CUT 5 — The growth arc. From 21 banks to 10 billion/month. */}
      <Sequence from={s(T.c5)} durationInFrames={s(T.c6 - T.c5)}>
        <EventTimeline
          categoryLabel="THE ARC"
          events={[
            { year: "2016", title: "Launch", description: "21 banks, zero users" },
            { year: "2018", title: "100M/mo", description: "Transactions cross 100 million" },
            { year: "2020", title: "COVID", description: "Pandemic accelerates cashless" },
            { year: "2023", title: "10B/mo", description: "Ten billion monthly" },
            { year: "2025", title: "16.6B/mo", description: "₹20.64 lakh crore volume" },
          ]}
          source="NPCI Monthly Reports"
          at={10}
        />
      </Sequence>

      {/* CUT 6 — Mechanical odometer rolls to final number. */}
      <Sequence from={s(T.c6)} durationInFrames={s(T.c7 - T.c6)}>
        <Odometer
          value={16580}
          suffix="M"
          label="Monthly UPI transactions — March 2025"
          source="NPCI"
          at={10}
        />
      </Sequence>

      {/* ═══ ACT 3: THE SCALE (42-68s) ═══ */}

      {/* CUT 7 — Golden-angle spiral. Visceral quantity visualization. */}
      <Sequence from={s(T.c7)} durationInFrames={s(T.c8 - T.c7)}>
        <DotCluster
          count={80}
          heroNumber="553M"
          label="Transactions per day — from chai stalls to hospitals"
          dotUnit="~7M transactions"
          source="NPCI March 2025"
          at={10}
        />
      </Sequence>

      {/* CUT 8 — Human scale meets data. Cutout foreground, stat behind. */}
      <Sequence from={s(T.c8)} durationInFrames={s(T.c9 - T.c8)}>
        <CutoutOverData
          cutout="demo-cutout.png"
          stat="₹687"
          statLabel="Average transaction — a chai, an auto ride, a doctor visit"
          source="NPCI March 2025"
          at={10}
        />
      </Sequence>

      {/* CUT 9 — STRUCTURAL CLIMAX. Setup fades → hard cut dark → punch SLAMS. */}
      <Sequence from={s(T.c9)} durationInFrames={s(T.c10 - T.c9)}>
        <DarkPunch
          setupText="India processes more real-time payments than..."
          punchText="the rest of the world combined."
          subtitle="46% of all global real-time transactions"
          punchAt={60}
        />
      </Sequence>

      {/* CUT 10 — Chart as payoff. Bars spring up with bounce. */}
      <Sequence from={s(T.c10)} durationInFrames={s(T.c11 - T.c10)}>
        <AscendingBars
          heroNumber="4×"
          heroLabel="Transaction growth in 3 years"
          bars={[
            { label: "Q1'22", height: 25 },
            { label: "Q1'23", height: 45 },
            { label: "Q1'24", height: 70 },
            { label: "Q1'25", height: 100 },
          ]}
          source="NPCI Quarterly Reports"
          at={10}
        />
      </Sequence>

      {/* ═══ ACT 4: GLOBAL COMPARISON (68-88s) ═══ */}

      {/* CUT 11 — Split panel: UPI vs Visa+Mastercard. */}
      <Sequence from={s(T.c11)} durationInFrames={s(T.c12 - T.c11)}>
        <ComparisonSplit
          left={{
            label: "Visa + Mastercard",
            value: "~700M/day",
            barPercent: 45,
            subtitle: "Global combined, all countries",
          }}
          right={{
            label: "UPI",
            value: "553M/day",
            barPercent: 85,
            subtitle: "India alone — single open rail",
          }}
          headline="Daily transaction volume"
          source="NPCI, Nilson Report 2024"
          at={10}
        />
      </Sequence>

      {/* CUT 12 — Visual weight IS the argument. 0% vs 1.5-3%. */}
      <Sequence from={s(T.c12)} durationInFrames={s(T.c13 - T.c12)}>
        <WeightContrast
          primary={{ value: "0%", label: "UPI merchant discount rate" }}
          secondary={{ value: "1.5–3%", label: "Global card network MDR" }}
          at={10}
        />
      </Sequence>

      {/* CUT 13 — The rail is exporting. 7 countries and growing. */}
      <Sequence from={s(T.c13)} durationInFrames={s(T.c14 - T.c13)}>
        <CountryHighlight
          countryName="India"
          value="7 countries"
          label="UPI accepted: Singapore, UAE, France, Sri Lanka, Mauritius, Bhutan, Nepal"
          source="NPCI International 2025"
          at={10}
        />
      </Sequence>

      {/* ═══ ACT 5: IMPLICATION + CLOSING (88-130s) ═══ */}

      {/* CUT 14 — Raw scale of money moving. $247B in a single month. */}
      <Sequence from={s(T.c14)} durationInFrames={s(T.c15 - T.c14)}>
        <StatHero
          value="₹20.64L Cr"
          label="Monthly UPI transaction value — March 2025"
          supportingStat="$247B"
          supportingLabel="USD equivalent — single month"
          source="NPCI / RBI"
          categoryLabel="VOLUME"
          at={10}
        />
      </Sequence>

      {/* CUT 15 — What UPI replaced. Rhythm accelerates. Last item: "All of it." */}
      <Sequence from={s(T.c15)} durationInFrames={s(T.c16 - T.c15)}>
        <StaccatoList
          items={[
            { text: "Cash", at: 0 },
            { text: "Cheques", at: 20 },
            { text: "Card swipes", at: 36 },
            { text: "Bank transfers", at: 48 },
            { text: "All of it.", at: 66 },
          ]}
          at={10}
        />
      </Sequence>

      {/* CUT 16 — Reframe: what the viewer believed at the start is now wrong. */}
      <Sequence from={s(T.c16)} durationInFrames={s(T.c17 - T.c16)}>
        <PivotReframe
          before="India was where you sent work to get it done cheaper."
          after="Now it's where payments happen at zero cost — and the world wants the blueprint."
          pivotAt={50}
          at={10}
        />
      </Sequence>

      {/* CUT 17 — This is public, not private. 100% fill. */}
      <Sequence from={s(T.c17)} durationInFrames={s(T.c18 - T.c17)}>
        <ProportionBar
          percent={100}
          label="UPI is public infrastructure — built by NPCI, backed by RBI"
          categoryLabel="OWNERSHIP"
          contextStat="Not a startup. Not a product. A rail."
          source="NPCI / Indian Banks' Association"
          at={10}
        />
      </Sequence>

      {/* CUT 18 — Earned conclusion. The plant from Act 2 crystallized. */}
      <Sequence from={s(T.c18)} durationInFrames={s(T.c19 - T.c18)}>
        <ProgressiveBuild
          title="Why UPI worked"
          points={[
            "Identity layer: Aadhaar",
            "Access layer: Jan Dhan accounts",
            "Device layer: cheap smartphones",
            "Rail layer: NPCI — open, interoperable, free",
          ]}
          stagger={30}
          at={10}
        />
      </Sequence>

      {/* CUT 19 — Closing thesis. Hard cut dark. Three words. */}
      <Sequence from={s(T.c19)} durationInFrames={s(T.c20 - T.c19)}>
        <DarkPunch
          punchText="Free. Open. Unstoppable."
          subtitle="The most powerful financial infrastructure on Earth"
          punchAt={15}
        />
      </Sequence>

      {/* CUT 20 — The room after the applause. Let it breathe. */}
      <Sequence from={s(T.c20)} durationInFrames={s(T.end - T.c20)}>
        <BreathBeat
          text="That's not a branding statement."
          subtext="It's a structural one."
          subtextAt={50}
          at={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const UPI_DEMO_V2_DURATION = s(T.end);
