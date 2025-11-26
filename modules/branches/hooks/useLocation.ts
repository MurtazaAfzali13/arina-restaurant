'use client';

import { useEffect, useState } from 'react';

export interface BranchLocation {
  id: number;
  name: string;
  slug: string;
  location: string;
  lat: number;
  lng: number;
  image_url: string;
}

export function useLocation(branchSlug: string) {
  const [branch, setBranch] = useState<BranchLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchSlug) return;

    const fetchBranch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/branches/${branchSlug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch branch');
        }

        setBranch(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [branchSlug]);

  return { branch, loading, error };
}
