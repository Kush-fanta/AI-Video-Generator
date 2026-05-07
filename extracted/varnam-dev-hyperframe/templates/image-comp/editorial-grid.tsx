import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, kenBurns, lineGrow, FPS } from "../shared/primitives";
import type { ImageRef, BaseProps } from "../shared/types";

const { fontFamily: sans } = loadSans();

export interface EditorialGridProps extends BaseProps {
  images: Array<{ image: ImageRef; caption: string }>;
  categoryLabel?: string;
  at?: number;
}

/**
 * 2x2 editorial image grid. Each cell: framed image (440x280, rounded 12px),
 * caption below in 18px sans. 24px gaps. Staggered reveal — each cell appears
 * 12 frames apart for rhythmic entrance.
 */
export const EditorialGrid: React.FC<EditorialGridProps> = ({
  images,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  // Asymmetric grid: row 1 cells are taller (anchor row), row 2 cells are shorter
  const cellW = 440;
  const cellHTop = 310;
  const cellHBottom = 250;
  const gap = 24;

  // Only render up to 4 images
  const cells = images.slice(0, 4);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Category label above grid */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 80,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Terracotta accent line below label */}
      <div
        style={{
          position: "absolute",
          top: 78,
          left: 80,
          width: `${lineGrow(frame, at + 6, 22)}%`,
          maxWidth: 100,
          height: 3,
          backgroundColor: P.terracotta,
          borderRadius: 2,
        }}
      />

      {/* Grid container — centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 40,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${cellW}px ${cellW}px`,
            gridTemplateRows: "auto auto",
            gap,
            alignItems: "start",
          }}
        >
          {cells.map((cell, i) => {
            const stagger = at + 8 + i * 12;
            const f = Math.max(0, frame - stagger);
            const scale = kenBurns(f, FPS * 6);
            // Top row cells (0,1) taller; bottom row cells (2,3) shorter — asymmetric weight
            const cellH = i < 2 ? cellHTop : cellHBottom;

            return (
              <div key={i} style={reveal(frame, stagger)}>
                {/* Framed image */}
                <div
                  style={{
                    width: cellW,
                    height: cellH,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    backgroundColor: P.light,
                  }}
                >
                  <Img
                    src={staticFile(cell.image)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `scale(${scale})`,
                      opacity: 0.85,
                    }}
                  />
                </div>

                {/* Caption */}
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 20,
                    lineHeight: 1.4,
                    color: P.sub,
                    marginTop: 12,
                    maxWidth: cellW - 16,
                  }}
                >
                  {cell.caption}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  "compositionId": "imgcomp-editorial-grid",
  "props": {
    "images": [
      {
        "image": "demo.png",
        "caption": "AI Research"
      },
      {
        "image": "demo.png",
        "caption": "Cybersecurity"
      },
      {
        "image": "demo.png",
        "caption": "Platform Architecture"
      },
      {
        "image": "demo.png",
        "caption": "Product Engineering"
      }
    ],
    "categoryLabel": "CAPABILITIES",
    "at": 15
  },
  "durationInFrames": 150
};
