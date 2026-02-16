"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

type LineChartCardProps = {
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
};

type BarChartCardProps = {
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
};

type PieChartCardProps = {
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
};

const DARK_CHART = { grid: "#475569", text: "#94a3b8", tooltipBg: "#1e293b", tooltipBorder: "#334155" };

export function LineChartCard({ title, data, color = "#34d399" }: LineChartCardProps) {
  return (
    <section className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-slate-300">{title}</div>
      {data.length === 0 ? (
        <div className="text-sm text-slate-500">No data yet.</div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.map((d) => ({ ...d, label: d.label || "" }))} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: DARK_CHART.text }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: DARK_CHART.text }} />
              <Tooltip
                contentStyle={{ backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: "#e2e8f0" }}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export function BarChartCard({ title, data, color = "#60a5fa" }: BarChartCardProps) {
  return (
    <section className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-slate-300">{title}</div>
      {data.length === 0 ? (
        <div className="text-sm text-slate-500">No data yet.</div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.map((d) => ({ ...d, label: d.label || "" }))} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: DARK_CHART.text }} interval={0} angle={-10} height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: DARK_CHART.text }} />
              <Tooltip
                contentStyle={{ backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: "#e2e8f0" }}
              />
              <Bar dataKey="value" fill={color} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

const PIE_COLORS = ["#34d399", "#60a5fa", "#a78bfa", "#f59e0b", "#64748b", "#94a3b8"];

export function PieChartCard({ title, data }: PieChartCardProps) {
  return (
    <section className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-slate-300">{title}</div>
      {data.length === 0 ? (
        <div className="text-sm text-slate-500">No data yet.</div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: DARK_CHART.tooltipBg, border: `1px solid ${DARK_CHART.tooltipBorder}`, borderRadius: "8px", color: "#e2e8f0" }}
              />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((s, idx) => (
                  <Cell key={s.name + idx} fill={s.color || PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default { LineChartCard, BarChartCard, PieChartCard };
