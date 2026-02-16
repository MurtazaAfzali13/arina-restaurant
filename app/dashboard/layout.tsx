"use client";

import { ReactNode, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sidebar } from "./components/Sidebar";
import { Menu as MenuIcon, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-800 pt-24">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-600 bg-slate-800/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 shadow-sm hover:bg-slate-600"
          >
            <MenuIcon className="h-4 w-4" />
            Menu
          </button>
          <div className="text-sm font-semibold text-slate-100">
            {pathname === "/dashboard"
              ? "Dashboard"
              : pathname?.split("/").pop()?.replace(/^[a-z]/, (c) => c.toUpperCase())}
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <Sidebar onLogout={onLogout} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 pb-12 md:pl-72">{children}</main>
    </div>
  );
}
