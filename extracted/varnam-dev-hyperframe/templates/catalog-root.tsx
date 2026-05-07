/**
 * Remotion catalog root — registers all templates for Studio + still renders.
 * Uses manualDemoMap from demos.tsx (avoids Vite-only import.meta.glob).
 */
import React from "react";
import { registerRoot, Composition } from "remotion";
import { demoMap } from "./catalog-demos";

const CatalogRoot: React.FC = () => (
  <>
    {Object.entries(demoMap).map(([id, entry]) => (
      <Composition
        key={id}
        id={id}
        component={entry.component as React.FC}
        defaultProps={entry.inputProps ?? {}}
        durationInFrames={entry.durationInFrames}
        fps={30}
        width={960}
        height={540}
      />
    ))}
  </>
);

registerRoot(CatalogRoot);
