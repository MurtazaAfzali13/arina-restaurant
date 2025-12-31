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

    if (profile.role === "admin") router.push("/");
    else router.push("/");
  };

  return (
    // 1. Background Image Wrapper
    <div className="relative min-h-screen w-full bg-[url('/images/login/restaurant-login.jpg')] bg-cover bg-center bg-no-repeat">
      
      {/* 2. Dark Overlay (Behind content, over image) */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content Wrapper (Ensures content is above overlay) */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {/* 3. Glassmorphism Container */}
        <div className="w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 transition-transform hover:scale-[1.01]">
          
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                tab === "signup"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-transparent"
                  : "bg-white/30 text-white hover:bg-white/40 border-white/20 backdrop-blur-sm"
              }`}
              onClick={() => setTab("signup")}
            >
              Signup
            </button>
            <button
              className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                tab === "login"
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg border-transparent"
                  : "bg-white/30 text-white hover:bg-white/40 border-white/20 backdrop-blur-sm"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
          </div>

          {/* Signup Form */}
          {tab === "signup" && (
            <div className="flex flex-col gap-4">
              <input
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={handleSignup}
              >
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <div className="flex flex-col gap-4">
              <input
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 shadow-sm"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                className="w-full bg-white/70 border border-white/50 backdrop-blur-sm p-4 rounded-xl placeholder-gray-600 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 shadow-sm"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button
                className="mt-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-4 rounded-xl hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}