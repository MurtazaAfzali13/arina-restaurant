"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleSignup = async () => {
    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName, phone }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Signup successful! Please login.");
      setTab("login");
    } else {
      alert(data.message);
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      alert("Login failed.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      alert("Failed to fetch profile.");
      return;
    }

    if (profile.role === "super_admin" || profile.role === "branch_admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-700 to-blue-800 overflow-hidden">

      {/* Add animation styles in a style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Desktop Image - Full page background with animation */}
      <img
        src="/images/login/login2.jpg"
        alt="Desktop Background"
        className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none animate-float"
      />

      {/* Mobile Image - Bottom positioned with animation */}
      <img
        src="/images/login/login1.jpg"
        alt="Mobile Background"
        className="block md:hidden absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none animate-float"
      />


      {/* Glass Form */}
      <div className="relative w-full max-w-md p-8 rounded-3xl 
        bg-white/1
        backdrop-blur-xl 
        border border-white/30 
        shadow-2xl 
        transition-all duration-500 
        hover:scale-[1.02] 
        hover:bg-white/15
        z-10">

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className={`py-3 px-8 rounded-2xl font-bold transition-all duration-300 ${tab === "signup"
                ? "bg-white/10 text-white shadow-lg backdrop-blur-sm"
                : "bg-white/10 text-gray-900 hover:bg-white/30"
              }`}
            onClick={() => setTab("signup")}
          >
            Signup
          </button>
          <button
            className={`py-3 px-8 rounded-2xl font-bold transition-all duration-300 ${tab === "login"
                ? "bg-white/40 text-white shadow-lg backdrop-blur-sm"
                : "bg-white/20 text-gray-700 hover:bg-white/30"
              }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
        </div>

        {/* Signup */}
        {tab === "signup" && (
          <div className="flex flex-col gap-4">
            <input
              className="bg-white/20 border border-white/40 text-gray-600 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="bg-white/20 border border-white/40 text-gray-600 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="bg-white/20 border border-white/40 text-gray-600 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="bg-white/20 border border-white/40 text-gray-600 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              className="bg-blue-700 hover:bg-white/50 text-gray-600 font-bold py-3 rounded-xl transition-all shadow-lg backdrop-blur-sm"
              onClick={handleSignup}
            >
              Register
            </button>
          </div>
        )}

        {/* Login */}
        {tab === "login" && (
          <div className="flex flex-col gap-4">
            <input
              className="bg-white/20 border border-white/40 text-gray-900 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              className="bg-white/20 border border-white/40 text-gray-600 placeholder-white/70 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button
              className="bg-blue-700 hover:bg-white/50 text-gray-300 font-bold py-3 rounded-xl transition-all shadow-lg backdrop-blur-sm"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}