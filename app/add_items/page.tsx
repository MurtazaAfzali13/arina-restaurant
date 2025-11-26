'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin"; // Context ما
import ImagePicker from "@/modules/food/components/ImagePicker";
import CategoryDropdown from "@/components/CatagoriesDropDown";

export default function AddFoodItem() {
  const { profile, isBranchAdmin, loading } = useUser(); // ✅ branch admin check
  const router = useRouter();

  const [category, setCategory] = useState("All");
  const [imageKey, setImageKey] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // اگر کاربر Branch Admin نبود، هدایت به صفحه اصلی
  useEffect(() => {
    if (!loading && (!profile || !isBranchAdmin)) {
      router.replace("/"); 
    }
  }, [loading, profile, isBranchAdmin, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingSubmit(true);

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("branch_id", String(profile?.branch_id)); // ✅ branch_id خود Branch Admin

    try {
      const res = await fetch("/api/add_items", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add meal");

      alert(result.message ?? "Meal saved!");
      e.currentTarget.reset();
      setCategory("All");
      setImageKey(prev => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (loading) return <p className="p-6 text-center">Loading...</p>;

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

        <CategoryDropdown category={category} setCategory={setCategory} />

        {/* branch_id غیرقابل تغییر، فقط شعبه خودش */}
        <input
          type="text"
          value={`Branch: ${profile?.branch_id}`}
          disabled
          className="w-full rounded-lg border p-2 text-white bg-gray-600"
        />

        <ImagePicker key={imageKey} name="image" />

        <button
          disabled={loadingSubmit}
          className="w-full rounded-lg bg-green-600 py-2 hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-800/70"
        >
          {loadingSubmit ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
