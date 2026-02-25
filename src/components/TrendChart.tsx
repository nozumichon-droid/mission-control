"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = {
  date: string;
  bruceac: number;
  meraki: number;
};

type Props = {
  title: string;
  data: Datum[];
  unit?: string;
};

export function TrendChart({ title, data, unit = "" }: Props) {
  return (
    <section className="card chart-card">
      <h2>{title}</h2>
      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Line type="monotone" dataKey="bruceac" stroke="#60A5FA" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="meraki" stroke="#A78BFA" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="hint">Unit: {unit || "raw"}</p>
    </section>
  );
}
