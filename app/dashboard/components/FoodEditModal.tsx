"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { classNames } from "../utils/classNames";

export type Food = {
  id: number;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  branch_id: number | null;
};

type FoodEditModalProps = {
  open: boolean;
  onClose: () => void;
  food: Food | null;
  onUpdated: (food: Food) => void;
  /** When provided (branch_manager), update is scoped to this branch for security */
  branchId?: number | null;
};

export function FoodEditModal({ open, onClose, food, onUpdated, branchId }: FoodEditModalProps) {
  const supabase = createClientComponentClient();
  const [name, setName] = useState(food?.name || "");
  const [price, setPrice] = useState(food?.price?.toString() || "");
  const [category, setCategory] = useState(food?.category || "");
  const [imageUrl, setImageUrl] = useState(food?.image_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local form in sync when a new food is selected
  useEffect(() => {
    setName(food?.name || "");
    setPrice(food?.price != null ? String(food.price) : "");
    setCategory(food?.category || "");
    setImageUrl(food?.image_url || "");
  }, [food]);

  if (!open || !food) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const numericPrice = Number.parseFloat(price);
      if (Number.isNaN(numericPrice)) {
        setError("Price must be a number");
        setSaving(false);
        return;
      }

      const payload = {
        name: name.trim(),
        price: numericPrice,
        category: category.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      // Branch manager: scope update to their branch only (defense in depth)
      let updateQuery = supabase.from("food_items").update(payload).eq("id", food.id);
      if (branchId != null) {
        updateQuery = updateQuery.eq("branch_id", branchId);
      }
      const { error: updateError } = await updateQuery;
      if (updateError) throw updateError;

      onUpdated({ ...food, ...payload, price: numericPrice });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to update food");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Edit food</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-300 hover:bg-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Food name"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-400">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. 12.50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. Pizza"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              placeholder="https://..."
            />
          </div>
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={classNames(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
              saving ? "bg-emerald-500/70" : "bg-emerald-600 hover:bg-emerald-500"
            )}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodEditModal;
