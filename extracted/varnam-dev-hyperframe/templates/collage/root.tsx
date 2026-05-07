import React from "react";
import { Composition, staticFile } from "remotion";
import { BeamConnect } from "./beam-connect";
import { CrisisSkyline } from "./crisis-skyline";
import { PropagandaPoster } from "./propaganda-poster";

const TelevisionDrug = () => (
  <BeamConnect
    leftSubject={staticFile("demo-woman-chair.png")}
    rightSubject={staticFile("demo-old-tv.png")}
    headline="TELEVISION — DRUG OF THE NATION"
    beamColor="#E8A828"
    beamFrom="right"
  />
);

const ITSectorCrisis = () => (
  <CrisisSkyline
    buildings={[
      staticFile("demo-building-left.png"),
      staticFile("demo-building-center.png"),
      staticFile("demo-building-right.png"),
    ]}
    silhouette={staticFile("demo-silhouette.png")}
    label="IT SECTOR"
    trend="down"
    trendColor="#E83030"
  />
);

const PosterDemo = () => (
  <PropagandaPoster
    subject={staticFile("demo-woman-chair.png")}
    headline="THE SILENT MAJORITY"
    subheadline="Who watches the watchers"
    accentColor="#C23028"
    accentShape="circle"
    subjectPosition="center"
  />
);

const PosterDarkDemo = () => (
  <PropagandaPoster
    subject={staticFile("demo-silhouette.png")}
    headline="SYSTEM FAILURE"
    subheadline="When the code breaks the coder"
    accentColor="#E8A828"
    accentShape="stripe"
    subjectPosition="left"
    dark
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="collage-beam-connect" component={TelevisionDrug} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="collage-crisis-skyline" component={ITSectorCrisis} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="collage-poster" component={PosterDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="collage-poster-dark" component={PosterDarkDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
