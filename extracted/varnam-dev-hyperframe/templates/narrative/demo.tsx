import { Composition } from "remotion";
import {
  ProgressiveBuild,
  WeightContrast,
  StrikethroughReject,
  WordEscalation,
  EditorialQuote,
  StaccatoList,
  PivotReframe,
  WordCloud,
  HighlightAnnotation,
  SplitArgument,
} from "./index";

const castComponent = <T,>(
  component: React.FC<T>
): React.FC<Record<string, unknown>> =>
  component as unknown as React.FC<Record<string, unknown>>;

/**
 * NarrativeDemos — registers one Composition per narrative template.
 * 1920x1080, 30fps. Durations 150-240 frames so animations are fully visible.
 * Demo content drawn from the India GCC / global capability centre narrative.
 */
export const NarrativeDemos: React.FC = () => {
  return (
    <>
      {/* ── 1. ProgressiveBuild ─────────────────────────────────────── */}
      <Composition
        id="narr-progressive-build"
        component={castComponent(ProgressiveBuild)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
        defaultProps={{
          points: [
            "India graduates 1.5 million engineers a year.",
            "Most of that talent never left the back office.",
            "That changes when you give it ownership.",
            "Strategic depth.",
          ],
          at: 10,
        }}
      />

      {/* ── 2. WeightContrast ────────────────────────────────────────── */}
      <Composition
        id="narr-weight-contrast"
        component={castComponent(WeightContrast)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
        defaultProps={{
          primary: { value: "The Best.", label: "What India became" },
          secondary: { value: "The cheapest option in the room.", label: "What it used to be" },
          at: 10,
        }}
      />

      {/* ── 3. StrikethroughReject ───────────────────────────────────── */}
      <Composition
        id="narr-strikethrough-reject"
        component={castComponent(StrikethroughReject)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={200}
        defaultProps={{
          rejected: "Back Office",
          corrected: "Brain Centre",
          strikeAt: 30,
          at: 10,
        }}
      />

      {/* ── 4. WordEscalation ────────────────────────────────────────── */}
      <Composition
        id="narr-word-escalation"
        component={castComponent(WordEscalation)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
        defaultProps={{
          words: [
            { text: "Capability", at: 10, size: 48 },
            { text: "Confidence", at: 65, size: 84 },
            { text: "Strategic Relevance", at: 130 },
          ],
        }}
      />

      {/* ── 5. EditorialQuote ────────────────────────────────────────── */}
      <Composition
        id="narr-editorial-quote"
        component={castComponent(EditorialQuote)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
        defaultProps={{
          quote:
            "The question is no longer whether India can deliver quality at scale — it is whether global firms are ready to trust India with the work that actually matters.",
          attribution: "McKinsey Global Institute · 2024",
          at: 10,
        }}
      />

      {/* ── 6. StaccatoList ──────────────────────────────────────────── */}
      <Composition
        id="narr-staccato-list"
        component={castComponent(StaccatoList)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
        defaultProps={{
          items: [
            { text: "Product engineering", at: 10 },
            { text: "AI & machine learning", at: 55 },
            { text: "Cybersecurity", at: 100 },
            { text: "Financial modelling", at: 145 },
          ],
          layout: "stack",
          at: 0,
        }}
      />

      {/* ── 7. PivotReframe ──────────────────────────────────────────── */}
      <Composition
        id="narr-pivot-reframe"
        component={castComponent(PivotReframe)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={220}
        defaultProps={{
          before: "How much high-quality work can we get at the lowest possible cost?",
          after: "What critical work can India own?",
          at: 10,
        }}
      />

      {/* ── 8. WordCloud ─────────────────────────────────────────────── */}
      <Composition
        id="narr-word-cloud"
        component={castComponent(WordCloud)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={180}
        defaultProps={{
          heroWord: "Ownership",
          terms: [
            "Engineering",
            "Research",
            "Architecture",
            "Product",
            "Design",
            "Security",
            "Data",
            "Finance",
            "Operations",
            "Legal",
            "Platform",
            "Analytics",
          ],
          at: 0,
        }}
      />

      {/* ── 9. HighlightAnnotation ───────────────────────────────────── */}
      <Composition
        id="narr-highlight-annotation"
        component={castComponent(HighlightAnnotation)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={230}
        defaultProps={{
          text:
            "India's GCC workforce grew 11% year-on-year, reaching 1.9 million professionals — driven not by cost arbitrage but by a measurable rise in complex, high-judgement work.",
          highlights: [
            { word: "1.9 million professionals", at: 50 },
            { word: "complex, high-judgement work", at: 130 },
          ],
          at: 10,
        }}
      />

      {/* ── 10. SplitArgument ────────────────────────────────────────── */}
      <Composition
        id="narr-split-argument"
        component={castComponent(SplitArgument)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={220}
        defaultProps={{
          leftHeader: "The Old Model",
          leftPoints: [
            "Absorbed overflow work",
            "Repetitive, well-defined tasks",
            "Cost-sensitive arbitrage",
          ],
          rightHeader: "The New Reality",
          rightPoints: [
            "Sets the architecture",
            "Global R&D centres",
            "Strategic ownership",
          ],
          at: 10,
        }}
      />
    </>
  );
};
