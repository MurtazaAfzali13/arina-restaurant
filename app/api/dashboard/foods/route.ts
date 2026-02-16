/**
 * GET /api/dashboard/foods
 * Returns food_items for the current user: super_admin gets all, branch_admin gets only their branch.
 */

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, branch_id")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const isBranchManager = profile.role === "branch_manager" || profile.role === "branch_admin";
    if (isBranchManager && !profile.branch_id) {
      return NextResponse.json({ error: "No branch assigned" }, { status: 403 });
    }

    let query = supabase
      .from("food_items")
      .select("id, name, price, category, image_url, branch_id")
      .order("created_at", { ascending: false });

    if (isBranchManager) {
      query = query.eq("branch_id", profile.branch_id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const foods = (data || []).map((f: { price?: string | number }) => ({
      ...f,
      price: Number(f.price),
    }));

    return NextResponse.json(foods);
  } catch (e: unknown) {
    console.error("Dashboard foods API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
