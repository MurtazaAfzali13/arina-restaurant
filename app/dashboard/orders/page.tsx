"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { classNames } from "../utils/classNames";

type Profile = {
  id: string;
  role: "admin" | "branch_manager" | string;
  branch_id: number | null;
};

type OrderRow = {
  id: string;
  branch_id: number;
  status: string | null;
  final_amount: string | null;
  created_at: string;
  customer_name?: string | null;
  branches?: { name: string | null } | { name: string | null }[] | null;
};

// Status badge colors – dark theme
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-900/50", text: "text-amber-200" },
  confirmed: { bg: "bg-blue-900/50", text: "text-blue-200" },
  preparing: { bg: "bg-violet-900/50", text: "text-violet-200" },
  ready: { bg: "bg-emerald-900/50", text: "text-emerald-200" },
  delivered: { bg: "bg-emerald-900/50", text: "text-emerald-200" },
  completed: { bg: "bg-slate-600/50", text: "text-slate-200" },
  cancelled: { bg: "bg-red-900/50", text: "text-red-200" },
};
type SortKey = "created_at" | "status" | "final_amount" | "customer_name";

export default function OrdersPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const role = profile?.role === "branch_manager" || profile?.role === "branch_admin" ? "branch_manager" : "admin";

  // Sorted orders (client-side sort respecting branch filter already applied in loadOrders)
  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortKey === "status") {
        cmp = (a.status || "").localeCompare(b.status || "");
      } else if (sortKey === "final_amount") {
        const amtA = Number.parseFloat(a.final_amount || "0") || 0;
        const amtB = Number.parseFloat(b.final_amount || "0") || 0;
        cmp = amtA - amtB;
      } else if (sortKey === "customer_name") {
        cmp = (a.customer_name || "").localeCompare(b.customer_name || "");
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [orders, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(key === "created_at" ? false : true);
    }
  };

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
    const loadOrders = async () => {
      if (!profile) return;
      if (role === "branch_manager" && !profile.branch_id) {
        setError("No branch assigned to your account.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const query = supabase
          .from("orders")
          .select("id, branch_id, status, final_amount, created_at, customer_name, branches(name)")
          .order("created_at", { ascending: false });
        if (role === "branch_manager") query.eq("branch_id", profile.branch_id);
        const { data, error: ordersError } = await query;
        if (ordersError) throw ordersError;
        setOrders((data || []) as OrderRow[]);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [profile, role, supabase]);

  const formatCurrency = (value: string | null) => {
    const num = Number.parseFloat(value || "0") || 0;
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const getStatusStyle = (status: string | null) => {
    const key = (status || "unknown").toLowerCase();
    return STATUS_STYLES[key] || { bg: "bg-slate-600/50", text: "text-slate-200" };
  };

  const SortHeader = ({
    label,
    column,
    align = "left",
  }: {
    label: string;
    column: SortKey;
    align?: "left" | "right";
  }) => (
    <th
      className={classNames(
        "px-4 py-3 font-semibold text-slate-400",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className={classNames(
          "inline-flex items-center gap-1 hover:text-slate-100",
          align === "right" ? "ml-auto" : ""
        )}
      >
        {label}
        {sortKey === column ? (
          sortAsc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </th>
  );

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Orders</h1>
        <p className="mt-1 text-sm text-slate-400">
          {role === "admin" ? "All branches" : "Filtered to your branch"}
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-6 text-sm text-slate-400">Loading orders...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 text-sm text-red-300">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-6 text-sm text-slate-400">No orders yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-600/50 bg-slate-700/30 shadow-sm">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-600/50 text-sm">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400 sm:px-6">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400 sm:px-6">Branch</th>
                  <SortHeader label="Customer" column="customer_name" />
                  <SortHeader label="Status" column="status" />
                  <SortHeader label="Final Amount" column="final_amount" align="right" />
                  <SortHeader label="Created At" column="created_at" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/50 bg-slate-800/30">
                {sortedOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-slate-600/30">
                      <td className="px-4 py-3 font-medium text-slate-100 sm:px-6">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-slate-300 sm:px-6">
                        {Array.isArray(order.branches)
                          ? order.branches[0]?.name || `Branch #${order.branch_id}`
                          : order.branches?.name || `Branch #${order.branch_id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-300 sm:px-6">{order.customer_name || "—"}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span
                          className={classNames(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                            statusStyle.bg,
                            statusStyle.text
                          )}
                        >
                          {order.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-100 sm:px-6">
                        {formatCurrency(order.final_amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 sm:px-6">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
