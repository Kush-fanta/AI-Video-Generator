 "use client";

import { useState, useEffect, useCallback } from "react";
import type { Registry } from "../lib/registry-types";

export function useRegistry(initialRegistry: Registry | null = null) {
  const [registry, setRegistry] = useState<Registry | null>(initialRegistry);
  const [loading, setLoading] = useState(initialRegistry === null);

  useEffect(() => {
    const loadLocalRegistry = async () => {
      try {
        const response = await fetch("/api/registry");
        if (!response.ok || !response.headers.get("content-type")?.includes("json")) {
          throw new Error("not json");
        }
        const data = (await response.json()) as Registry;
        setRegistry(data);
      } catch {
        const mod = await import("../../../registry.json");
        setRegistry(mod.default as unknown as Registry);
      } finally {
        setLoading(false);
      }
    };

    if (initialRegistry) {
      setLoading(false);
      return;
    }

    void loadLocalRegistry();
  }, [initialRegistry]);

  const updateTemplate = useCallback(
    async (templateId: string, status: string, notes?: string) => {
      // Optimistic update
      setRegistry((prev) => {
        if (!prev) return prev;
        const next = { ...prev, templates: { ...prev.templates } };
        const t = next.templates[templateId];
        if (t) {
          next.templates[templateId] = {
            ...t,
            status,
            qc: {
              ...(t.qc || { status: "", notes: "", reviewedAt: "" }),
              status,
              notes: notes || t.qc?.notes || "",
              reviewedAt: new Date().toISOString(),
            },
          };
        }
        return next;
      });

      // registry.json is generated-only. QC state is local until promoted into
      // source metadata and regenerated with `pnpm template -- registry --write`.
    },
    [],
  );

  return { registry, loading, updateTemplate };
}
