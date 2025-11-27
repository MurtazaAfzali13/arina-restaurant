
'use client';

import { use } from 'react';


export default function MenuPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = use(params);

  return (
    <div className="p-6">
   
    </div>
  );
}
