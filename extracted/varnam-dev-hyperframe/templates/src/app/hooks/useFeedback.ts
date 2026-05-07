 "use client";

import { useState, useEffect, useCallback } from "react";

export interface FeedbackRect {
  x: number;
  y: number;
  w: number;
  h: number; // all percentages 0-100
}

export interface FeedbackItem {
  id: string;
  frame: number;
  time: string; // e.g. "55.0s"
  rect: FeedbackRect;
  note: string;
  thumbnail?: string; // data URL (base64 PNG)
  status: "open" | "fixed";
  createdAt: string;
}

export function useFeedback(project: string) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/feedback?project=${encodeURIComponent(project)}`)
      .then((r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("json"))
          throw new Error("not json");
        return r.json();
      })
      .then((data: FeedbackItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [project]);

  const addItem = useCallback(
    async (item: FeedbackItem) => {
      if (!project) return;

      // Optimistic update
      setItems((prev) => [...prev, item]);

      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, item }),
      });
    },
    [project],
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      if (!project) return;

      let newStatus: "open" | "fixed" = "open";

      // Optimistic toggle
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            newStatus = item.status === "open" ? "fixed" : "open";
            return { ...item, status: newStatus };
          }
          return item;
        }),
      );

      await fetch("/api/feedback/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, id, status: newStatus }),
      });
    },
    [project],
  );

  return { items, loading, addItem, toggleStatus };
}
