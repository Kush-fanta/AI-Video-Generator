 "use client";

import { useEffect, useState } from "react";

export interface FeedbackSummaryEntry {
  open: number;
  fixed: number;
  total: number;
  updatedAt: string | null;
}

export type FeedbackSummaryMap = Record<string, FeedbackSummaryEntry>;

export function useFeedbackSummary() {
  const [summaries, setSummaries] = useState<FeedbackSummaryMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback/summary")
      .then((r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("json")) {
          throw new Error("not json");
        }
        return r.json();
      })
      .then((data: FeedbackSummaryMap) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch(() => {
        setSummaries({});
        setLoading(false);
      });
  }, []);

  return { summaries, loading };
}
