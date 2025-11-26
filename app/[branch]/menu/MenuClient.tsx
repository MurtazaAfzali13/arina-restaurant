import { useMeals } from '@/modules/food/hooks/useMeals';
import { DishCard } from '@/modules/food/components/DishCart';
import CategoryDropdown from '@/components/CatagoriesDropDown';
import Link from 'next/link';
import { useUser } from '@/modules/food/hooks/useAdmin';

interface MenuClientProps {
  branchId: string | number;
}

export default function MenuClient({ branchId }: MenuClientProps) {
  const { meals, category, setCategory, loading } = useMeals(String(branchId));
  const { profile, isBranchAdmin, loading: userLoading } = useUser();

  if (userLoading) return <p className="p-6 text-center">Loading user info...</p>;

  const canAddMeals = isBranchAdmin && Number(profile?.branch_id) === Number(branchId);

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="mx-auto container px-6">
        <div className="text-center mb-10">
          <h2 className="font-bold text-4xl mb-4 text-gray-900">🍽️ Branch Menu</h2>

          {canAddMeals && (
            <Link
              href="/add_items"
              className="bg-green-500 px-8 py-4 rounded-xl text-lg font-bold mt-4 inline-block hover:bg-green-600 transition"
            >
              Add meals
            </Link>
          )}
        </div>

        <CategoryDropdown category={category} setCategory={setCategory} />

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading meals...</p>
        ) : meals.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <DishCard key={meal.slug} dish={meal as any} branchSlug={String(branchId)} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No meals found for this category 🍽️</p>
        )}
      </div>
    </section>
  );
}