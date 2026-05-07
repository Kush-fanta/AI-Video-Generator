/**
 * UPI Demo — Template stress-test for IndiaPill channel.
 * ~100 seconds (3000 frames @ 30fps), 14 cuts, 9 template categories.
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";

// Hero
import { SectionHeader } from "../../hero/section-header";
import { StatHero } from "../../hero/stat-hero";

// Data Viz
import { ProportionBar } from "../../data-viz/proportion-bar";
import { ComparisonSplit } from "../../data-viz/comparison-split";

// Image Comp
import { FramedLeftTextRight } from "../../image-comp/framed-left-text-right";
import { CutoutOverData } from "../../image-comp/cutout-over-data";
import { FramedRightTextLeft } from "../../image-comp/framed-right-text-left";

// Counter
import { Odometer } from "../../counter/odometer";

// Narrative
import { PivotReframe } from "../../narrative/pivot-reframe";
import { ProgressiveBuild } from "../../narrative/progressive-build";

// Transitions
import { DarkPunch } from "../../transitions/dark-punch";
import { BreathBeat } from "../../transitions/breath-beat";

// Timeline
import { EventTimeline } from "../../timeline/event-timeline";

// Geo
import { CountryHighlight } from "../../geo/country-highlight";

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

export const UpiDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* CUT 1 — Section Header: Title card (0-5s) */}
      <Sequence from={0} durationInFrames={s(5)}>
        <SectionHeader
          number="UPI"
          name="The World's Largest Payment Rail"
          description="How India built real-time payments for 1.4 billion people"
          categoryLabel="DIGITAL INFRASTRUCTURE"
          at={10}
        />
      </Sequence>

      {/* CUT 2 — Archival: Demonetisation queues (5-12s) */}
      <Sequence from={s(5)} durationInFrames={s(7)}>
        <FramedLeftTextRight
          image="demo.png"
          headline="November 8, 2016"
          body="Overnight, 86% of India's currency became worthless. The queues lasted weeks. But something else was launching the same year."
          categoryLabel="THE CATALYST"
          at={10}
        />
      </Sequence>

      {/* CUT 3 — Timeline: The arc (12-20s) */}
      <Sequence from={s(12)} durationInFrames={s(8)}>
        <EventTimeline
          categoryLabel="THE JOURNEY"
          events={[
            { year: "2016", title: "Launch", description: "21 banks, NPCI backbone" },
            { year: "2018", title: "100M", description: "Monthly transactions cross 100 million" },
            { year: "2020", title: "COVID", description: "Pandemic accelerates cashless shift" },
            { year: "2023", title: "10B/mo", description: "10 billion monthly transactions" },
            { year: "2025", title: "16B/mo", description: "₹20.64 lakh crore monthly volume" },
          ]}
          source="NPCI Monthly Reports"
          at={10}
        />
      </Sequence>

      {/* CUT 4 — Odometer: Monthly transactions (20-27s) */}
      <Sequence from={s(20)} durationInFrames={s(7)}>
        <Odometer
          value={16580}
          suffix="M"
          label="Monthly UPI transactions — March 2025"
          source="NPCI"
          at={10}
        />
      </Sequence>

      {/* CUT 5 — Cutout over data: Street vendor QR (27-34s) */}
      <Sequence from={s(27)} durationInFrames={s(7)}>
        <CutoutOverData
          cutout="demo-cutout.png"
          stat="553M"
          statLabel="Transactions per day — from chai stalls to hospitals"
          source="NPCI March 2025"
          at={10}
        />
      </Sequence>

      {/* CUT 6 — Dark Punch: Scale reframe (34-41s) */}
      <Sequence from={s(34)} durationInFrames={s(7)}>
        <DarkPunch
          setupText="India processes more real-time payments than..."
          punchText="the rest of the world combined."
          subtitle="46% of all global real-time transactions"
          punchAt={60}
        />
      </Sequence>

      {/* CUT 7 — Stat Hero: Volume (41-48s) */}
      <Sequence from={s(41)} durationInFrames={s(7)}>
        <StatHero
          value="₹20.64L Cr"
          label="Monthly UPI transaction value — March 2025"
          supportingStat="$247B"
          supportingLabel="USD equivalent, single month"
          source="NPCI / RBI"
          categoryLabel="VOLUME"
          at={10}
        />
      </Sequence>

      {/* CUT 8 — Comparison: UPI vs Global (48-56s) */}
      <Sequence from={s(48)} durationInFrames={s(8)}>
        <ComparisonSplit
          left={{
            label: "Visa + Mastercard",
            value: "~700M/day",
            barPercent: 45,
            subtitle: "Global combined average",
          }}
          right={{
            label: "UPI",
            value: "553M/day",
            barPercent: 85,
            subtitle: "India alone — single rail",
          }}
          headline="Daily transaction volume"
          source="NPCI, Nilson Report 2024"
          at={10}
        />
      </Sequence>

      {/* CUT 9 — Proportion Bar: Zero MDR (56-62s) */}
      <Sequence from={s(56)} durationInFrames={s(6)}>
        <ProportionBar
          percent={0}
          label="Merchant discount rate on UPI person-to-merchant transactions"
          categoryLabel="MDR"
          contextStat="vs 1.5–3% card MDR globally"
          source="RBI Circular, Jan 2020"
          at={10}
        />
      </Sequence>

      {/* CUT 10 — Pivot Reframe (62-69s) */}
      <Sequence from={s(62)} durationInFrames={s(7)}>
        <PivotReframe
          before="India was where you sent work to get it done cheaper."
          after="Now it's where payments happen at zero cost — and the world wants to copy the rails."
          pivotAt={50}
          at={10}
        />
      </Sequence>

      {/* CUT 11 — Archival: NPCI office / infra (69-76s) */}
      <Sequence from={s(69)} durationInFrames={s(7)}>
        <FramedRightTextLeft
          image="demo-boardroom.png"
          headline="Built by NPCI, not a startup"
          body="A non-profit backed by RBI and the Indian Banks' Association. The rails are public infrastructure, not a product."
          categoryLabel="THE BUILDER"
          at={10}
        />
      </Sequence>

      {/* CUT 12 — Geo: International expansion (76-83s) */}
      <Sequence from={s(76)} durationInFrames={s(7)}>
        <CountryHighlight
          countryName="India"
          value="7 countries"
          label="UPI accepted: Singapore, UAE, France, Sri Lanka, Mauritius, Bhutan, Nepal"
          source="NPCI International 2025"
          at={10}
        />
      </Sequence>

      {/* CUT 13 — Progressive Build: Why it worked (83-95s) */}
      <Sequence from={s(83)} durationInFrames={s(12)}>
        <ProgressiveBuild
          title="Why UPI worked"
          points={[
            "Aadhaar gave 1.4 billion people a digital identity",
            "Jan Dhan opened 520 million bank accounts",
            "Smartphones dropped below ₹5,000",
            "NPCI built an open, interoperable rail — not a walled garden",
          ]}
          stagger={50}
          at={10}
        />
      </Sequence>

      {/* CUT 14 — Breath Beat: Closing (95-100s) */}
      <Sequence from={s(95)} durationInFrames={s(5)}>
        <BreathBeat
          text="The most powerful financial infrastructure in the world — and it's free."
          subtext="That's not a branding statement. It's a structural one."
          subtextAt={60}
          at={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const UPI_DEMO_DURATION = s(100);
