import GalleryGrid from "./components/GalleryGrid";

export const metadata = {
  title: "Food Gallery | Pexels API 🍕🥗",
  description:
    "A collection of delicious food images fetched directly from Pexels REST API.",
};

export interface PexelsPhoto {
  id: number;
  alt: string;
  src: {
    medium: string;
    large: string;
  };
}

async function getFoodImages(): Promise<PexelsPhoto[]> {
  const API_KEY = process.env.PEXELS_API_KEY;

  if (!API_KEY) {
    console.error("❌ Missing PEXELS_API_KEY in .env.local");
    return [];
  }

  const res = await fetch(
    "https://api.pexels.com/v1/search?query=delicious food&per_page=300",
    {
      headers: {
        Authorization: API_KEY,
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    }
  );

  if (!res.ok) throw new Error("Failed to fetch food images from Pexels API");
  const data = await res.json();
  return data.photos || [];
}

export default async function GalleryPage() {
  const photos = await getFoodImages();

  return (
    <main className="min-h-screen bg-gray-700 py-12 px-6 flex flex-col items-center pt-30">
      <h1 className="text-4xl font-bold text-gray-100 mb-6 text-center">
        🍴 Delicious Food Gallery
      </h1>
      <p className="text-gray-100 mb-10 max-w-2xl text-center">
        Browse through 300 tasty food images from the{" "}
        <strong>Pexels REST API</strong>. Use the pagination below to explore.
      </p>

      <GalleryGrid photos={photos} perPage={30} />
    </main>
  );
}
