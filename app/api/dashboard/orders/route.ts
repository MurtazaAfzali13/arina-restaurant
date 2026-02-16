/**
 * GET /api/dashboard/orders?range=today|7d|30d|all
 * Returns orders for dashboard: super_admin gets all branches, branch_admin gets their branch only.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    const range = request.nextUrl.searchParams.get("range") || "7d";
    const now = new Date();
    let fromDate: Date | null = null;
    if (range === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "7d") {
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (range === "30d") {
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 30);
    }
    const fromIso = fromDate ? fromDate.toISOString() : null;

    let query = supabase
      .from("orders")
      .select("id, branch_id, status, final_amount, created_at, customer_name, branches(name)")
      .order("created_at", { ascending: false });

    if (isBranchManager) {
      query = query.eq("branch_id", profile.branch_id);
    }
    if (fromIso) {
      query = query.gte("created_at", fromIso);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e: unknown) {
    console.error("Dashboard orders API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
