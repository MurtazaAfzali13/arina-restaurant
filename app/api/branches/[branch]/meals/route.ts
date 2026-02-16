import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ branch: string }> }
) {
  const { branch } = await context.params;

  if (!branch) {
    return NextResponse.json(
      { error: "branch param is required" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // گرفتن category از URL
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? null;

  // ---- Query ----
  let query = supabase
    .from("food_items")
    .select("*")
    .eq("branch_id", branch);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
