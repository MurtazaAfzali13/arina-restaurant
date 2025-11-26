'use client';

import { useState } from 'react';

interface CategoryDropdownProps {
  category: string;
  setCategory: (value: string) => void;
}

export default function CategoryDropdown({ category, setCategory }: CategoryDropdownProps) {
  // لیست دسته‌بندی‌های ثابت
  const categories = [
    { value: 'All', label: '🍴 All Categories' },
    { value: 'Burger', label: '🍔 Burgers' },
    { value: 'Pizza', label: '🍕 Pizzas' },
    { value: 'Smoothie', label: '🍹 Smoothies' },
    { value: 'Healthy', label: '🥗 Healthy Meals' },
    { value: 'Special', label: '🍛 Special Dishes' },
    { value: 'Salad', label: '🥬 Salads' },
    { value: 'Grill', label: '🔥 Grilled Items' },
    { value: 'Sandwich', label: '🥪 Sandwiches' },
    { value: 'Wrap', label: '🌯 Wraps' },
    { value: 'Seafood', label: '🦐 Seafood' },
    { value: 'Dessert', label: '🍰 Desserts' },
    { value: 'Drinks', label: '🥤 Drinks' },
    { value: 'Asian', label: '🍜 Asian Foods' },
    { value: 'Pasta', label: '🍝 Pasta' },
    { value: 'Curry', label: '🍛 Curry' },
    { value: 'Steak', label: '🥩 Steaks' },
    { value: 'Breakfast', label: '🍳 Breakfast' },
  ];

  return (
    <div className="flex justify-center mb-12">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-4 rounded-lg border border-gray-300 bg-green-500 text-white font-bold cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
      >
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
