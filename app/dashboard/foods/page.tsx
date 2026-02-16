"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FoodEditModal, { Food } from "../components/FoodEditModal";

type Profile = {
  id: string;
  role: "admin" | "branch_manager" | string;
  branch_id: number | null;
};

export default function FoodsPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Branch managers can edit foods for their branch; admin has read-only view of all foods
  const isBranchManager =
    profile?.role === "branch_manager" || profile?.role === "branch_admin";

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
    const loadFoods = async () => {
      if (!profile) return;
      if (isBranchManager && !profile.branch_id) {
        setError("No branch assigned to your account.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const query = supabase
          .from("food_items")
          .select("id, name, price, category, image_url, branch_id")
          .order("created_at", { ascending: false });
        if (isBranchManager) query.eq("branch_id", profile.branch_id);
        const { data, error: foodsError } = await query;
        if (foodsError) throw foodsError;
        setFoods(
          (data || []).map((f: any) => ({
            ...f,
            price: Number(f.price),
          }))
        );
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load foods");
      } finally {
        setLoading(false);
      }
    };
    loadFoods();
  }, [profile, isBranchManager, supabase]);

  const openEdit = (food: Food) => {
    setSelectedFood(food);
    setEditOpen(true);
  };

  const handleUpdated = (next: Food) => {
    setFoods((prev) => prev.map((f) => (f.id === next.id ? next : f)));
  };

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Foods</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isBranchManager ? "Manage foods for your branch" : "Read-only view for all branches"}
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-6 text-sm text-slate-400">Loading foods...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 text-sm text-red-300">{error}</div>
      ) : foods.length === 0 ? (
        <div className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-6 text-sm text-slate-400">No foods found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <div
              key={food.id}
              className="rounded-2xl border border-slate-600/50 bg-slate-700/30 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <img
                  src={food.image_url || "/images/restaurant/restaurant1.jpg"}
                  alt={food.name}
                  className="h-16 w-16 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/restaurant/restaurant1.jpg";
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-100">{food.name}</div>
                  <div className="text-xs text-slate-500">{food.category || "Uncategorized"}</div>
                  <div className="mt-2 text-lg font-semibold text-emerald-400">
                    {(food.price || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Branch #{food.branch_id ?? "—"}</span>
                {isBranchManager ? (
                  <button
                    onClick={() => openEdit(food)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Edit
                  </button>
                ) : (
                  <span className="text-slate-500">Read only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <FoodEditModal
        open={editOpen}
        food={selectedFood}
        onClose={() => setEditOpen(false)}
        onUpdated={handleUpdated}
        branchId={isBranchManager ? profile?.branch_id ?? null : undefined}
      />
    </div>
  );
}
