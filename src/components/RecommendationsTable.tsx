"use client";

import { useMemo, useState } from "react";
import type { Recommendation } from "@/types/dashboard";

type Props = {
  recommendations: Recommendation[];
};

const order = { critical: 0, high: 1, medium: 2, low: 3 };

export function RecommendationsTable({ recommendations }: Props) {
  const [rows, setRows] = useState(recommendations);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => rows.toSorted((a, b) => order[a.priority] - order[b.priority]),
    [rows],
  );

  async function updateStatus(id: string, status: Recommendation["status"]) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to save");

      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      // no-op; can wire toast later
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card">
      <h2>Active Recommendations</h2>
      <div className="table-wrap">
        <table className="reco-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Title</th>
              <th>Site</th>
              <th>Impact</th>
              <th>Effort</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Blockers</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <td><span className={`pill ${r.priority}`}>{r.priority}</span></td>
                <td>{r.title}</td>
                <td>{r.site_slug}</td>
                <td>{r.impact}</td>
                <td>{r.effort_hours}h</td>
                <td>
                  <select
                    value={r.status}
                    disabled={savingId === r.id}
                    onChange={(e) =>
                      updateStatus(r.id, e.target.value as Recommendation["status"])
                    }
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>
                <td>{r.owner ?? "—"}</td>
                <td>{r.blocker_notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
