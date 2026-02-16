"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { classNames } from "./utils/classNames";

// -----------------------------------------------------------------------------
// Placeholder data – replace with real API data when ready.
// Structure is kept so you can plug in: setTableData(apiRows), setChartData(apiData), etc.
// -----------------------------------------------------------------------------

const PLACEHOLDER_TABLE_ROWS: { id: string; name: string; status: string; date: string }[] = [
  { id: "1", name: "—", status: "—", date: "—" },
  { id: "2", name: "—", status: "—", date: "—" },
  { id: "3", name: "—", status: "—", date: "—" },
  { id: "4", name: "—", status: "—", date: "—" },
  { id: "5", name: "—", status: "—", date: "—" },
];

const PLACEHOLDER_LINE_DATA = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 19 },
  { label: "Wed", value: 8 },
  { label: "Thu", value: 24 },
  { label: "Fri", value: 16 },
  { label: "Sat", value: 22 },
  { label: "Sun", value: 14 },
];

const PLACEHOLDER_BAR_DATA = [
  { label: "Category A", value: 40 },
  { label: "Category B", value: 65 },
  { label: "Category C", value: 32 },
  { label: "Category D", value: 48 },
  { label: "Category E", value: 55 },
];

// Dark theme chart colors (visible on slate-800)
const CHART_COLORS = {
  primary: "#34d399",   // emerald-400
  secondary: "#60a5fa", // blue-400
  grid: "#475569",      // slate-600
  text: "#94a3b8",      // slate-400
  tooltipBg: "#1e293b",
  tooltipBorder: "#334155",
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Minimal auth check: redirect if not logged in. No real data fetch.
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/login");
    };
    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-slate-800 -m-4 p-4 md:-m-6 md:p-6 rounded-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview and key metrics. Data will appear here when connected.
        </p>
      </div>

      {/* KPI placeholders – skeleton style */}
      <div
        className={classNames(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        )}
      >
        {["Total Orders", "Revenue", "Active Items", "Branches"].map((title, i) => (
          <div
            key={title}
            className="rounded-xl border border-slate-600/50 bg-slate-700/50 p-5"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-slate-600/70" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-600/50" />
          </div>
        ))}
      </div>

      {/* Charts row – responsive */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Chart 1: Area (placeholder) */}
        <section className="rounded-xl border border-slate-600/50 bg-slate-700/30 p-5">
          <div className="mb-4 text-sm font-semibold text-slate-300">
            Trend (placeholder)
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={PLACEHOLDER_LINE_DATA}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.tooltipBg,
                    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                  labelStyle={{ color: CHART_COLORS.text }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart 2: Bar (placeholder) */}
        <section className="rounded-xl border border-slate-600/50 bg-slate-700/30 p-5">
          <div className="mb-4 text-sm font-semibold text-slate-300">
            Distribution (placeholder)
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PLACEHOLDER_BAR_DATA}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.tooltipBg,
                    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS.secondary}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Table – placeholder rows */}
      <section className="rounded-xl border border-slate-600/50 bg-slate-700/30 overflow-hidden">
        <div className="border-b border-slate-600/50 px-4 py-3 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-300">Recent activity (placeholder)</h2>
          <p className="mt-0.5 text-xs text-slate-500">Name, Status, Date – replace with real data source.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600/50">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-700/50 sm:px-6">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-700/50 sm:px-6">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-700/50 sm:px-6">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/50 bg-slate-800/50">
              {PLACEHOLDER_TABLE_ROWS.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "transition-colors border-l-2",
                    index === 0
                      ? "border-l-emerald-500/70 bg-emerald-900/20 hover:bg-emerald-900/30"
                      : "border-l-transparent hover:bg-slate-600/30",
                    index !== 0 && (index % 2 === 0 ? "bg-slate-800/30" : "bg-slate-700/20")
                  )}
                >
                  <td className="px-4 py-3 text-sm text-slate-300 sm:px-6 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-600/60 text-slate-300">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 sm:px-6 whitespace-nowrap">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
