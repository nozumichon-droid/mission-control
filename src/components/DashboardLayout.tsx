import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function DashboardLayout({ children }: Props) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Mission Control</p>
          <h1>Website Optimization Command Center</h1>
        </div>
        <p className="hint">Realtime posture for bruceac.com + merakirestoration.com</p>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
