import { AlertBanner } from "@/components/AlertBanner";
import { AuditReport } from "@/components/AuditReport";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HealthStatus } from "@/components/HealthStatus";
import { MetricsCard } from "@/components/MetricsCard";
import { RecommendationsTable } from "@/components/RecommendationsTable";
import { TrendChart } from "@/components/TrendChart";
import { getDashboardSummary } from "@/lib/data";
import { trend } from "@/lib/format";
import type { Audit, SiteSlug } from "@/types/dashboard";

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

function sitePanel(site: SiteSlug, latest: Audit | null, prev: Audit | null) {
  if (!latest) {
    return <p className="card">No audit data for {site}</p>;
  }

  const lighthouseTrend = trend(latest.lighthouse_score, prev?.lighthouse_score);
  const lcpTrend = trend(latest.lcp_ms, prev?.lcp_ms);
  const seoTrend = trend(
    latest.estimated_seo_visibility,
    prev?.estimated_seo_visibility,
  );
  const convTrend = trend(latest.conversion_rate, prev?.conversion_rate);

  return (
    <section className="site-column" key={site}>
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

export default async function Home() {
  const data = await getDashboardSummary();

  const bruceHist = data.auditsBySite.bruceac;
  const merakiHist = data.auditsBySite.meraki;

  const chartData = Array.from({ length: Math.min(bruceHist.length, merakiHist.length) }).map(
    (_, i) => ({
      date: new Date(bruceHist[i].audit_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      bruceac: bruceHist[i].lighthouse_score,
      meraki: merakiHist[i].lighthouse_score,
    }),
  );

  return (
    <DashboardLayout>
      <AlertBanner findings={data.findings} />

      <section className="site-grid">
        {sitePanel(
          "bruceac",
          data.latestAudits.bruceac,
          data.auditsBySite.bruceac.at(-2) ?? null,
        )}
        {sitePanel(
          "meraki",
          data.latestAudits.meraki,
          data.auditsBySite.meraki.at(-2) ?? null,
        )}
      </section>

      <HealthStatus
        latestAudits={[data.latestAudits.bruceac, data.latestAudits.meraki]}
        findings={data.findings}
      />

      <RecommendationsTable recommendations={data.recommendations} />

      <section className="two-col">
        <TrendChart title="Lighthouse Trend (30d)" data={chartData} unit="score" />
        <ComparisonMatrix
          bruce={data.latestAudits.bruceac}
          meraki={data.latestAudits.meraki}
        />
      </section>

      <section className="two-col">
        <AuditReport site="bruceac" audits={data.auditsBySite.bruceac} />
        <AuditReport site="meraki" audits={data.auditsBySite.meraki} />
      </section>
    </DashboardLayout>
  );
}
