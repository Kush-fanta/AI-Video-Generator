import React from "react";
import type { DemoEntry, DemoConfig } from "./auto-demos";

import * as CollageSilhouetteOutlineModule from "../../collage/silhouette-outline";
import * as HeroStatComparisonHeroModule from "../../hero/stat-comparison-hero";
import * as CollageBeamConnectModule from "../../collage/beam-connect";
import * as CollageCrisisSkylineModule from "../../collage/crisis-skyline";
import * as CollagePropagandaPosterModule from "../../collage/propaganda-poster";
import * as ImageCompSplitImageStatModule from "../../image-comp/split-image-stat";
import * as ImageCompSplitImageStatRevealModule from "../../image-comp/split-image-stat-reveal";
import * as ImageCompSectionMarkerModule from "../../image-comp/section-marker";
import * as ImageCompDualStatCompareModule from "../../image-comp/dual-stat-compare";
import * as ImageCompVerdictOverlayModule from "../../image-comp/verdict-overlay";
import * as ImageCompStatStripModule from "../../image-comp/stat-strip";
import * as ImageCompThreatGapBarModule from "../../image-comp/threat-gap-bar";
import * as ImageCompTimelineStripModule from "../../image-comp/timeline-strip";
import * as ImageCompEvidenceCardModule from "../../image-comp/evidence-card";
import * as ImageCompStatGridModule from "../../image-comp/stat-grid";
import * as ImageCompStackedStatBuildModule from "../../image-comp/stacked-stat-build";
import * as ImageCompPullQuoteOverlayModule from "../../image-comp/pull-quote-overlay";
import * as SwarajyaKitArchivalCaptionModule from "../../swarajya-kit/archival-caption";
import * as SwarajyaKitLowerThirdLabelModule from "../../swarajya-kit/lower-third-label";
import * as SwarajyaKitLowerThirdModule from "../../swarajya-kit/lower-third";
import * as SwarajyaKitTextCardAccentModule from "../../swarajya-kit/text-card-accent";
import * as SwarajyaKitTextCardTwoLineModule from "../../swarajya-kit/text-card-two-line";
import * as SwarajyaKitTextCardUnderlineModule from "../../swarajya-kit/text-card-underline";
import * as SwarajyaKitTextCardModule from "../../swarajya-kit/text-card";
import * as SwarajyaKitArchivalActionOverlayModule from "../../swarajya-kit/archival-action-overlay";
import * as SwarajyaKitArchivalEditorialModule from "../../swarajya-kit/archival-editorial";
import * as SwarajyaKitStatBigNumberModule from "../../swarajya-kit/stat-big-number";
import * as SwarajyaKitStatComparisonModule from "../../swarajya-kit/stat-comparison";
import * as SwarajyaKitStatDeltaModule from "../../swarajya-kit/stat-delta";
import * as SwarajyaKitStatPercentModule from "../../swarajya-kit/stat-percent";
import * as SwarajyaKitStatStackedModule from "../../swarajya-kit/stat-stacked";
import * as SwarajyaKitStatWithIconModule from "../../swarajya-kit/stat-with-icon";
import * as SwarajyaKitCostBarCompareModule from "../../swarajya-kit/cost-bar-compare";
import * as SwarajyaKitRatioTileModule from "../../swarajya-kit/ratio-tile";
import * as SwarajyaKitTimeSeriesDeclineModule from "../../swarajya-kit/time-series-decline";
import * as SwarajyaKitSplitCompareModule from "../../swarajya-kit/split-compare";
import * as SwarajyaKitRedFullBleedModule from "../../swarajya-kit/red-full-bleed";
import * as SwarajyaKitBlackFullBleedModule from "../../swarajya-kit/black-full-bleed";
import * as SwarajyaKitChapterSlateModule from "../../swarajya-kit/chapter-slate";
import * as SwarajyaKitEndCardModule from "../../swarajya-kit/end-card";
import * as SwarajyaKitEvidenceListModule from "../../swarajya-kit/evidence-list";
import * as SwarajyaKitLowerThirdQuoteModule from "../../swarajya-kit/lower-third-quote";
import * as SwarajyaKitMapCalloutModule from "../../swarajya-kit/map-callout";
import * as SwarajyaKitPullQuoteModule from "../../swarajya-kit/pull-quote";
import * as SwarajyaKitQuestionHookModule from "../../swarajya-kit/question-hook";
import * as SwarajyaKitTickerStripModule from "../../swarajya-kit/ticker-strip";
import * as SwarajyaKitTitleCardModule from "../../swarajya-kit/title-card";
import * as SwarajyaKitAreaChartModule from "../../swarajya-kit/area-chart";
import * as SwarajyaKitBarChartHModule from "../../swarajya-kit/bar-chart-h";
import * as SwarajyaKitBarChartVModule from "../../swarajya-kit/bar-chart-v";
import * as SwarajyaKitDonutChartModule from "../../swarajya-kit/donut-chart";
import * as SwarajyaKitImageCaptionModule from "../../swarajya-kit/image-caption";
import * as SwarajyaKitImageDuoModule from "../../swarajya-kit/image-duo";
import * as SwarajyaKitImageFullBleedModule from "../../swarajya-kit/image-full-bleed";
import * as SwarajyaKitImageGrid2x2Module from "../../swarajya-kit/image-grid-2x2";
import * as SwarajyaKitImageHeadlineOverModule from "../../swarajya-kit/image-headline-over";
import * as SwarajyaKitImageInsetModule from "../../swarajya-kit/image-inset";
import * as SwarajyaKitImageLeftSplitModule from "../../swarajya-kit/image-left-split";
import * as SwarajyaKitImageRightSplitModule from "../../swarajya-kit/image-right-split";
import * as SwarajyaKitImageSourceCreditModule from "../../swarajya-kit/image-source-credit";
import * as SwarajyaKitImageStripModule from "../../swarajya-kit/image-strip";
import * as SwarajyaKitLineChartModule from "../../swarajya-kit/line-chart";
import * as SwarajyaKitRankingListModule from "../../swarajya-kit/ranking-list";
import * as SwarajyaKitStackedBarHModule from "../../swarajya-kit/stacked-bar-h";
import * as SwarajyaKitTransitionBreakLineModule from "../../swarajya-kit/transition-break-line";
import * as SwarajyaKitTransitionChapterBumpModule from "../../swarajya-kit/transition-chapter-bump";
import * as SwarajyaKitTransitionCutBlackModule from "../../swarajya-kit/transition-cut-black";
import * as SwarajyaKitTransitionCutNavyModule from "../../swarajya-kit/transition-cut-navy";
import * as SwarajyaKitTransitionFlashModule from "../../swarajya-kit/transition-flash";
import * as SwarajyaKitTransitionIrisModule from "../../swarajya-kit/transition-iris";
import * as SwarajyaKitTransitionNumberBumpModule from "../../swarajya-kit/transition-number-bump";
import * as SwarajyaKitTransitionRedSweepModule from "../../swarajya-kit/transition-red-sweep";
import * as SwarajyaKitTransitionSegmentDividerModule from "../../swarajya-kit/transition-segment-divider";
import * as SwarajyaKitTransitionWipeRightModule from "../../swarajya-kit/transition-wipe-right";
import * as SwarajyaKitAnnotatedStatModule from "../../swarajya-kit/annotated-stat";
import * as SwarajyaKitBeforeAfterModule from "../../swarajya-kit/before-after";
import * as SwarajyaKitBreakingBannerModule from "../../swarajya-kit/breaking-banner";
import * as SwarajyaKitCalloutBoxModule from "../../swarajya-kit/callout-box";
import * as SwarajyaKitChapterIntroModule from "../../swarajya-kit/chapter-intro";
import * as SwarajyaKitComparisonTableModule from "../../swarajya-kit/comparison-table";
import * as SwarajyaKitCreditsRollModule from "../../swarajya-kit/credits-roll";
import * as SwarajyaKitDataCalloutModule from "../../swarajya-kit/data-callout";
import * as SwarajyaKitDisclaimerModule from "../../swarajya-kit/disclaimer";
import * as SwarajyaKitGaugeModule from "../../swarajya-kit/gauge";
import * as SwarajyaKitGrowthArrowModule from "../../swarajya-kit/growth-arrow";
import * as SwarajyaKitHeatRowModule from "../../swarajya-kit/heat-row";
import * as SwarajyaKitMapDotsModule from "../../swarajya-kit/map-dots";
import * as SwarajyaKitMidRollHookModule from "../../swarajya-kit/mid-roll-hook";
import * as SwarajyaKitProgressBarHModule from "../../swarajya-kit/progress-bar-h";
import * as SwarajyaKitProgressMultiModule from "../../swarajya-kit/progress-multi";
import * as SwarajyaKitQuoteAttributionModule from "../../swarajya-kit/quote-attribution";
import * as SwarajyaKitScatterTwoSeriesModule from "../../swarajya-kit/scatter-two-series";
import * as SwarajyaKitScrollTickerModule from "../../swarajya-kit/scroll-ticker";
import * as SwarajyaKitSourceCardModule from "../../swarajya-kit/source-card";
import * as SwarajyaKitTimelineHModule from "../../swarajya-kit/timeline-h";
import * as SwarajyaKitTimelineVModule from "../../swarajya-kit/timeline-v";
import * as SwarajyaKitWaterfallChartModule from "../../swarajya-kit/waterfall-chart";

interface TemplateModule {
  demo?: DemoConfig;
  default?: React.FC<any>;
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object";
};

const isDemoConfig = (value: unknown): value is DemoConfig => {
  if (!isRecord(value)) return false;
  return (
    typeof value.compositionId === "string" &&
    typeof value.durationInFrames === "number" &&
    isRecord(value.props)
  );
};

const resolveComponent = (mod: TemplateModule): React.FC<any> | null => {
  if (typeof mod.default === "function") {
    return mod.default;
  }

  for (const [key, value] of Object.entries(mod)) {
    if (
      key !== "demo" &&
      key !== "default" &&
      typeof value === "function" &&
      key[0] === key[0].toUpperCase()
    ) {
      return value as React.FC<any>;
    }
  }

  return null;
};

const createEntry = (mod: TemplateModule): DemoEntry | null => {
  if (!isDemoConfig(mod.demo)) return null;
  const Component = resolveComponent(mod);
  if (!Component) return null;

  return {
    component: Component,
    durationInFrames: mod.demo.durationInFrames,
    inputProps: mod.demo.props,
  };
};

const missingModules: Array<[string, TemplateModule]> = [
  ["collage-silhouette-outline", CollageSilhouetteOutlineModule],
  ["hero-stat-comparison-hero", HeroStatComparisonHeroModule],
  ["collage-beam-connect", CollageBeamConnectModule],
  ["collage-crisis-skyline", CollageCrisisSkylineModule],
  ["collage-propaganda-poster", CollagePropagandaPosterModule],
  ["imgcomp-split-image-stat", ImageCompSplitImageStatModule],
  ["imgcomp-split-image-stat-reveal", ImageCompSplitImageStatRevealModule],
  ["imgcomp-section-marker", ImageCompSectionMarkerModule],
  ["imgcomp-dual-stat-compare", ImageCompDualStatCompareModule],
  ["imgcomp-verdict-overlay", ImageCompVerdictOverlayModule],
  ["imgcomp-stat-strip", ImageCompStatStripModule],
  ["imgcomp-threat-gap-bar", ImageCompThreatGapBarModule],
  ["imgcomp-timeline-strip", ImageCompTimelineStripModule],
  ["imgcomp-evidence-card", ImageCompEvidenceCardModule],
  ["imgcomp-stat-grid", ImageCompStatGridModule],
  ["imgcomp-stacked-stat-build", ImageCompStackedStatBuildModule],
  ["imgcomp-pull-quote-overlay", ImageCompPullQuoteOverlayModule],
  ["sk-archival-caption", SwarajyaKitArchivalCaptionModule],
  ["sk-lower-third-label", SwarajyaKitLowerThirdLabelModule],
  ["sk-lower-third", SwarajyaKitLowerThirdModule],
  ["sk-text-card-accent", SwarajyaKitTextCardAccentModule],
  ["sk-text-card-two-line", SwarajyaKitTextCardTwoLineModule],
  ["sk-text-card-underline", SwarajyaKitTextCardUnderlineModule],
  ["sk-text-card", SwarajyaKitTextCardModule],
  ["sk-archival-action-overlay", SwarajyaKitArchivalActionOverlayModule],
  ["sk-archival-editorial", SwarajyaKitArchivalEditorialModule],
  ["sk-stat-big-number", SwarajyaKitStatBigNumberModule],
  ["sk-stat-comparison", SwarajyaKitStatComparisonModule],
  ["sk-stat-delta", SwarajyaKitStatDeltaModule],
  ["sk-stat-percent", SwarajyaKitStatPercentModule],
  ["sk-stat-stacked", SwarajyaKitStatStackedModule],
  ["sk-stat-with-icon", SwarajyaKitStatWithIconModule],
  ["sk-cost-bar-compare", SwarajyaKitCostBarCompareModule],
  ["sk-ratio-tile", SwarajyaKitRatioTileModule],
  ["sk-time-series-decline", SwarajyaKitTimeSeriesDeclineModule],
  ["sk-split-compare", SwarajyaKitSplitCompareModule],
  ["sk-red-full-bleed", SwarajyaKitRedFullBleedModule],
  ["sk-black-full-bleed", SwarajyaKitBlackFullBleedModule],
  ["sk-chapter-slate", SwarajyaKitChapterSlateModule],
  ["sk-end-card", SwarajyaKitEndCardModule],
  ["sk-evidence-list", SwarajyaKitEvidenceListModule],
  ["sk-lower-third-quote", SwarajyaKitLowerThirdQuoteModule],
  ["sk-map-callout", SwarajyaKitMapCalloutModule],
  ["sk-pull-quote", SwarajyaKitPullQuoteModule],
  ["sk-question-hook", SwarajyaKitQuestionHookModule],
  ["sk-ticker-strip", SwarajyaKitTickerStripModule],
  ["sk-title-card", SwarajyaKitTitleCardModule],
  ["sk-area-chart", SwarajyaKitAreaChartModule],
  ["sk-bar-chart-h", SwarajyaKitBarChartHModule],
  ["sk-bar-chart-v", SwarajyaKitBarChartVModule],
  ["sk-donut-chart", SwarajyaKitDonutChartModule],
  ["sk-image-caption", SwarajyaKitImageCaptionModule],
  ["sk-image-duo", SwarajyaKitImageDuoModule],
  ["sk-image-full-bleed", SwarajyaKitImageFullBleedModule],
  ["sk-image-grid-2x2", SwarajyaKitImageGrid2x2Module],
  ["sk-image-headline-over", SwarajyaKitImageHeadlineOverModule],
  ["sk-image-inset", SwarajyaKitImageInsetModule],
  ["sk-image-left-split", SwarajyaKitImageLeftSplitModule],
  ["sk-image-right-split", SwarajyaKitImageRightSplitModule],
  ["sk-image-source-credit", SwarajyaKitImageSourceCreditModule],
  ["sk-image-strip", SwarajyaKitImageStripModule],
  ["sk-line-chart", SwarajyaKitLineChartModule],
  ["sk-ranking-list", SwarajyaKitRankingListModule],
  ["sk-stacked-bar-h", SwarajyaKitStackedBarHModule],
  ["sk-transition-break-line", SwarajyaKitTransitionBreakLineModule],
  ["sk-transition-chapter-bump", SwarajyaKitTransitionChapterBumpModule],
  ["sk-transition-cut-black", SwarajyaKitTransitionCutBlackModule],
  ["sk-transition-cut-navy", SwarajyaKitTransitionCutNavyModule],
  ["sk-transition-flash", SwarajyaKitTransitionFlashModule],
  ["sk-transition-iris", SwarajyaKitTransitionIrisModule],
  ["sk-transition-number-bump", SwarajyaKitTransitionNumberBumpModule],
  ["sk-transition-red-sweep", SwarajyaKitTransitionRedSweepModule],
  ["sk-transition-segment-divider", SwarajyaKitTransitionSegmentDividerModule],
  ["sk-transition-wipe-right", SwarajyaKitTransitionWipeRightModule],
  ["sk-annotated-stat", SwarajyaKitAnnotatedStatModule],
  ["sk-before-after", SwarajyaKitBeforeAfterModule],
  ["sk-breaking-banner", SwarajyaKitBreakingBannerModule],
  ["sk-callout-box", SwarajyaKitCalloutBoxModule],
  ["sk-chapter-intro", SwarajyaKitChapterIntroModule],
  ["sk-comparison-table", SwarajyaKitComparisonTableModule],
  ["sk-credits-roll", SwarajyaKitCreditsRollModule],
  ["sk-data-callout", SwarajyaKitDataCalloutModule],
  ["sk-disclaimer", SwarajyaKitDisclaimerModule],
  ["sk-gauge", SwarajyaKitGaugeModule],
  ["sk-growth-arrow", SwarajyaKitGrowthArrowModule],
  ["sk-heat-row", SwarajyaKitHeatRowModule],
  ["sk-map-dots", SwarajyaKitMapDotsModule],
  ["sk-mid-roll-hook", SwarajyaKitMidRollHookModule],
  ["sk-progress-bar-h", SwarajyaKitProgressBarHModule],
  ["sk-progress-multi", SwarajyaKitProgressMultiModule],
  ["sk-quote-attribution", SwarajyaKitQuoteAttributionModule],
  ["sk-scatter-two-series", SwarajyaKitScatterTwoSeriesModule],
  ["sk-scroll-ticker", SwarajyaKitScrollTickerModule],
  ["sk-source-card", SwarajyaKitSourceCardModule],
  ["sk-timeline-h", SwarajyaKitTimelineHModule],
  ["sk-timeline-v", SwarajyaKitTimelineVModule],
  ["sk-waterfall-chart", SwarajyaKitWaterfallChartModule],
];

export const staticAutoDemoMap: Record<string, DemoEntry> = Object.fromEntries(
  missingModules.flatMap(([compositionId, mod]) => {
    const entry = createEntry(mod);
    return entry ? [[compositionId, entry]] : [];
  }),
);
