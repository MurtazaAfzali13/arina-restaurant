'use client';

import { useEffect, useState } from 'react';

import {Food } from "../domain/food.types"


export function useMeal(branchId: string, slug: string) {
  const [meal, setMeal] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/branches/${branchId}/meals/${slug}`);

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed");

        setMeal(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [branchId, slug]);

  return { meal, loading, error };
}