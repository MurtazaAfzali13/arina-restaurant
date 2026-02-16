import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("profiles")
      .select("id, email, full_name, phone, role, branch_id, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// در API route، بررسی کنید که کاربر فقط پروفایل خودش را آپدیت کند
export async function PUT(req: NextRequest) {
  try {
    const { userId, full_name, phone } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // TODO: اضافه کردن authentication check
    // const { user } = await supabaseServer.auth.getUser();
    // if (!user || user.id !== userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;

    const { data, error } = await supabaseServer
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}