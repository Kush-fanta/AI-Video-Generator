import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";

interface DemoEntry {
  component: React.FC;
  durationInFrames: number;
  inputProps?: Record<string, unknown>;
}

const NATIVE_PALETTE_COMPOSITIONS = new Set([
  "sk-area-chart",
  "sk-bar-chart-h",
  "sk-bar-chart-v",
]);

const getPreviewPaletteFilter = (
  compositionId: string,
  inputProps?: Record<string, unknown>,
): string | undefined => {
  if (!compositionId.startsWith("sk-")) return undefined;
  if (NATIVE_PALETTE_COMPOSITIONS.has(compositionId)) return undefined;

  const palette = inputProps?.palette;
  if (palette === "slate") {
    return "hue-rotate(12deg) saturate(1.08) brightness(1.03)";
  }
  if (palette === "forest") {
    return "hue-rotate(78deg) saturate(1.15) brightness(0.95)";
  }
  if (palette === "mono") {
    return "grayscale(1) contrast(1.05) brightness(0.98)";
  }
  return undefined;
};

let demoMapPromise: Promise<Record<string, DemoEntry>> | null = null;

const loadDemoMap = async () => {
  if (!demoMapPromise) {
    demoMapPromise = import("../demos").then((mod) => mod.demoMap);
  }

  return demoMapPromise;
};

interface TemplatePlayerProps {
  compositionId: string;
  inputProps?: Record<string, unknown>;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  style?: React.CSSProperties;
  acknowledgeRemotionLicense?: boolean;
  playOnlyWhenVisible?: boolean;
  visibilityThreshold?: number;
}

export const TemplatePlayer = forwardRef<PlayerRef, TemplatePlayerProps>(
  function TemplatePlayer(
    {
      compositionId,
      inputProps,
      width = 480,
      height = 270,
      autoPlay = true,
      loop = true,
      controls = true,
      style,
      acknowledgeRemotionLicense,
      playOnlyWhenVisible = true,
      visibilityThreshold = 0.45,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<PlayerRef | null>(null);
    const [entry, setEntry] = useState<DemoEntry | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing">(
      playOnlyWhenVisible ? "idle" : "loading",
    );
    const [isVisible, setIsVisible] = useState(!playOnlyWhenVisible);
    const [hasBeenVisible, setHasBeenVisible] = useState(!playOnlyWhenVisible);
    const shouldLoadEntry = !playOnlyWhenVisible || hasBeenVisible;

    const setPlayerRef = useCallback(
      (node: PlayerRef | null) => {
        playerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
          return;
        }
        if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      setHasBeenVisible(!playOnlyWhenVisible);
      setIsVisible(!playOnlyWhenVisible);
    }, [compositionId, playOnlyWhenVisible]);

    useEffect(() => {
      if (!shouldLoadEntry) {
        setEntry(null);
        setStatus("idle");
        return;
      }

      let cancelled = false;
      setStatus("loading");
      setEntry(null);

      void loadDemoMap()
        .then((demoMap) => {
          if (cancelled) return;
          const nextEntry = demoMap[compositionId] || null;
          setEntry(nextEntry);
          setStatus(nextEntry ? "ready" : "missing");
        })
        .catch(() => {
          if (cancelled) return;
          setEntry(null);
          setStatus("missing");
        });

      return () => {
        cancelled = true;
      };
    }, [compositionId, shouldLoadEntry]);

    useEffect(() => {
      if (!playOnlyWhenVisible) {
        setIsVisible(true);
        return;
      }

      const node = containerRef.current;
      if (!node || typeof IntersectionObserver === "undefined") {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          const next =
            first.isIntersecting && first.intersectionRatio >= visibilityThreshold;
          setIsVisible(next);
        },
        {
          threshold: [0, visibilityThreshold, 1],
          rootMargin: "120px 0px 120px 0px",
        },
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [playOnlyWhenVisible, visibilityThreshold]);

    useEffect(() => {
      if (isVisible) {
        setHasBeenVisible(true);
      }
    }, [isVisible]);

    const frameStyle: React.CSSProperties = useMemo(
      () => ({
        width,
        height,
        borderRadius: 8,
        overflow: "hidden",
        ...style,
      }),
      [height, style, width],
    );

    const showPlayer =
      status === "ready" && !!entry && (!playOnlyWhenVisible || isVisible);

    const resolvedInputProps = useMemo(() => {
      if (!entry?.inputProps && !inputProps) return undefined;
      return {
        ...(entry?.inputProps ?? {}),
        ...(inputProps ?? {}),
      };
    }, [entry?.inputProps, inputProps]);

    const playerInstanceKey = useMemo(
      () => `${compositionId}:${JSON.stringify(resolvedInputProps ?? {})}`,
      [compositionId, resolvedInputProps],
    );
    const previewPaletteFilter = useMemo(
      () => getPreviewPaletteFilter(compositionId, resolvedInputProps),
      [compositionId, resolvedInputProps],
    );

    useEffect(() => {
      const player = playerRef.current;
      if (!player || status !== "ready") return;

      if (!autoPlay || (playOnlyWhenVisible && !isVisible)) {
        player.pause();
        return;
      }

      player.play();
    }, [autoPlay, isVisible, playOnlyWhenVisible, status, playerInstanceKey]);

    const placeholderText =
      status === "loading"
        ? "Loading preview..."
        : status === "missing"
          ? `No demo: ${compositionId}`
          : null;

    return (
      <div ref={containerRef} style={frameStyle}>
        {showPlayer && entry ? (
          <Player
            key={playerInstanceKey}
            ref={setPlayerRef}
            component={entry.component}
            compositionWidth={1920}
            compositionHeight={1080}
            durationInFrames={entry.durationInFrames}
            fps={30}
            inputProps={resolvedInputProps}
            acknowledgeRemotionLicense={acknowledgeRemotionLicense}
            autoPlay={false}
            loop={loop}
            controls={controls}
            style={{
              width: "100%",
              height: "100%",
              filter: previewPaletteFilter,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: status === "idle" ? "#101010" : "#1a1a1a",
              border: status === "idle" ? "1px solid #1f1f1f" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: 13,
            }}
          >
            {placeholderText}
          </div>
        )}
      </div>
    );
  },
);
