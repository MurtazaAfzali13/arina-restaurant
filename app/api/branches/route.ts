import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("branches")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch branches", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
