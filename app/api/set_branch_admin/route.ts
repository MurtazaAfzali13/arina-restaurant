import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { userId, branchId } = await req.json();

    if (!userId || !branchId) {
      return NextResponse.json({ error: "userId and branchId are required" }, { status: 400 });
    }

    // تغییر نقش کاربر و تعیین branch_id
    const { error } = await supabase
      .from("profiles")
      .update({ 
        role: "branch_admin", 
        branch_id: branchId 
      })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: "User updated to Branch Admin successfully" 
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}