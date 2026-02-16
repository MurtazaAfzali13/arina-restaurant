// app/api/branches/[branch]/meals/[slug]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: Request,
  context: { params: Promise<{ branch: string; slug: string }> }
) {
  try {
    // unwrap params
    const params = await context.params;
    const branch = params.branch;
    const slug = params.slug;

    if (!branch || !slug) {
      return NextResponse.json(
        { error: "Invalid branch or slug" },
        { status: 400 }
      );
    }

    const branchId = Number(branch);
    if (isNaN(branchId)) {
      return NextResponse.json(
        { error: "Branch must be a number" },
        { status: 400 }
      );
    }

    // fetch meal from Supabase
    const { data: meal, error } = await supabase
      .from("food_items")
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        price,
        category,
        branch_id
      `)
      .eq("branch_id", branchId)
      .eq("slug", slug)
      .single();

    if (error || !meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(meal, { status: 200 });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
