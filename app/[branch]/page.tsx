
'use client';

import MenuClient from './menu/MenuClient';
import dynamic from 'next/dynamic';
import { use } from 'react';

const MapView = dynamic(() => import('@/modules/map/MapView'), { ssr: false });

export default function MenuPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = use(params);

  return (
    <div className="p-6">
      {/* Map */}
      <MapView cities={[{ id: 1, cityName: branch, lat: 34.5, lng: 69.1 }]} selectedCity={{ id: 1, cityName: branch, lat: 34.5, lng: 69.1 }} />

      {/* Menu */}
    <MenuClient branchId={branch} />
    </div>
  );
}
