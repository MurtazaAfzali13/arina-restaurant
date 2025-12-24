'use client';

import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center text-gray-600">
            Loading checkout page...
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
