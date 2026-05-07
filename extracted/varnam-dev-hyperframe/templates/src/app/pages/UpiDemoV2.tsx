"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { UpiDemoV2, UPI_DEMO_V2_DURATION } from "../upi-demo-v2";
import { useFeedback } from "../hooks/useFeedback";
import FeedbackOverlay from "../components/FeedbackOverlay";
import { FeedbackPanel } from "../components/FeedbackPanel";

export const UpiDemoV2Page: React.FC = () => {
  const playerRef = useRef<PlayerRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { items, addItem, toggleStatus } = useFeedback("upi-demo-v2");
  const [feedbackMode, setFeedbackMode] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") {
        setFeedbackMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(100vh - 57px)",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Player area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          ref={containerRef}
          style={{ position: "relative", maxWidth: 1280, width: "90%" }}
        >
          {/* Pen button — always visible, bottom-right over player */}
          <button
            onClick={() => setFeedbackMode((p) => !p)}
            style={{
              position: "absolute",
              bottom: 52,
              right: 12,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: feedbackMode ? "5px 12px" : "5px 8px",
              borderRadius: 6,
              border: "none",
              background: feedbackMode ? "#C17A48" : "rgba(0,0,0,0.65)",
              color: feedbackMode ? "#fff" : "#aaa",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              backdropFilter: "blur(8px)",
              transition: "all 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {feedbackMode ? "Done" : ""}
          </button>
          <Suspense
            fallback={<div style={{ color: "#666" }}>Loading...</div>}
          >
            <Player
              ref={playerRef}
              component={UpiDemoV2}
              compositionWidth={1920}
              compositionHeight={1080}
              durationInFrames={UPI_DEMO_V2_DURATION}
              fps={30}
              autoPlay
              controls
              style={{
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            />
          </Suspense>
          <FeedbackOverlay
            playerRef={playerRef}
            containerRef={containerRef}
            onSubmit={addItem}
            fps={30}
            enabled={feedbackMode}
          />
        </div>

        {/* Floating feedback button — bottom-right of player */}
      </div>

      {/* Feedback panel */}
      <FeedbackPanel
        items={items}
        playerRef={playerRef}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
};
