# Feedback Tool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual feedback tool to the preview pages — draw rectangles on frames, type notes, persist as fix tasks the AI agent can read.

**Architecture:** Three components: (1) `FeedbackOverlay` canvas over `@remotion/player` for rectangle drawing + frame capture, (2) `FeedbackPanel` scrollable gallery alongside the player, (3) Vite middleware API for persistence to `feedback.json`. Follows existing patterns: `useRegistry` hook → `useFeedback` hook, `/api/update-template` → `/api/feedback`.

**Tech Stack:** React 18, TypeScript, @remotion/player (PlayerRef for frame seeking), Vite dev server middleware, canvas API for rectangle + screenshot.

---

## File Structure

| File | Responsibility |
|------|---------------|
| Create: `src/app/hooks/useFeedback.ts` | State hook — load/save feedback items via API, optimistic updates |
| Create: `src/app/components/FeedbackOverlay.tsx` | Canvas layer over Player — rectangle drawing, frame capture, note input |
| Create: `src/app/components/FeedbackPanel.tsx` | Scrollable vertical gallery of feedback items with thumbnails |
| Modify: `src/app/pages/FullDemo.tsx` | Wrap Player with FeedbackOverlay, add FeedbackPanel alongside |
| Modify: `src/app/pages/UpiDemoV2.tsx` | Same treatment as FullDemo |
| Modify: `vite.config.ts` | Add `/api/feedback` GET/POST routes |

---

## Chunk 1: Persistence Layer

### Task 1: Vite middleware — `/api/feedback` routes

**Files:**
- Modify: `vite.config.ts:8-54` (add feedbackApi plugin alongside registryApi)

- [ ] **Step 1: Add feedbackApi plugin to vite.config.ts**

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

function feedbackApi() {
  return {
    name: "feedback-api",
    configureServer(server: any) {
      // GET /api/feedback?project=<slug> — returns feedback array
      server.middlewares.use("/api/feedback", (req: any, res: any, next: any) => {
        const url = new URL(req.url, "http://localhost");

        if (req.method === "GET") {
          const project = url.searchParams.get("project") || "default";
          const feedbackPath = resolve(__dirname, `feedback/${project}.json`);
          if (!existsSync(feedbackPath)) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify([]));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(readFileSync(feedbackPath, "utf-8"));
          return;
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk: string) => (body += chunk));
          req.on("end", () => {
            try {
              const { project, item } = JSON.parse(body);
              const slug = project || "default";
              const dir = resolve(__dirname, "feedback");
              if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
              const feedbackPath = resolve(dir, `${slug}.json`);
              const items = existsSync(feedbackPath)
                ? JSON.parse(readFileSync(feedbackPath, "utf-8"))
                : [];
              items.push(item);
              writeFileSync(feedbackPath, JSON.stringify(items, null, 2));
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true, id: item.id }));
            } catch (e: any) {
              res.writeHead(500);
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        next();
      });

      // PATCH /api/feedback/status — update item status (open→fixed)
      server.middlewares.use("/api/feedback/status", (req: any, res: any, next: any) => {
        if (req.method !== "PATCH") return next();
        let body = "";
        req.on("data", (chunk: string) => (body += chunk));
        req.on("end", () => {
          try {
            const { project, id, status } = JSON.parse(body);
            const slug = project || "default";
            const feedbackPath = resolve(__dirname, `feedback/${slug}.json`);
            if (!existsSync(feedbackPath)) {
              res.writeHead(404);
              res.end(JSON.stringify({ error: "No feedback file" }));
              return;
            }
            const items = JSON.parse(readFileSync(feedbackPath, "utf-8"));
            const item = items.find((i: any) => i.id === id);
            if (!item) {
              res.writeHead(404);
              res.end(JSON.stringify({ error: "Item not found" }));
              return;
            }
            item.status = status;
            writeFileSync(feedbackPath, JSON.stringify(items, null, 2));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true }));
          } catch (e: any) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}
```

Register it in defineConfig:
```typescript
plugins: [react(), registryApi(), feedbackApi()],
```

- [ ] **Step 2: Verify by running dev server and testing with curl**

```bash
cd templates && pnpm dev &
sleep 2
# POST a test item
curl -s -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"project":"test","item":{"id":"f1","frame":100,"note":"test note","status":"open"}}' 
# GET it back
curl -s "http://localhost:3000/api/feedback?project=test"
# Clean up
rm -rf templates/feedback/test.json
```

Expected: POST returns `{"ok":true,"id":"f1"}`, GET returns array with the item.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat: add /api/feedback persistence routes"
```

---

### Task 2: useFeedback hook

**Files:**
- Create: `src/app/hooks/useFeedback.ts`

- [ ] **Step 1: Create the hook**

```typescript
import { useState, useEffect, useCallback } from "react";

export interface FeedbackRect {
  x: number;   // % of player width (0-100)
  y: number;   // % of player height (0-100)
  w: number;   // % width
  h: number;   // % height
}

export interface FeedbackItem {
  id: string;
  frame: number;
  time: string;         // e.g. "55.0s"
  rect: FeedbackRect;
  note: string;
  thumbnail?: string;   // data URL (base64 PNG)
  status: "open" | "fixed";
  createdAt: string;
}

export function useFeedback(project: string) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/feedback?project=${encodeURIComponent(project)}`)
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [project]);

  const addItem = useCallback(async (item: FeedbackItem) => {
    setItems((prev) => [...prev, item]);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, item }),
    });
  }, [project]);

  const toggleStatus = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "open" ? "fixed" : "open" } : i
      )
    );
    const item = items.find((i) => i.id === id);
    await fetch("/api/feedback/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project,
        id,
        status: item?.status === "open" ? "fixed" : "open",
      }),
    });
  }, [project, items]);

  return { items, loading, addItem, toggleStatus };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/hooks/useFeedback.ts
git commit -m "feat: add useFeedback hook for feedback state management"
```

---

## Chunk 2: UI Components

### Task 3: FeedbackOverlay — rectangle drawing + frame capture

**Files:**
- Create: `src/app/components/FeedbackOverlay.tsx`

- [ ] **Step 1: Create the overlay component**

This component wraps the Player and adds:
- A transparent canvas overlay for rectangle drawing
- A note input popover that appears on mouse-up
- Frame capture via the canvas under the Player

```tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import type { PlayerRef } from "@remotion/player";
import type { FeedbackItem, FeedbackRect } from "../hooks/useFeedback";

interface FeedbackOverlayProps {
  playerRef: React.RefObject<PlayerRef | null>;
  /** Container ref wrapping the <Player> — used for canvas screenshot */
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (item: FeedbackItem) => void;
  fps: number;
  enabled: boolean;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  playerRef,
  containerRef,
  onSubmit,
  fps,
  enabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<FeedbackRect | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Convert pixel coords to percentage of container
  const toPercent = useCallback(
    (px: number, py: number) => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const bounds = el.getBoundingClientRect();
      return {
        x: ((px - bounds.left) / bounds.width) * 100,
        y: ((py - bounds.top) / bounds.height) * 100,
      };
    },
    [containerRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      const p = toPercent(e.clientX, e.clientY);
      setStart(p);
      setDrawing(true);
      setShowInput(false);
      setRect(null);
    },
    [enabled, toPercent]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing || !start) return;
      const p = toPercent(e.clientX, e.clientY);
      setRect({
        x: Math.min(start.x, p.x),
        y: Math.min(start.y, p.y),
        w: Math.abs(p.x - start.x),
        h: Math.abs(p.y - start.y),
      });
    },
    [drawing, start, toPercent]
  );

  const captureFrame = useCallback((): string | undefined => {
    const container = containerRef.current;
    if (!container) return undefined;
    // Find the canvas or video element inside the player
    const source =
      container.querySelector("canvas") || container.querySelector("video");
    if (!source) return undefined;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(source as HTMLCanvasElement, 0, 0, 320, 180);
    return canvas.toDataURL("image/png", 0.7);
  }, [containerRef]);

  const handleMouseUp = useCallback(() => {
    if (!drawing || !rect || rect.w < 2 || rect.h < 2) {
      setDrawing(false);
      setRect(null);
      return;
    }
    setDrawing(false);
    setShowInput(true);
    setNote("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [drawing, rect]);

  const handleSubmit = useCallback(() => {
    if (!rect || !note.trim()) return;
    const frame = playerRef.current?.getCurrentFrame() ?? 0;
    const time = `${(frame / fps).toFixed(1)}s`;
    const thumbnail = captureFrame();
    const item: FeedbackItem = {
      id: `f${Date.now()}`,
      frame,
      time,
      rect,
      note: note.trim(),
      thumbnail,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    onSubmit(item);
    setRect(null);
    setShowInput(false);
    setNote("");
  }, [rect, note, playerRef, fps, captureFrame, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setShowInput(false);
        setRect(null);
      }
    },
    [handleSubmit]
  );

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        cursor: "crosshair",
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Rectangle visualization */}
      {rect && (
        <div
          style={{
            position: "absolute",
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
            border: "2px solid #C17A48",
            borderRadius: 4,
            backgroundColor: "rgba(193, 122, 72, 0.15)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Note input popover */}
      {showInput && rect && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(rect.x + rect.w, 75)}%`,
            top: `${rect.y}%`,
            zIndex: 20,
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 10,
              padding: 12,
              width: 260,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <textarea
              ref={inputRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's wrong here?"
              style={{
                width: "100%",
                minHeight: 72,
                background: "#111",
                border: "1px solid #333",
                borderRadius: 6,
                color: "#e0e0e0",
                padding: 8,
                fontSize: 13,
                resize: "vertical",
                outline: "none",
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
              <span style={{ fontSize: 11, color: "#555" }}>Enter to submit · Esc to cancel</span>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "#C17A48",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/FeedbackOverlay.tsx
git commit -m "feat: add FeedbackOverlay component — rectangle drawing + note input"
```

---

### Task 4: FeedbackPanel — scrollable gallery

**Files:**
- Create: `src/app/components/FeedbackPanel.tsx`

- [ ] **Step 1: Create the panel component**

```tsx
import React from "react";
import type { PlayerRef } from "@remotion/player";
import type { FeedbackItem } from "../hooks/useFeedback";

interface FeedbackPanelProps {
  items: FeedbackItem[];
  playerRef: React.RefObject<PlayerRef | null>;
  onToggleStatus: (id: string) => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  items,
  playerRef,
  onToggleStatus,
}) => {
  const openCount = items.filter((i) => i.status === "open").length;
  const fixedCount = items.filter((i) => i.status === "fixed").length;

  return (
    <div
      style={{
        width: 320,
        height: "100%",
        background: "#0d0d0d",
        borderLeft: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>
          Feedback
        </span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 10,
            background: openCount > 0 ? "#C17A4830" : "#4ade8030",
            color: openCount > 0 ? "#C17A48" : "#4ade80",
            fontWeight: 600,
          }}
        >
          {openCount} open
        </span>
        {fixedCount > 0 && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 10,
              background: "#4ade8020",
              color: "#4ade80",
              fontWeight: 600,
            }}
          >
            {fixedCount} fixed
          </span>
        )}
      </div>

      {/* Items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {items.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#444", fontSize: 13 }}>
            Press F to enter feedback mode.
            <br />
            Draw a rectangle on any frame.
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              playerRef.current?.seekTo(item.frame);
              playerRef.current?.pause();
            }}
            style={{
              background: "#111",
              borderRadius: 8,
              border: `1px solid ${item.status === "fixed" ? "#4ade8040" : "#222"}`,
              padding: 10,
              cursor: "pointer",
              opacity: item.status === "fixed" ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {/* Thumbnail + time */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  style={{
                    width: 80,
                    height: 45,
                    borderRadius: 4,
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid #222",
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    marginBottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>f{item.frame} · {item.time}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(item.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      color: item.status === "open" ? "#4ade80" : "#888",
                      padding: 0,
                    }}
                  >
                    {item.status === "open" ? "✓ Mark fixed" : "↩ Reopen"}
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#ccc",
                    lineHeight: 1.4,
                    textDecoration: item.status === "fixed" ? "line-through" : "none",
                  }}
                >
                  {item.note}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/components/FeedbackPanel.tsx
git commit -m "feat: add FeedbackPanel — scrollable gallery with thumbnails"
```

---

## Chunk 3: Integration

### Task 5: Wire into FullDemo page

**Files:**
- Modify: `src/app/pages/FullDemo.tsx` (full rewrite — small file)

- [ ] **Step 1: Rewrite FullDemo with feedback integration**

```tsx
import React, { Suspense, useRef, useState, useEffect } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { UpiDemo, UPI_DEMO_DURATION } from "../upi-demo";
import { FeedbackOverlay } from "../components/FeedbackOverlay";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { useFeedback } from "../hooks/useFeedback";

const FPS = 30;

export const FullDemo: React.FC = () => {
  const playerRef = useRef<PlayerRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const { items, addItem, toggleStatus } = useFeedback("upi-demo");

  // F key toggles feedback mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" && !(e.target instanceof HTMLTextAreaElement)) {
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
      }}
    >
      {/* Player area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Feedback mode indicator */}
        {feedbackMode && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 20,
              padding: "4px 12px",
              borderRadius: 6,
              background: "#C17A4830",
              color: "#C17A48",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            FEEDBACK MODE (F to exit)
          </div>
        )}

        <div
          ref={containerRef}
          style={{ position: "relative", width: "90%", maxWidth: 1280 }}
        >
          <Suspense fallback={<div style={{ color: "#666" }}>Loading...</div>}>
            <Player
              ref={playerRef}
              component={UpiDemo}
              compositionWidth={1920}
              compositionHeight={1080}
              durationInFrames={UPI_DEMO_DURATION}
              fps={FPS}
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
            fps={FPS}
            enabled={feedbackMode}
          />
        </div>
      </div>

      {/* Feedback panel — always visible */}
      <FeedbackPanel
        items={items}
        playerRef={playerRef}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
};
```

- [ ] **Step 2: Apply same pattern to UpiDemoV2.tsx**

Same structure but imports `UpiDemoV2` and `UPI_DEMO_V2_DURATION`, project slug `"upi-demo-v2"`.

- [ ] **Step 3: Verify — start dev server, navigate to /demo, press F, draw rectangle, type note, see it in gallery**

```bash
cd templates && pnpm dev
# Open http://localhost:3000/demo
# Press F → crosshair cursor
# Draw rectangle → note input appears
# Type note → Enter
# Gallery should show item with thumbnail
# Click item → player seeks to frame
```

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/FullDemo.tsx src/app/pages/UpiDemoV2.tsx
git commit -m "feat: integrate feedback tool into demo pages"
```

---

### Task 6: Add feedback.json to .gitignore

**Files:**
- Modify: `.gitignore` (or create if missing)

- [ ] **Step 1: Add feedback directory to gitignore**

```
feedback/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore feedback data"
```
