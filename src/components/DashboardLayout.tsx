import { ReactNode } from "react";
import type { SiteSlug } from "@/types/dashboard";

type TabKey = "dashboard" | "recommendations" | "timeline" | "audit";

type Props = {
  children: ReactNode;
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  activeSite: SiteSlug;
  onSiteChange: (site: SiteSlug) => void;
  onExport: () => void;
  exporting?: boolean;
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "recommendations", label: "Recommendations" },
  { key: "timeline", label: "Timeline" },
  { key: "audit", label: "Audit History" },
];

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  activeSite,
  onSiteChange,
  onExport,
  exporting,
}: Props) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header sticky-top glass-card">
        <div>
          <p className="eyebrow">Mission Control</p>
          <h1>Website Optimization Command Center</h1>
          <p className="hint">Realtime posture for bruceac.com + merakirestoration.com</p>
        </div>
        <div className="header-actions">
          <div className="site-switch">
            <button className={activeSite === "bruceac" ? "active" : ""} onClick={() => onSiteChange("bruceac")}>Bruce</button>
            <button className={activeSite === "meraki" ? "active" : ""} onClick={() => onSiteChange("meraki")}>Meraki</button>
          </div>
          <button className="export-btn" onClick={onExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
        <nav className="tabs-row">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
