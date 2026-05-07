import { registerRoot, Composition } from "remotion";
import { SP } from "./shared/swarajya-palette";
import { StatComparisonHero } from "./hero/stat-comparison-hero";
import { ThesisBold } from "./narrative/thesis-bold";
import { VerdictStamp } from "./narrative/verdict-stamp";
import { RedactionReveal } from "./narrative/redaction-reveal";
import { ClassifiedBlock } from "./editorial/classified-block";
import { EvidenceDossier } from "./editorial/evidence-dossier";
import { VersusSplit } from "./comparison/versus-split";
import { TugOfWar } from "./comparison/tug-of-war";
import { ThreatLevel } from "./meter/threat-level";
import { VaultDoor } from "./reveal/vault-door";

const castComponent = <T,>(
  component: React.FC<T>
): React.FC<Record<string, unknown>> =>
  component as unknown as React.FC<Record<string, unknown>>;

const Root: React.FC = () => (
  <>
    {/* Hero */}
    <Composition
      id="hero-stat-comparison-hero"
      component={castComponent(StatComparisonHero)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        valueA: "$46B",
        valueB: "$100B",
        labelA: "2019",
        labelB: "2024",
        winner: "b",
        source: "NASSCOM",
        categoryLabel: "GCC REVENUE",
        at: 15,
        palette: SP,
      }}
    />

    {/* Narrative */}
    <Composition
      id="narr-thesis-bold"
      component={castComponent(ThesisBold)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        thesis: "The GCC model made outsourcing obsolete.",
        support: "When you can own the talent, why rent it?",
        at: 15,
        palette: SP,
      }}
    />

    <Composition
      id="narr-verdict-stamp"
      component={castComponent(VerdictStamp)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        text: "CONFIRMED",
        context: "India crosses $100B in GCC revenue",
        at: 15,
        palette: SP,
      }}
    />

    <Composition
      id="narr-redaction-reveal"
      component={castComponent(RedactionReveal)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        words: [
          { text: "India", redacted: false },
          { text: "is the", redacted: false },
          { text: "brain centre", redacted: true },
          { text: "of global tech", redacted: false },
        ],
        at: 15,
        palette: SP,
      }}
    />

    {/* Editorial */}
    <Composition
      id="edit-classified-block"
      component={castComponent(ClassifiedBlock)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        items: [
          { title: "AI Research Lead", body: "Bangalore. $200K+." },
          { title: "Product Director", body: "Hyderabad. Global P&L." },
          { title: "Staff Engineer", body: "Pune. Platform arch." },
        ],
        highlightIndex: 0,
        at: 15,
        palette: SP,
      }}
    />

    <Composition
      id="edit-evidence-dossier"
      component={castComponent(EvidenceDossier)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        title: "GCC Evidence",
        findings: [
          { date: "2019", text: "Revenue crosses $30B", source: "NASSCOM" },
          {
            date: "2024",
            text: "Revenue hits $100B",
            source: "Economic Survey",
          },
        ],
        at: 15,
        palette: SP,
      }}
    />

    {/* Comparison */}
    <Composition
      id="comp-versus-split"
      component={castComponent(VersusSplit)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        sideA: { value: "$100B", label: "India GCC Revenue" },
        sideB: { value: "$46B", label: "2019 Revenue" },
        categoryLabel: "THEN VS NOW",
        at: 15,
        palette: SP,
      }}
    />

    <Composition
      id="comp-tug-of-war"
      component={castComponent(TugOfWar)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        leftForce: { label: "Legacy IT", value: 35 },
        rightForce: { label: "GCC Innovation", value: 72 },
        at: 15,
        palette: SP,
      }}
    />

    {/* Meter */}
    <Composition
      id="meter-threat-level"
      component={castComponent(ThreatLevel)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        level: 4,
        label: "Talent Shortage Severity",
        description: "Critical shortage in specialized AI/ML roles",
        at: 15,
        palette: SP,
      }}
    />

    {/* Reveal */}
    <Composition
      id="reveal-vault-door"
      component={castComponent(VaultDoor)}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        content: "67%",
        label: "Fortune 30 penetration",
        openAt: 35,
        at: 15,
        palette: SP,
      }}
    />
  </>
);

registerRoot(Root);
