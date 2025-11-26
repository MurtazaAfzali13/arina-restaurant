'use client';

import { useMeals } from '@/modules/food/hooks/useMeals';
import { DishCard } from '@/modules/food/components/DishCart';
import CategoryDropdown from '@/components/CatagoriesDropDown';
import Link from 'next/link';
import { useUser } from '@/modules/food/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuClientProps {
  branchId: string | number;
}

// کامپوننت اسکلتونی با افکت موج
const DishCardSkeletonWithShimmer = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 relative">
    {/* Shimmer Overlay */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-50 to-transparent z-10" />
    
    {/* Image Skeleton */}
    <div className="h-48 bg-gray-200 rounded-t-2xl relative z-0" />
    
    <div className="p-6 relative z-0">
      {/* Title Skeleton */}
      <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3" />
      
      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      
      <div className="flex justify-between items-center">
        {/* Price Skeleton */}
        <div className="h-7 bg-gray-200 rounded-lg w-20" />
        
        {/* Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

// کامپوننت اسکلتونی برای اطلاعات کاربر
const UserInfoSkeleton = () => (
  <section className="py-20 bg-gray-50 min-h-screen">
    <div className="mx-auto container px-4 sm:px-6">
      <div className="text-center mb-10">
        <Skeleton className="h-12 w-64 mx-auto mb-4 rounded-xl" />
        <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
      </div>
      <div className="flex justify-center mb-8">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </div>
  </section>
);

export default function MenuClient({ branchId }: MenuClientProps) {
  const { meals, category, setCategory, loading } = useMeals(String(branchId));
  const { profile, isBranchAdmin, loading: userLoading } = useUser();

  // Skeleton loading برای user info
  if (userLoading) {
    return <UserInfoSkeleton />;
  }

  const canAddMeals = isBranchAdmin && Number(profile?.branch_id) === Number(branchId);

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="mx-auto container px-4 sm:px-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-3xl sm:text-4xl mb-4 text-gray-900">🍽️ Branch Menu</h2>

          {canAddMeals && (
            <Link
              href="/add_items"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-bold mt-4 inline-block transition-colors duration-300"
            >
              Add meals
            </Link>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="mb-8">
          <CategoryDropdown category={category} setCategory={setCategory} />
        </div>

        {/* Meals Grid */}
        {loading ? (
          // نمایش 6 کارت اسکلتونی با افکت موج در همه دستگاه‌ها
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <DishCardSkeletonWithShimmer key={index} />
            ))}
          </div>
        ) : meals.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <DishCard key={meal.slug} dish={meal as any} branchSlug={String(branchId)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No meals found for this category 🍽️</p>
            {canAddMeals && (
              <Link
                href="/add_items"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors"
              >
                Add the first meal
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}