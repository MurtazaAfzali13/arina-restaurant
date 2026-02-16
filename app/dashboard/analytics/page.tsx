"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BarChartCard, LineChartCard, PieChartCard } from "../components/Charts";

type Profile = {
  id: string;
  role: "admin" | "branch_manager" | string;
  branch_id: number | null;
};

type StatusSlice = { name: string; value: number; color?: string };

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  ready: "#10B981",
  delivered: "#059669",
  completed: "#64748B",
  cancelled: "#EF4444",
};

function isoDateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildDayBuckets(days: number) {
  const now = new Date();
  const buckets: { key: string; label: string; date: Date }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = isoDateKey(d);
    buckets.push({
      key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      date: d,
    });
  }
  return buckets;
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ordersLine, setOrdersLine] = useState<Array<{ label: string; value: number }>>([]);
  const [barData, setBarData] = useState<Array<{ label: string; value: number }>>([]);
  const [statusData, setStatusData] = useState<StatusSlice[]>([]);

  // Admin: global data; branch_manager: filter all charts by profile.branch_id (real Supabase data)
  const role = profile?.role === "branch_manager" || profile?.role === "branch_admin" ? "branch_manager" : "admin";

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, branch_id")
        .eq("id", user.id)
        .single();
      if (profileError || !profileData) {
        setError("Could not load profile");
        setLoading(false);
        return;
      }
      setProfile(profileData as Profile);
      setLoading(false);
    };
    loadProfile();
  }, [router, supabase]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!profile) return;
      if (role === "branch_manager" && !profile.branch_id) {
        setError("No branch assigned to your account.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const DAYS = 14;
        const dayBuckets = buildDayBuckets(DAYS);
        const fromISO = (() => {
          const d = new Date(dayBuckets[0].date);
          d.setHours(0, 0, 0, 0);
          return d.toISOString();
        })();

        // Orders per day (line)
        const ordersLineQuery = supabase.from("orders").select("created_at").gte("created_at", fromISO);
        if (role === "branch_manager") ordersLineQuery.eq("branch_id", profile.branch_id);
        const ordersLineRes = await ordersLineQuery;
        if (ordersLineRes.error) throw ordersLineRes.error;
        const countsByDay: Record<string, number> = {};
        for (const row of ordersLineRes.data || []) {
          const d = new Date((row as any).created_at);
          const key = isoDateKey(d);
          countsByDay[key] = (countsByDay[key] || 0) + 1;
        }
        setOrdersLine(dayBuckets.map((b) => ({ label: b.label, value: countsByDay[b.key] || 0 })));

        // Bar chart:
        if (role === "admin") {
          // revenue per branch
          const revQuery = supabase.from("orders").select("final_amount, branch_id, branches(name)");
          const revRes = await revQuery;
          if (revRes.error) throw revRes.error;
          const map = new Map<number, { label: string; value: number }>();
          for (const r of revRes.data || []) {
            const bid = Number((r as any).branch_id);
            const name = (r as any).branches?.name || `Branch #${bid}`;
            const amt = Number.parseFloat((r as any).final_amount || "0") || 0;
            const prev = map.get(bid) || { label: name, value: 0 };
            prev.value += amt;
            map.set(bid, prev);
          }
          setBarData(Array.from(map.values()).sort((a, b) => b.value - a.value));
        } else {
          // revenue per day for this branch
          const revQuery = supabase
            .from("orders")
            .select("final_amount, created_at")
            .eq("branch_id", profile.branch_id)
            .gte("created_at", fromISO);
          const revRes = await revQuery;
          if (revRes.error) throw revRes.error;
          const sumByDay: Record<string, number> = {};
          for (const r of revRes.data || []) {
            const d = new Date((r as any).created_at);
            const key = isoDateKey(d);
            const amt = Number.parseFloat((r as any).final_amount || "0") || 0;
            sumByDay[key] = (sumByDay[key] || 0) + amt;
          }
          setBarData(dayBuckets.map((b) => ({ label: b.label, value: sumByDay[b.key] || 0 })));
        }

        // Status distribution
        const statusQuery = supabase.from("orders").select("status");
        if (role === "branch_manager") statusQuery.eq("branch_id", profile.branch_id);
        const statusRes = await statusQuery;
        if (statusRes.error) throw statusRes.error;
        const sMap: Record<string, number> = {};
        for (const r of statusRes.data || []) {
          const s = ((r as any).status || "unknown") as string;
          sMap[s] = (sMap[s] || 0) + 1;
        }
        const statusList: StatusSlice[] = Object.entries(sMap).map(([name, value]) => ({
          name,
          value,
          color: STATUS_COLORS[name] || "#94A3B8",
        }));
        setStatusData(statusList);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [profile, role, supabase]);

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          {role === "admin" ? "Global analytics across branches" : "Branch-level analytics"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-600/50 bg-slate-700/30" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 text-sm text-red-300">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartCard title="Orders per day (last 14 days)" data={ordersLine} />
          <BarChartCard
            title={role === "admin" ? "Revenue per branch" : "Revenue per day"}
            data={barData}
            color={role === "admin" ? "#60a5fa" : "#34d399"}
          />
          <PieChartCard title="Order status distribution" data={statusData} />
        </div>
      )}
    </div>
  );
}
