"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/modules/food/hooks/useAdmin";

interface RatingProps {
  mealId: number;
}

export default function Rating({ mealId }: RatingProps) {
  const { profile, loading } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchRating = async () => {
      const res = await fetch(`/api/rating?meal_id=${mealId}`);
      const data = await res.json();
      if (res.ok) setRating(data.rating || 0);
    };

    fetchRating();
  }, [mealId, profile]);

  const handleRate = async (r: number) => {
    if (submitting) return;
    setRating(r);
    setSubmitting(true);

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: Number(mealId),
          rating: r,
        }),
      });

      const data = await res.json();
      if (!res.ok) alert(data.error || "Something went wrong!");
    } catch (err: any) {
      alert("Network error: " + err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (!profile)
    return (
      <p className="text-xs text-gray-500 italic text-center">
        برای امتیازدهی وارد شوید
      </p>
    );

  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col items-center">
      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((r) => (
          <span
            key={r}
            onClick={() => handleRate(r)}
            onMouseEnter={() => setHoverRating(r)}
            onMouseLeave={() => setHoverRating(0)}
            className={`cursor-pointer text-2xl transition-colors ${
              r <= displayRating ? "text-yellow-400" : "text-gray-400"
            } ${submitting ? "opacity-50 cursor-wait" : "hover:text-yellow-500"}`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-500 mt-1">
        {rating}/5
        {submitting && (
          <span className="ml-1 text-yellow-400 animate-pulse">درحال ثبت...</span>
        )}
      </p>
    </div>
  );
}
