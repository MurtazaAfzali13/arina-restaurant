import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
//api/menu/route.ts
export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // کلید عادی کافی است
  );

  // گرفتن branch از query params
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch");

  if (!branchId) {
    return NextResponse.json(
      { error: "branch is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .eq("branch_id", branchId)
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
