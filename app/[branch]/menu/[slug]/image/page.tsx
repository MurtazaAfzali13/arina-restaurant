// app/menu/[slug]/image/page.tsx
'use client';

import ShowImageClient from "@/modules/food/components/ShowImageClient";
import { useMeal } from "@/modules/food/hooks/useMeals";
import { useParams } from "next/navigation";

export default function ShowImagePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // برای branchId می‌توانیم 1 را موقت بگذاریم یا اگر نیاز باشد از مسیر یا context بگیریم
  const branchId = "1";

  const { meal, loading, error } = useMeal(branchId, slug);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">در حال بارگذاری تصویر...</p>;
  }

  if (error || !meal) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error || "غذا یافت نشد"}</p>
      </div>
    );
  }

  return <ShowImageClient item={meal} />;
}
