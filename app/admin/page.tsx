'use client';
import { useUser } from '@/modules/food/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { profile, isAdmin, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/auth'); // یا نمایش Access Denied
    }
  }, [loading, isAdmin, router]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!profile || !isAdmin) return <p className="p-6 text-red-500">Access Denied. Admins only.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {profile.full_name}!</p>
      <p>Email: {profile.email}</p>
      <p>Branch ID: {profile.branch_id ?? 'Not assigned'}</p>
    </div>
  );
}
