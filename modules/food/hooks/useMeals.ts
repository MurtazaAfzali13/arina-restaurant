'use client';

import { useEffect, useState } from 'react';

import {Food } from "../domain/food.types"
export function useMeals(branchId: string, initialCategory = 'All') {
  const [meals, setMeals] = useState<Food[]>([]);
  const [category, setCategory] = useState<string>(initialCategory);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!branchId) return;

    const controller = new AbortController();
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== 'All') params.set('category', category);

        const res = await fetch(`/api/branches/${encodeURIComponent(branchId)}/meals?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown fetch error' }));
          console.error('fetch error', err);
          setMeals([]);
          return;
        }

        const data: Food[] = await res.json();
        setMeals(data);
      } catch (err) {
        if ((err as any).name === 'AbortError') return;
        console.error('Failed to load meals:', err);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
    return () => controller.abort();
  }, [branchId, category]);

  return { meals, category, setCategory, loading };
}


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
