'use client';

import MenuClient from './MenuClient';
import { use } from 'react';

export default function MenuPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = use(params); // unwrap کردن Promise
  return <MenuClient branchId={branch} />;
}