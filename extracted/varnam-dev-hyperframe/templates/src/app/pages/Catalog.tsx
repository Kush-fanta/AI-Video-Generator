 "use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SKPaletteName } from "../../../swarajya-kit/_tokens";
import { useRegistry } from "../hooks/useRegistry";
import type { Registry, TemplateEntry } from "../lib/registry-types";

const LazyTemplatePlayer = dynamic(
  () => import("../components/TemplatePlayer").then((mod) => mod.TemplatePlayer),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: 13,
        }}
      >
        Loading preview...
      </div>
    ),
  },
);

const STATUS_COLORS: Record<string, string> = {
  approved: "#4ade80",
  "needs-polish": "#fbbf24",
  rejected: "#f87171",
  draft: "#94a3b8",
  "in-review": "#60a5fa",
};

const SWARAJYA_PALETTES: SKPaletteName[] = [
  "default",
  "slate",
  "forest",
  "mono",
];

const getGlobalPalettePreviewFilter = (
  palette: SKPaletteName | undefined,
): string | undefined => {
  if (palette === "slate") {
    return "sepia(0.28) hue-rotate(150deg) saturate(1.7) brightness(1.05)";
  }
  if (palette === "forest") {
    return "sepia(0.7) hue-rotate(65deg) saturate(2.1) brightness(0.95)";
  }
  if (palette === "mono") {
    return "grayscale(1) contrast(1.18) brightness(1.02)";
  }
  return undefined;
};

const getGlobalPaletteOverlay = (
  palette: SKPaletteName | undefined,
): string | undefined => {
  if (palette === "slate") return "rgba(92, 134, 194, 0.22)";
  if (palette === "forest") return "rgba(46, 126, 78, 0.28)";
  if (palette === "mono") return "rgba(125, 125, 125, 0.2)";
  return undefined;
};

interface TemplateCardProps {
  templateId: string;
  template: TemplateEntry;
  globalPalette?: SKPaletteName;
}

const TemplateCard = React.memo(function TemplateCard({
  templateId,
  template,
  globalPalette,
}: TemplateCardProps) {
  const clickPreviewExperiment = templateId.includes("chapter-marker");
  const [previewEnabled, setPreviewEnabled] = useState(!clickPreviewExperiment);
  const supportsPalette = template.category === "swarajya-kit";
  const globalPreviewFilter = supportsPalette
    ? getGlobalPalettePreviewFilter(globalPalette)
    : undefined;
  const globalPreviewOverlay = supportsPalette
    ? getGlobalPaletteOverlay(globalPalette)
    : undefined;

  return (
    <div
      style={{
        background: "#151515",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #222",
        contentVisibility: "auto",
        containIntrinsicSize: "420px",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "#0f0f0f",
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          filter: globalPreviewFilter,
          transition: "filter 220ms ease",
        }}
      >
        {previewEnabled ? (
          <LazyTemplatePlayer
            compositionId={template.compositionId}
            inputProps={
              supportsPalette ? { palette: globalPalette ?? "default" } : undefined
            }
            width={480}
            height={270}
            controls={false}
            autoPlay
            loop
            playOnlyWhenVisible
            acknowledgeRemotionLicense
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              borderRadius: 0,
            }}
          />
        ) : (
          <button
            onClick={() => setPreviewEnabled(true)}
            style={{
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #313131",
              background: "#171717",
              color: "#d6d6d6",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Click to preview (test)
          </button>
        )}
        {globalPreviewOverlay ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: globalPreviewOverlay,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#e0e0e0" }}>
            {template.exportName}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 10,
              background: `${STATUS_COLORS[template.status] || "#666"}20`,
              color: STATUS_COLORS[template.status] || "#666",
              fontWeight: 600,
            }}
          >
            {template.status}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            marginTop: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {template.category} / {templateId.split("/")[1]}
          </span>
          {template.createdAt && (
            <span style={{ color: "#555" }}>{template.createdAt.slice(0, 10)}</span>
          )}
        </div>
        {template.qc?.notes && (
          <div
            style={{
              fontSize: 12,
              color: "#999",
              marginTop: 8,
              padding: "6px 10px",
              background: "#1a1a1a",
              borderRadius: 6,
              borderLeft: `2px solid ${STATUS_COLORS[template.status] || "#666"}`,
            }}
          >
            {template.qc.notes}
          </div>
        )}
      </div>
    </div>
  );
},
function areTemplateCardsEqual(prev, next) {
  return (
    prev.templateId === next.templateId &&
    prev.template === next.template &&
    prev.globalPalette === next.globalPalette
  );
});

export const Catalog: React.FC<{
  initialRegistry: Registry | null;
  channelFilter?: string[];
  title?: string;
  subtitle?: string;
}> = ({ initialRegistry, channelFilter, title, subtitle }) => {
  const { registry, loading } = useRegistry(initialRegistry);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "newest" | "oldest">("name");
  const [globalPalette, setGlobalPalette] = useState<SKPaletteName>("default");
  const showGlobalPaletteControl = !!channelFilter?.includes("swarajya-kit");

  const categories = useMemo(() => {
    if (!registry) return [];
    return Object.entries(registry.categories)
      .filter(([name, c]) => c.status === "active" && (!channelFilter || channelFilter.includes(name)))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [registry?.categories, channelFilter]);

  const creationDates = useMemo(() => {
    if (!registry) return [];
    const dates = new Set<string>();
    for (const t of Object.values(registry.templates)) {
      if (t.createdAt) dates.add(t.createdAt.slice(0, 10));
    }
    return Array.from(dates).sort().reverse();
  }, [registry?.templates]);

  const templates = useMemo(() => {
    if (!registry) return [];
    return Object.entries(registry.templates)
      .filter(([, t]) => {
        if (channelFilter && !channelFilter.includes(t.category)) return false;
        if (activeCategory && t.category !== activeCategory) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (dateFilter && (!t.createdAt || !t.createdAt.startsWith(dateFilter))) return false;
        return true;
      })
      .sort(([a, ta], [b, tb]) => {
        if (sortBy === "newest") return (tb.createdAt || "").localeCompare(ta.createdAt || "");
        if (sortBy === "oldest") return (ta.createdAt || "").localeCompare(tb.createdAt || "");
        return a.localeCompare(b);
      });
  }, [registry?.templates, activeCategory, statusFilter, dateFilter, sortBy]);
  const deferredTemplates = useDeferredValue(templates);

  const statusCounts = useMemo(() => {
    if (!registry) return {};
    const counts: Record<string, number> = {};
    for (const t of Object.values(registry.templates)) {
      counts[t.status] = (counts[t.status] || 0) + 1;
    }
    return counts;
  }, [registry]);

  if (loading || !registry) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "#666" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>
          {title ?? "Template Catalog"}
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
          {subtitle ?? `${Object.keys(registry.templates).length} templates across ${categories.length} categories`}
        </p>
        {showGlobalPaletteControl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#a3a3a3" }}>
              Global palette
            </span>
            <select
              value={globalPalette}
              onChange={(event) =>
                setGlobalPalette(event.target.value as SKPaletteName)
              }
              style={{
                minWidth: 140,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #313131",
                background: "#111",
                color: "#e0e0e0",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {SWARAJYA_PALETTES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Category pills */}
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: !activeCategory ? "#C17A48" : "#333",
            background: !activeCategory ? "#C17A4820" : "transparent",
            color: !activeCategory ? "#C17A48" : "#888",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          All
        </button>
        {categories.map(([name]) => (
          <button
            key={name}
            onClick={() => setActiveCategory(activeCategory === name ? null : name)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: activeCategory === name ? "#C17A48" : "#333",
              background: activeCategory === name ? "#C17A4820" : "transparent",
              color: activeCategory === name ? "#C17A48" : "#888",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {name}
          </button>
        ))}

        <div style={{ width: 1, height: 28, background: "#333", margin: "0 8px" }} />

        {/* Status pills */}
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: statusFilter === status ? STATUS_COLORS[status] : "#333",
              background: statusFilter === status ? `${STATUS_COLORS[status]}20` : "transparent",
              color: statusFilter === status ? STATUS_COLORS[status] : "#666",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {status} ({count})
          </button>
        ))}

        <div style={{ width: 1, height: 28, background: "#333", margin: "0 8px" }} />

        {/* Date filter pills */}
        {creationDates.map((date) => (
          <button
            key={date}
            onClick={() => setDateFilter(dateFilter === date ? null : date)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: dateFilter === date ? "#60a5fa" : "#333",
              background: dateFilter === date ? "#60a5fa20" : "transparent",
              color: dateFilter === date ? "#60a5fa" : "#666",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {date}
          </button>
        ))}

        <div style={{ width: 1, height: 28, background: "#333", margin: "0 8px" }} />

        {/* Sort toggle */}
        {(["name", "newest", "oldest"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: sortBy === s ? "#a78bfa" : "#333",
              background: sortBy === s ? "#a78bfa20" : "transparent",
              color: sortBy === s ? "#a78bfa" : "#666",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {s === "name" ? "A-Z" : s === "newest" ? "Newest" : "Oldest"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        {deferredTemplates.map(([templateId, template]) => (
          <TemplateCard
            key={templateId}
            templateId={templateId}
            template={template}
            globalPalette={globalPalette}
          />
        ))}
      </div>

      {deferredTemplates.length === 0 && (
        <div style={{ textAlign: "center", color: "#666", padding: 60, fontSize: 16 }}>
          No templates match the current filters.
        </div>
      )}
    </div>
  );
};
