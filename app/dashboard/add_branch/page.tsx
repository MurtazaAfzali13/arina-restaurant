'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin";

interface BranchForm {
  name: string;
  slug: string;
  location: string;
  lat: string;
  lng: string;
  image_url: string;
}

export default function AddBranch() {
  const { profile, isSuperAdmin, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState<BranchForm>({
    name: "",
    slug: "",
    location: "",
    lat: "",
    lng: "",
    image_url: "/images/restaurant/restaurant1.jpg",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Branch created successfully!");
        router.push('/dashboard/set_branch_admin');
      } else {
        setError(result.error || "Failed to create branch");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // به طور خودکار slug ایجاد کن اگر name تغییر کرد و slug خالی است
    if (name === 'name' && !formData.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  };

  if (userLoading) return <div className="p-4">Loading...</div>;
  if (!isSuperAdmin) return <div className="p-4 text-red-500">Access denied. Super Admin only.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Branch</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Branch Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter branch name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., kabul-branch"
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique identifier for the branch (auto-generated from name)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter location address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input
              type="text"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 34.5001284"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input
              type="text"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 69.0724087"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter image URL"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default: /images/restaurant/restaurant1.jpg
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Branch"}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview */}
      {formData.name && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Preview:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Slug:</strong> {formData.slug}</p>
            <p><strong>Location:</strong> {formData.location}</p>
            {formData.lat && <p><strong>Latitude:</strong> {formData.lat}</p>}
            {formData.lng && <p><strong>Longitude:</strong> {formData.lng}</p>}
            <p><strong>Image:</strong> {formData.image_url}</p>
          </div>
        </div>
      )}
    </div>
  );
}