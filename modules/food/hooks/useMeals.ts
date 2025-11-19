'use client';

import { useEffect, useState } from 'react';

import {Food } from "../domain/food.types"


export function useMeals(branchId: string, initialCategory = "All") {
  const [meals, setMeals] = useState<Food[]>([]);
  const [category, setCategory] = useState<string>(initialCategory);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);

  // 📌 گرفتن غذاها بر اساس category
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
          { cache: "no-store", signal: controller.signal }
        );

        if (!res.ok) {
          console.error("Fetch meals error");
          setMeals([]);
          return;
        }

        const data: Food[] = await res.json();
        setMeals(data);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
    return () => controller.abort();
  }, [branchId, category]);

  // 📌 گرفتن لیست همه دسته‌بندی‌ها از API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };

    loadCategories();
  }, []);

  return {
    meals,
    category,
    setCategory,
    loading,
    categories, // 👈 اینو اضافه کردیم
  };
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
