"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { PlayerRef } from "@remotion/player";
import type { FeedbackItem, FeedbackRect } from "../hooks/useFeedback";

interface FeedbackOverlayProps {
  playerRef: React.RefObject<PlayerRef | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (item: FeedbackItem) => void;
  fps: number;
  enabled: boolean;
}

function captureFrame(
  containerRef: React.RefObject<HTMLDivElement | null>,
): string | undefined {
  const container = containerRef.current;
  if (!container) return undefined;
  const source =
    container.querySelector("canvas") || container.querySelector("video");
  if (!source) return undefined;
  try {
    const tmp = document.createElement("canvas");
    tmp.width = 320;
    tmp.height = 180;
    const ctx = tmp.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(source as HTMLCanvasElement, 0, 0, 320, 180);
    return tmp.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

export default function FeedbackOverlay({
  playerRef,
  containerRef,
  onSubmit,
  fps,
  enabled,
}: FeedbackOverlayProps) {
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<FeedbackRect | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [note, setNote] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const clear = useCallback(() => {
    setDragging(false);
    setStart(null);
    setRect(null);
    setShowInput(false);
    setNote("");
  }, []);

  // Focus textarea when input appears
  useEffect(() => {
    if (showInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showInput]);

  // Escape to cancel
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        clear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, clear]);

  if (!enabled) return null;

  const toPercent = (
    clientX: number,
    clientY: number,
  ): { x: number; y: number } => {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    return {
      x: ((clientX - b.left) / b.width) * 100,
      y: ((clientY - b.top) / b.height) * 100,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (showInput) return;
    const pos = toPercent(e.clientX, e.clientY);
    setStart(pos);
    setDragging(true);
    setRect(null);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !start) return;
    const pos = toPercent(e.clientX, e.clientY);
    setRect({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    });
  };

  const onMouseUp = () => {
    if (!dragging || !rect) {
      setDragging(false);
      return;
    }
    setDragging(false);
    if (rect.w > 2 && rect.h > 2) {
      setShowInput(true);
    } else {
      setRect(null);
    }
  };

  const handleSubmit = () => {
    if (!note.trim() || !rect) return;
    const frame = playerRef.current?.getCurrentFrame() ?? 0;
    const time = `${(frame / fps).toFixed(1)}s`;
    const thumbnail = captureFrame(containerRef);
    const item: FeedbackItem = {
      id: crypto.randomUUID(),
      frame,
      time,
      rect,
      note: note.trim(),
      thumbnail,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    onSubmit(item);
    clear();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Position popover near the rect
  const popoverStyle: React.CSSProperties = rect
    ? {
        position: "absolute",
        left: `${Math.min(rect.x + rect.w + 1, 70)}%`,
        top: `${rect.y}%`,
        zIndex: 20,
      }
    : {};

  return (
    <div
      ref={overlayRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        inset: 0,
        cursor: showInput ? "default" : "crosshair",
        zIndex: 10,
      }}
    >
      {/* Selection rectangle */}
      {rect && (
        <div
          style={{
            position: "absolute",
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
            border: "2px solid #C17A48",
            backgroundColor: "rgba(193, 122, 72, 0.15)",
            pointerEvents: "none",
            borderRadius: 2,
          }}
        />
      )}

      {/* Note input popover */}
      {showInput && rect && (
        <div
          style={{
            ...popoverStyle,
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 12,
            width: 240,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add a note..."
            rows={3}
            style={{
              width: "100%",
              background: "#111",
              border: "1px solid #333",
              borderRadius: 4,
              color: "#eee",
              padding: 8,
              fontSize: 13,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span style={{ color: "#666", fontSize: 11 }}>
              Enter to submit · Esc to cancel
            </span>
            <button
              onClick={handleSubmit}
              style={{
                background: "#C17A48",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
