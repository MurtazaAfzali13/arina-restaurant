import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // گرفتن دسته‌بندی‌های منحصر به فرد از food_items
    const { data: foods, error } = await supabase
      .from('food_items')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // استخراج دسته‌بندی‌های منحصر به فرد
    const categorySet = new Set<string>();
    foods?.forEach(item => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });

    // ساختاردهی به فرمت مورد نیاز
    const categories = [
      { id: 1, name: 'All', slug: 'all', order: 0 }
    ];

    let id = 2;
    categorySet.forEach(cat => {
      categories.push({
        id: id++,
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        order: id - 1
      });
    });

    return NextResponse.json(categories);

  } catch (error: any) {
    console.error('API error:', error);
    
    // در صورت خطا، دسته‌بندی‌های پیش‌فرض
    const fallbackCategories = [
      { id: 1, name: 'All', slug: 'all', order: 0 },
      { id: 2, name: 'Main Course', slug: 'main-course', order: 1 },
      { id: 3, name: 'Appetizers', slug: 'appetizers', order: 2 },
      { id: 4, name: 'Desserts', slug: 'desserts', order: 3 },
      { id: 5, name: 'Drinks', slug: 'drinks', order: 4 },
    ];

    return NextResponse.json(fallbackCategories);
  }
}