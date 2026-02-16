"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// تایپ برای Category
interface Category {
  id: number;
  name: string;
  slug: string;
  order?: number;
}

interface CategoryDropdownProps {
  category: string;
  setCategory: (category: string) => void;
  categories: Category[]; // این prop اضافه شد
  mealsCount?: number; // اضافه کردن mealsCount
}

export default function CategoryDropdown({ 
  category, 
  setCategory,
  categories = [], // مقدار پیش‌فرض
  mealsCount = 0 // مقدار پیش‌فرض
}: CategoryDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // اگر categories خالی است، از پیش‌فرض استفاده کن
  const displayCategories = categories.length > 0 
    ? categories 
    : [
        { id: 1, name: 'All', slug: 'all' },
        { id: 2, name: 'Main Course', slug: 'main-course' },
        { id: 3, name: 'Appetizers', slug: 'appetizers' },
        { id: 4, name: 'Desserts', slug: 'desserts' },
        { id: 5, name: 'Drinks', slug: 'drinks' },
      ];

  // پیدا کردن نام دسته‌بندی فعلی
  const currentCategory = displayCategories.find(cat => cat.slug === category)?.name || 'All';

  return (
    <div className="mb-8 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Filter by Category</h3>
          <p className="text-gray-600 text-sm">Select a category to filter meals</p>
        </div>

        {/* Dropdown برای دسکتاپ */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">{currentCategory}</span>
            <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.slug);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    category === cat.slug ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* دکمه‌های افقی برای موبایل */}
        <div className="flex md:hidden overflow-x-auto gap-2 pb-2">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                category === cat.slug
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* نمایش دسته‌بندی انتخاب شده */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-gray-600">Currently viewing:</span>
        <span className="font-semibold text-emerald-600">{currentCategory}</span>
        <span className="text-gray-400">
          ({mealsCount} {mealsCount === 1 ? 'item' : 'items'})
        </span>
      </div>
    </div>
  );
}