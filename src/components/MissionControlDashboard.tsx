"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AlertBanner } from "@/components/AlertBanner";
import { AuditReport } from "@/components/AuditReport";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HealthStatus } from "@/components/HealthStatus";
import { MetricsCard } from "@/components/MetricsCard";
import { RecommendationsTable } from "@/components/RecommendationsTable";
import { TrendChart } from "@/components/TrendChart";
import { trend } from "@/lib/format";
import type { Audit, DashboardSummary, Recommendation, SiteSlug } from "@/types/dashboard";

type TabKey = "dashboard" | "recommendations" | "timeline" | "audit";

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "recommendations", label: "Recommendations" },
  { key: "timeline", label: "Timeline" },
  { key: "audit", label: "Audit History" },
];

function statusForLighthouse(score: number) {
  if (score >= 90) return "good" as const;
  if (score >= 75) return "warning" as const;
  return "critical" as const;
}

function statusForLcp(ms: number) {
  if (ms <= 2500) return "good" as const;
  if (ms <= 4000) return "warning" as const;
  return "critical" as const;
}

function SitePanel({ site, latest, prev, active }: { site: SiteSlug; latest: Audit | null; prev: Audit | null; active: boolean }) {
  if (!latest) {
    return <p className="card">No audit data for {site}</p>;
  }

  const lighthouseTrend = trend(latest.lighthouse_score, prev?.lighthouse_score);
  const lcpTrend = trend(latest.lcp_ms, prev?.lcp_ms);
  const seoTrend = trend(latest.estimated_seo_visibility, prev?.estimated_seo_visibility);
  const convTrend = trend(latest.conversion_rate, prev?.conversion_rate);

  return (
    <section className={`site-column ${active ? "site-column-active" : ""}`} key={site}>
      <h2>{site === "bruceac" ? "Bruce A/C" : "Meraki Restoration"}</h2>
      <div className="metrics-grid">
        <MetricsCard
          label="Lighthouse"
          value={latest.lighthouse_score}
          status={statusForLighthouse(latest.lighthouse_score)}
          trendLabel={lighthouseTrend.label}
        />
        <MetricsCard
          label="LCP"
          value={`${latest.lcp_ms}ms`}
          status={statusForLcp(latest.lcp_ms)}
          trendLabel={lcpTrend.label}
        />
        <MetricsCard
          label="SEO Visibility"
          value={latest.estimated_seo_visibility}
          status={latest.estimated_seo_visibility >= 70 ? "good" : "warning"}
          trendLabel={seoTrend.label}
        />
        <MetricsCard
          label="Conversion"
          value={`${(latest.conversion_rate * 100).toFixed(1)}%`}
          status={latest.conversion_rate >= 0.12 ? "good" : "warning"}
          trendLabel={convTrend.label}
        />
      </div>
    </section>
  );
}

function ActivityFeed({ data }: { data: DashboardSummary }) {
  const items = useMemo(() => {
    const auditEvents = Object.values(data.latestAudits)
      .filter(Boolean)
      .map((audit) => ({
        at: audit!.audit_date,
        title: "New audit run",
        detail: `${audit!.site_slug.toUpperCase()} scored ${audit!.lighthouse_score}`,
      }));

    const findingEvents = data.findings.slice(0, 8).map((f) => ({
      at: f.created_at,
      title: f.severity === "critical" ? "Critical issue detected" : "Issue detected",
      detail: `${f.site_slug.toUpperCase()} · ${f.title}`,
    }));

    const recoEvents = data.recommendations.slice(0, 8).map((r) => ({
      at: r.updated_at,
      title: "Recommendation updated",
      detail: `${r.site_slug.toUpperCase()} · ${r.title}`,
    }));

    return [...auditEvents, ...findingEvents, ...recoEvents]
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 14);
  }, [data]);

  return (
    <section className="card">
      <h2>Activity Feed</h2>
      <ul className="activity-feed">
        {items.map((item, i) => (
          <li key={`${item.title}-${item.at}-${i}`}>
            <p className="activity-title">{item.title}</p>
            <p className="hint">{item.detail}</p>
            <p className="hint">{new Date(item.at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function siteName(site: SiteSlug) {
  return site === "bruceac" ? "Bruce A/C" : "Meraki";
}

function KanbanBoard({ recommendations }: { recommendations: Recommendation[] }) {
  const [cards, setCards] = useState(recommendations);

  const columns = {
    todo: cards.filter((r) => r.status === "not_started"),
    inprogress: cards.filter((r) => r.status === "in_progress"),
    done: cards.filter((r) => r.status === "completed"),
  };

  async function persistStatus(id: string, status: Recommendation["status"]) {
    await fetch(`/api/recommendations/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;

    const statusMap: Record<string, Recommendation["status"]> = {
      todo: "not_started",
      inprogress: "in_progress",
      done: "completed",
    };
    const newStatus = statusMap[destination.droppableId] ?? "not_started";

    setCards((prev) => prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c)));
    await persistStatus(draggableId, newStatus);
  }

  return (
    <section className="card">
      <h2>Recommendations Kanban</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-grid">
          {(
            [
              { id: "todo", title: "TODO", list: columns.todo },
              { id: "inprogress", title: "IN PROGRESS", list: columns.inprogress },
              { id: "done", title: "DONE", list: columns.done },
            ] as const
          ).map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div className="kanban-col" ref={provided.innerRef} {...provided.droppableProps}>
                  <h3>{col.title}</h3>
                  {col.list.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(dragProvided) => (
                        <article
                          className="kanban-card"
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <p><strong>{card.title}</strong></p>
                          <p className="hint">{siteName(card.site_slug)} · {card.effort_hours}h · {card.impact}</p>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}

export function MissionControlDashboard({ initialData }: { initialData: DashboardSummary }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [activeSite, setActiveSite] = useState<SiteSlug>("bruceac");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        setData(json.data as DashboardSummary);
      } catch {
        // passive polling
      }
    }, 20000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.metaKey && e.key === "1") {
        e.preventDefault();
        setActiveSite("bruceac");
      }
      if (e.metaKey && e.key === "2") {
        e.preventDefault();
        setActiveSite("meraki");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bruceHist = data.auditsBySite.bruceac;
  const merakiHist = data.auditsBySite.meraki;
  const chartData = Array.from({ length: Math.min(bruceHist.length, merakiHist.length) }).map((_, i) => ({
    date: new Date(bruceHist[i].audit_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    bruceac: bruceHist[i].lighthouse_score,
    meraki: merakiHist[i].lighthouse_score,
  }));

  const searchItems = useMemo(
    () => [
      ...tabs.map((t) => ({
        id: `tab-${t.key}`,
        label: `Open ${t.label}`,
        action: () => {
          setActiveTab(t.key);
          setSearchOpen(false);
        },
      })),
      ...data.recommendations.map((r) => ({
        id: r.id,
        label: `${r.title} (${r.site_slug})`,
        action: () => {
          setActiveTab("recommendations");
          setSearchOpen(false);
        },
      })),
    ],
    [data.recommendations],
  );

  const filtered = searchItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  async function exportPdf() {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#070b14" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(img, "PNG", 10, 10, width, height);
      pdf.save(`mission-control-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activeSite={activeSite}
      onSiteChange={setActiveSite}
      onExport={exportPdf}
      exporting={isExporting}
    >
      <div ref={reportRef} className="dashboard-capture">
        <AlertBanner findings={data.findings} />

        {activeTab === "dashboard" && (
          <>
            <section className="site-grid">
              <SitePanel
                site="bruceac"
                latest={data.latestAudits.bruceac}
                prev={data.auditsBySite.bruceac.at(-2) ?? null}
                active={activeSite === "bruceac"}
              />
              <SitePanel
                site="meraki"
                latest={data.latestAudits.meraki}
                prev={data.auditsBySite.meraki.at(-2) ?? null}
                active={activeSite === "meraki"}
              />
            </section>

            <HealthStatus latestAudits={[data.latestAudits.bruceac, data.latestAudits.meraki]} findings={data.findings} />

            <section className="two-col">
              <TrendChart title="Lighthouse Trend (30d)" data={chartData} unit="score" />
              <ComparisonMatrix bruce={data.latestAudits.bruceac} meraki={data.latestAudits.meraki} />
            </section>
          </>
        )}

        {activeTab === "recommendations" && (
          <>
            <KanbanBoard key={data.generatedAt} recommendations={data.recommendations} />
            <RecommendationsTable recommendations={data.recommendations} />
          </>
        )}

        {activeTab === "timeline" && <ActivityFeed data={data} />}

        {activeTab === "audit" && (
          <section className="two-col">
            <AuditReport site="bruceac" audits={data.auditsBySite.bruceac} />
            <AuditReport site="meraki" audits={data.auditsBySite.meraki} />
          </section>
        )}
      </div>

      {searchOpen && (
        <div className="command-palette" onClick={() => setSearchOpen(false)}>
          <div className="command-panel" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              placeholder="Search tabs and recommendations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="command-results">
              {filtered.slice(0, 8).map((item) => (
                <button key={item.id} onClick={item.action}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
