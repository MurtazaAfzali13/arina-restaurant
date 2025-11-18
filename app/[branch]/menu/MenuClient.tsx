'use client';

import { useMeals } from '@/modules/food/hooks/useMeals';
import { DishCard } from '@/modules/food/components/DishCart';

export default function MenuClient({ branchId }: { branchId: string }) {
  const { meals, category, setCategory, loading } = useMeals(branchId);

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="mx-auto container px-6">
        <div className="text-center mb-10">
          <h2 className="font-bold text-4xl mb-4 text-gray-900">🍽️ Branch Menu</h2>
          <p className="text-gray-600 text-lg">Choose a category and explore meals from this branch!</p>
        </div>

        <div className="flex justify-center mb-12">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-4 rounded-lg border bg-green-500 text-white">
            <option value="All">🍴 All Categories</option>
            <option value="Burger">🍔 Burgers</option>
            <option value="Pizza">🍕 Pizzas</option>
            <option value="Salad">🥗 Salads</option>
            <option value="Health Food">💚 Healthy</option>
            <option value="Curry">🍛 Curry</option>
            <option value="Asian">🍜 Asian</option>
            <option value="Pasta">🍝 Pasta</option>
          </select>
        </div>

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
