'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin";

interface Branch {
  id: number;
  name: string;
  slug: string;
  location: string;
  lat: string | null;
  lng: string | null;
  image_url: string;
  is_default: boolean;
}

interface BranchForm {
  name: string;
  slug: string;
  location: string;
  lat: string;
  lng: string;
  image_url: string;
}

export default function EditBranch() {
  const { profile, isSuperAdmin, loading: userLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchForm>({
    name: "",
    slug: "",
    location: "",
    lat: "",
    lng: "",
    image_url: "/images/restaurant/restaurant1.jpg",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchBranch();
  }, [isSuperAdmin, branchId]);

  const fetchBranch = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/branches');
      if (!res.ok) throw new Error('Failed to fetch branches');
      const branches = await res.json();
      const currentBranch = branches.find((b: Branch) => b.id === parseInt(branchId));
      
      if (!currentBranch) {
        setError('Branch not found');
        return;
      }

      setBranch(currentBranch);
      setFormData({
        name: currentBranch.name,
        slug: currentBranch.slug,
        location: currentBranch.location,
        lat: currentBranch.lat || "",
        lng: currentBranch.lng || "",
        image_url: currentBranch.image_url,
      });
    } catch (err) {
      setError('Failed to load branch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/branches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(branchId),
          ...formData,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Branch updated successfully!");
        router.push('/dashboard/manage_branches');
      } else {
        setError(result.error || "Failed to update branch");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Submit error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (userLoading || loading) return <div className="p-4 text-slate-400">Loading...</div>;
  if (!isSuperAdmin) return <div className="p-4 text-red-400">Access denied. Super Admin only.</div>;
  if (error && !branch) return <div className="p-4 text-red-400">{error}</div>;

  const inputClass = "w-full p-2 border border-slate-600 rounded-xl bg-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Edit Branch</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-400">Branch Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Enter branch name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-400">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="e.g., kabul-branch"
          />
          <p className="text-xs text-slate-500 mt-1">
            Unique identifier for the branch
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-400">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Enter location address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Latitude</label>
            <input
              type="text"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 34.5001284"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-400">Longitude</label>
            <input
              type="text"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 69.0724087"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-400">Image URL</label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter image URL"
          />
        </div>

        {branch?.is_default && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3">
            <p className="text-amber-200 text-sm">
              This is the default branch. Some settings cannot be modified.
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Updating..." : "Update Branch"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/dashboard/manage_branches')}
            className="flex-1 bg-slate-600 text-slate-200 p-2 rounded-xl hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}