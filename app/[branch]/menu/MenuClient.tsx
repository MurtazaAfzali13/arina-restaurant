'use client';

import { useMeals } from '@/modules/food/hooks/useMeals';
import { DishCard } from '@/modules/food/components/DishCart';
import CategoryDropdown from '@/components/CatagoriesDropDown';
import Link from 'next/link';
import { useUser } from '@/modules/food/hooks/useAdmin'; // Context ما

interface MenuClientProps {
  branchId: string;
}

export default function MenuClient({ branchId }: MenuClientProps) {
  const { meals, category, setCategory, loading } = useMeals(branchId);
  const { isAdmin, loading: userLoading } = useUser(); // وضعیت کاربر از Context
   console.log("status",isAdmin)
  if (userLoading) return <p className="p-6 text-center">Loading user info...</p>;

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="mx-auto container px-6">

        {/* عنوان و دکمه Add meals فقط برای Admin */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-4xl mb-4 text-gray-900">🍽️ Branch Menu</h2>

          {isAdmin && (
            <Link
              href="/add_items"
              className="bg-green-500 px-8 py-4 rounded-xl text-lg font-bold mt-4 inline-block hover:bg-green-600 transition"
            >
              Add meals
            </Link>
          )}
        </div>

        {/* Dropdown دسته‌بندی */}
        <CategoryDropdown category={category} setCategory={setCategory} />

        {/* نمایش غذاها */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading meals...</p>
        ) : meals.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <DishCard key={meal.slug} dish={meal as any} branchSlug={branchId} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No meals found for this category 🍽️</p>
        )}
      </div>
    </section>
  );
}
