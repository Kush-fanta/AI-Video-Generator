/**
 * swarajya-personas.tsx — Same fact, five different minds.
 * Fact: India has two aircraft carriers. Indigenous naval jet: not before 2032.
 *
 *   npx remotion still swarajya-personas.tsx <id> out/p-<id>.png
 */
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: PT } = loadPTSerif();
const { fontFamily: FR } = loadFraunces();

const BG = "#F2EDE7";
const CORAL = "#DC7070";
const INK = "#202020";
const W = 1920;
const H = 1080;

const BODY: React.CSSProperties = { fontFamily: PT, fontWeight: 400, fontSize: 40, color: INK, lineHeight: 1.35 };
const LABEL: React.CSSProperties = { ...BODY, letterSpacing: 6, textTransform: "uppercase" };

// A reusable byline block — shows each persona's signature.
const Byline: React.FC<{ name: string; role: string; kind: string }> = ({ name, role, kind }) => (
  <div style={{ position: "absolute", right: 120, bottom: 80, textAlign: "right" }}>
    <div style={{ ...BODY, fontSize: 32, color: INK, opacity: 0.8 }}>{name}</div>
    <div style={{ ...BODY, fontSize: 26, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>
      {role}
    </div>
    <div style={{ ...BODY, fontSize: 22, opacity: 0.4, fontStyle: "italic", marginTop: 10 }}>{kind}</div>
  </div>
);

// ─── 1. The Strategist ─── flinty, ops-room voice, hardware-first
const Strategist: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Threat ledger · carrier aviation
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 240, width: 1680, height: 1,
        background: INK, opacity: 0.15,
      }}
    />
    <div style={{ position: "absolute", left: 120, top: 320, ...BODY, fontSize: 52, lineHeight: 1.3, color: INK, maxWidth: 1500 }}>
      A carrier is a platform. Without an indigenous aircraft, it is a{" "}
      <span style={{ color: CORAL, fontWeight: 700 }}>logistics target</span>{" "}
      that happens to float.
    </div>
    <div style={{ position: "absolute", left: 120, top: 600, ...BODY, fontSize: 36, opacity: 0.7, maxWidth: 1500 }}>
      We will fight the next war with French engines and an import queue.
    </div>
    <Byline name="Cmdr. A. Rao (Retd.)" role="Naval Aviation" kind="the strategist" />
  </AbsoluteFill>
);

// ─── 2. The Historian ─── civilizational memory, longue durée
const Historian: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      Notebook · the long view
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 240, width: 1680, height: 1,
        background: INK, opacity: 0.15,
      }}
    />
    <div
      style={{
        position: "absolute", left: 200, right: 200, top: 340,
        fontFamily: PT, fontSize: 52, lineHeight: 1.45, color: INK, fontWeight: 400,
      }}
    >
      In 1612, Surat's shipwrights built hulls the English paid to buy.
      In 2026, Cochin's yards build carriers the French fit out with wings.
      The hull has always been ours.{" "}
      <span style={{ color: CORAL, fontFamily: FR, fontWeight: 700, fontStyle: "italic" }}>
        The engine, seldom.
      </span>
    </div>
    <Byline name="R. Kamath" role="Modern India, 1600 – 2026" kind="the historian" />
  </AbsoluteFill>
);

// ─── 3. The Economist ─── opportunity cost, ledger voice
const Economist: React.FC = () => {
  const Row = ({ top, left, label, val, accent }: { top: number; left: number; label: string; val: string; accent?: boolean }) => (
    <>
      <div style={{ position: "absolute", left, top, ...BODY, fontSize: 32, opacity: 0.6 }}>{label}</div>
      <div
        style={{
          position: "absolute", left, top: top + 40,
          fontFamily: PT, fontWeight: 700, fontSize: 72, lineHeight: 1,
          color: accent ? CORAL : INK,
        }}
      >
        {val}
      </div>
    </>
  );
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
        Opportunity cost · carrier aviation
      </div>
      <div
        style={{
          position: "absolute", left: 120, top: 240, width: 1680, height: 1,
          background: INK, opacity: 0.15,
        }}
      />
      <Row top={320} left={120}  label="Paid to France · 36 Rafale-M"        val="₹63,000 cr" accent />
      <Row top={320} left={780}  label="Tejas Mk2 programme · annual"         val="₹1,800 cr" />
      <Row top={320} left={1340} label="Ratio"                                val="35×"      accent />
      <div style={{ position: "absolute", left: 120, top: 620, ...BODY, fontSize: 36, opacity: 0.8, maxWidth: 1500 }}>
        We buy thirty-five years of indigenous capability each time we sign.
      </div>
      <Byline name="M. Subramanian" role="Fiscal policy" kind="the economist" />
    </AbsoluteFill>
  );
};

// ─── 4. The Moralist ─── dharma / sovereignty framing
const Moralist: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      On sovereignty · a thought
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 240, width: 1680, height: 1,
        background: INK, opacity: 0.15,
      }}
    />
    <div
      style={{
        position: "absolute", left: 200, right: 200, top: 360, textAlign: "center",
        fontFamily: FR, fontWeight: 400, fontStyle: "italic", fontSize: 64, lineHeight: 1.4, color: INK,
      }}
    >
      Shakti without shastra is
      <br />
      <span style={{ color: CORAL, fontWeight: 700 }}>a borrowed hand.</span>
    </div>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 720, textAlign: "center",
        ...BODY, fontSize: 32, opacity: 0.6,
      }}
    >
      Power, if it depends on another's technology, is not power.
    </div>
    <Byline name="V. Iyer" role="Civilizational writer" kind="the moralist" />
  </AbsoluteFill>
);

// ─── 5. The Skeptic ─── punctures the outrage, comparative frame
const Skeptic: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 120, top: 160, ...LABEL, opacity: 0.5 }}>
      A dissent · before we shout
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 240, width: 1680, height: 1,
        background: INK, opacity: 0.15,
      }}
    />
    <div
      style={{
        position: "absolute", left: 120, top: 320,
        fontFamily: FR, fontWeight: 700, fontSize: 72, lineHeight: 1.1, color: INK, maxWidth: 1600,
      }}
    >
      Every navy flies someone else's engine.
    </div>
    <div style={{ position: "absolute", left: 120, top: 500, ...BODY, fontSize: 36, opacity: 0.8, maxWidth: 1600 }}>
      The Queen Elizabeth flies American F-35Bs.
      The Charles de Gaulle's catapults were built in the United States.
      Carriers are platforms, not monasteries.
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 760,
        fontFamily: PT, fontWeight: 700, fontSize: 40, color: CORAL, maxWidth: 1600,
      }}
    >
      The question isn't whether we import. It's what we stop importing, and when.
    </div>
    <Byline name="P. Mehta" role="Columnist" kind="the skeptic" />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="Strategist" component={Strategist} width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Historian"  component={Historian}  width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Economist"  component={Economist}  width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Moralist"   component={Moralist}   width={W} height={H} fps={30} durationInFrames={60} />
    <Composition id="Skeptic"    component={Skeptic}    width={W} height={H} fps={30} durationInFrames={60} />
  </>
);

registerRoot(Root);
