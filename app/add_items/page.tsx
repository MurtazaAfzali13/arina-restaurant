'use client';

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin";
import ImagePicker from "@/modules/food/components/ImagePicker";
import CategoryDropdown from "@/components/CatagoriesDropDown";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AddFoodItem() {
  const { user, profile, isBranchAdmin, loading, refreshProfile } = useUser();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const formRef = useRef<HTMLFormElement>(null);

  const [category, setCategory] = useState("All");
  const [imageKey, setImageKey] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        console.log("Auth check:", { user, profile, isBranchAdmin, loading });
        
        // First check session directly
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Direct session check:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          router.replace("/login");
          return;
        }
        
        // Then check profile
        if (!profile) {
          console.log("No profile, refreshing...");
          await refreshProfile();
          return;
        }
        
        // Check role
        if (!isBranchAdmin) {
          console.log("Not branch admin, redirecting");
          router.replace("/");
          return;
        }
        
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [loading, user, profile, isBranchAdmin, router, refreshProfile, supabase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Form submission started");
    
    if (!formRef.current) {
      console.error("Form ref is null");
      alert("Form error: Form not found");
      return;
    }
    
    setLoadingSubmit(true);

    try {
      // 1. Check session first
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("Current session in submit:", {
        hasSession: !!session,
        userId: session?.user?.id,
        tokenLength: session?.access_token?.length
      });

      if (!session) {
        alert('Please login again.');
        router.push('/login');
        return;
      }

      // 2. Prepare form data - FIXED: Use formRef instead of event
      const form = formRef.current;
      const formData = new FormData(form);
      formData.set("category", category);
      
      if (profile?.branch_id) {
        formData.set("branch_id", String(profile.branch_id));
      } else {
        alert('Error: Branch ID not found');
        return;
      }

      // 3. Log data for debugging
      const formDataEntries: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log("Sending form data:", formDataEntries);

      // 4. Send request
      console.log("Calling API...");
      const startTime = Date.now();
      
      const res = await fetch("/api/add_items", {
        method: "POST",
        body: formData,
      });

      const endTime = Date.now();
      console.log(`API response time: ${endTime - startTime}ms`);
      
      const result = await res.json();
      console.log("API Response:", {
        status: res.status,
        ok: res.ok,
        result
      });

      if (!res.ok) {
        throw new Error(result.error || `Error with code ${res.status}`);
      }

      alert(result.message || "Meal added successfully!");
      form.reset();
      setCategory("All");
      setImageKey((prev) => prev + 1);
      
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingSubmit(false);
    }
  }

  // Show loading
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center bg-gray-900 min-h-screen p-6">
        <div className="max-w-lg w-full rounded-lg bg-gray-700 p-6 text-white">
          <div className="text-center">
            <p className="mb-4">Checking access...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // If auth check is complete and user is branch admin
  return (
    <div className="flex justify-center bg-gray-900 min-h-screen p-6">
      <form
        ref={formRef}
        key={imageKey}
        onSubmit={handleSubmit}
        className="max-w-lg w-full space-y-6 rounded-lg bg-gray-700 p-6 text-white"
      >
        <h1 className="text-2xl font-bold text-center">Add Meal</h1>
        <p className="text-center text-sm text-gray-300">
          Branch: {profile?.branch_id} | Role: Branch Admin
        </p>

        <div>
          <label className="block mb-2 text-sm">Meal Name *</label>
          <input
            name="name"
            placeholder="Enter meal name"
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Description</label>
          <textarea
            name="description"
            placeholder="Enter meal description"
            className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Price (Toman) *</label>
          <input
            name="price"
            type="number"
            step="1"
            min="0"
            placeholder="Enter price"
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <CategoryDropdown category={category} setCategory={setCategory} />

        <div>
          <label className="block mb-2 text-sm">Branch *</label>
          <input
            type="text"
            value={`Branch ${profile?.branch_id}`}
            disabled
            className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-gray-400"
          />
          <input
            type="hidden"
            name="branch_id"
            value={profile?.branch_id || ""}
          />
        </div>

        <ImagePicker key={imageKey} name="image" />

        <div className="pt-4 border-t border-gray-600">
          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full rounded-lg bg-green-600 py-3 font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSubmit ? "Submitting..." : "Add Meal"}
          </button>
        </div>

        <div className="text-xs text-gray-400 pt-4 border-t border-gray-700">
          <p>* Required fields</p>
          <p className="mt-1">Branch ID: {profile?.branch_id}</p>
          <p>User ID: {user?.id}</p>
        </div>
      </form>
    </div>
  );
}