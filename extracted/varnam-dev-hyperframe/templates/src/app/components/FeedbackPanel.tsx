"use client";

import React from "react";
import type { PlayerRef } from "@remotion/player";
import type { FeedbackItem } from "../hooks/useFeedback";

interface FeedbackPanelProps {
  items: FeedbackItem[];
  playerRef: React.RefObject<PlayerRef | null>;
  onToggleStatus: (id: string) => void;
  title?: string;
  emptyMessage?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  items,
  playerRef,
  onToggleStatus,
  title = "Feedback",
  emptyMessage,
  style,
}) => {
  const openCount = items.filter((i) => i.status === "open").length;
  const fixedCount = items.filter((i) => i.status === "fixed").length;

  const seekToFrame = (frame: number) => {
    playerRef.current?.seekTo(frame);
    playerRef.current?.pause();
  };

  return (
    <div
      style={{
        width: 320,
        height: "100%",
        background: "#0d0d0d",
        borderLeft: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              background: "#c2694a",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 9999,
            }}
          >
            {openCount} open
          </span>
          <span
            style={{
              background: "#166534",
              color: "#4ade80",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 9999,
            }}
          >
            {fixedCount} fixed
          </span>
        </div>
      </div>

      {/* Item list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {items.length === 0 ? (
          <div
            style={{
              color: "#666",
              fontSize: 12,
              padding: "32px 16px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {emptyMessage || (
              <>
                Press{" "}
                <kbd style={{ color: "#999", fontFamily: "monospace" }}>F</kbd>{" "}
                to enter feedback mode. Draw a rectangle on any frame.
              </>
            )}
          </div>
        ) : (
          items.map((item) => {
            const isFixed = item.status === "fixed";
            return (
              <div
                key={item.id}
                onClick={() => seekToFrame(item.frame)}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 16px",
                  cursor: "pointer",
                  opacity: isFixed ? 0.6 : 1,
                  borderLeft: `3px solid ${isFixed ? "#4ade80" : "transparent"}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "none";
                }}
              >
                {/* Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      style={{
                        width: 80,
                        height: 45,
                        borderRadius: 4,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 45,
                        borderRadius: 4,
                        background: "#1a1a1a",
                      }}
                    />
                  )}
                  <span
                    style={{
                      color: "#888",
                      fontSize: 10,
                      marginTop: 2,
                      display: "block",
                    }}
                  >
                    f{item.frame} &middot; {item.time}
                  </span>
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      color: "#ccc",
                      fontSize: 12,
                      lineHeight: 1.4,
                      textDecoration: isFixed ? "line-through" : "none",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.note}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(item.id);
                    }}
                    style={{
                      alignSelf: "flex-start",
                      background: "none",
                      border: `1px solid ${isFixed ? "#4ade80" : "#444"}`,
                      color: isFixed ? "#4ade80" : "#999",
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {isFixed ? "Reopen" : "Mark fixed"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
