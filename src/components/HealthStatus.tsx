import type { Audit, Finding } from "@/types/dashboard";

type Props = {
  latestAudits: (Audit | null)[];
  findings: Finding[];
};

export function HealthStatus({ latestAudits, findings }: Props) {
  const critical = findings.filter((f) => f.severity === "critical");
  const lastAudit = latestAudits
    .filter(Boolean)
    .map((a) => new Date(a!.audit_date).getTime())
    .sort((a, b) => b - a)[0];

  const nextAudit = new Date();
  nextAudit.setDate(nextAudit.getDate() + ((8 - nextAudit.getDay()) % 7 || 7));
  nextAudit.setHours(6, 0, 0, 0);

  return (
    <section className="card health-card">
      <div className="health-head">
        <h2>System Health Status</h2>
        <span className={critical.length ? "pill critical" : "pill good"}>
          {critical.length ? "Attention Required" : "All Systems Nominal"}
        </span>
      </div>
      <p className="health-meta">
        Last audit: {lastAudit ? new Date(lastAudit).toLocaleString() : "n/a"}
      </p>
      <p className="health-meta">Next scheduled audit: {nextAudit.toLocaleString()}</p>
      <ul className="alerts">
        {critical.length ? (
          critical.slice(0, 5).map((f) => (
            <li key={f.id}>
              <strong>{f.site_slug.toUpperCase()}</strong> — {f.title}
            </li>
          ))
        ) : (
          <li>No critical alerts right now.</li>
        )}
      </ul>
    </section>
  );
}
