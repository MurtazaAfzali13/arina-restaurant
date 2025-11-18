import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// مسیر پوشه data/lib
const dataDir = path.join(process.cwd(), "data", "lib");

// اگر پوشه وجود ندارد، آن را بساز
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// مسیر فایل دیتابیس
const dbPath = path.join(dataDir, "map.db");

// ایجاد دیتابیس
const db = new Database(dbPath);

// ایجاد جدول cities (با ستون imageUrl)
db.prepare(`
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY,
    cityName TEXT NOT NULL,
    country TEXT NOT NULL,
    emoji TEXT,
    date TEXT,
    notes TEXT,
    lat REAL,
    lng REAL,
    imageUrl TEXT
  )
`).run();

// آماده‌سازی دستور درج داده
const insert = db.prepare(`
  INSERT INTO cities (id, cityName, country, emoji, date, notes, lat, lng, imageUrl)
  VALUES (@id, @cityName, @country, @emoji, @date, @notes, @lat, @lng, @imageUrl)
`);

// داده‌های شعب
const cities = [
  {
    id: 10000001,
    cityName: "Kabul",
    country: "Afghanistan",
    emoji: "🇦🇫",
    date: "2025-06-11T10:00:00.000Z",
    notes: "Main branch of our restaurant.",
    lat: 34.5001284,
    lng: 69.0724087,
    imageUrl: "/images/restaurant/restaurant1.jpg",
  },
  {
    id: 10000002,
    cityName: "Herat",
    country: "Afghanistan",
    emoji: "🇦🇫",
    date: "2025-06-12T11:00:00.000Z",
    notes: "Second branch located in Herat.",
    lat: 34.352865,
    lng: 62.2040287,
    imageUrl: "/images/restaurant/restaurant2.jpg",
  },
];

// حذف داده‌های قبلی و درج جدید
db.prepare("DELETE FROM cities").run();
for (const city of cities) insert.run(city);

console.log(`✅ Database created at: ${dbPath}`);

db.close();
