"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// City type
export interface City {
  id: number;
  cityName: string;
  country: string;
  emoji?: string;
  notes?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}

// Dynamically import react-leaflet (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

function MapController({
  setMap,
  cities,
  selectedCity,
}: {
  setMap: (map: any) => void;
  cities: City[];
  selectedCity: City | null;
}) {
  const center: LatLngExpression = selectedCity
    ? [selectedCity.lat, selectedCity.lng]
    : [34.5553, 69.2075]; // Default Kabul

  const locationIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  // استفاده از ref callback برای گرفتن instance از map
  const mapRef = useCallback((node: any) => {
    if (node !== null) {
      setMap(node);
    }
  }, [setMap]);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={selectedCity ? 13 : 6}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cities.map((city) => (
        <Marker
          key={city.id}
          position={[city.lat, city.lng]}
          icon={locationIcon}
        >
          <Popup>
            <div className="flex flex-col gap-2 max-w-[200px]">
              <span className="text-base font-semibold text-gray-800">
                {city.emoji} {city.cityName}
              </span>
              <span className="text-gray-500 text-sm">{city.country}</span>
              {city.notes && (
                <p className="italic text-gray-600 text-sm">{city.notes}</p>
              )}
              {city.imageUrl && (
                <img
                  src={city.imageUrl}
                  alt={city.cityName}
                  className="w-full h-28 object-cover rounded-lg mt-1"
                />
              )}
              <span className="text-xs text-gray-400 mt-1">
                📍 {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default function MapView({
  cities,
  selectedCity,
}: {
  cities: City[];
  selectedCity: City | null;
}) {
  const [isReady, setIsReady] = useState(false);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsReady(true);
    }
  }, []);

  // Center map on selected city
  useEffect(() => {
    if (map && selectedCity) {
      map.setView([selectedCity.lat, selectedCity.lng], 13);
    }
  }, [map, selectedCity]);

  if (!isReady || !cities?.length) return null;

  return (
    <div
      className="
        relative w-full h-[300px] md:h-[550px] 
        rounded-3xl overflow-hidden
        border border-gray-200
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        transition-transform duration-300 ease-out
        hover:scale-[1.01] hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)]
        z-10
      "
    >
      {isReady && (
        <MapController
          setMap={setMap}
          cities={cities}
          selectedCity={selectedCity}
        />
      )}
    </div>
  );
}