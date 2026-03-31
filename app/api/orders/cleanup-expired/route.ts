import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getOrderCleanupCutoffIso } from "@/lib/orderExpiry";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const INTERNAL_SECRET = process.env.CLEANUP_ORDERS_INTERNAL_SECRET;

function getBearerTokenFromHeaders(h: Headers): string | null {
  const authHeader = h.get("Authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

export async function POST(_request: NextRequest) {
  try {
    const allHeaders = await headers();
    const token = getBearerTokenFromHeaders(allHeaders);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Optional internal secret for automated jobs (Supabase scheduled execution).
    const internalSecretHeader = allHeaders.get("x-internal-secret") || "";
    const hasInternalSecret = Boolean(INTERNAL_SECRET && internalSecretHeader === INTERNAL_SECRET);

    if (!hasInternalSecret) {
      // Cookie-based auth (preferred for internal calls).
      const cookieStore = await cookies();
      const routeClient = createRouteHandlerClient({ cookies: async () => cookieStore });
      const { data: sessionData } = await routeClient.auth.getSession();
      const userId = sessionData.session?.user?.id ?? null;

      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { data: profile, error: profileError } = await routeClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 403 });
      }

      const isAdmin =
        profile.role === "super_admin" ||
        profile.role === "branch_admin" ||
        profile.role === "branch_manager";

      if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cleanupCutoffIso = getOrderCleanupCutoffIso();
    const { data: oldOrders, error: oldOrdersError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .lt("created_at", cleanupCutoffIso)
      .limit(2000);

    if (oldOrdersError) {
      return NextResponse.json(
        { error: oldOrdersError.message || "Failed to fetch old orders" },
        { status: 500 }
      );
    }

    const oldOrderIds = (oldOrders || []).map((o) => o.id).filter(Boolean);
    if (oldOrderIds.length === 0) {
      return NextResponse.json({ success: true, deletedOrdersCount: 0 }, { status: 200 });
    }

    const { error: deleteItemsError } = await supabaseAdmin
      .from("order_items")
      .delete()
      .in("order_id", oldOrderIds);
    if (deleteItemsError) {
      return NextResponse.json(
        { error: deleteItemsError.message || "Failed to delete old order items" },
        { status: 500 }
      );
    }

    const { data: deletedOrders, error: deleteOrdersError } = await supabaseAdmin
      .from("orders")
      .delete()
      .in("id", oldOrderIds)
      .select("id");
    if (deleteOrdersError) {
      return NextResponse.json(
        { error: deleteOrdersError.message || "Failed to delete old orders" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, deletedOrdersCount: (deletedOrders || []).length },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("cleanup-expired error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

