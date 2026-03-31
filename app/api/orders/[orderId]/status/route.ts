import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { isOrderExpired } from "@/lib/orderExpiry";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getBearerToken(h: Headers): string | null {
  const authHeader = h.get("Authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

const ALLOWED_STATUSES = new Set([
  "pending",
  "preparing",
  "ready",
  "delivering",
  "completed",
  "cancelled",
]);

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

    const h = await headers();
    const token = getBearerToken(h);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Service client for reads+updates, but we enforce authorization ourselves.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate user role with an RLS client.
    const supabaseRls = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabaseRls.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseRls
      .from("profiles")
      .select("role, branch_id")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const role = profile.role as string;
    const isBranchManager = role === "branch_manager" || role === "branch_admin";
    const userBranchId = profile.branch_id ? Number(profile.branch_id) : null;

    // Parse body
    const reqBody = await _request.json().catch(() => ({}));
    const requestedStatus = reqBody?.status as string | undefined;
    const nextStatus =
      requestedStatus === "on_delivery"
        ? "delivering"
        : requestedStatus === "delivered"
          ? "completed"
          : requestedStatus;

    if (!nextStatus || !ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch order first, then check expiration (race-safe).
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, branch_id, status, created_at")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (isOrderExpired({ created_at: order.created_at, status: order.status })) {
      return NextResponse.json({ error: "Order expired" }, { status: 410 });
    }

    if (isBranchManager) {
      if (!userBranchId || Number(order.branch_id) !== userBranchId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (e: unknown) {
    console.error("update order status error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

