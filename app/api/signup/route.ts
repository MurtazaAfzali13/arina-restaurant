import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, phone } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: "Email & password required" }), { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ success: false, message: authError?.message }), { status: 400 });
    }

    const userId = authData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, email, full_name, phone, role: "customer", branch_id: null })
      .select()
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ success: false, message: profileError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, message: "Signup completed!", profile }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
