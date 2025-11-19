'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin"; // Context ما
import ImagePicker from "@/modules/food/components/ImagePicker";
import CategoryDropdown from "@/components/CatagoriesDropDown";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

export default function AddFoodItem() {
  const { isAdmin, loading: userLoading } = useUser();
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // برای reset ImagePicker
  const [category, setCategory] = useState("All"); // state برای CategoryDropdown

  // اگر کاربر admin نبود، هدایت به login
  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/auth/login");
    }
  }, [userLoading, isAdmin, router]);

  // بارگذاری Branch ها
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch("/api/branches");
        if (!res.ok) throw new Error("Failed to load branches");
        const data = (await res.json()) as Branch[];
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
    formData.set("category", category); // مقدار دسته‌بندی را اضافه می‌کنیم

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
      setCategory("All"); // ریست CategoryDropdown
      setImageKey((prev) => prev + 1); // ریست ImagePicker
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  if (userLoading || !isAdmin) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
    <div className="flex justify-center bg-gray-900 min-h-screen p-6">
      <form
        key={imageKey}
        onSubmit={handleSubmit}
        className="max-w-lg space-y-6 rounded-lg bg-gray-700 p-6 text-white"
      >
        <h1 className="text-2xl font-bold text-center">Add Meal</h1>

        <input
          name="name"
          placeholder="Food Name"
          required
          className="w-full rounded-lg border p-2 text-white"
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full rounded-lg border p-2 text-white"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          required
          className="w-full rounded-lg border p-2 text-white"
        />

        {/* Category Dropdown کامپوننت */}
        <CategoryDropdown category={category} setCategory={setCategory} />

        {/* انتخاب Branch */}
        <select
          name="branch_id"
          required
          className="w-full rounded-lg border p-2 text-white"
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} {b.location ? `(${b.location})` : ""}
            </option>
          ))}
        </select>

        {/* Image Picker */}
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
