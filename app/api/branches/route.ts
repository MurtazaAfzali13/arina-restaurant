import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const { name, slug, location, lat, lng, image_url } = await req.json();

    if (!name || !slug || !location) {
      return NextResponse.json(
        { error: "Name, slug, and location are required" },
        { status: 400 }
      );
    }

    // بررسی اینکه slug تکراری نباشد
    const { data: existingBranch, error: checkError } = await supabaseServer
      .from("branches")
      .select("id")
      .eq("slug", slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // اگر خطایی غیر از "پیدا نشدن" باشد
      console.error("Check slug error:", checkError);
      return NextResponse.json(
        { error: "Failed to check branch slug", details: checkError.message },
        { status: 500 }
      );
    }

    if (existingBranch) {
      return NextResponse.json(
        { error: "Branch with this slug already exists" },
        { status: 400 }
      );
    }

    // ایجاد شعبه جدید
    const { data, error: insertError } = await supabaseServer
      .from("branches")
      .insert([
        {
          name,
          slug,
          location,
          lat: lat || null,
          lng: lng || null,
          image_url: image_url || "/images/restaurant/restaurant1.jpg",
          is_default: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create branch", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Branch created successfully", 
        data 
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}


// برای آپدیت شعبه
export async function PUT(req: NextRequest) {
  try {
    const { id, name, slug, location, lat, lng, image_url } = await req.json();

    if (!id || !name || !slug || !location) {
      return NextResponse.json(
        { error: "ID, name, slug, and location are required" },
        { status: 400 }
      );
    }

    // بررسی اینکه slug تکراری نباشد (به جز برای خود شعبه)
    const { data: existingBranch } = await supabaseServer
      .from("branches")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();

    if (existingBranch) {
      return NextResponse.json(
        { error: "Another branch with this slug already exists" },
        { status: 400 }
      );
    }

    // آپدیت شعبه
    const { data, error } = await supabaseServer
      .from("branches")
      .update({
        name,
        slug,
        location,
        lat: lat || null,
        lng: lng || null,
        image_url: image_url || "/images/restaurant/restaurant1.jpg",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update branch", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch updated successfully",
      data,
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

// برای حذف شعبه
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("branches")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete branch", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}