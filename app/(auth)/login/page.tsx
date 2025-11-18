"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const router = useRouter();

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
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-transform hover:scale-[1.02]">
        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-8 relative">
          <button
            className={`py-3 px-8 rounded-2xl font-bold transition-all duration-300 ${
              tab === "signup"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-black shadow-lg"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
            onClick={() => setTab("signup")}
          >
            Signup
          </button>
          <button
            className={`py-3 px-8 rounded-2xl font-bold transition-all duration-300 ${
              tab === "login"
                ? "bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
        </div>

        {/* Signup Form */}
        {tab === "signup" && (
          <div className="flex flex-col gap-5">
            <input
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-black font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg"
              onClick={handleSignup}
            >
              Register
            </button>
          </div>
        )}

        {/* Login Form */}
        {tab === "login" && (
          <div className="flex flex-col gap-5">
            <input
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              className="border border-gray-300 p-4 rounded-xl font-bold text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-green-400 to-green-600 text-black font-bold py-4 rounded-xl hover:from-green-500 hover:to-green-700 transition-colors shadow-lg"
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
