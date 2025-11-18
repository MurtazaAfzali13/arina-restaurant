"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "customer";
  phone?: string;
  branch_id?: number | null;
}

export default function AdminPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching profile:", error?.message);
        router.push("/auth");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!profile || profile.role !== "admin") {
    return <p className="p-6 text-red-500">Access Denied. Admins only.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {profile.full_name}!</p>
      <p>Email: {profile.email}</p>
      <p>Branch ID: {profile.branch_id ?? "Not assigned"}</p>
    </div>
  );
}
