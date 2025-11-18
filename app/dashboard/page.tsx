"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/auth"); // اگر لاگین نکرده → Login
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        router.push("/auth"); // خطا → Login
        return;
      }

      setProfile(data);

      // ریدایرکت به Admin فقط داخل useEffect
      if (data.role === "admin") {
        router.push("/admin");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!profile) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p>Welcome, {profile.full_name}!</p>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
    </div>
  );
}
