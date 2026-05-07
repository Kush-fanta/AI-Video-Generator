"use client";

import React, { Suspense } from "react";
import { Player } from "@remotion/player";
import { VoxDemo, VOX_DEMO_DURATION } from "../vox-demo";

export const VoxDemoPage: React.FC = () => (
  <div
    style={{
      width: "100vw",
      height: "100vh",
      background: "#0A0A0A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Suspense fallback={<div style={{ color: "#666" }}>Loading...</div>}>
      <Player
        component={VoxDemo}
        compositionWidth={1920}
        compositionHeight={1080}
        durationInFrames={360}
        fps={30}
        autoPlay
        loop
        controls
        style={{
          width: "90vw",
          maxWidth: 1280,
          aspectRatio: "16/9",
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </Suspense>
  </div>
);
