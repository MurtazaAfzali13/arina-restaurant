import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({
    cookies: () => cookies(), // ✅ فقط تابع که cookies() برمی‌گرداند
  });

  try {
    const body: { meal_id?: number; rating?: number } = await req.json();
    const { meal_id, rating } = body;

    if (!meal_id || !rating) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const { error } = await supabase
      .from("ratings")
      .upsert([{ meal_id: Number(meal_id), rating, user_id: userId }], {
        onConflict: "user_id, meal_id",
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({
    cookies: () => cookies(), // ✅ فقط تابع که cookies() برمی‌گرداند
  });

  const url = new URL(req.url);
  const meal_id = Number(url.searchParams.get("meal_id"));

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ rating: 0 });

  const userId = session.user.id;

  const { data } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", userId)
    .eq("meal_id", meal_id)
    .single();

  return NextResponse.json({ rating: data?.rating || 0 });
}
