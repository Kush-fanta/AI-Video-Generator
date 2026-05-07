/**
 * Demo map: compositionId → { component, durationInFrames }
 *
 * LEGACY manual entries below. New templates should export a `demo` object
 * from their .tsx file instead — they'll be auto-discovered.
 * See auto-demos.tsx for the auto-discovery system.
 */
import React from "react";
import { buildAutoDemoMap } from "./auto-demos";
import { staticAutoDemoMap } from "./static-auto-demos";

// ── Hero ────────────────────────────────────────────────────────
import { TitleWithFrame } from "../../hero/title-with-frame";
import { TitleWithCutout } from "../../hero/title-with-cutout";
import { SectionHeader } from "../../hero/section-header";
import { StatHero } from "../../hero/stat-hero";
import { StatHeroWithImage } from "../../hero/stat-hero-with-image";
import { QuoteCard } from "../../hero/quote-card";
import { ChannelBadge } from "../../hero/channel-badge";
import { ChapterMarker } from "../../hero/chapter-marker";
import { ClosingCard } from "../../hero/closing-card";
import { TopicHero } from "../../hero/topic-hero";
import { ColdOpen } from "../../hero/cold-open";
import { VerdictCard } from "../../hero/verdict-card";
import { EntityCard } from "../../hero/entity-card";
import { TimelineHero } from "../../hero/timeline-hero";
import { MapTitle } from "../../hero/map-title";
import { DuoTitle } from "../../hero/duo-title";
import { StatComparisonHero } from "../../hero/stat-comparison-hero";
import { ImageTitleOverlay } from "../../hero/image-title-overlay";
import { SequenceTitle } from "../../hero/sequence-title";
import { Provocation } from "../../hero/provocation";

// ── Data Viz ────────────────────────────────────────────────────
import { ProportionBar } from "../../data-viz/proportion-bar";
import { StackedBars } from "../../data-viz/stacked-bars";
import { RangeViz } from "../../data-viz/range-viz";
import { ComparisonSplit } from "../../data-viz/comparison-split";
import { HeroNumber } from "../../data-viz/hero-number";
import { AscendingBars } from "../../data-viz/ascending-bars";
import { DotCluster } from "../../data-viz/dot-cluster";
import { DataCardGrid } from "../../data-viz/data-card-grid";
import { PercentageArc } from "../../data-viz/percentage-arc";
import { TimelineBar } from "../../data-viz/timeline-bar";
import { Odometer as DataVizOdometer } from "../../data-viz/odometer";
import { WaffleGrid } from "../../data-viz/waffle-grid";
import { FunnelChart } from "../../data-viz/funnel-chart";
import { RadialProgress } from "../../data-viz/radial-progress";
import { ScatterBurst } from "../../data-viz/scatter-burst";
import { RankingRace } from "../../data-viz/ranking-race";
import { SplitStat } from "../../data-viz/split-stat";
import { AreaFill } from "../../data-viz/area-fill";
import { IconArray } from "../../data-viz/icon-array";
import { DeltaArrow } from "../../data-viz/delta-arrow";

// ── Image Composition ───────────────────────────────────────────
import { FramedLeftTextRight } from "../../image-comp/framed-left-text-right";
import { FramedRightTextLeft } from "../../image-comp/framed-right-text-left";
import { FullBleedOverlay } from "../../image-comp/full-bleed-overlay";
import { CutoutHero } from "../../image-comp/cutout-hero";
import { CutoutOverData } from "../../image-comp/cutout-over-data";
import { DualFrame } from "../../image-comp/dual-frame";
import { EditorialGrid } from "../../image-comp/editorial-grid";
import { SplitScreenPush } from "../../image-comp/split-screen-push";
import { ImageWithQuote } from "../../image-comp/image-with-quote";
import { CutoutTrio } from "../../image-comp/cutout-trio";
import { CutoutBeforeAfter } from "../../image-comp/cutout-before-after";
import { CutoutStack } from "../../image-comp/cutout-stack";
import { CutoutReveal } from "../../image-comp/cutout-reveal";
import { CutoutSilhouette } from "../../image-comp/cutout-silhouette";
import { CutoutCensus } from "../../image-comp/cutout-census";
import { CutoutSlam } from "../../image-comp/cutout-slam";
import { CutoutObjectPrime } from "../../image-comp/cutout-object-prime";
import { CutoutParallax } from "../../image-comp/cutout-parallax";
import { CutoutStrip } from "../../image-comp/cutout-strip";
import { CutoutShatter } from "../../image-comp/cutout-shatter";
import { CutoutSpotlight } from "../../image-comp/cutout-spotlight";
import { CutoutEvidence } from "../../image-comp/cutout-evidence";
import { CutoutMorphSplit } from "../../image-comp/cutout-morph-split";
import { CutoutTicker } from "../../image-comp/cutout-ticker";
import { CutoutScalePunch } from "../../image-comp/cutout-scale-punch";

// ── Narrative ───────────────────────────────────────────────────
import { ProgressiveBuild } from "../../narrative/progressive-build";
import { WeightContrast } from "../../narrative/weight-contrast";
import { StrikethroughReject } from "../../narrative/strikethrough-reject";
import { WordEscalation } from "../../narrative/word-escalation";
import { EditorialQuote } from "../../narrative/editorial-quote";
import { StaccatoList } from "../../narrative/staccato-list";
import { PivotReframe } from "../../narrative/pivot-reframe";
import { WordCloud } from "../../narrative/word-cloud";
import { HighlightAnnotation } from "../../narrative/highlight-annotation";
import { SplitArgument } from "../../narrative/split-argument";
import { SlamCounter } from "../../narrative/slam-counter";
import { TypewriterBurst } from "../../narrative/typewriter-burst";
import { RedactionReveal } from "../../narrative/redaction-reveal";
import { StackCollapse } from "../../narrative/stack-collapse";
import { WordSlamSequence } from "../../narrative/word-slam-sequence";
import { GlitchText } from "../../narrative/glitch-text";
import { VerdictStamp } from "../../narrative/verdict-stamp";
import { ScrollManifest } from "../../narrative/scroll-manifest";
import { SplitScreenDebate } from "../../narrative/split-screen-debate";
import { KineticQuote } from "../../narrative/kinetic-quote";

// ── Transitions ─────────────────────────────────────────────────
import { DarkPunch } from "../../transitions/dark-punch";
import { BreathBeat } from "../../transitions/breath-beat";
import { SectionWipe } from "../../transitions/section-wipe";
import { CallbackEcho } from "../../transitions/callback-echo";
import { LandingMoment } from "../../transitions/landing-moment";
import { FadeReveal } from "../../transitions/fade-reveal";
import { ZoomPunch } from "../../transitions/zoom-punch";
import { CrossDissolve } from "../../transitions/cross-dissolve";
import { Blackout } from "../../transitions/blackout";
import { EndTitle } from "../../transitions/end-title";
import { HardCutFlash } from "../../transitions/hard-cut-flash";
import { ShakeImpact } from "../../transitions/shake-impact";
import { ColorWipe } from "../../transitions/color-wipe";
import { IrisOpen } from "../../transitions/iris-open";
import { SplitReveal } from "../../transitions/split-reveal";
import { GlitchTransition } from "../../transitions/glitch-transition";
import { StampSeal } from "../../transitions/stamp-seal";
import { CountdownBeat } from "../../transitions/countdown-beat";
import { PullBackReveal } from "../../transitions/pull-back-reveal";
import { SmashToBlack } from "../../transitions/smash-to-black";
import { GoldSlashDemo } from "../../transitions/gold-slash";
import { ThreatGapBar } from "../../data-viz/threat-gap-bar";
import { AccusationReveal } from "../../narrative/accusation-reveal";
import { OpsRoomTitle } from "../../hero/ops-room-title";
import { TimelineEventStrip } from "../../data-viz/timeline-event-strip";
import { EvidenceFrame } from "../../image-comp/evidence-frame";

// ── Geo ─────────────────────────────────────────────────────────
import { CountryHighlight } from "../../geo/country-highlight";
import { RouteTrace } from "../../geo/route-trace";
import { ZoomToLocation } from "../../geo/zoom-to-location";
import { MultiCountryCompare } from "../../geo/multi-country-compare";
import { ChoroplethFill } from "../../geo/choropleth-fill";
import { CityMarkers, demo as cityMarkersDemo } from "../../geo/city-markers";
import { TerritoryExpansion } from "../../geo/territory-expansion";

// ── Lower-thirds ────────────────────────────────────────────────
import { SpeakerId } from "../../lower-thirds/speaker-id";
import { SourceCitation } from "../../lower-thirds/source-citation";
import { FactBox } from "../../lower-thirds/fact-box";
import { LocationTag } from "../../lower-thirds/location-tag";
import { ChapterLower } from "../../lower-thirds/chapter-lower";
import { ExpertCredential } from "../../lower-thirds/expert-credential";

// ── Callout ─────────────────────────────────────────────────────
import { ArrowCallout } from "../../callout/arrow-callout";
import { CircleHighlight } from "../../callout/circle-highlight";
import { MagnifyCrop } from "../../callout/magnify-crop";
import { BracketAnnotation } from "../../callout/bracket-annotation";
import { ScreenPin } from "../../callout/screen-pin";
import { RedlineBox } from "../../callout/redline-box";

// ── Counter ─────────────────────────────────────────────────────
import { Odometer } from "../../counter/odometer";
import { EasingNumber } from "../../counter/easing-number";
import { SplitFlap } from "../../counter/split-flap";
import { LiveTicker } from "../../counter/live-ticker";
import { DeltaCounter } from "../../counter/delta-counter";
import { MultiStat } from "../../counter/multi-stat";

// ── Diagram ─────────────────────────────────────────────────────
import { StepSequence } from "../../diagram/step-sequence";
import { CauseEffectChain } from "../../diagram/cause-effect-chain";
import { Funnel } from "../../diagram/funnel";
import { OrgChart } from "../../diagram/org-chart";
import { CycleLoop } from "../../diagram/cycle-loop";
import { TwoPathSplit } from "../../diagram/two-path-split";
import { ObjectFocus } from "../../diagram/object-focus";
import { PathJourney } from "../../diagram/path-journey";

// ── Timeline ────────────────────────────────────────────────────
import { EventTimeline } from "../../timeline/event-timeline";
import { BeforeAfterWipe } from "../../timeline/before-after-wipe";
import { VerticalScroll } from "../../timeline/vertical-scroll";
import { EraSpotlight } from "../../timeline/era-spotlight";
import { DualTimeline } from "../../timeline/dual-timeline";

// ── Cinematic ───────────────────────────────────────────────────
import { FilmGrain } from "../../cinematic/film-grain";
import { Letterbox } from "../../cinematic/letterbox";
import { ParallaxStill } from "../../cinematic/parallax-still";
import { VignettePulse } from "../../cinematic/vignette-pulse";
import { ColorShift } from "../../cinematic/color-shift";

// ── Screen ──────────────────────────────────────────────────────
import { BrowserFrame } from "../../screen/browser-frame";
import { PhoneMockup } from "../../screen/phone-mockup";
import { DocumentScroll } from "../../screen/document-scroll";
import { TerminalReadout } from "../../screen/terminal-readout";
import { SocialPostCard } from "../../screen/social-post-card";
import { FeatureSpotlight } from "../../screen/feature-spotlight";

// ── Social-proof ────────────────────────────────────────────────
import { LogoWall } from "../../social-proof/logo-wall";
import { TopNList } from "../../social-proof/top-n-list";
import { Leaderboard } from "../../social-proof/leaderboard";
import { BrandRow } from "../../social-proof/brand-row";
import { FlagGrid } from "../../social-proof/flag-grid";

// ── Kinetic-text ────────────────────────────────────────────────
import { WordByWord } from "../../kinetic-text/word-by-word";
import { SentenceSubtitle } from "../../kinetic-text/sentence-subtitle";
import { KaraokeLine } from "../../kinetic-text/karaoke-line";

// ── Collage ────────────────────────────────────────────────────
import { PaperBg } from "../../collage/paper-bg";
import { HalftoneBeam } from "../../collage/halftone-beam";
import { CutoutFigure } from "../../collage/cutout-figure";
import { BoldStatement } from "../../collage/bold-statement";
import { CollageScene } from "../../collage/collage-scene";
import { DarkCanvas } from "../../collage/dark-canvas";
import { GridOverlay } from "../../collage/grid-overlay";
import { TrendArrow } from "../../collage/trend-arrow";
import { SilhouetteOutline } from "../../collage/silhouette-outline";
import { BillboardLabel } from "../../collage/billboard-label";
import { DarkEditorialScene } from "../../collage/dark-editorial-scene";

// ── Indian ─────────────────────────────────────────────────────
import { MughalArchHero } from "../../indian/mughal-arch-hero";
import { JaliOverlayStat } from "../../indian/jali-overlay-stat";
import { MiniatureFrame } from "../../indian/miniature-frame";
import { ArchComparison } from "../../indian/arch-comparison";
import { MughalQuote } from "../../indian/mughal-quote";
import { DynastyTimeline } from "../../indian/dynasty-timeline";
import { KolamHero } from "../../indian/kolam-hero";
import { TempleStat } from "../../indian/temple-stat";
import { LotusReveal } from "../../indian/lotus-reveal";
import { ChakraProgress } from "../../indian/chakra-progress";
import { GopuramComparison } from "../../indian/gopuram-comparison";
import { TextileQuote } from "../../indian/textile-quote";
import { ArchPortrait } from "../../indian/arch-portrait";
import { CutoutRangoli } from "../../indian/cutout-rangoli";
import { PichwaiHero } from "../../indian/pichwai-hero";
import { TextilePortrait } from "../../indian/textile-portrait";
import { DurbarSplit } from "../../indian/durbar-split";
import { MonumentOverlay } from "../../indian/monument-overlay";
import { BrassOdometer } from "../../indian/brass-odometer";
import { SaffronWaffle } from "../../indian/saffron-waffle";
import { MandalaProgress } from "../../indian/mandala-progress";
import { IndiaCard } from "../../indian/india-card";
import { PillarChart } from "../../indian/pillar-chart";
import { ScrollDecree } from "../../indian/scroll-decree";
import { RajputHero } from "../../indian/rajput-hero";
import { HoliSplash } from "../../indian/holi-splash";
import { HaveliFrame } from "../../indian/haveli-frame";
import { BlockPrint } from "../../indian/block-print";
import { FestivalCounter } from "../../indian/festival-counter";
import { RangoliTransition } from "../../indian/rangoli-transition";


// ── Comparison (new) ──────────────────────────────────────
import { VersusSplit } from "../../comparison/versus-split";
import { ToggleState } from "../../comparison/toggle-state";
import { ScaleBalance } from "../../comparison/scale-balance";
import { MirrorStat } from "../../comparison/mirror-stat";
import { SpectrumPosition } from "../../comparison/spectrum-position";
import { ThenNowColumns } from "../../comparison/then-now-columns";
import { AdvantageCheck } from "../../comparison/advantage-check";
import { GapBridge } from "../../comparison/gap-bridge";
import { TugOfWar } from "../../comparison/tug-of-war";
import { OverlapVenn } from "../../comparison/overlap-venn";

// ── Meter (new) ───────────────────────────────────────────
import { DialGauge } from "../../meter/dial-gauge";
import { ThreatLevel } from "../../meter/threat-level";
import { BatteryFill } from "../../meter/battery-fill";
import { SignalStrength } from "../../meter/signal-strength";
import { StarRating } from "../../meter/star-rating";
import { ProgressRing } from "../../meter/progress-ring";
import { ConfidenceInterval } from "../../meter/confidence-interval";
import { ApprovalArc } from "../../meter/approval-arc";
import { HealthBar } from "../../meter/health-bar";
import { CountdownTimer } from "../../meter/countdown-timer";

// ── Editorial (new) ───────────────────────────────────────
import { FrontPage } from "../../editorial/front-page";
import { PullQuote } from "../../editorial/pull-quote";
import { BreakingBanner } from "../../editorial/breaking-banner";
import { SidebarCallout } from "../../editorial/sidebar-callout";
import { CorrectionNotice } from "../../editorial/correction-notice";
import { Dateline } from "../../editorial/dateline";
import { IndexCard } from "../../editorial/index-card";
import { ClassifiedBlock } from "../../editorial/classified-block";
import { EvidenceDossier } from "../../editorial/evidence-dossier";
import { TickerCrawl } from "../../editorial/ticker-crawl";

// ── Reveal (new) ──────────────────────────────────────────
import { CurtainPull } from "../../reveal/curtain-pull";
import { ScratchCard } from "../../reveal/scratch-card";
import { BlurToSharp } from "../../reveal/blur-to-sharp";
import { PixelResolve } from "../../reveal/pixel-resolve";
import { EnvelopeOpen } from "../../reveal/envelope-open";
import { VaultDoor } from "../../reveal/vault-door";
import { FogLift } from "../../reveal/fog-lift";
import { RedactedLift } from "../../reveal/redacted-lift";
import { BlindsOpen } from "../../reveal/blinds-open";
import { PeelBack } from "../../reveal/peel-back";

// ── Abstract (new) ────────────────────────────────────────
import { GrainWash } from "../../abstract/grain-wash";
import { TopographyLines } from "../../abstract/topography-lines";
import { DotField } from "../../abstract/dot-field";
import { WavePattern } from "../../abstract/wave-pattern";
import { MeshGradient } from "../../abstract/mesh-gradient";
import { PaperTear } from "../../abstract/paper-tear";
import { InkSpread } from "../../abstract/ink-spread";
import { NoiseStatic } from "../../abstract/noise-static";
import { RippleRings } from "../../abstract/ripple-rings";
import { GridWarp } from "../../abstract/grid-warp";

// ── Annotation (new) ──────────────────────────────────────
import { MarginNote } from "../../annotation/margin-note";
import { PostItStack } from "../../annotation/post-it-stack";
import { RedPenCircle } from "../../annotation/red-pen-circle";
import { FootnotePop } from "../../annotation/footnote-pop";
import { HighlightSweep } from "../../annotation/highlight-sweep";
import { PinBoard } from "../../annotation/pin-board";
import { CardFan } from "../../annotation/card-fan";
import { LayerExplode } from "../../annotation/layer-explode";
import { AccordionReveal } from "../../annotation/accordion-reveal";
import { FlipCard } from "../../annotation/flip-card";

// ── Kinetic Text (new) ────────────────────────────────────
import { MassiveWord } from "../../kinetic-text/massive-word";
import { TextCascade } from "../../kinetic-text/text-cascade";
import { TextSpiral } from "../../kinetic-text/text-spiral";
import { BounceWord } from "../../kinetic-text/bounce-word";
import { TypewriterCursor } from "../../kinetic-text/typewriter-cursor";
import { TextShatter } from "../../kinetic-text/text-shatter";
import { TextWave } from "../../kinetic-text/text-wave";
import { ZoomThrough } from "../../kinetic-text/zoom-through";
import { TextFlipCycle } from "../../kinetic-text/text-flip-cycle";
import { EllipsisResolve } from "../../kinetic-text/ellipsis-resolve";

// ── Data Viz (new) ────────────────────────────────────────
import { Treemap } from "../../data-viz/treemap";
import { RadarChart } from "../../data-viz/radar-chart";
import { SankeyFlow } from "../../data-viz/sankey-flow";
import { BubblePack } from "../../data-viz/bubble-pack";
import { SparkLine } from "../../data-viz/spark-line";
import { LollipopChart } from "../../data-viz/lollipop-chart";
import { SlopeChart } from "../../data-viz/slope-chart";
import { IsotypeRow } from "../../data-viz/isotype-row";
import { DumbbellChart } from "../../data-viz/dumbbell-chart";
import { PyramidChart } from "../../data-viz/pyramid-chart";

// ── Narrative (new) ───────────────────────────────────────
import { MythVsFact } from "../../narrative/myth-vs-fact";
import { ListBuild } from "../../narrative/list-build";
import { ParadoxFrame } from "../../narrative/paradox-frame";
import { ThesisBold } from "../../narrative/thesis-bold";
import { WhisperShout } from "../../narrative/whisper-shout";
import { EllipsisPunchline } from "../../narrative/ellipsis-punchline";

// ── Hero (new) ────────────────────────────────────────────
import { CountdownHero } from "../../hero/countdown-hero";
import { QuestionHero } from "../../hero/question-hero";
import { DefinitionCard } from "../../hero/definition-card";
import { WantedPoster } from "../../hero/wanted-poster";

// ── Screen (new) ──────────────────────────────────────────
import { ChatBubble } from "../../screen/chat-bubble";
import { EmailWindow } from "../../screen/email-window";
import { ReceiptScroll } from "../../screen/receipt-scroll";
import { DashboardKPI } from "../../screen/dashboard-kpi";
import { SearchResult } from "../../screen/search-result";
import { NotificationStack } from "../../screen/notification-stack";
import { CodeBlock } from "../../screen/code-block";
import { PollResult } from "../../screen/poll-result";
import { TweetCard } from "../../screen/tweet-card";
import { SpreadsheetCell } from "../../screen/spreadsheet-cell";

export interface DemoEntry {
  component: React.FC;
  durationInFrames: number;
  inputProps?: Record<string, unknown>;
}

export const manualDemoMap: Record<string, DemoEntry> = {
  // ── Hero ──
  "hero-title-with-frame": {
    component: () => <TitleWithFrame title="India" subtitle="The Back Office" categoryLabel="THE OLD STORY" image="demo.png" at={15} />,
    durationInFrames: 150,
  },
  "hero-title-with-cutout": {
    component: () => <TitleWithCutout title="GCC India" subtitle="Global Capability Centres" cutout="demo-cutout.png" at={15} />,
    durationInFrames: 150,
  },
  "hero-section-header": {
    component: () => <SectionHeader number="02" name="The Mechanism" description="How GCCs replaced outsourcing contracts with company-owned operations." categoryLabel="PART TWO" at={15} />,
    durationInFrames: 150,
  },
  "hero-stat-hero": {
    component: () => <StatHero value="$100B" label="IT Services Industry" supportingStat="1,850" supportingLabel="GCCs in India" source="NASSCOM 2024" at={15} />,
    durationInFrames: 150,
  },
  "hero-stat-hero-with-image": {
    component: () => <StatHeroWithImage value="1,850" label="GCCs in India" image="demo-cutout.png" source="Economic Survey 2024-25" categoryLabel="THE SCALE" at={15} />,
    durationInFrames: 150,
  },
  "hero-quote-card": {
    component: () => <QuoteCard quote="GCCs in India have moved beyond back-office roles into strategic hubs for engineering, research and development." source="Economic Survey 2024-25" highlights={["beyond back-office", "strategic hubs"]} at={15} />,
    durationInFrames: 150,
  },
  "hero-channel-badge": {
    component: () => <ChannelBadge name="INDIA PILL" />,
    durationInFrames: 90,
  },
  "hero-chapter-marker": {
    component: () => <ChapterMarker number="03" title="The Scale" at={15} />,
    durationInFrames: 150,
  },
  "hero-closing-card": {
    component: () => <ClosingCard channelName="INDIA PILL" cta="Subscribe for data-backed analysis" tagline="Data-backed analysis of India's transformation" at={15} />,
    durationInFrames: 150,
  },
  "hero-topic-hero": {
    component: () => <TopicHero title="Innovation Node" image="demo.png" categoryLabel="THE DIRECTION" at={15} />,
    durationInFrames: 150,
  },
  "hero-cold-open": {
    component: () => <ColdOpen line="What if everything you knew was wrong?" at={15} />,
    durationInFrames: 150,
  },
  "hero-verdict-card": {
    component: () => <VerdictCard verdict="Not Guilty" context="The evidence never supported the original claim." categoryLabel="THE VERDICT" at={15} />,
    durationInFrames: 150,
  },
  "hero-entity-card": {
    component: () => <EntityCard name="Nandan Nilekani" role="Co-founder, Infosys · Architect of Aadhaar" image="demo-cutout.png" categoryLabel="THE ARCHITECT" at={15} />,
    durationInFrames: 150,
  },
  "hero-timeline-hero": {
    component: () => <TimelineHero year="1991" event="India opens its economy to the world" categoryLabel="THE TURNING POINT" at={15} />,
    durationInFrames: 150,
  },
  "hero-map-title": {
    component: () => <MapTitle location="Bengaluru" subtitle="India's Silicon Valley — home to 500+ GCCs" categoryLabel="THE GEOGRAPHY" at={15} />,
    durationInFrames: 150,
  },
  "hero-duo-title": {
    component: () => <DuoTitle line1="The Old Story" line2="Back Office of the World" categoryLabel="THEN VS NOW" at={15} />,
    durationInFrames: 150,
  },
  "hero-stat-comparison": {
    component: () => <StatComparisonHero valueA="$46B" valueB="$100B" labelA="2019" labelB="2024" winner="b" source="NASSCOM" categoryLabel="GCC REVENUE" at={15} />,
    durationInFrames: 150,
  },
  "hero-image-title-overlay": {
    component: () => <ImageTitleOverlay title="The New Headquarters" subtitle="How GCCs became the brain, not the hand" image="demo-cutout.png" at={15} />,
    durationInFrames: 150,
  },
  "hero-sequence-title": {
    component: () => <SequenceTitle number={2} total={5} subtitle="The Mechanism" categoryLabel="CHAPTER" at={15} />,
    durationInFrames: 150,
  },
  "hero-provocation": {
    component: () => <Provocation question="What happens when the back office starts thinking?" categoryLabel="THE QUESTION" at={15} />,
    durationInFrames: 150,
  },

  // ── Data Viz ──
  "dataviz-proportion-bar": {
    component: () => <ProportionBar percent={67} label="Fortune Global 30 penetration" source="NASSCOM 2024" categoryLabel="PENETRATION" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-stacked-bars": {
    component: () => <StackedBars bars={[{ percent: 28, label: "Global STEM workforce" }, { percent: 23, label: "Software engineers worldwide" }]} categoryLabel="INDIA'S SHARE" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-range-viz": {
    component: () => <RangeViz min={105} max={125} current={115} unit="$B" headline="By 2030" source="Multiple sources" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-comparison-split": {
    component: () => <ComparisonSplit left={{ label: "Your", value: "Routine Work", barPercent: 40 }} right={{ label: "Our", value: "Lower Costs", barPercent: 75 }} at={15} />,
    durationInFrames: 150,
  },
  "dataviz-hero-number": {
    component: () => <HeroNumber value="$100B" label="IT Services Industry" showCurve source="NASSCOM" at={15} />,
    durationInFrames: 150,
  },
  "dataviz-ascending-bars": {
    component: () => <AscendingBars bars={[{ label: "Q1", height: 110 }, { label: "Q2", height: 135 }, { label: "Q3", height: 165 }, { label: "Q4", height: 200 }]} heroNumber="5-7%" heroLabel="Quarter on quarter growth" subtitle="Even while global tech was under pressure." at={15} />,
    durationInFrames: 180,
  },
  "dataviz-dot-cluster": {
    component: () => <DotCluster count={80} label="New GCCs in 5 years" heroNumber="400+" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-data-card-grid": {
    component: () => <DataCardGrid cards={[{ value: "1,850", label: "GCCs" }, { value: "20L", label: "Professionals" }, { value: "67%", label: "Fortune 30" }, { value: "174", label: "Fortune 500" }]} headline="THE NUMBERS" at={15} />,
    durationInFrames: 150,
  },
  "dataviz-percentage-arc": {
    component: () => <PercentageArc percent={67} label="Fortune Global 30 with Indian GCCs" supportingText="174 of the Fortune 500 have established GCC operations in India." at={15} />,
    durationInFrames: 180,
  },
  "dataviz-timeline-bar": {
    component: () => <TimelineBar rows={[{ label: "2000", value: 25, displayValue: "Early BPOs" }, { label: "2010", value: 50, displayValue: "IT Services boom" }, { label: "2020", value: 75, displayValue: "GCC transformation" }, { label: "2030", value: 100, displayValue: "$125B projected" }]} headline="GCC Evolution" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-odometer": {
    component: () => <DataVizOdometer value="1,850" label="GCCs operating in India" source="NASSCOM 2024" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-waffle-grid": {
    component: () => <WaffleGrid percent={67} label="Fortune Global 30 companies with Indian GCCs" source="NASSCOM 2024" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-funnel-chart": {
    component: () => <FunnelChart tiers={[{ label: "Applicants", value: "50K", widthPercent: 100 }, { label: "Screened", value: "12K", widthPercent: 60 }, { label: "Interviewed", value: "3K", widthPercent: 25 }, { label: "Hired", value: "800", widthPercent: 10 }]} headline="HIRING FUNNEL" source="Internal Data" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-radial-progress": {
    component: () => <RadialProgress percent={73} label="Indian GCC engineers working on core product, not support" source="Zinnov 2024" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-scatter-burst": {
    component: () => <ScatterBurst points={[{ x: 20, y: 30, size: 12, label: "BPO" }, { x: 45, y: 55, size: 18, label: "IT Services" }, { x: 70, y: 80, size: 24, label: "GCCs" }, { x: 85, y: 40, size: 10, label: "Consulting" }, { x: 35, y: 70, size: 15, label: "SaaS" }]} headline="CAPABILITY VS SCALE" xAxis="Scale" yAxis="Capability" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-ranking-race": {
    component: () => <RankingRace entries={[{ label: "Bangalore", values: [40, 55, 80, 100] }, { label: "Hyderabad", values: [20, 35, 60, 85] }, { label: "Pune", values: [30, 40, 50, 55] }, { label: "Chennai", values: [35, 30, 45, 50] }]} keyframes={["2010", "2015", "2020", "2024"]} headline="GCC HUBS BY HEADCOUNT" source="Zinnov" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-split-stat": {
    component: () => <SplitStat left={{ value: "$30B", label: "2015 GCC Revenue" }} right={{ value: "$100B", label: "2024 GCC Revenue" }} winner="right" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-area-fill": {
    component: () => <AreaFill points={[{ x: 0, y: 5 }, { x: 15, y: 12 }, { x: 30, y: 18 }, { x: 50, y: 35, label: "35B" }, { x: 70, y: 60 }, { x: 85, y: 82, label: "82B" }, { x: 100, y: 100, label: "$100B" }]} headline="GCC REVENUE GROWTH" xAxis="Year" yAxis="Revenue ($B)" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-icon-array": {
    component: () => <IconArray highlighted={3} total={10} label="of the world's top 10 tech companies have their largest R&D centre in India" ratioText="3 in 10" source="Company filings" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-delta-arrow": {
    component: () => <DeltaArrow before="400" after="1,850" beforeLabel="GCCs in 2015" afterLabel="GCCs in 2024" direction="up" changeText="+362%" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },

  // ── Image Composition ──
  "imgcomp-framed-left-text-right": {
    component: () => <FramedLeftTextRight image="demo-engineers.png" headline="Engineering Research" body="Indian GCC centres now lead global R&D across AI, cybersecurity, and platform architecture." categoryLabel="THE MECHANISM" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-framed-right-text-left": {
    component: () => <FramedRightTextLeft image="demo.png" headline="Product Ownership" body="From execution to strategy — Indian leaders now hold global P&L responsibilities." categoryLabel="OWNERSHIP" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-full-bleed-overlay": {
    component: () => <FullBleedOverlay image="demo.png" headline="Bangalore" subtitle="The epicentre of India's GCC transformation." categoryLabel="THE CITY" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-cutout-hero": {
    component: () => <CutoutHero bglessImageSrc="demo.png" headline="Brain Centre" label="India's new role in the global economy" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-cutout-over-data": {
    component: () => <CutoutOverData cutout="demo.png" stat="28%" statLabel="Global STEM workforce" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-dual-frame": {
    component: () => <DualFrame leftImage="demo.png" leftLabel="New York" rightImage="demo.png" rightLabel="Bangalore" connector="→" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-editorial-grid": {
    component: () => <EditorialGrid images={[{ image: "demo.png", caption: "AI Research" }, { image: "demo.png", caption: "Cybersecurity" }, { image: "demo.png", caption: "Platform Architecture" }, { image: "demo.png", caption: "Product Engineering" }]} categoryLabel="CAPABILITIES" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-split-screen-push": {
    component: () => <SplitScreenPush image="demo.png" title="From Back Office to Brain Centre" body="Indian GCC centres now lead global R&D across AI, cybersecurity, and platform architecture." stat="1,850" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-image-with-quote": {
    component: () => <ImageWithQuote image="demo.png" quote="The same India that once answered the phone is now designing the system." attribution="Economic Survey 2024-25" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-cutout-trio": {
    component: () => <CutoutTrio items={[{ image: "demo.png", label: "Customer Support" }, { image: "demo.png", label: "Payroll" }, { image: "demo.png", label: "Tickets" }]} heading="India was the call." at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-cutout-before-after": {
    component: () => <CutoutBeforeAfter beforeImage="demo.png" afterImage="demo.png" beforeLabel="NEFT, 3-5 days" afterLabel="UPI, instant" headline="Settlement Speed" pivotAt={50} at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-stack": {
    component: () => <CutoutStack items={[{ image: "demo.png", label: "Aadhaar" }, { image: "demo.png", label: "Jan Dhan" }, { image: "demo.png", label: "UPI" }]} headline="The Stack" subtitle="Each layer depends on the one below it." at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-reveal": {
    component: () => <CutoutReveal image="demo.png" headline="The architect behind the system" body="From policy to protocol — one infrastructure, a billion users." revealAt={40} at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-silhouette": {
    component: () => <CutoutSilhouette image="demo.png" quote="When the infrastructure is free, everyone builds on it." attribution="India Stack, 2024" at={15} />,
    durationInFrames: 150,
  },
  "imgcomp-cutout-census": {
    component: () => <CutoutCensus items={[{ image: "demo.png", stat: "520M", label: "Jan Dhan accounts" }, { image: "demo.png", stat: "1.4B", label: "Aadhaar registrations" }, { image: "demo.png", stat: "16.6B", label: "UPI transactions/mo" }]} headline="The Numbers" source="RBI, UIDAI, NPCI" at={15} />,
    durationInFrames: 180,
  },

    "imgcomp-cutout-slam": {
    component: () => <CutoutSlam bglessImageSrc="demo.png" headline="Hard Impact" label="No easing, no mercy" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-object-prime": {
    component: () => <CutoutObjectPrime bglessImageSrc="demo.png" text="The object speaks before the words arrive." attribution="Design Principle" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-parallax": {
    component: () => <CutoutParallax bgLayer="demo.png" fgLayer="demo.png" headline="Depth Without 3D" label="Two layers, one illusion" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-strip": {
    component: () => <CutoutStrip items={[{ image: "demo.png", label: "AI" }, { image: "demo.png", label: "Cyber" }, { image: "demo.png", label: "Platform" }, { image: "demo.png", label: "Product" }]} headline="CAPABILITIES" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-shatter": {
    component: () => <CutoutShatter bglessImageSrc="demo.png" headline="Everything breaks" label="And something new appears" pivotAt={50} at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-spotlight": {
    component: () => <CutoutSpotlight bglessImageSrc="demo.png" headline="Selective reveal" label="Only what matters" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-evidence": {
    component: () => <CutoutEvidence items={[{ image: "demo.png", label: "Exhibit A" }, { image: "demo.png", label: "Exhibit B" }, { image: "demo.png", label: "Exhibit C" }]} headline="THE EVIDENCE" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-morph-split": {
    component: () => <CutoutMorphSplit imageA="demo.png" imageB="demo.png" headline="Before → After" label="The split reveals" splitAt={40} at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-ticker": {
    component: () => <CutoutTicker items={[{ image: "demo.png", label: "Entity A" }, { image: "demo.png", label: "Entity B" }, { image: "demo.png", label: "Entity C" }, { image: "demo.png", label: "Entity D" }, { image: "demo.png", label: "Entity E" }]} headline="The Players" at={15} />,
    durationInFrames: 180,
  },
  "imgcomp-cutout-scale-punch": {
    component: () => <CutoutScalePunch bglessImageSrc="demo.png" headline="Maximum Impact" label="Tiny to massive in 4 frames" at={15} />,
    durationInFrames: 180,
  },

  // ── Narrative ──
  "narr-progressive-build": {
    component: () => <ProgressiveBuild points={["Indian teams did the work.", "The headquarters made the decisions.", "India executed.", "It didn't own."]} at={15} />,
    durationInFrames: 180,
  },
  "narr-weight-contrast": {
    component: () => <WeightContrast primary={{ value: "The Best", label: "What India became" }} secondary={{ value: "The Cheapest", label: "What it used to be" }} at={15} />,
    durationInFrames: 150,
  },
  "narr-strikethrough-reject": {
    component: () => <StrikethroughReject rejected="Back Office" corrected="Brain Centre" strikeAt={50} at={15} />,
    durationInFrames: 150,
  },
  "narr-word-escalation": {
    component: () => <WordEscalation words={[{ text: "Capability", at: 20, size: 80, color: "#6D917D" }, { text: "Confidence", at: 55, size: 100, color: "#7A8999" }, { text: "Strategic Relevance", at: 90, size: 120, color: "#C17A48" }]} />,
    durationInFrames: 150,
  },
  "narr-editorial-quote": {
    component: () => <EditorialQuote quote="GCCs in India have moved beyond back-office roles into strategic hubs for engineering, research and development." attribution="Economic Survey 2024-25" at={15} />,
    durationInFrames: 150,
  },
  "narr-staccato-list": {
    component: () => <StaccatoList items={[{ text: "Employability gaps", at: 20, color: "#907070" }, { text: "Leadership depth", at: 50, color: "#7A8999" }, { text: "Specialized skills", at: 80, color: "#6D917D" }, { text: "Retention", at: 110, color: "#C17A48" }]} at={10} />,
    durationInFrames: 150,
  },
  "narr-pivot-reframe": {
    component: () => <PivotReframe before="How much work can India do at low cost?" after="What critical work can India own?" at={15} />,
    durationInFrames: 150,
  },
  "narr-word-cloud": {
    component: () => <WordCloud heroWord="System" terms={["AI", "Platform", "R&D", "Cyber", "Engineering"]} at={15} />,
    durationInFrames: 150,
  },
  "narr-highlight-annotation": {
    component: () => <HighlightAnnotation text="GCCs in India have moved beyond back-office roles into strategic hubs for engineering research and development." highlights={[{ word: "beyond", at: 30 }, { word: "back-office", at: 40 }, { word: "strategic", at: 60 }, { word: "hubs", at: 70 }, { word: "engineering", at: 90 }]} at={10} />,
    durationInFrames: 150,
  },
  "narr-split-argument": {
    component: () => <SplitArgument leftHeader="The Old Model" leftPoints={["Send work offshore", "Cost arbitrage", "Back-office execution"]} rightHeader="The New Reality" rightPoints={["Own the product", "Innovation hub", "Strategic leadership"]} at={15} />,
    durationInFrames: 150,
  },
  "narr-slam-counter": {
    component: () => <SlamCounter value={1850} label="GCCs in India" at={10} />,
    durationInFrames: 180,
  },
  "narr-typewriter-burst": {
    component: () => <TypewriterBurst text="They didn't just outsource. They took ownership." at={10} burstAt={70} />,
    durationInFrames: 180,
  },
  "narr-redaction-reveal": {
    component: () => <RedactionReveal words={[{ text: "India" }, { text: "is" }, { text: "not", redacted: true, revealAt: 60 }, { text: "just" }, { text: "a", redacted: true, revealAt: 80 }, { text: "back-office." }, { text: "It's" }, { text: "the", redacted: true, revealAt: 100 }, { text: "brain." }]} at={10} />,
    durationInFrames: 180,
  },
  "narr-stack-collapse": {
    component: () => <StackCollapse lines={["Cost arbitrage", "Back-office ops", "Low-skill labor", "One word: Ownership"]} at={10} collapseAt={80} />,
    durationInFrames: 180,
  },
  "narr-word-slam-sequence": {
    component: () => <WordSlamSequence text="India builds the future now" at={10} holdFrames={5} />,
    durationInFrames: 180,
  },
  "narr-glitch-text": {
    component: () => <GlitchText text="Something changed." at={10} glitchAt={50} glitchDuration={12} />,
    durationInFrames: 180,
  },
  "narr-verdict-stamp": {
    component: () => <VerdictStamp text="APPROVED" context="The verdict is in" at={30} />,
    durationInFrames: 180,
  },
  "narr-scroll-manifest": {
    component: () => <ScrollManifest items={["AI Research", "Cybersecurity", "Platform Engineering", "Product Design", "Data Science", "Cloud Architecture", "Chip Design", "Quantum Computing"]} title="GCC Capabilities" at={10} scrollDuration={140} />,
    durationInFrames: 180,
  },
  "narr-split-screen-debate": {
    component: () => <SplitScreenDebate leftHeader="Old Model" rightHeader="New Reality" leftPoints={[{ text: "Send work offshore", at: 10 }, { text: "Cost arbitrage", at: 25 }, { text: "Back-office execution", at: 40 }]} rightPoints={[{ text: "Own the product", at: 15 }, { text: "Innovation hub", at: 30 }, { text: "Strategic leadership", at: 45 }]} at={10} />,
    durationInFrames: 180,
  },
  "narr-kinetic-quote": {
    component: () => <KineticQuote text="They handed over the keys to the kingdom" attribution="Industry Analyst" at={10} />,
    durationInFrames: 180,
  },

  // ── Transitions ──
  "trans-dark-punch": {
    component: () => <DarkPunch setupText="That was the deal." punchText="Something changed." subtitle="India, 2024" setupAt={10} punchAt={60} />,
    durationInFrames: 150,
  },
  "trans-breath-beat": {
    component: () => <BreathBeat text="The honest test." subtext="And that's what it comes down to." subtextAt={60} at={15} />,
    durationInFrames: 150,
  },
  "trans-section-wipe": {
    component: () => <SectionWipe categoryLabel="THE MECHANISM" at={15} />,
    durationInFrames: 90,
  },
  "trans-callback-echo": {
    component: () => <CallbackEcho echoType="bar" echoValue={67} headline="What can India" keyword="own" at={15} />,
    durationInFrames: 150,
  },
  "trans-landing-moment": {
    component: () => <LandingMoment word="Ownership." supportingText="They're handing over" at={30} />,
    durationInFrames: 150,
  },
  "trans-fade-reveal": {
    component: () => <FadeReveal categoryLabel="THE SCALE" heroText="1,850 GCCs" supportingText="And the numbers back this up." heroAt={30} supportAt={60} />,
    durationInFrames: 150,
  },
  "trans-zoom-punch": {
    component: () => <ZoomPunch text="Brain Centre" subtitle="India's new identity" at={30} />,
    durationInFrames: 150,
  },
  "trans-cross-dissolve": {
    component: () => <CrossDissolve text="..." at={15} />,
    durationInFrames: 150,
  },
  "trans-blackout": {
    component: () => <Blackout fadeIn />,
    durationInFrames: 90,
  },
  "trans-end-title": {
    component: () => <EndTitle channelName="INDIA PILL" title="No Longer the Back Office" teaser="Next: The Semiconductor Play" at={15} />,
    durationInFrames: 150,
  },
  "trans-hard-cut-flash": {
    component: () => <HardCutFlash at={30} />,
    durationInFrames: 120,
  },
  "trans-shake-impact": {
    component: () => <ShakeImpact at={20} intensity={14} />,
    durationInFrames: 120,
  },
  "trans-color-wipe": {
    component: () => <ColorWipe at={20} />,
    durationInFrames: 120,
  },
  "trans-iris-open": {
    component: () => <IrisOpen at={20} />,
    durationInFrames: 120,
  },
  "trans-split-reveal": {
    component: () => <SplitReveal at={20} />,
    durationInFrames: 120,
  },
  "trans-glitch-transition": {
    component: () => <GlitchTransition at={20} />,
    durationInFrames: 120,
  },
  "trans-stamp-seal": {
    component: () => <StampSeal text="VERDICT" at={20} />,
    durationInFrames: 120,
  },
  "trans-countdown-beat": {
    component: () => <CountdownBeat at={10} />,
    durationInFrames: 120,
  },
  "trans-pull-back-reveal": {
    component: () => <PullBackReveal at={20} />,
    durationInFrames: 120,
  },
  "trans-smash-to-black": {
    component: () => <SmashToBlack at={30} />,
    durationInFrames: 120,
  },

  // ── Geo ──
  "geo-country-highlight": {
    component: () => <CountryHighlight countryName="India" value="$3.7T" label="GDP (PPP) 2026" source="World Bank" />,
    durationInFrames: 150,
  },
  "geo-route-trace": {
    component: () => <RouteTrace points={[{x:150,y:180,label:"Mumbai"},{x:400,y:160,label:"Dubai"},{x:650,y:140,label:"London"},{x:850,y:200,label:"New York"}]} title="Spice Route to Finance Route" subtitle="How capital flows mirrored ancient trade" />,
    durationInFrames: 180,
  },
  "geo-zoom-to-location": {
    component: () => <ZoomToLocation locationName="Bengaluru" subtitle="India's Silicon Plateau — 1,600+ GCCs" categoryLabel="Tech Geography" targetX={300} targetY={280} />,
    durationInFrames: 150,
  },
  "geo-multi-country-compare": {
    component: () => <MultiCountryCompare countries={[{name:"India",value:"$3.7T",path:"M600,130 L700,125 L780,140 L760,170 L680,180 L600,165 Z"},{name:"Germany",value:"$4.5T",path:"M420,100 L470,95 L490,120 L460,135 L420,125 Z"},{name:"Japan",value:"$4.2T",path:"M850,130 L880,125 L890,150 L870,160 L845,148 Z"}]} title="GDP Comparison 2026" revealMode="sequential" source="IMF" />,
    durationInFrames: 150,
  },
  "geo-choropleth-fill": {
    component: () => <ChoroplethFill regions={[{name:"North",value:82,path:"M200,100 L500,90 L520,180 L180,190 Z"},{name:"South",value:45,path:"M180,200 L520,190 L500,320 L220,330 Z"},{name:"East",value:68,path:"M530,90 L800,100 L790,200 L520,190 Z"},{name:"West",value:91,path:"M530,200 L790,210 L770,330 L510,320 Z"}]} title="Internet Penetration by Region" unit="% households" source="TRAI 2026" />,
    durationInFrames: 180,
  },
  "geo-city-markers": {
    component: () => <CityMarkers {...cityMarkersDemo.props} />,
    durationInFrames: cityMarkersDemo.durationInFrames,
  },
  "geo-territory-expansion": {
    component: () => <TerritoryExpansion stages={[{year:"1526",path:"M400,200 L500,190 L520,240 L480,260 L400,250 Z",label:"Babur's conquest"},{year:"1600",path:"M350,180 L550,170 L580,260 L520,300 L340,280 Z",label:"Akbar's empire"},{year:"1700",path:"M300,160 L600,150 L640,300 L560,380 L280,340 Z",label:"Aurangzeb's peak"}]} title="Mughal Territorial Expansion" source="Historical Atlas" />,
    durationInFrames: 180,
  },

  // ── Lower-thirds ──
  "lt-speaker-id": {
    component: () => <SpeakerId name="Nandan Nilekani" role="Co-founder, Infosys" organization="Infosys Limited" at={15} />,
    durationInFrames: 150,
  },
  "lt-source-citation": {
    component: () => <SourceCitation publication="IMF World Economic Outlook" year="2024" holdDuration={60} at={10} />,
    durationInFrames: 90,
  },
  "lt-fact-box": {
    component: () => <FactBox stat="$3.7T" label="India's GDP (2024)" detail="Overtook the UK to become the 5th largest economy" at={10} />,
    durationInFrames: 150,
  },
  "lt-location-tag": {
    component: () => <LocationTag city="Bengaluru" country="India" at={10} />,
    durationInFrames: 120,
  },
  "lt-chapter-lower": {
    component: () => <ChapterLower number="2" title="The Mechanism" at={10} />,
    durationInFrames: 120,
  },
  "lt-expert-credential": {
    component: () => <ExpertCredential name="Raghuram Rajan" role="Former Governor, Reserve Bank of India" institution="Reserve Bank of India" at={10} />,
    durationInFrames: 150,
  },

  // ── Callout ──
  "callout-arrow-callout": {
    component: () => <ArrowCallout targetX={960} targetY={400} text="GDP Growth Peak" at={15} />,
    durationInFrames: 150,
  },
  "callout-circle-highlight": {
    component: () => <CircleHighlight x={700} y={500} radius={90} label="Key Region" at={10} />,
    durationInFrames: 150,
  },
  "callout-magnify-crop": {
    component: () => <MagnifyCrop src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop" cropX={340} cropY={270} cropW={280} cropH={180} label="Detail View" at={10} />,
    durationInFrames: 150,
  },
  "callout-bracket-annotation": {
    component: () => <BracketAnnotation x={600} y={340} width={400} height={200} label="Policy Block" at={10} />,
    durationInFrames: 150,
  },
  "callout-screen-pin": {
    component: () => <ScreenPin x={1200} y={350} label="Server Location" at={10} />,
    durationInFrames: 120,
  },
  "callout-redline-box": {
    component: () => <RedlineBox x={700} y={300} width={500} height={300} label="Exhibit A" at={10} />,
    durationInFrames: 150,
  },

  // ── Counter ──
  "counter-odometer": {
    component: () => <Odometer value={1850} label="GCCs in India" source="NASSCOM 2024" at={15} />,
    durationInFrames: 180,
  },
  "counter-easing-number": {
    component: () => <EasingNumber value={42.7} decimals={1} suffix="M" label="Monthly Active Users" source="Internal Analytics Q4 2025" at={10} />,
    durationInFrames: 150,
  },
  "counter-split-flap": {
    component: () => <SplitFlap value="1850" label="Global Capability Centers" source="NASSCOM 2024" at={10} />,
    durationInFrames: 180,
  },
  "counter-live-ticker": {
    component: () => <LiveTicker items={[{ key: "GCCs", value: "1,850" }, { key: "Revenue", value: "$64.1B", color: "#6D917D" }, { key: "Talent", value: "1.9M" }, { key: "Growth", value: "+18%", color: "#6D917D" }]} headline="India GCC Dashboard" source="NASSCOM 2024" at={5} />,
    durationInFrames: 180,
  },
  "counter-delta-counter": {
    component: () => <DeltaCounter delta="+12.4M" direction="up" before="₹2.1T" after="₹3.5T" label="Tax Revenue Growth" source="Ministry of Finance 2025" at={10} />,
    durationInFrames: 150,
  },
  "counter-multi-stat": {
    component: () => <MultiStat stats={[{ value: "580K", label: "Deaths", suffix: "K" }, { value: "6.9M", label: "Displaced", suffix: "M" }, { value: "$4.5T", label: "Economic Cost", prefix: "$", suffix: "T" }]} source="UN OCHA 2025" at={5} />,
    durationInFrames: 150,
  },

  // ── Diagram ──
  "diagram-step-sequence": {
    component: () => <StepSequence steps={[{number:"01", title:"Cheap Labor", description:"Cost arbitrage era"},{number:"02", title:"Skills Build", description:"Engineering depth develops"},{number:"03", title:"Strategic Hub", description:"R&D moves in-country"}]} at={15} />,
    durationInFrames: 180,
  },
  "diagram-cause-effect-chain": {
    component: () => <CauseEffectChain items={[{label:"Oil Shock"},{label:"Dollar Recycling"},{label:"Petrodollar System"},{label:"US Hegemony"}]} at={15} />,
    durationInFrames: 180,
  },
  "diagram-funnel": {
    component: () => <Funnel stages={[{label:"Total Applicants", value:"120K", percent:100},{label:"Screened", value:"42K", percent:35},{label:"Interviewed", value:"8.4K", percent:7},{label:"Hired", value:"1.2K", percent:1}]} at={15} />,
    durationInFrames: 180,
  },
  "diagram-org-chart": {
    component: () => <OrgChart root={{label:"Ministry of Defence", children:[{label:"Army", children:[{label:"Northern Cmd"},{label:"Western Cmd"}]},{label:"Navy", children:[{label:"Eastern Fleet"},{label:"Western Fleet"}]},{label:"Air Force"}]}} at={15} />,
    durationInFrames: 180,
  },
  "diagram-cycle-loop": {
    component: () => <CycleLoop nodes={[{label:"Collect Data", description:"Sensors & surveys"},{label:"Analyze", description:"Pattern recognition"},{label:"Decide", description:"Policy choice"},{label:"Implement", description:"Execute on ground"}]} at={15} />,
    durationInFrames: 180,
  },
  "diagram-two-path-split": {
    component: () => <TwoPathSplit input="GCC Strategy" pathA={{label:"Cost Center", value:"$12/hr"}} pathB={{label:"Innovation Hub", value:"$45/hr"}} at={15} />,
    durationInFrames: 150,
  },
  "diagram-object-focus": {
    component: () => <ObjectFocus category="ANCHOR OBJECT" headline="Start with one object the viewer can hold onto." anchorValue="01" anchorLabel="One claim" anchorDetail="Keep the reference object alive while the meaning changes around it." mutations={[{label:"Actor", detail:"Name who is moving the system.", x:180, y:310},{label:"Pressure", detail:"Show the variable that changes the object.", x:1430, y:276, tone:"sage"},{label:"Constraint", detail:"Mark what limits the move.", x:212, y:760, tone:"slate"},{label:"Consequence", detail:"Land what becomes newly true.", x:1404, y:736}]} payoff="Object continuity does the comprehension work." source="Motion featured videos, sampled April 9, 2026" at={0} />,
    durationInFrames: 210,
  },
  "diagram-path-journey": {
    component: () => <PathJourney category="TRACK THE TOKEN" headline="Move one token through the mechanism." travelerLabel="IDEA" nodes={[{label:"Anchor", detail:"Plant the object early.", x:230, y:700},{label:"Mutation", detail:"Change one property only.", x:690, y:500},{label:"Contrast", detail:"Flip the frame when the thesis hits.", x:1170, y:560},{label:"Payoff", detail:"Arrive at the sentence that matters.", x:1620, y:330}]} payoff="The viewer should track a payload, not decode a fresh diagram every cut." source="Storyboard grammar adapted for varnam" at={0} />,
    durationInFrames: 210,
  },

  // ── Timeline ──
  "tl-event-timeline": {
    component: () => <EventTimeline events={[{year:"1991",title:"Liberalisation",description:"India opens economy"},{year:"2000",title:"Y2K Boom",description:"IT services explode"},{year:"2010",title:"GCC Era Begins",description:"MNCs set up captive centres"},{year:"2024",title:"Strategic Hubs",description:"R&D and AI lead"}]} categoryLabel="INDIA IT TIMELINE" at={15} />,
    durationInFrames: 210,
  },
  "tl-before-after-wipe": {
    component: () => <BeforeAfterWipe beforeLabel="License Raj" afterLabel="Open Market" beforeStat="1975" afterStat="2024" category="ECONOMIC SHIFT" at={10} />,
    durationInFrames: 150,
  },
  "tl-vertical-scroll": {
    component: () => <VerticalScroll events={[{date:"1947",title:"Independence",description:"End of colonial rule"},{date:"1950",title:"Republic",description:"Constitution comes into force"},{date:"1991",title:"Liberalisation",description:"Dismantling the License Raj"},{date:"2000",title:"IT Boom",description:"Bangalore becomes Silicon Valley of the East"},{date:"2020",title:"Digital India",description:"UPI processes 10B transactions monthly"}]} category="MODERN INDIA" at={10} />,
    durationInFrames: 210,
  },
  "tl-era-spotlight": {
    component: () => <EraSpotlight eras={[{label:"Colonial",startYear:"1858",endYear:"1947",description:"British Crown rule over the Indian subcontinent"},{label:"Nehruvian",startYear:"1947",endYear:"1964",description:"Socialist planning, industrialisation, non-alignment"},{label:"Emergency",startYear:"1975",endYear:"1977",description:"Civil liberties suspended under Indira Gandhi"},{label:"Liberalisation",startYear:"1991",endYear:"2004",description:"Markets open, IT boom, global integration"}]} activeIndex={3} category="INDIA ERAS" at={10} />,
    durationInFrames: 180,
  },
  "tl-dual-timeline": {
    component: () => <DualTimeline trackA={{label:"Policy",events:[{year:"1991",title:"LPG Reforms"},{year:"2000",title:"IT Act"},{year:"2016",title:"Demonetisation"},{year:"2020",title:"NEP 2020"}]}} trackB={{label:"Outcome",events:[{year:"1995",title:"Infosys IPO"},{year:"2004",title:"BPO Peak"},{year:"2017",title:"UPI Launch"},{year:"2023",title:"5M+ Tech Jobs"}]}} categoryLabel="POLICY vs OUTCOME" at={10} />,
    durationInFrames: 210,
  },

  // ── Cinematic ──
  "cine-film-grain": {
    component: () => <FilmGrain opacity={0.12} />,
    durationInFrames: 150,
  },
  "cine-letterbox": {
    component: () => <Letterbox at={15} />,
    durationInFrames: 90,
  },
  "cine-parallax-still": {
    component: () => <ParallaxStill background="demo.png" foreground="demo-cutout.png" at={0} />,
    durationInFrames: 180,
  },
  "cine-vignette-pulse": {
    component: () => <VignettePulse intensity={0.5} />,
    durationInFrames: 150,
  },
  "cine-color-shift": {
    component: () => (
      <ColorShift phrase="Transformation" label="THE SHIFT" at={15} duration={60} />
    ),
    durationInFrames: 90,
  },

  // ── Screen ──
  "screen-browser-frame": {
    component: () => <BrowserFrame url="nasscom.in/gcc-report-2024" headline="India GCC Report" at={15} />,
    durationInFrames: 180,
  },
  "screen-phone-mockup": {
    component: () => <PhoneMockup headline="GCCs cross $64B revenue" content="India's Global Capability Centres are no longer back-office hubs. With 1,850 centres and 1.9 million employees, they now drive AI research, chip design, and global product engineering for the world's biggest companies." label="GCC Economy" subtitle="1,850 centres · 1.9M employees" at={15} />,
    durationInFrames: 150,
  },
  "screen-document-scroll": {
    component: () => <DocumentScroll title="Economic Survey 2024-25" passage="GCCs in India have moved beyond back-office roles into strategic functions including AI research, chip design, and global product engineering. The transformation represents a fundamental shift in how multinational corporations view their India operations." highlightText="beyond back-office" source="Ministry of Finance" at={15} />,
    durationInFrames: 180,
  },
  "screen-terminal-readout": {
    component: () => <TerminalReadout lines={["$ nasscom-cli export --sector=gcc --format=json 2024", "> Fetching GCC database...", "> Records found: 1,850", "> Revenue total: $64.1B", "> Talent pool: 1.9M employees", "> Export complete → gcc_report_2024.json"]} label="GCC Data Pipeline" windowTitle="nasscom-cli — zsh" at={15} />,
    durationInFrames: 180,
  },
  "screen-social-post-card": {
    component: () => <SocialPostCard username="IndiaPill" handle="@indiapill" text="India's GCCs aren't back-office anymore. They're running AI labs, chip design, and R&D for the world's biggest companies." likes={12400} reposts={3200} at={15} />,
    durationInFrames: 150,
  },
  "screen-feature-spotlight": {
    component: () => <FeatureSpotlight category="THESIS MOMENT" headline="Use darkness as punctuation, not default style." subheadline="Flip into a dark stage only when the sentence itself becomes the event." featureName="Contrast Beat" heroValue="1" heroLabel="structural punch when the thesis lands" chips={[{label:"Silence", detail:"Leave most of the frame quiet.", x:1438, y:278},{label:"Focus", detail:"One active accent color.", x:260, y:766},{label:"Payoff", detail:"The line becomes the moment.", x:1422, y:742}]} source="Motion featured videos, sampled April 9, 2026" at={0} />,
    durationInFrames: 210,
  },

  // ── Social-proof ──
  "social-logo-wall": {
    component: () => <LogoWall logos={[{name:"Goldman Sachs",subtitle:"Banking",highlighted:true},{name:"JPMorgan",subtitle:"Finance",highlighted:true},{name:"Microsoft",subtitle:"Tech"},{name:"Google",subtitle:"Tech",highlighted:true},{name:"Amazon",subtitle:"E-commerce"},{name:"Apple",subtitle:"Consumer",highlighted:true},{name:"Meta",subtitle:"Social"},{name:"Deutsche Bank",subtitle:"Banking"},{name:"HSBC",subtitle:"Finance"},{name:"Citibank",subtitle:"Banking"},{name:"Wells Fargo",subtitle:"Finance"},{name:"Morgan Stanley",subtitle:"Banking",highlighted:true}]} categoryLabel="GCC CLIENTS IN INDIA" at={15} />,
    durationInFrames: 150,
  },
  "social-top-n-list": {
    component: () => <TopNList items={[{rank:1,name:"United States",value:"$25.5T"},{rank:2,name:"China",value:"$18.3T"},{rank:3,name:"Japan",value:"$4.2T"},{rank:4,name:"Germany",value:"$4.1T"},{rank:5,name:"India",value:"$3.5T"}]} source="World Bank 2025" at={10} />,
    durationInFrames: 180,
  },
  "social-leaderboard": {
    component: () => <Leaderboard rows={[{rank:1,name:"India",value:1800,maxValue:1800},{rank:2,name:"Philippines",value:1200,maxValue:1800},{rank:3,name:"Poland",value:450,maxValue:1800},{rank:4,name:"Romania",value:280,maxValue:1800},{rank:5,name:"Czech Republic",value:220,maxValue:1800}]} categoryLabel="GCC HEADCOUNT BY COUNTRY" unit="(in thousands)" at={10} />,
    durationInFrames: 210,
  },
  "social-brand-row": {
    component: () => <BrandRow brands={["TCS","Infosys","Wipro","HCL Tech","Tech Mahindra","LTIMindtree","Mphasis","Persistent"]} header="IT SERVICES REVENUE" at={10} />,
    durationInFrames: 120,
  },
  "social-flag-grid": {
    component: () => <FlagGrid countries={[{code:"BR",name:"Brazil",highlighted:true},{code:"RU",name:"Russia",highlighted:true},{code:"IN",name:"India",highlighted:true},{code:"CN",name:"China",highlighted:true},{code:"ZA",name:"South Africa",highlighted:true},{code:"US",name:"United States"},{code:"GB",name:"United Kingdom"},{code:"DE",name:"Germany"},{code:"JP",name:"Japan"}]} categoryLabel="BRICS MEMBERS" at={12} />,
    durationInFrames: 150,
  },

  // ── Kinetic-text ──
  "ktext-word-by-word": {
    component: () => <WordByWord words={[{word:"India",at:15},{word:"now",at:25},{word:"hosts",at:35},{word:"1,850",at:45},{word:"Global",at:60},{word:"Capability",at:72},{word:"Centres",at:88}]} at={10} />,
    durationInFrames: 180,
  },
  "ktext-sentence-subtitle": {
    component: () => <SentenceSubtitle sentences={[{text:"India now hosts 1,850 Global Capability Centres.",at:15}]} at={10} />,
    durationInFrames: 150,
  },
  "ktext-karaoke-line": {
    component: () => <KaraokeLine words={[{word:"India",startFrame:15,endFrame:28},{word:"now",startFrame:28,endFrame:40},{word:"hosts",startFrame:40,endFrame:55},{word:"1,850",startFrame:55,endFrame:72},{word:"GCCs",startFrame:72,endFrame:95}]} wordWidths={[60,40,55,68,55]} maxWidth={900} />,
    durationInFrames: 150,
  },

  // ── Collage ──
  "collage-paper-bg": {
    component: () => <PaperBg color="#F2EDE4" grain={0.08} vignette={0.2} aging={0.06}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"serif",fontSize:120,color:"#2A2622",opacity:0.15}}>PAPER</div></PaperBg>,
    durationInFrames: 90,
  },
  "collage-halftone-beam": {
    component: () => <PaperBg color="#F2EDE4"><HalftoneBeam from={{x:15,y:50}} to={{x:85,y:50}} color="#E8A828" narrowWidth={40} wideWidth={300} at={10} /></PaperBg>,
    durationInFrames: 90,
  },
  "collage-bold-statement": {
    component: () => <PaperBg color="#F2EDE4"><BoldStatement text="DRUG OF THE NATION" fontSize={72} rotation={-5} x={50} y={42} at={10} /><BoldStatement text="A SMALLER LINE" fontSize={36} rotation={-5} x={50} y={58} at={18} bandColor="#E8A828" bandPadding={8} /></PaperBg>,
    durationInFrames: 90,
  },
  "collage-cutout-figure": {
    component: () => <PaperBg color="#F2EDE4"><CutoutFigure src="demo-cutout.png" x={50} y={85} maxHeight={700} anchor="bottom-center" entrance="stamp" at={10} /></PaperBg>,
    durationInFrames: 90,
  },
  "collage-scene": {
    component: () => <CollageScene paperColor="#F2EDE4" grain={0.07} elements={[
      // Layer 1: halftone beam BEHIND the figures
      {type:"beam",from:{x:72,y:48},to:{x:22,y:35},beamColor:"#E8A828",narrowWidth:80,wideWidth:340,at:6,zIndex:1},
      // Layer 2: woman in chair — overlaps the beam
      {type:"cutout",src:"demo-woman-chair.png",x:25,y:88,maxHeight:680,anchor:"bottom-center",entrance:"stamp",at:0,zIndex:3},
      // Layer 3: TV — beam comes FROM behind it
      {type:"cutout",src:"demo-old-tv.png",x:75,y:88,maxHeight:440,anchor:"bottom-center",entrance:"slide-left",at:4,zIndex:2},
      // Layer 4: text ON the beam, between the figures
      {type:"text",text:"TELEVISION — DRUG OF THE NATION",fontSize:38,rotation:-10,x:48,y:30,at:14,zIndex:4},
    ]} />,
    durationInFrames: 150,
  },

  // ── Collage (dark) ──
  "collage-dark-canvas": {
    component: () => <DarkCanvas color="#0D0F14" grain={0.05}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"sans-serif",fontSize:80,fontWeight:800,color:"#FFF",opacity:0.08}}>DARK</div></DarkCanvas>,
    durationInFrames: 90,
  },
  "collage-grid-overlay": {
    component: () => <DarkCanvas color="#0D0F14"><GridOverlay cellSize={80} color="rgba(255,255,255,0.1)" at={5} /></DarkCanvas>,
    durationInFrames: 90,
  },
  "collage-trend-arrow": {
    component: () => <DarkCanvas color="#0D0F14"><GridOverlay cellSize={80} color="rgba(255,255,255,0.08)" at={0} /><TrendArrow points={[{x:8,y:25},{x:25,y:35},{x:38,y:20},{x:55,y:40},{x:70,y:30},{x:92,y:55}]} color="#E8342E" strokeWidth={5} at={10} glow /></DarkCanvas>,
    durationInFrames: 120,
  },
  "collage-billboard-label": {
    component: () => <DarkCanvas color="#0D0F14"><BillboardLabel text="IT SECTOR" x={50} y={50} fontSize={36} at={10} /><BillboardLabel text="CRISIS" x={50} y={65} fontSize={24} bgColor="#E8342E" textColor="#FFF" at={18} /></DarkCanvas>,
    durationInFrames: 90,
  },
  "collage-dark-editorial-scene": {
    component: () => <DarkEditorialScene showGrid gridSize={80} elements={[
      // Layer 1: buildings at bottom — behind everything
      {type:"cutout",src:"demo-building-left.png",x:12,y:98,maxHeight:550,anchor:"bottom-center",entrance:"slide-right",at:0,zIndex:1,contrast:1.5},
      {type:"cutout",src:"demo-building-right.png",x:88,y:98,maxHeight:480,anchor:"bottom-center",entrance:"slide-left",at:2,zIndex:1,contrast:1.5},
      {type:"cutout",src:"demo-building-center.png",x:50,y:98,maxHeight:520,anchor:"bottom-center",entrance:"drop",at:1,zIndex:2,contrast:1.4},
      // Layer 2: silhouette outline OVERLAPPING the center building
      {type:"silhouette",src:"demo-silhouette.png",x:50,y:35,maxHeight:550,at:5,zIndex:3,strokeColor:"#FFFFFF"},
      // Layer 3: red trend arrow — cuts THROUGH the silhouette and buildings
      {type:"trend",points:[{x:5,y:28},{x:20,y:38},{x:35,y:22},{x:52,y:42},{x:68,y:32},{x:95,y:58}],trendColor:"#E8342E",at:8},
      // Layer 4: billboard ON the center building
      {type:"billboard",text:"IT SECTOR",x:50,y:60,fontSize:32,at:12,zIndex:8,perspective:true},
    ]} />,
    durationInFrames: 150,
  },

  // ── Indian ──
  "indian-mughal-arch-hero": {
    component: () => <MughalArchHero headline="The Mughal Empire" subtitle="Three centuries of art, architecture and empire" categoryLabel="DYNASTY" at={15} />,
    durationInFrames: 180,
  },
  "indian-jali-overlay-stat": {
    component: () => <JaliOverlayStat value="331" label="Years of Mughal rule across the Indian subcontinent" source="1526 -- 1857" categoryLabel="THE REIGN" at={15} />,
    durationInFrames: 180,
  },
  "indian-miniature-frame": {
    component: () => <MiniatureFrame image="demo-cutout.png" caption="Shah Jahan, fifth Mughal emperor and builder of the Taj Mahal" title="The Builder Emperor" at={15} />,
    durationInFrames: 180,
  },
  "indian-arch-comparison": {
    component: () => <ArchComparison leftValue="1526" leftLabel="Babur founds the Mughal Empire at Panipat" rightValue="1857" rightLabel="Last emperor Bahadur Shah Zafar exiled" connector="to" at={15} />,
    durationInFrames: 180,
  },
  "indian-mughal-quote": {
    component: () => <MughalQuote quote="If there is a paradise on earth, it is this, it is this, it is this." attribution="Mughal inscription, Red Fort, Delhi" at={15} />,
    durationInFrames: 180,
  },
  "indian-dynasty-timeline": {
    component: () => <DynastyTimeline title="Mughal Dynasty" events={[
      { date: "1526", event: "Babur defeats Ibrahim Lodi at the First Battle of Panipat" },
      { date: "1556", event: "Akbar ascends the throne, begins era of religious tolerance" },
      { date: "1632", event: "Shah Jahan commissions the Taj Mahal in Agra" },
      { date: "1658", event: "Aurangzeb seizes power, empire reaches maximum extent" },
      { date: "1857", event: "Last Mughal emperor deposed after the Indian Rebellion" },
    ]} at={15} />,
    durationInFrames: 180,
  },

  // ── Indian (South Indian / Temple) ──
  "indian-kolam-hero": {
    component: () => <KolamHero title="Chola Empire" subtitle="Builders of Brihadeshwara, rulers of the seas" categoryLabel="TAMIL NADU" source="Archaeological Survey of India" at={15} />,
    durationInFrames: 180,
  },
  "indian-temple-stat": {
    component: () => <TempleStat value="1,010" label="Years since Brihadeshwara Temple was built in Thanjavur" supportingStat="216 ft" supportingLabel="Height of the vimana — tallest of its era" source="ASI Heritage Records" at={15} />,
    durationInFrames: 180,
  },
  "indian-lotus-reveal": {
    component: () => <LotusReveal title="Thiruvananthapuram" subtitle="City named after the serpent Anantha on which Vishnu reclines" at={10} />,
    durationInFrames: 180,
  },
  "indian-chakra-progress": {
    component: () => <ChakraProgress value={78} label="Of India's temple inscriptions are in Tamil or Kannada" source="Epigraphy Dept, Govt of India" at={10} />,
    durationInFrames: 180,
  },
  "indian-gopuram-comparison": {
    component: () => <GopuramComparison left={{ value: "7", label: "Tiers on the Meenakshi Amman gopuram" }} right={{ value: "14", label: "Gopurams guarding the temple complex" }} heading="Madurai Meenakshi Temple" source="Hindu Temple Architecture" at={15} />,
    durationInFrames: 180,
  },
  "indian-textile-quote": {
    component: () => <TextileQuote quote="The loom is mightier than the sword — it clothed an empire and wove a freedom movement." attribution="Mahatma Gandhi" context="On the significance of khadi and handloom" at={10} />,
    durationInFrames: 180,
  },

  // ── Indian (Cutout/Image) ──
  "indian-arch-portrait": {
    component: () => <ArchPortrait image="demo.png" name="Akbar the Great" title="Third Mughal Emperor" at={15} />,
    durationInFrames: 180,
  },
  "indian-cutout-rangoli": {
    component: () => <CutoutRangoli image="demo.png" caption="The sacred geometry of tradition" at={15} />,
    durationInFrames: 180,
  },
  "indian-pichwai-hero": {
    component: () => <PichwaiHero image="demo.png" caption="Shrinathji" subtitle="Pichwai painting tradition of Nathdwara" at={15} />,
    durationInFrames: 180,
  },
  "indian-textile-portrait": {
    component: () => <TextilePortrait image="demo.png" name="The Weaver" label="Handloom Heritage" at={15} />,
    durationInFrames: 180,
  },
  "indian-durbar-split": {
    component: () => <DurbarSplit leftImage="demo.png" rightImage="demo.png" leftName="Mughal Empire" rightName="Maratha Empire" centerLabel="vs" at={15} />,
    durationInFrames: 180,
  },
  "indian-monument-overlay": {
    component: () => <MonumentOverlay image="demo.png" headline="Brihadeshwara Temple" subtitle="A thousand years of Chola grandeur" accent="gopuram" at={15} />,
    durationInFrames: 180,
  },

  // ── Indian (Data/Map) ──
  "indian-brass-odometer": {
    component: () => <BrassOdometer value="142.8" label="UPI Transactions Per Month (Billions)" source="NPCI, March 2025" at={15} />,
    durationInFrames: 180,
  },
  "indian-saffron-waffle": {
    component: () => <SaffronWaffle percent={67} label="Fortune 500 companies with India-based GCCs" source="NASSCOM 2024" at={15} />,
    durationInFrames: 180,
  },
  "indian-mandala-progress": {
    component: () => <MandalaProgress percent={73} label="Indian GCC engineers on core product, not support" source="Zinnov 2024" at={15} />,
    durationInFrames: 180,
  },
  "indian-india-card": {
    component: () => <IndiaCard stat="$3.94T" statLabel="India's Nominal GDP" body="Fifth-largest economy globally, projected third by 2028." source="IMF World Economic Outlook 2025" at={15} />,
    durationInFrames: 180,
  },
  "indian-pillar-chart": {
    component: () => <PillarChart title="Top 5 UPI-Enabled Apps by Volume" items={[{ label: "PhonePe", value: 48, displayValue: "48%" }, { label: "GPay", value: 37, displayValue: "37%" }, { label: "Paytm", value: 8, displayValue: "8%" }, { label: "CRED", value: 3, displayValue: "3%" }, { label: "Others", value: 4, displayValue: "4%" }]} source="NPCI Dashboard 2025" at={15} />,
    durationInFrames: 180,
  },
  "indian-scroll-decree": {
    component: () => <ScrollDecree title="Digital Public Infrastructure" lines={["Aadhaar gave identity to 1.4 billion.", "Jan Dhan opened 520 million bank accounts.", "UPI moved $2.2 trillion in a single year.", "India Stack is the blueprint the world copies."]} attribution="India Stack, 2024" at={15} />,
    durationInFrames: 180,
  },

  // ── Indian (Rajasthani / Modern) ──
  "indian-rajput-hero": {
    component: () => <RajputHero headline="Rajputana" subtitle="Warriors, poets, and the pink city that never sleeps" categoryLabel="RAJASTHAN" source="Heritage India" at={15} />,
    durationInFrames: 180,
  },
  "indian-holi-splash": {
    component: () => <HoliSplash text="Festival of Colors" subtitle="Holi — the great equalizer" at={15} />,
    durationInFrames: 180,
  },
  "indian-haveli-frame": {
    component: () => <HaveliFrame title="Shekhawati Haveli" caption="Painted mansions of the Marwari merchants" image="demo.png" at={15} />,
    durationInFrames: 180,
  },
  "indian-block-print": {
    component: () => <BlockPrint text="Ajrakh" subtext="2,000 years of resist-dyeing tradition" source="Textile Heritage Trust" at={15} />,
    durationInFrames: 180,
  },
  "indian-festival-counter": {
    component: () => <FestivalCounter value="5,000" label="Festivals celebrated across India each year" source="Ministry of Culture" at={15} />,
    durationInFrames: 180,
  },
  "indian-rangoli-transition": {
    component: () => <RangoliTransition title="Diwali" subtitle="The triumph of light over darkness" at={10} />,
    durationInFrames: 180,
  },

  // ── Full Demo ──
  "upi-demo": {
    component: React.lazy(() => import("./upi-demo").then(m => ({ default: m.UpiDemo }))),
    durationInFrames: 3000,
  },

  // ── Comparison (new) ──
  "comp-versus-split": {
    component: () => <VersusSplit sideA={{ value: "$100B", label: "India GCC Revenue" }} sideB={{ value: "$46B", label: "2019 Revenue" }} categoryLabel="THEN VS NOW" at={15} />,
    durationInFrames: 180,
  },
  "comp-toggle-state": {
    component: () => <ToggleState before="Outsourcing" after="In-house innovation" toggleAt={45} at={15} />,
    durationInFrames: 180,
  },
  "comp-scale-balance": {
    component: () => <ScaleBalance leftItem={{ text: "Cost savings", weight: 40 }} rightItem={{ text: "Strategic value", weight: 75 }} label="GCC Value Proposition" at={15} />,
    durationInFrames: 180,
  },
  "comp-mirror-stat": {
    component: () => <MirrorStat topValue="1,850" topLabel="GCCs in India today" bottomValue="400" bottomLabel="GCCs in India, 2015" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },
  "comp-spectrum-position": {
    component: () => <SpectrumPosition leftLabel="Cost Centre" rightLabel="Innovation Hub" position={78} positionLabel="India GCCs" source="Zinnov 2024" at={15} />,
    durationInFrames: 180,
  },
  "comp-then-now-columns": {
    component: () => <ThenNowColumns thenDate="2005" thenContent="Back-office support, data entry, call centres" nowDate="2024" nowContent="AI research, product engineering, global P&L ownership" at={15} />,
    durationInFrames: 180,
  },
  "comp-advantage-check": {
    component: () => <AdvantageCheck features={[{ name: "Cost efficiency", a: true, b: true }, { name: "Talent depth", a: false, b: true }, { name: "Innovation", a: false, b: true }, { name: "Scale", a: true, b: true }]} labelA="Outsourcing" labelB="GCC Model" at={15} />,
    durationInFrames: 180,
  },
  "comp-gap-bridge": {
    component: () => <GapBridge fromValue="$30B" fromLabel="2015" toValue="$100B" toLabel="2024" gapLabel="3.3x growth" at={15} />,
    durationInFrames: 180,
  },
  "comp-tug-of-war": {
    component: () => <TugOfWar leftForce={{ label: "Legacy IT", value: 35 }} rightForce={{ label: "GCC Innovation", value: 72 }} at={15} />,
    durationInFrames: 180,
  },
  "comp-overlap-venn": {
    component: () => <OverlapVenn leftLabel="Engineering" rightLabel="Business" overlapLabel="GCC Leaders" at={15} />,
    durationInFrames: 180,
  },

  // ── Meter (new) ──
  "meter-dial-gauge": {
    component: () => <DialGauge value={73} maxValue={100} label="GCC Maturity Index" unit="%" source="Zinnov 2024" at={15} />,
    durationInFrames: 180,
  },
  "meter-threat-level": {
    component: () => <ThreatLevel level={4} label="Talent Shortage Severity" description="Critical shortage in specialized AI/ML roles" at={15} />,
    durationInFrames: 180,
  },
  "meter-battery-fill": {
    component: () => <BatteryFill percent={67} label="Fortune 30 GCC Penetration" at={15} />,
    durationInFrames: 180,
  },
  "meter-signal-strength": {
    component: () => <SignalStrength strength={4} label="India GCC Readiness" description="Strong infrastructure, growing talent pipeline" at={15} />,
    durationInFrames: 180,
  },
  "meter-star-rating": {
    component: () => <StarRating rating={4.5} label="India as GCC Destination" source="AT Kearney" at={15} />,
    durationInFrames: 180,
  },
  "meter-progress-ring": {
    component: () => <ProgressRing percent={73} label="Engineers on core product" sublabel="Not support roles" at={15} />,
    durationInFrames: 180,
  },
  "meter-confidence-interval": {
    component: () => <ConfidenceInterval low={95} high={125} estimate={110} label="GCC Revenue 2030 ($B)" at={15} />,
    durationInFrames: 180,
  },
  "meter-approval-arc": {
    component: () => <ApprovalArc approvalPercent={78} label="CEO Approval of GCC Strategy" source="Deloitte Survey" at={15} />,
    durationInFrames: 180,
  },
  "meter-health-bar": {
    component: () => <HealthBar current={73} max={100} label="Talent Pipeline Health" at={15} />,
    durationInFrames: 180,
  },
  "meter-countdown-timer": {
    component: () => <CountdownTimer seconds={47} label="Average UPI Transaction Time" at={15} />,
    durationInFrames: 180,
  },

  // ── Editorial (new) ──
  "edit-front-page": {
    component: () => <FrontPage headline="India Becomes World's GCC Capital" subhead="1,850 global capability centres now call India home" byline="Data Desk" date="April 2024" at={15} />,
    durationInFrames: 180,
  },
  "edit-pull-quote": {
    component: () => <PullQuote quote="GCCs in India have moved beyond back-office roles into strategic hubs." attribution="Economic Survey" publication="2024-25" at={15} />,
    durationInFrames: 180,
  },
  "edit-breaking-banner": {
    component: () => <BreakingBanner headline="India GCC Revenue Crosses $100 Billion" subtext="First emerging market to achieve this milestone" at={15} />,
    durationInFrames: 180,
  },
  "edit-sidebar-callout": {
    component: () => <SidebarCallout mainText="The transformation from cost arbitrage to capability arbitrage marks a fundamental shift." sidebarStat="73%" sidebarLabel="On core product" source="Zinnov" at={15} />,
    durationInFrames: 180,
  },
  "edit-correction-notice": {
    component: () => <CorrectionNotice original="India is the back office of the world" corrected="India is the brain centre of the world" date="2024" at={15} />,
    durationInFrames: 180,
  },
  "edit-dateline": {
    component: () => <Dateline location="BANGALORE" date="April 9, 2026" lede="The city that houses more than 500 global capability centres has quietly become the world's largest tech hub." at={15} />,
    durationInFrames: 180,
  },
  "edit-index-card": {
    component: () => <IndexCard title="GCC Definition" body="A company-owned offshore operation that handles core business functions." annotation="Key concept" at={15} />,
    durationInFrames: 180,
  },
  "edit-classified-block": {
    component: () => <ClassifiedBlock items={[{ title: "AI Research Lead", body: "Bangalore. $200K+." }, { title: "Product Director", body: "Hyderabad. Global P&L." }, { title: "Staff Engineer", body: "Pune. Platform arch." }]} highlightIndex={0} at={15} />,
    durationInFrames: 180,
  },
  "edit-evidence-dossier": {
    component: () => <EvidenceDossier title="GCC Evidence" findings={[{ date: "2019", text: "Revenue crosses $30B", source: "NASSCOM" }, { date: "2024", text: "Revenue hits $100B", source: "Economic Survey" }]} at={15} />,
    durationInFrames: 180,
  },
  "edit-ticker-crawl": {
    component: () => <TickerCrawl tickerText="GCC revenue crosses $100B — 1,850 centres operational — 67% of Fortune 30 have Indian GCCs" headline="India GCC Watch" tag="LIVE" at={15} />,
    durationInFrames: 180,
  },

  // ── Reveal (new) ──
  "reveal-curtain-pull": {
    component: () => <CurtainPull content="$100 Billion" sublabel="India GCC Revenue, 2024" revealAt={30} at={15} />,
    durationInFrames: 180,
  },
  "reveal-scratch-card": {
    component: () => <ScratchCard hiddenValue="1,850" label="GCCs in India" scratchAt={25} at={15} />,
    durationInFrames: 180,
  },
  "reveal-blur-to-sharp": {
    component: () => <BlurToSharp content="Brain Centre" sublabel="India's new identity" focusAt={30} at={15} />,
    durationInFrames: 180,
  },
  "reveal-pixel-resolve": {
    component: () => <PixelResolve content="$100B" label="The number" resolveAt={25} at={15} />,
    durationInFrames: 180,
  },
  "reveal-envelope-open": {
    component: () => <EnvelopeOpen message="Promoted to Global P&L Owner" sender="HQ, New York" openAt={30} at={15} />,
    durationInFrames: 180,
  },
  "reveal-vault-door": {
    component: () => <VaultDoor content="67%" label="Fortune 30 penetration" openAt={35} at={15} />,
    durationInFrames: 180,
  },
  "reveal-fog-lift": {
    component: () => <FogLift content="The Future is Already Here" sublabel="Just not evenly distributed" clearAt={20} at={15} />,
    durationInFrames: 180,
  },
  "reveal-redacted-lift": {
    component: () => <RedactedLift text="India moved from back office to brain centre in a decade" redactedWords={["brain centre", "a decade"]} liftAt={30} at={15} />,
    durationInFrames: 180,
  },
  "reveal-blinds-open": {
    component: () => <BlindsOpen content="Innovation Hub" openAt={20} at={15} />,
    durationInFrames: 180,
  },
  "reveal-peel-back": {
    component: () => <PeelBack topContent="The Old Story" revealedContent="The Real Story" peelAt={35} at={15} />,
    durationInFrames: 180,
  },

  // ── Abstract (new) ──
  "abs-grain-wash": {
    component: () => <GrainWash text="Chapter One" at={15} />,
    durationInFrames: 180,
  },
  "abs-topography-lines": {
    component: () => <TopographyLines text="Terrain" at={15} />,
    durationInFrames: 180,
  },
  "abs-dot-field": {
    component: () => <DotField text="Signal" at={15} />,
    durationInFrames: 180,
  },
  "abs-wave-pattern": {
    component: () => <WavePattern text="Frequency" at={15} />,
    durationInFrames: 180,
  },
  "abs-mesh-gradient": {
    component: () => <MeshGradient text="Atmosphere" at={15} />,
    durationInFrames: 180,
  },
  "abs-paper-tear": {
    component: () => <PaperTear bottomContent="The truth underneath" tearAt={30} at={15} />,
    durationInFrames: 180,
  },
  "abs-ink-spread": {
    component: () => <InkSpread text="Impact" sublabel="When everything changes" spreadAt={20} at={15} />,
    durationInFrames: 180,
  },
  "abs-noise-static": {
    component: () => <NoiseStatic text="Transmission" resolveAt={35} at={15} />,
    durationInFrames: 180,
  },
  "abs-ripple-rings": {
    component: () => <RippleRings text="Origin" at={15} />,
    durationInFrames: 180,
  },
  "abs-grid-warp": {
    component: () => <GridWarp text="Gravity" at={15} />,
    durationInFrames: 180,
  },

  // ── Annotation (new) ──
  "annot-margin-note": {
    component: () => <MarginNote mainText="India's GCC sector grew 3.3x in under a decade." annotation="Fastest growth rate globally" at={15} />,
    durationInFrames: 180,
  },
  "annot-post-it-stack": {
    component: () => <PostItStack notes={[{ text: "Check NASSCOM data" }, { text: "Verify Fortune 30 claim" }, { text: "Add Zinnov source" }]} at={15} />,
    durationInFrames: 180,
  },
  "annot-red-pen-circle": {
    component: () => <RedPenCircle text="India is the brain centre, not the back office." circledPortion="brain centre" note="Key claim" at={15} />,
    durationInFrames: 180,
  },
  "annot-footnote-pop": {
    component: () => <FootnotePop mainText="GCC revenue reached $100 billion in 2024." footnoteNumber={1} footnoteText="Source: NASSCOM annual report" popAt={35} at={15} />,
    durationInFrames: 180,
  },
  "annot-highlight-sweep": {
    component: () => <HighlightSweep text="The transformation from cost arbitrage to capability arbitrage." highlights={[{ phrase: "capability arbitrage" }]} at={15} />,
    durationInFrames: 180,
  },
  "annot-pin-board": {
    component: () => <PinBoard items={[{ text: "1,850 GCCs" }, { text: "$100B revenue" }, { text: "67% Fortune 30" }]} title="Key Facts" at={15} />,
    durationInFrames: 180,
  },
  "annot-card-fan": {
    component: () => <CardFan cards={[{ title: "Phase 1", body: "Cost centre" }, { title: "Phase 2", body: "Delivery hub" }, { title: "Phase 3", body: "Innovation lab" }]} at={15} />,
    durationInFrames: 180,
  },
  "annot-layer-explode": {
    component: () => <LayerExplode layers={[{ label: "Infrastructure", content: "Aadhaar + Jan Dhan" }, { label: "Platform", content: "UPI + DigiLocker" }, { label: "Apps", content: "PhonePe + GPay" }]} explodeAt={30} at={15} />,
    durationInFrames: 180,
  },
  "annot-accordion-reveal": {
    component: () => <AccordionReveal sections={[{ title: "What are GCCs?", content: "Company-owned offshore operations." }, { title: "Why India?", content: "Talent, cost, English." }, { title: "What changed?", content: "Support to ownership." }]} at={15} />,
    durationInFrames: 180,
  },
  "annot-flip-card": {
    component: () => <FlipCard front="What did India used to be?" back="The back office of the world" flipAt={40} at={15} />,
    durationInFrames: 180,
  },

  // ── Kinetic Text (new) ──
  "ktext-massive-word": {
    component: () => <MassiveWord word="SHIFT" sublabel="The GCC transformation" at={15} />,
    durationInFrames: 180,
  },
  "ktext-text-cascade": {
    component: () => <TextCascade words={["Cost", "Talent", "Scale", "Innovation", "Ownership"]} at={15} />,
    durationInFrames: 180,
  },
  "ktext-text-spiral": {
    component: () => <TextSpiral text="TRANSFORM" at={15} />,
    durationInFrames: 180,
  },
  "ktext-bounce-word": {
    component: () => <BounceWord word="IMPACT" label="When the numbers land" at={15} />,
    durationInFrames: 180,
  },
  "ktext-typewriter-cursor": {
    component: () => <TypewriterCursor text="India is no longer the back office." at={15} />,
    durationInFrames: 180,
  },
  "ktext-text-shatter": {
    component: () => <TextShatter beforeWord="OUTSOURCE" afterWord="INNOVATE" shatterAt={40} at={15} />,
    durationInFrames: 180,
  },
  "ktext-text-wave": {
    component: () => <TextWave text="CAPABILITY ARBITRAGE" at={15} />,
    durationInFrames: 180,
  },
  "ktext-zoom-through": {
    component: () => <ZoomThrough words={["Cost", "Scale", "Talent", "Innovation"]} at={15} />,
    durationInFrames: 180,
  },
  "ktext-text-flip-cycle": {
    component: () => <TextFlipCycle words={["Bangalore", "Hyderabad", "Pune", "Chennai", "Delhi"]} at={15} />,
    durationInFrames: 180,
  },
  "ktext-ellipsis-resolve": {
    component: () => <EllipsisResolve punchline="$100B" sublabel="That's the number" at={15} />,
    durationInFrames: 180,
  },

  // ── Data Viz (new) ──
  "dataviz-treemap": {
    component: () => <Treemap items={[{ label: "IT Services", value: 45 }, { label: "Engineering", value: 28 }, { label: "AI/ML", value: 15 }, { label: "Consulting", value: 12 }]} title="GCC Revenue Split" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-radar-chart": {
    component: () => <RadarChart axes={[{ label: "Talent", value: 85 }, { label: "Cost", value: 90 }, { label: "Infra", value: 70 }, { label: "Innovation", value: 75 }, { label: "Scale", value: 80 }]} title="India Scorecard" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-sankey-flow": {
    component: () => <SankeyFlow leftItems={["US HQ", "EU HQ", "APAC"]} rightItems={["Bangalore", "Hyderabad", "Pune"]} flows={[{ from: 0, to: 0, value: 40 }, { from: 1, to: 0, value: 30 }, { from: 2, to: 1, value: 20 }]} title="GCC Flow" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-bubble-pack": {
    component: () => <BubblePack items={[{ label: "BLR", value: 500 }, { label: "HYD", value: 300 }, { label: "PUN", value: 200 }, { label: "CHN", value: 150 }]} title="GCCs by City" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-spark-line": {
    component: () => <SparkLine value="$100B" trend={[20, 30, 45, 55, 70, 85, 100]} label="GCC Revenue" trendLabel="2016-2024" source="NASSCOM" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-lollipop-chart": {
    component: () => <LollipopChart items={[{ label: "Bangalore", value: 500 }, { label: "Hyderabad", value: 300 }, { label: "Pune", value: 200 }, { label: "Chennai", value: 150 }]} title="GCCs by City" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-slope-chart": {
    component: () => <SlopeChart startLabel="2019" endLabel="2024" items={[{ label: "IT Services", start: 60, end: 45 }, { label: "Engineering", start: 25, end: 40 }]} title="Revenue Mix Shift" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-isotype-row": {
    component: () => <IsotypeRow items={[{ label: "Fortune 30", count: 20 }, { label: "Fortune 100", count: 65 }]} unitLabel="companies" title="GCC Adoption" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-dumbbell-chart": {
    component: () => <DumbbellChart items={[{ label: "Revenue ($B)", start: 30, end: 100 }, { label: "Headcount (K)", start: 800, end: 2000 }]} startLabel="2015" endLabel="2024" title="GCC Growth" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-pyramid-chart": {
    component: () => <PyramidChart items={[{ label: "Junior", left: 45, right: 50 }, { label: "Mid", left: 30, right: 35 }, { label: "Senior", left: 15, right: 20 }]} leftLabel="2019" rightLabel="2024" title="Talent Pyramid" at={15} />,
    durationInFrames: 180,
  },

  // ── Narrative (new) ──
  "narr-myth-vs-fact": {
    component: () => <MythVsFact myth="India only does cheap IT support" fact="73% work on core product" factAt={45} at={15} />,
    durationInFrames: 180,
  },
  "narr-list-build": {
    component: () => <ListBuild items={["Cost arbitrage", "Talent depth", "Time zone coverage", "Innovation", "Ownership"]} title="WHY INDIA" at={15} />,
    durationInFrames: 180,
  },
  "narr-paradox-frame": {
    component: () => <ParadoxFrame statementA="India was the cheapest option" statementB="India became the best option" at={15} />,
    durationInFrames: 180,
  },
  "narr-thesis-bold": {
    component: () => <ThesisBold thesis="The GCC model made outsourcing obsolete." support="When you can own the talent, why rent it?" at={15} />,
    durationInFrames: 180,
  },
  "narr-whisper-shout": {
    component: () => <WhisperShout text="$100 BILLION" shoutAt={35} at={15} />,
    durationInFrames: 180,
  },
  "narr-ellipsis-punchline": {
    component: () => <EllipsisPunchline punchline="INDIA" sublabel="The answer was always India" punchAt={50} at={15} />,
    durationInFrames: 180,
  },

  // ── Hero (new) ──
  "hero-countdown-hero": {
    component: () => <CountdownHero from={5} statement="India crosses $100B" label="GCC Milestone" at={15} />,
    durationInFrames: 180,
  },
  "hero-question-hero": {
    component: () => <QuestionHero question="What happens when the back office starts thinking?" attribution="The GCC Question" at={15} />,
    durationInFrames: 180,
  },
  "hero-definition-card": {
    component: () => <DefinitionCard word="GCC" pronunciation="/dʒiː.siː.siː/" partOfSpeech="noun" definition="A company-owned offshore operation handling core business functions." at={15} />,
    durationInFrames: 180,
  },
  "hero-wanted-poster": {
    component: () => <WantedPoster name="The Outsourcing Model" charge="Making India a cost centre for 20 years" reward="Replaced by GCC innovation" at={15} />,
    durationInFrames: 180,
  },

  // ── Screen (new) ──
  "screen-chat-bubble": {
    component: () => <ChatBubble messages={[{ text: "We need to cut costs", sender: "left" }, { text: "Build a GCC instead?", sender: "right" }, { text: "In India?", sender: "left" }, { text: "1,850 companies already did", sender: "right" }]} contactName="Strategy" at={15} />,
    durationInFrames: 180,
  },
  "screen-email-window": {
    component: () => <EmailWindow from="CEO" to="Board" subject="India GCC Strategy" body="Bangalore centre now owns global product P&L." at={15} />,
    durationInFrames: 180,
  },
  "screen-receipt-scroll": {
    component: () => <ReceiptScroll items={[{ name: "IT Support", amount: "$12B" }, { name: "Engineering R&D", amount: "$35B" }, { name: "AI/ML Ops", amount: "$18B" }]} total="$100B" merchant="India GCC Inc." date="FY 2024" at={15} />,
    durationInFrames: 180,
  },
  "screen-dashboard-kpi": {
    component: () => <DashboardKPI value="$100B" label="GCC Revenue" trend="up" trendPercent="+12% YoY" period="FY 2024" at={15} />,
    durationInFrames: 180,
  },
  "screen-search-result": {
    component: () => <SearchResult query="India GCC revenue 2024" title="India GCC Revenue Crosses $100B" url="nasscom.in/gcc-report" snippet="1,850 centres employing over 2 million professionals." at={15} />,
    durationInFrames: 180,
  },
  "screen-notification-stack": {
    component: () => <NotificationStack notifications={[{ title: "Bloomberg", preview: "GCC revenue hits $100B", color: "#C17A48" }, { title: "NASSCOM", preview: "400 GCCs added in 5 years" }, { title: "ET", preview: "Bangalore: world GCC capital" }]} at={15} />,
    durationInFrames: 180,
  },
  "screen-code-block": {
    component: () => <CodeBlock lines={["const gccCount = 1850;", "const revenue = \"$100B\";", "// back office → brain centre", "console.log(revenue);"]} language="typescript" highlightLines={[2]} at={15} />,
    durationInFrames: 180,
  },
  "screen-poll-result": {
    component: () => <PollResult question="Top GCC destination?" options={[{ text: "India", percent: 67, winner: true }, { text: "Shared", percent: 22 }, { text: "Shifting", percent: 11 }]} totalVotes="12,847" at={15} />,
    durationInFrames: 180,
  },
  "screen-tweet-card": {
    component: () => <TweetCard name="NASSCOM" handle="@nasscom" text="India GCC sector crosses $100B. 1,850 centres. 2M+ professionals." likes={4200} retweets={1800} replies={340} date="Apr 2024" at={15} />,
    durationInFrames: 180,
  },
  "screen-spreadsheet-cell": {
    component: () => <SpreadsheetCell data={[["City", "GCCs", "Revenue"], ["BLR", "500+", "$35B"], ["HYD", "300+", "$22B"], ["PUN", "200+", "$15B"]]} highlightCell={{ row: 1, col: 2 }} formula="=SUM(C2:C4)" at={15} />,
    durationInFrames: 180,
  },

  // ── Swarajya templates ────────────────────────────────────
  "trans-gold-slash": {
    component: () => <GoldSlashDemo />,
    durationInFrames: 90,
  },
  "dataviz-threat-gap-bar": {
    component: () => <ThreatGapBar threatLabel="CHINA THREAT RANGE" threatValue={85} threatDisplay="3,500 KM" capabilityLabel="INDIA INTERCEPT RANGE" capabilityValue={40} capabilityDisplay="1,200 KM" gapLabel="2,300 KM GAP" title="THE CAPABILITY DEFICIT" source="IISS Military Balance 2024" badge="#SWARAJYA" at={15} />,
    durationInFrames: 180,
  },
  "narr-accusation-reveal": {
    component: () => <AccusationReveal contextLine="IN 2023, THE MINISTRY OF DEFENCE CLAIMED:" accusation="WE HAVE NO KNOWLEDGE OF ANY SUCH TRANSFER" attribution="— Press Trust of India, March 14 2023" badge="#SWARAJYA" at={15} />,
    durationInFrames: 180,
  },
  "hero-ops-room-title": {
    component: () => <OpsRoomTitle title="OPERATION SINDHU RAKSHA" subtitle="HOW INDIA BUILT A NAVAL CORDON THE WORLD DIDN'T SEE COMING" episodeLabel="EPISODE 04 | SERIES: NAVAL DOCTRINE" badge="#SWARAJYA" at={15} />,
    durationInFrames: 180,
  },
  "dataviz-timeline-event-strip": {
    component: () => <TimelineEventStrip events={[{ date: "1971", label: "SIMLA AGREEMENT", type: "capability", annotation: "India & Pakistan" }, { date: "1998", label: "POKHRAN-II", type: "capability", annotation: "Nuclear declaration" }, { date: "2003", label: "CEASEFIRE LINE", type: "threat", annotation: "Violations begin" }, { date: "2016", label: "SURGICAL STRIKES", type: "capability" }, { date: "2019", label: "BALAKOT", type: "capability" }, { date: "2023", label: "ESCALATION SPIKE", type: "threat", annotation: "72 violations" }]} title="THE ESCALATION LADDER" source="Ministry of Defence Annual Report" badge="#SWARAJYA" at={15} buildFrames={120} />,
    durationInFrames: 210,
  },
  "imgcomp-evidence-frame": {
    component: () => <EvidenceFrame image="swarajya-sample.png" categoryLabel="CLASSIFIED" headline="3 CHINESE SUBMARINES TRACKED NEAR ANDAMAN SEA" body="Multiple sorties detected in Q3 2023. Pattern suggests pre-positioning for strait interdiction." source="IISS Strategic Dossier 2024" refNumber="REF: IND/NAV/2024-003" badge="#SWARAJYA" at={15} />,
    durationInFrames: 180,
  },

};

/**
 * Merged demo map: auto-discovered templates override manual entries.
 * Auto-discovered = templates that export `demo` from their .tsx file.
 * Manual = everything above in `manualDemoMap`.
 */
const autoDemos = buildAutoDemoMap();
export const demoMap: Record<string, DemoEntry> = {
  ...manualDemoMap,
  ...staticAutoDemoMap,
  ...autoDemos,
};
