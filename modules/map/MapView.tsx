'use client';

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { City } from "../food/domain/food.types";

// City type


// Dynamically import react-leaflet (client-side only)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

interface MapControllerProps {
  setMap: (map: any) => void;
  cities: City[];
  selectedCity: City | null;
}

function MapController({ setMap, cities, selectedCity }: MapControllerProps) {
  const center: LatLngExpression = selectedCity
    ? [selectedCity.lat, selectedCity.lng]
    : [34.5553, 69.2075]; // Default Kabul

  const locationIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  const mapRef = useCallback((node: any) => {
    if (node !== null) setMap(node);
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

      {cities.map(city => (
        <Marker key={city.id} position={[city.lat, city.lng]} icon={locationIcon}>
          <Popup>
            <div className="flex flex-col gap-2 max-w-[200px]">
              <span className="font-semibold text-gray-800">{city.emoji} {city.cityName}</span>
              <span className="text-gray-500 text-sm">{city.country}</span>
              {city.notes && <p className="italic text-gray-600 text-sm">{city.notes}</p>}
              {city.imageUrl && <img src={city.imageUrl} alt={city.cityName} className="w-full h-28 object-cover rounded-lg mt-1" />}
              <span className="text-xs text-gray-400 mt-1">📍 {city.lat.toFixed(4)}, {city.lng.toFixed(4)}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

interface MapViewProps {
  cities: City[];
  selectedCity: City | null;
}

export default function MapView({ cities, selectedCity }: MapViewProps) {
  const [isReady, setIsReady] = useState(false);
  const [map, setMap] = useState<any>(null);

  const NAVBAR_HEIGHT = 80; // ارتفاع Navbar خود را وارد کنید

  useEffect(() => {
    if (typeof window !== "undefined") setIsReady(true);
  }, []);

  useEffect(() => {
    if (map && selectedCity) {
      map.setView([selectedCity.lat, selectedCity.lng], 13);
    }
  }, [map, selectedCity]);

  if (!isReady || !cities?.length) return null;

  return (
    <div
      className="w-full h-[400px] md:h-[550px] rounded-3xl overflow-hidden border border-gray-200 shadow-md"
      style={{ marginTop: NAVBAR_HEIGHT }} // فاصله از بالای صفحه برای قرارگیری زیر Navbar
    >
      <MapController setMap={setMap} cities={cities} selectedCity={selectedCity} />
    </div>
  );
}

