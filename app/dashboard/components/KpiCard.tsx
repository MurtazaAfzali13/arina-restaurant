"use client";

import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-600/50 bg-slate-700/50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-700/70">
      <div className="text-sm font-medium text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
    </div>
  );
}

export default KpiCard;
