import { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  status?: "good" | "warning" | "critical";
  trendLabel?: string;
  hint?: string;
  icon?: ReactNode;
};

export function MetricsCard({
  label,
  value,
  status = "good",
  trendLabel,
  hint,
  icon,
}: Props) {
  return (
    <article className={`card metric metric-${status}`}>
      <header>
        <p className="metric-label">{label}</p>
        {icon ? <span className="metric-icon">{icon}</span> : null}
      </header>
      <h3 className="metric-value">{value}</h3>
      <footer>
        {trendLabel ? <span className="trend">{trendLabel}</span> : <span />}
        {hint ? <span className="hint">{hint}</span> : null}
      </footer>
    </article>
  );
}
