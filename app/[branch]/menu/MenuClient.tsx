"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { DishCard } from "@/modules/food/components/DishCart";
import CategoryDropdown from "@/components/CatagoriesDropDown";
import { Food } from "@/modules/food/domain/food.types";
import { useUser } from "@/modules/food/hooks/useAdmin";
import { useCart } from "@/Contexts/CartContext";
import SnakeSpinner from "@/app/dashboard/components/Spinner";


interface MenuClientProps {
  branchId: string | number;
}

export default function MenuClient({ branchId }: MenuClientProps) {
  const [meals, setMeals] = useState<Food[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(false);

  const { profile, isBranchAdmin, loading: userLoading } = useUser();
  const { state } = useCart();

  // 🔢 تعداد آیتم‌های این شعبه در سبد
  const branchItemsCount =
    state.branchCarts[Number(branchId)]?.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) || 0;

  // 📌 fetch meals
  useEffect(() => {
    if (!branchId) return;

    const controller = new AbortController();

    const fetchMeals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "All") params.set("category", category);

        const res = await fetch(
          `/api/branches/${branchId}/meals?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          setMeals([]);
          return;
        }

        const data: Food[] = await res.json();
        setMeals(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Fetch meals error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
    return () => controller.abort();
  }, [branchId, category]);

  if (userLoading) {
    return <p className="p-6 text-center">Loading user info...</p>;
  }

  const canAddMeals =
    isBranchAdmin && Number(profile?.branch_id) === Number(branchId);

  return (
    <section className="py-20 bg-gray-900 min-h-screen">
      <div className="mx-auto container px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h2 className="font-bold text-4xl mb-2 text-gray-100">
            🍽️ Branch {branchId} Menu
          </h2>

          <p className="text-gray-600 mb-4">
            {branchId === "1" ? "Kabul Branch" : "Herat Branch"}
          </p>

          {canAddMeals && (
            <Link
              href="/add_items"
              className="mb-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition"
            >
              Add meals
            </Link>
          )}

          {/* 🛒 Cart Button */}
          <Link
            href={`/${branchId}/cart`}
            className="relative flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <ShoppingCart size={20} />
            View Cart

            {branchItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {branchItemsCount}
              </span>
            )}
          </Link>
        </div>


        {/* Categories */}
        <CategoryDropdown category={category} setCategory={setCategory} />

        {/* Meals */}
        {loading ? (
          <div className="text-center text-gray-500 text-lg mt-10">
            <SnakeSpinner />
          </div>
        ) : meals.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {meals.map((meal) => (
              <DishCard
                key={meal.slug}
                dish={meal as any}
                branchSlug={String(branchId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg mt-10">
            No meals found for this category 🍽️
          </p>
        )}
      </div>
    </section>
  );
}
