 "use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlayerRef } from "@remotion/player";
import { useRegistry } from "../hooks/useRegistry";
import { useFeedback } from "../hooks/useFeedback";
import { useFeedbackSummary } from "../hooks/useFeedbackSummary";
import FeedbackOverlay from "../components/FeedbackOverlay";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { TemplatePlayer } from "../components/TemplatePlayer";
import type { Registry } from "../lib/registry-types";

const STATUS_COLORS: Record<string, string> = {
  approved: "#4ade80",
  "needs-polish": "#fbbf24",
  rejected: "#f87171",
  draft: "#94a3b8",
  "in-review": "#60a5fa",
};

const FILTERS = [
  "all",
  "needs-review",
  "approved",
  "needs-polish",
  "rejected",
] as const;

type FilterValue = (typeof FILTERS)[number];

const formatDate = (value?: string | null) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatDuration = (frames: number) => `${(frames / 30).toFixed(1)}s`;

const feedbackProjectKey = (templateId: string) =>
  `template-${templateId.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;

const issueSummaryText = (open: number, fixed: number) => {
  if (!open && !fixed) return "No frame issues";
  if (!open) return `${fixed} fixed`;
  if (!fixed) return `${open} open`;
  return `${open} open · ${fixed} fixed`;
};

export const QCReview: React.FC<{ initialRegistry: Registry | null }> = ({
  initialRegistry,
}) => {
  const { registry, loading, updateTemplate } = useRegistry(initialRegistry);
  const { summaries } = useFeedbackSummary();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("needs-review");
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const templateList = useMemo(() => {
    if (!registry) return [];

    return Object.entries(registry.templates)
      .filter(([, template]) => {
        if (filter === "all") return true;
        if (filter === "needs-review") {
          return template.status === "draft" || template.status === "in-review";
        }
        return template.status === filter;
      })
      .sort(([aId, aTemplate], [bId, bTemplate]) => {
        const aSummary = summaries[feedbackProjectKey(aId)];
        const bSummary = summaries[feedbackProjectKey(bId)];
        const reviewRank = (status: string) =>
          ({
            draft: 0,
            "needs-polish": 1,
            "in-review": 2,
            rejected: 3,
            approved: 4,
          })[status] ?? 5;

        const statusDiff = reviewRank(aTemplate.status) - reviewRank(bTemplate.status);
        if (statusDiff !== 0) return statusDiff;

        const issueDiff = (bSummary?.open || 0) - (aSummary?.open || 0);
        if (issueDiff !== 0) return issueDiff;

        return aId.localeCompare(bId);
      });
  }, [filter, registry, summaries]);

  useEffect(() => {
    if (currentIndex > templateList.length - 1) {
      setCurrentIndex(Math.max(0, templateList.length - 1));
    }
  }, [currentIndex, templateList.length]);

  const current = templateList[currentIndex];
  const [templateId, template] = current || ["", null];
  const currentProject = templateId ? feedbackProjectKey(templateId) : "";
  const { items, addItem, toggleStatus } = useFeedback(currentProject);

  const currentSummary = summaries[currentProject] || {
    open: items.filter((item) => item.status === "open").length,
    fixed: items.filter((item) => item.status === "fixed").length,
    total: items.length,
    updatedAt: items[items.length - 1]?.createdAt || null,
  };

  useEffect(() => {
    setDraftNotes(template?.qc?.notes || "");
    setActionError(null);
    setFeedbackMode(false);
  }, [templateId, template?.qc?.notes]);

  const statusCounts = useMemo(() => {
    if (!registry) return { all: 0, "needs-review": 0 };
    const counts: Record<string, number> = { all: 0, "needs-review": 0 };

    for (const entry of Object.values(registry.templates)) {
      counts.all += 1;
      counts[entry.status] = (counts[entry.status] || 0) + 1;
      if (entry.status === "draft" || entry.status === "in-review") {
        counts["needs-review"] += 1;
      }
    }

    return counts;
  }, [registry]);

  const reviewStats = useMemo(() => {
    if (!registry) {
      return { total: 0, approved: 0, blocked: 0, reviewed: 0 };
    }

    let approved = 0;
    let blocked = 0;
    let reviewed = 0;

    for (const [id, entry] of Object.entries(registry.templates)) {
      if (entry.status === "approved") approved += 1;
      if ((summaries[feedbackProjectKey(id)]?.open || 0) > 0) blocked += 1;
      if (entry.qc?.reviewedAt) reviewed += 1;
    }

    return {
      total: Object.keys(registry.templates).length,
      approved,
      blocked,
      reviewed,
    };
  }, [registry, summaries]);

  const triggerFlash = (color: string) => {
    setFlash(color);
    window.setTimeout(() => setFlash(null), 260);
  };

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, templateList.length - 1));
  }, [templateList.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const commitStatus = useCallback(
    async (status: string, color: string) => {
      if (!templateId) return;
      if (status === "approved" && currentSummary.open > 0) {
        setActionError("Resolve or promote open frame issues before approving.");
        return;
      }

      setActionError(null);
      await updateTemplate(templateId, status, draftNotes.trim());
      triggerFlash(color);
      if (status === "approved" || status === "rejected") {
        window.setTimeout(goNext, 140);
      }
    },
    [currentSummary.open, draftNotes, goNext, templateId, updateTemplate],
  );

  const promoteOpenIssues = useCallback(() => {
    const openItems = items.filter((item) => item.status === "open");
    if (!openItems.length) {
      setActionError("No open frame issues to promote.");
      return;
    }

    const promoted = openItems
      .map((item) => `- ${item.time} (f${item.frame}): ${item.note}`)
      .join("\n");

    setDraftNotes((prev) => {
      const trimmed = prev.trim();
      const prefix = trimmed ? `${trimmed}\n\n` : "";
      return `${prefix}Frame issues:\n${promoted}`;
    });
    setActionError(null);
  }, [items]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextEntry =
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "INPUT" ||
        target?.isContentEditable;

      if (isTextEntry) return;

      if (event.key === "ArrowRight") {
        void commitStatus("approved", "#4ade80");
      } else if (event.key === "ArrowLeft") {
        void commitStatus("rejected", "#f87171");
      } else if (event.key === "ArrowUp") {
        void commitStatus("needs-polish", "#fbbf24");
      } else if (event.key === "ArrowDown") {
        goNext();
      } else if (event.key === "Backspace" || event.key === "b" || event.key === "B") {
        goPrev();
      } else if (event.key === "f" || event.key === "F") {
        setFeedbackMode((value) => !value);
      } else if (event.key === "i" || event.key === "I") {
        void commitStatus("in-review", "#60a5fa");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commitStatus, goNext, goPrev]);

  if (loading || !registry) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!template) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "#777",
          fontSize: 18,
        }}
      >
        {templateList.length === 0
          ? "No templates match this filter."
          : "Review queue complete."}
      </div>
    );
  }

  const progress = reviewStats.total
    ? Math.round((reviewStats.reviewed / reviewStats.total) * 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 57px)",
        background: "#080808",
        color: "#f3f3f3",
        display: "grid",
        gridTemplateColumns: "320px minmax(0, 1fr) 360px",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #1a1a1a",
          background: "#0c0c0c",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 57px)",
        }}
      >
        <div style={{ padding: 20, borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 12, color: "#8f8f8f", textTransform: "uppercase" }}>
            QC Desk
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {reviewStats.reviewed}/{reviewStats.total}
          </div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
            {reviewStats.approved} approved · {reviewStats.blocked} blocked by open issues
          </div>
          <div
            style={{
              marginTop: 16,
              height: 6,
              background: "#171717",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #C17A48 0%, #e7b06f 100%)",
              }}
            />
          </div>
        </div>

        <div style={{ padding: "16px 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((value) => (
            <button
              key={value}
              onClick={() => {
                setFilter(value);
                setCurrentIndex(0);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${filter === value ? "#C17A48" : "#262626"}`,
                background: filter === value ? "#22160f" : "#101010",
                color: filter === value ? "#f2c28e" : "#7b7b7b",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {value} ({statusCounts[value] || 0})
            </button>
          ))}
        </div>

        <div style={{ overflowY: "auto", paddingBottom: 16 }}>
          {templateList.map(([id, entry], index) => {
            const summary = summaries[feedbackProjectKey(id)] || {
              open: 0,
              fixed: 0,
              total: 0,
              updatedAt: null,
            };
            const active = index === currentIndex;

            return (
              <button
                key={id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: active ? "#141414" : "transparent",
                  borderLeft: `3px solid ${active ? "#C17A48" : "transparent"}`,
                  padding: "14px 16px 14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: STATUS_COLORS[entry.status] || "#666",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: active ? "#fff" : "#d0d0d0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.exportName}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#7c7c7c" }}>
                  {entry.category} · {entry.status}
                </div>
                <div style={{ fontSize: 12, color: summary.open ? "#fbbf24" : "#666" }}>
                  {issueSummaryText(summary.open, summary.fixed)}
                </div>
                <div style={{ fontSize: 11, color: "#575757" }}>
                  {entry.qc?.reviewedAt
                    ? `Reviewed ${formatDate(entry.qc.reviewedAt)}`
                    : "Awaiting first pass"}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <main
        style={{
          minWidth: 0,
          borderRight: "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#7d7d7d" }}>
              {currentIndex + 1} of {templateList.length} in {filter}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>
              {template.exportName}
            </div>
          </div>

          <span
            style={{
              marginLeft: 8,
              padding: "5px 10px",
              borderRadius: 999,
              background: `${STATUS_COLORS[template.status] || "#666"}20`,
              color: STATUS_COLORS[template.status] || "#666",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {template.status}
          </span>

          <span style={{ fontSize: 13, color: "#7c7c7c" }}>
            {template.category} · {formatDuration(template.durationFrames)} · {template.file}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={goPrev} style={ghostButtonStyle}>
              Back
            </button>
            <button onClick={goNext} style={ghostButtonStyle}>
              Skip
            </button>
            <button
              onClick={() => setFeedbackMode((value) => !value)}
              style={{
                ...ghostButtonStyle,
                borderColor: feedbackMode ? "#C17A48" : "#2a2a2a",
                color: feedbackMode ? "#f2c28e" : "#bcbcbc",
                background: feedbackMode ? "#22160f" : "#101010",
              }}
            >
              {feedbackMode ? "Exit frame notes" : "Frame notes"}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 24,
            gap: 18,
            position: "relative",
          }}
        >
          {flash && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: flash,
                opacity: 0.12,
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard label="Status" value={template.status} tone={STATUS_COLORS[template.status] || "#888"} />
            <MetricCard label="Frame Issues" value={`${currentSummary.open}`} subvalue={issueSummaryText(currentSummary.open, currentSummary.fixed)} />
            <MetricCard label="Created" value={formatDate(template.createdAt)} />
            <MetricCard label="Last Review" value={formatDate(template.qc?.reviewedAt)} />
          </div>

          <div
            ref={containerRef}
            style={{
              position: "relative",
              flex: 1,
              minHeight: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#050505",
              border: "1px solid #1a1a1a",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {template.compositionId ? (
              <>
                <TemplatePlayer
                  ref={playerRef}
                  compositionId={template.compositionId}
                  acknowledgeRemotionLicense
                  autoPlay
                  loop
                  controls
                  style={{
                    width: "100%",
                    maxWidth: 1180,
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                />
                <FeedbackOverlay
                  playerRef={playerRef}
                  containerRef={containerRef}
                  onSubmit={addItem}
                  fps={30}
                  enabled={feedbackMode}
                />
              </>
            ) : (
              <div style={{ color: "#777", fontSize: 14 }}>
                No live demo registered for {template.compositionId}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              color: "#767676",
              fontSize: 12,
            }}
          >
            <span>Keyboard: ← reject · ↑ polish · → approve · ↓ skip · B back · F frame notes · I in review</span>
            {actionError && <span style={{ color: "#f5b041" }}>{actionError}</span>}
          </div>
        </div>
      </main>

      <aside
        style={{
          background: "#0b0b0b",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 57px)",
        }}
      >
        <div style={{ padding: 20, borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 12, color: "#7e7e7e", textTransform: "uppercase" }}>
            Verdict
          </div>
          <textarea
            name="verdict-notes"
            value={draftNotes}
            onChange={(event) => setDraftNotes(event.target.value)}
            placeholder="Write the review note that should survive after the frame notes are gone."
            style={{
              width: "100%",
              minHeight: 150,
              marginTop: 12,
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              color: "#f2f2f2",
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button onClick={promoteOpenIssues} style={ghostButtonStyle}>
              Promote open issues to notes
            </button>
            <button
              onClick={() => void commitStatus("in-review", "#60a5fa")}
              style={{ ...decisionButtonStyle, background: "#0f1a24", color: "#7fc8ff", borderColor: "#17344c" }}
            >
              Mark in review
            </button>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            <button
              onClick={() => void commitStatus("approved", "#4ade80")}
              disabled={currentSummary.open > 0}
              style={{
                ...decisionButtonStyle,
                background: currentSummary.open > 0 ? "#122015" : "#102514",
                color: currentSummary.open > 0 ? "#5b7d65" : "#75e09e",
                borderColor: currentSummary.open > 0 ? "#1f3224" : "#1e4b2a",
                cursor: currentSummary.open > 0 ? "not-allowed" : "pointer",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => void commitStatus("needs-polish", "#fbbf24")}
              style={{ ...decisionButtonStyle, background: "#231a09", color: "#f4c56a", borderColor: "#3f2d11" }}
            >
              Needs polish
            </button>
            <button
              onClick={() => void commitStatus("rejected", "#f87171")}
              style={{ ...decisionButtonStyle, background: "#251111", color: "#ff9b9b", borderColor: "#442121" }}
            >
              Reject
            </button>
          </div>
        </div>

        <div style={{ padding: 20, borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 12, color: "#7e7e7e", textTransform: "uppercase" }}>
            Review context
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <InspectorStat label="Template ID" value={templateId} />
            <InspectorStat label="Version" value={`v${template.version}`} />
            <InspectorStat label="Composition" value={template.compositionId} />
            <InspectorStat label="Project key" value={currentProject} />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <FeedbackPanel
            items={items}
            playerRef={playerRef}
            onToggleStatus={toggleStatus}
            title="Frame Issues"
            emptyMessage={
              <>
                Use <kbd style={{ color: "#999", fontFamily: "monospace" }}>F</kbd>{" "}
                to mark exact frames and regions that still need work.
              </>
            }
            style={{
              width: "100%",
              borderLeft: "none",
              borderTop: "1px solid #1a1a1a",
            }}
          />
        </div>
      </aside>
    </div>
  );
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #2a2a2a",
  background: "#101010",
  color: "#c8c8c8",
  cursor: "pointer",
  fontSize: 12,
};

const decisionButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid transparent",
  fontSize: 13,
  fontWeight: 700,
  textAlign: "left",
};

const cardBase: React.CSSProperties = {
  padding: 14,
  borderRadius: 8,
  border: "1px solid #1a1a1a",
  background: "#101010",
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  subvalue?: string;
  tone?: string;
}> = ({ label, value, subvalue, tone }) => (
  <div style={cardBase}>
    <div style={{ fontSize: 11, color: "#727272", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, color: tone || "#f2f2f2" }}>
      {value}
    </div>
    {subvalue && <div style={{ fontSize: 12, color: "#7c7c7c", marginTop: 4 }}>{subvalue}</div>}
  </div>
);

const InspectorStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={cardBase}>
    <div style={{ fontSize: 11, color: "#727272", textTransform: "uppercase" }}>{label}</div>
    <div
      style={{
        fontSize: 12,
        color: "#d0d0d0",
        marginTop: 6,
        wordBreak: "break-word",
        lineHeight: 1.4,
      }}
    >
      {value}
    </div>
  </div>
);
