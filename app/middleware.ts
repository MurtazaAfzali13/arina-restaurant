import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // فقط برای مسیر /uploads
  if (url.pathname.startsWith("/uploads/food-images")) {
    const filePath = path.join(process.cwd(), url.pathname);
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      return new Response(file, {
        headers: { "Content-Type": "image/jpeg" }, // می‌توان MIME-type دقیق‌تر کرد
      });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uploads/food-images/:path*"],
};
