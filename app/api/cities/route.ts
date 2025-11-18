import Database from "better-sqlite3";
import path from "path";
import { NextResponse } from "next/server";

import { City } from "@/lib/types";

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "data", "lib", "map.db");
    const db = new Database(dbPath);

    // ✅ استفاده از type assertion
    const cities = db.prepare("SELECT * FROM cities").all() as City[];

    db.close();

    return NextResponse.json(cities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
