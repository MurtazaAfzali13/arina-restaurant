'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin";
import Link from "next/link";

interface Branch {
  id: number;
  name: string;
  slug: string;
  location: string;
  lat: string | null;
  lng: string | null;
  image_url: string;
  is_default: boolean;
  created_at: string;
}

export default function ManageBranches() {
  const { profile, isSuperAdmin, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!isSuperAdmin) {
      router.replace("/");
      return;
    }
    fetchBranches();
  }, [isSuperAdmin, userLoading, router]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/branches');
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      setBranches(data || []); // تضمین می‌کند که همیشه آرایه باشد
    } catch (err) {
      setError('Failed to load branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/branches?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBranches(branches.filter(branch => branch.id !== id));
        alert('Branch deleted successfully!');
      } else {
        const result = await res.json();
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert('Network error occurred');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (userLoading) return <div className="p-4 text-slate-400">Loading user data...</div>;
  if (!isSuperAdmin) return null; // redirect handled in useEffect

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Manage Branches</h1>
        <Link
          href="/dashboard/add_branch"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors"
        >
          Add New Branch
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading branches...</div>
      ) : (
        <div className="border border-slate-600/50 rounded-xl overflow-hidden bg-slate-700/30">
          <table className="min-w-full divide-y divide-slate-600/50">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/50 bg-slate-800/30">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                    No branches found
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-600/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={branch.image_url || "/images/restaurant/restaurant1.jpg"}
                            alt={branch.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/restaurant/restaurant1.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-100">
                            {branch.name || "Unnamed Branch"}
                            {branch.is_default && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-200">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">{branch.slug || "no-slug"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-200">{branch.location || "No location"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {branch.lat && branch.lng ? (
                        `${branch.lat}, ${branch.lng}`
                      ) : (
                        'Not set'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/dashboard/manage_branches/${branch.id}`}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        Edit
                      </Link>
                      {!branch.is_default && (
                        <button
                          onClick={() => handleDelete(branch.id)}
                          disabled={deletingId === branch.id}
                          className="text-red-400 hover:text-red-300 disabled:text-slate-500"
                        >
                          {deletingId === branch.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}