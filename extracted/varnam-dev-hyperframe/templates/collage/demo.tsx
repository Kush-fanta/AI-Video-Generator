import React from "react";
import { Composition } from "remotion";
import { CollageScene } from "./collage-scene";
import { PaperBg } from "./paper-bg";
import { HalftoneBeam } from "./halftone-beam";
import { CutoutFigure } from "./cutout-figure";
import { BoldStatement } from "./bold-statement";

// --- Demo: "Television — Drug of the Nation" recreation ----------------------

const TelevisionDrugDemo = () => (
  <CollageScene
    paperColor="#F2EDE4"
    grain={0.07}
    elements={[
      // Yellow halftone beam from TV to woman's head
      {
        type: "beam",
        from: { x: 72, y: 48 },
        to: { x: 28, y: 38 },
        beamColor: "#E8A828",
        narrowWidth: 80,
        wideWidth: 320,
        at: 6,
        zIndex: 1,
      },
      // Woman in chair — left side
      {
        type: "cutout",
        src: "demo-woman-chair.png",
        x: 28,
        y: 82,
        maxHeight: 650,
        anchor: "bottom-center",
        entrance: "stamp",
        at: 0,
        zIndex: 2,
      },
      // Old TV on stand — right side
      {
        type: "cutout",
        src: "demo-old-tv.png",
        x: 74,
        y: 82,
        maxHeight: 420,
        anchor: "bottom-center",
        entrance: "slide-left",
        at: 4,
        zIndex: 2,
      },
      // Bold statement — angled on the beam
      {
        type: "text",
        text: "TELEVISION — DRUG OF THE NATION",
        fontSize: 36,
        rotation: -8,
        x: 48,
        y: 32,
        at: 14,
        zIndex: 5,
      },
    ]}
  />
);

// --- Demo: Individual components ---------------------------------------------

const PaperBgDemo = () => (
  <PaperBg color="#F2EDE4" grain={0.08} vignette={0.2} aging={0.06}>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "serif",
        fontSize: 120,
        color: "#2A2622",
        opacity: 0.15,
      }}
    >
      PAPER
    </div>
  </PaperBg>
);

const HalftoneBeamDemo = () => (
  <PaperBg color="#F2EDE4">
    <HalftoneBeam
      from={{ x: 15, y: 50 }}
      to={{ x: 85, y: 50 }}
      color="#E8A828"
      narrowWidth={40}
      wideWidth={300}
      at={10}
    />
  </PaperBg>
);

const CutoutFigureDemo = () => (
  <PaperBg color="#F2EDE4">
    <CutoutFigure
      src="demo-woman-chair.png"
      x={50}
      y={85}
      maxHeight={700}
      anchor="bottom-center"
      entrance="stamp"
      at={10}
    />
  </PaperBg>
);

const BoldStatementDemo = () => (
  <PaperBg color="#F2EDE4">
    <BoldStatement
      text="DRUG OF THE NATION"
      fontSize={72}
      rotation={-5}
      x={50}
      y={45}
      at={10}
    />
    <BoldStatement
      text="A SMALLER LINE"
      fontSize={36}
      rotation={-5}
      x={50}
      y={58}
      at={18}
      bandColor="#E8A828"
      bandPadding={8}
    />
  </PaperBg>
);

// --- Compositions ------------------------------------------------------------

export const CollageDemos: React.FC = () => (
  <>
    <Composition
      id="collage-television-drug"
      component={TelevisionDrugDemo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="collage-paper-bg"
      component={PaperBgDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="collage-halftone-beam"
      component={HalftoneBeamDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="collage-cutout-figure"
      component={CutoutFigureDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="collage-bold-statement"
      component={BoldStatementDemo}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
