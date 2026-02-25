import type { Audit, SiteSlug } from "@/types/dashboard";

type Props = {
  site: SiteSlug;
  audits: Audit[];
};

export function AuditReport({ site, audits }: Props) {
  const [current, previous] = audits.slice(-2).reverse();
  if (!current) return null;

  return (
    <details className="card" open>
      <summary>
        <strong>{site.toUpperCase()}</strong> Weekly Audit Snapshot
      </summary>
      <div className="audit-grid">
        <p>Lighthouse: {current.lighthouse_score} (prev: {previous?.lighthouse_score ?? "n/a"})</p>
        <p>LCP: {current.lcp_ms}ms (prev: {previous?.lcp_ms ?? "n/a"})</p>
        <p>CLS: {current.cls} (prev: {previous?.cls ?? "n/a"})</p>
        <p>FID: {current.fid_ms}ms (prev: {previous?.fid_ms ?? "n/a"})</p>
        <p>SEO visibility: {current.estimated_seo_visibility}</p>
        <p>Conversion rate: {(current.conversion_rate * 100).toFixed(1)}%</p>
      </div>
    </details>
  );
}
