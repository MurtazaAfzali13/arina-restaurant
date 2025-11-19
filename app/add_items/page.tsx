"use client";

import { FormEvent, useEffect, useState } from "react";
import ImagePicker from "@/modules/food/components/ImagePicker";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

export default function AddFoodItem() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // برای reset ImagePicker

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await fetch("/api/branches");
        if (!response.ok) throw new Error("Failed to load branches");
        const data = (await response.json()) as Branch[];
        setBranches(data);
      } catch (err) {
        console.error(err);
        setBranches([]);
      }
    };
    loadBranches();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/add_items", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add meal");

      alert(result.message ?? "Meal saved!");

      // ریست فرم
      e.currentTarget.reset();
      // ریست ImagePicker
      setImageKey((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 flex justify-center">
      <form
        key={imageKey} // key باعث می‌شود فرم rerender شود و ImagePicker هم reset شود
        onSubmit={handleSubmit}
        className="max-w-lg space-y-6 rounded-lg bg-gray-800 p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Add Meal</h1>

        <input
          name="name"
          placeholder="Food Name"
          required
          className="w-full rounded-lg border p-2 text-black"
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full rounded-lg border p-2 text-black"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          required
          className="w-full rounded-lg border p-2 text-black"
        />

        <select
          name="category"
          required
          className="w-full rounded-lg border p-2 text-black"
        >
          <option value="">Select Category</option>
          <option value="Burger">🍔 Burger</option>
          <option value="Smoothie">🍹 Smoothie</option>
          <option value="Pizza">🍕 Pizza</option>
          <option value="Healthy">🥗 Healthy</option>
          <option value="Special">🍛 Special</option>
          <option value="Dessert">🍰 Dessert</option>
          <option value="Drink">🥤 Drink</option>
          <option value="Traditional">🍢 Traditional</option>
        </select>

        <select
          name="branch_id"
          required
          className="w-full rounded-lg border p-2 text-black"
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} {b.location ? `(${b.location})` : ""}
            </option>
          ))}
        </select>

        <ImagePicker key={imageKey} name="image" />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-green-600 py-2 hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-800/70"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
