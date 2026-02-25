import type { Finding } from "@/types/dashboard";

type Props = {
  findings: Finding[];
};

export function AlertBanner({ findings }: Props) {
  const critical = findings.filter((f) => f.severity === "critical");
  if (!critical.length) return null;

  return (
    <aside className="alert-banner">
      ⚠️ {critical.length} critical issue{critical.length > 1 ? "s" : ""} detected — top: {critical[0].title}
    </aside>
  );
}
