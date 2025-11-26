"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Define TypeScript type for a city
type City = {
  id: number;
  cityName: string;
  country: string;
  emoji?: string;
  date?: string;
  notes?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
};

// MapView loaded only on client (SSR=false)
const MapView = dynamic<{ cities: City[]; selectedCity: City | null }>(
  () => import("./MapView"),
  { ssr: false }
);

export default function MapPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data: City[]) => {
        // only Kabul and Herat
        const filtered = data.filter((c) => ["Kabul", "Herat"].includes(c.cityName));
        setCities(filtered);
        // Set first city as default selection
        if (filtered.length > 0) {
          setSelectedCity(filtered[0]);
        }
      })
      .catch(console.error);
  }, []);

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
  };

  return (
   <main className="p-6 bg-gray-200 min-h-screen pt-20">
  <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
    📍 Restaurant Locations
  </h1>

  <div className="flex flex-col md:flex-row gap-6">
    {/* Left: Cards */}
  <div className="md:w-1/2 flex flex-col gap-4">
  {cities.map((c) => (
    <div
      key={c.id}
      onClick={() => handleCityClick(c)}
      className={`bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col md:flex-row cursor-pointer transform hover:scale-105 ${
        selectedCity?.id === c.id 
          ? 'ring-4 ring-blue-500 shadow-xl scale-105' 
          : 'hover:shadow-lg'
      }`}
    >
      {/* Image on top for small screens, right for large */}
      {c.imageUrl && (
        <div className="w-full md:w-1/2 h-48 md:h-auto order-1 md:order-2">
          <img
            src={c.imageUrl}
            alt={c.cityName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Text below image on small screens, left on large */}
      <div className="p-5 md:w-1/2 flex flex-col justify-center order-2 md:order-1 text-black">
        <h2 className="text-xl font-semibold text-black">
          {c.emoji} {c.cityName}
        </h2>
        <p className="text-black/80">{c.country}</p>
        <p className="mt-2 text-black">{c.notes}</p>
        <p className="text-sm text-black/70 mt-1">
          Lat: {c.lat}, Lng: {c.lng}
        </p>
      </div>
    </div>
  ))}
</div>


    {/* Right: Map */}
    <div className="md:w-1/2 h-[400px] md:h-auto rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-10">
      <MapView cities={cities} selectedCity={selectedCity} />
    
    </div>
  </div>
</main>

  );
}
