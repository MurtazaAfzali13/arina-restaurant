'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MenuClient from './menu/MenuClient';

export interface Branch {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  image_url?: string;
  notes?: string;
}





export default function BranchPageClient({ branchSlug }: { branchSlug: string }) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loadingBranch, setLoadingBranch] = useState(true);

  useEffect(() => {
    fetch(`/api/branches/${branchSlug}`)
      .then(res => res.json())
      .then((data: Branch) => {
        setBranch(data);
        setLoadingBranch(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingBranch(false);
      });
  }, [branchSlug]);

  if (loadingBranch || !branch) return <p className="text-center mt-20">Loading...</p>;




  return (
    <main className="p-6 bg-gray-800 min-h-screen pt-20">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        📍 {branch.name} Branch
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="md:w-1/2 h-[400px] md:h-auto rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-10">

        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          {branch.image_url && (
            <img
              src={branch.image_url}
              alt={branch.name}
              className="w-full h-60 md:h-auto object-cover rounded-xl shadow"
            />
          )}
          <div className="p-4 bg-white rounded-xl shadow">
            <p className="text-gray-700">{branch.notes}</p>
            <p className="text-sm text-gray-500 mt-1">
              📍 Lat: {branch.lat}, Lng: {branch.lng}
            </p>
          </div>
        </div>
      </div>

      <MenuClient branchId={branchSlug} />
    </main>
  );
}
