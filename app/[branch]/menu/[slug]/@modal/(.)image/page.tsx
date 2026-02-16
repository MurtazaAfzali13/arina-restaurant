'use client';

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMeal } from "@/modules/food/hooks/useMeals";

export default function ImageModalPage() {
  const params = useParams();
  const router = useRouter();
  const branch = params.branch as string;
  const slug = params.slug as string;
  const { meal, loading, error } = useMeal(branch, slug);

  // بستن با ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [router]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <p className="text-white text-lg font-semibold animate-pulse">
          Loading image...
        </p>
      );
    }

    if (error || !meal) {
      return (
        <div className="text-center text-white">
          <p className="text-lg font-semibold">Unable to display this image.</p>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <button
            type="button"
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20 cursor-pointer"
            onClick={() => router.back()}
          >
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          type="button"
          className="absolute top-4 right-4 z-10 rounded-full bg-white/20 text-white w-10 h-10 flex items-center justify-center text-xl hover:bg-white/30"
          onClick={() => router.back()}
        >
          ×
        </button>

        <Image
          src={meal.image_url || "/images/meals/1.jpg"}
          alt={meal.name}
          width={1200}
          height={800}
          className="h-auto w-full max-h-[100vh] rounded-lg object-contain"
          priority
        />
      </div>
    );
  }, [error, loading, meal, router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={(e) => e.target === e.currentTarget && router.back()}
    >
      {content}
    </div>
  );
}
