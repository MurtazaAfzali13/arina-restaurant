import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { supabaseServer } from "@/lib/supabaseServer";

// تابع تولید slug از نام غذا
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
  try {
    // گرفتن هدر Authorization (Bearer token)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // بررسی Session و گرفتن پروفایل
    const { data: { user }, error: sessionError } = await supabaseServer.auth.getUser(token);

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
    }

    // ادامه ثبت غذا
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = (formData.get("category") as string) || "Other";
    const branch_id = formData.get("branch_id") as string;
    const image = formData.get("image") as File | null;

    if (!name || isNaN(price) || !branch_id) {
      return NextResponse.json({ error: "فیلدهای اجباری پر نشده‌اند." }, { status: 400 });
    }

    let imagePath = "/images/meals/default.jpg";

    if (image && image.size > 0) {
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "حداکثر حجم عکس 5MB است." }, { status: 400 });
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const optimizedBuffer = await sharp(buffer)
        .resize(1024, 1024, { fit: "inside" })
        .jpeg({ quality: 85 })
        .toBuffer();

      const fileName = `${name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.jpg`;
      const imagesDir = path.join(process.cwd(), "public", "images", "meals");

      await fs.mkdir(imagesDir, { recursive: true });
      await fs.writeFile(path.join(imagesDir, fileName), optimizedBuffer);

      imagePath = `/images/meals/${fileName}`;
    }

    const slug = generateSlug(name);

    const { data, error } = await supabaseServer.from("food_items").insert([
      {
        name,
        slug,
        description,
        price,
        category,
        branch_id: parseInt(branch_id),
        image_url: imagePath,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "خطا در ثبت غذا" }, { status: 500 });
    }

    return NextResponse.json({ message: "غذا با موفقیت ثبت شد!", meal: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "خطای غیرمنتظره", details: err.message }, { status: 500 });
  }
}
