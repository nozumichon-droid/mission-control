import type { Audit } from "@/types/dashboard";

type Props = {
  bruce: Audit | null;
  meraki: Audit | null;
};

export function ComparisonMatrix({ bruce, meraki }: Props) {
  if (!bruce || !meraki) return null;

  const rows = [
    {
      metric: "Lighthouse",
      b: bruce.lighthouse_score,
      m: meraki.lighthouse_score,
      better: bruce.lighthouse_score >= meraki.lighthouse_score ? "Bruce" : "Meraki",
    },
    {
      metric: "LCP (lower better)",
      b: bruce.lcp_ms,
      m: meraki.lcp_ms,
      better: bruce.lcp_ms <= meraki.lcp_ms ? "Bruce" : "Meraki",
    },
    {
      metric: "SEO Visibility",
      b: bruce.estimated_seo_visibility,
      m: meraki.estimated_seo_visibility,
      better:
        bruce.estimated_seo_visibility >= meraki.estimated_seo_visibility
          ? "Bruce"
          : "Meraki",
    },
    {
      metric: "Conversion Rate",
      b: `${(bruce.conversion_rate * 100).toFixed(1)}%`,
      m: `${(meraki.conversion_rate * 100).toFixed(1)}%`,
      better: bruce.conversion_rate >= meraki.conversion_rate ? "Bruce" : "Meraki",
    },
  ];

  return (
    <section className="card">
      <h2>Bruce vs Meraki Comparison</h2>
      <div className="table-wrap">
        <table className="reco-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Bruce</th>
              <th>Meraki</th>
              <th>Best Performer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.metric}>
                <td>{row.metric}</td>
                <td>{row.b}</td>
                <td>{row.m}</td>
                <td><span className="pill medium">{row.better}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
