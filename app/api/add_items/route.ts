import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; // این تابع async شده است
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// Generate slug
function generateSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "") +
    "-" +
    Date.now()
  );
}

export async function POST(req: Request) {
  console.log("=== API ADD_ITEMS START ===");
  
  try {
    // 🔧 FIX: await the cookies() function
    const cookieStore =  cookies();
    
    // Create supabase client for route handler
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Check session with route handler
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("Session from route handler:", {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      sessionError: sessionError?.message
    });

    if (!session) {
      console.error("No session found in API");
      return NextResponse.json({ 
        error: "User not authenticated",
        message: "Please login again"
      }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, branch_id")
      .eq("id", session.user.id)
      .single();

    console.log("Profile data:", {
      profile,
      profileError: profileError?.message
    });

    if (profileError || !profile) {
      console.error("Profile fetch failed:", profileError);
      return NextResponse.json({ 
        error: "Error fetching user profile"
      }, { status: 500 });
    }

    // Check role
    const isAdmin = profile.role === "super_admin" || profile.role === "branch_admin";
    if (!isAdmin) {
      console.error("User is not admin:", profile.role);
      return NextResponse.json({ 
        error: "Access denied. Admins only.",
        userRole: profile.role
      }, { status: 403 });
    }

    console.log("✅ User authorized:", {
      userId: session.user.id,
      role: profile.role,
      branchId: profile.branch_id
    });

    // Get form data
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const branch_id = Number(formData.get("branch_id"));
    const category = (formData.get("category") as string) || "Other";
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;
    
    console.log("📝 Form data received:", {
      name,
      price,
      branch_id,
      category,
      description: description ? "Has description" : "No description",
      image: image ? `Yes (${image.size} bytes)` : "No"
    });

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json({ 
        error: "Meal name is required" 
      }, { status: 400 });
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ 
        error: "Enter a valid price" 
      }, { status: 400 });
    }

    if (isNaN(branch_id) || branch_id <= 0) {
      return NextResponse.json({ 
        error: "Invalid branch ID" 
      }, { status: 400 });
    }

    // Check branch_admin access
    if (profile.role === "branch_admin") {
      if (profile.branch_id !== branch_id) {
        console.error("Branch mismatch:", {
          userBranch: profile.branch_id,
          requestedBranch: branch_id
        });
        return NextResponse.json(
          { error: "You can only add meals to your own branch" },
          { status: 403 }
        );
      }
    }

    // Process image
    let imagePath = "/images/meals/default.jpg";

    if (image && image.size > 0) {
      console.log("Processing image...");
      
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Maximum image size is 5MB" },
          { status: 400 }
        );
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: "Unsupported image format" },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await image.arrayBuffer());

        const optimized = await sharp(buffer)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const fileName = `${generateSlug(name)}.jpg`;
        const imagesDir = path.join(process.cwd(), "public", "images", "meals");

        await fs.mkdir(imagesDir, { recursive: true });
        const filePath = path.join(imagesDir, fileName);
        await fs.writeFile(filePath, optimized);

        imagePath = `/images/meals/${fileName}`;
        console.log("✅ Image saved:", imagePath);
      } catch (imageError: any) {
        console.error("Image processing error:", imageError);
        return NextResponse.json(
          { error: "Error processing image" },
          { status: 500 }
        );
      }
    }

    // Insert into database
    const slug = generateSlug(name);
    
    console.log("Inserting into database...", {
      name,
      slug,
      price,
      branch_id,
      category,
      imagePath
    });

    const { data, error: insertError } = await supabase
      .from("food_items")
      .insert([
        {
          name,
          slug,
          description: description || null,
          price,
          category,
          branch_id,
          image_url: imagePath,
          created_by: session.user.id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Database insert error:", insertError);
      return NextResponse.json(
        { 
          error: "Error saving meal to database",
          details: insertError.message 
        },
        { status: 500 }
      );
    }

    console.log("✅ Meal added successfully:", data);

    return NextResponse.json({
      message: "Meal added successfully!",
      data,
      success: true
    }, { status: 201 });

  } catch (err: any) {
    console.error("❌ Unhandled API error:", err);
    return NextResponse.json({
      error: "Server error",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  } finally {
    console.log("=== API ADD_ITEMS END ===");
  }
}