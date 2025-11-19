"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  Menu as MenuIcon,
  X,
  LogOut,
  LogIn,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  const cities = [
    { id: 1, name: "Kabul" },
    { id: 2, name: "Herat" },
  ];

  const navItems = [
    { name: "Menu", href: "#" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  // Scroll Effect
  useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

  // Fetch Supabase User Session
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    }

    loadUser();

    // Real-time session listener
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  // Fetch Branches From API
  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const res = await fetch("/api/branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, []);

  const handleBranchClick = (branchId: number) => {
    setMenuOpen(false);
    router.push(`/${branchId}/menu`);
  };

  const handleCitySelect = (cityId: number) => {
    setCityOpen(false);
    router.push(`/${cityId}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">
        <Link href="/">
          <div className="flex justify-between items-center">
            <Image src="/images/logo/menu-item-1.png" alt="Logo" width={40} height={40} className="" />

            {/* Logo */}
            <div className="text-xl font-bold text-white ml-4">Ariana Feast</div>
          </div>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6 relative">
          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-2 font-semibold text-white hover:text-emerald-300"
            >
              Select City <ChevronDown size={16} />
            </button>
            {cityOpen && (
              <div className="absolute mt-2 w-40 rounded-md bg-white text-black shadow-lg z-50">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Dropdown */}
          {navItems.map((item) =>
            item.name === "Menu" ? (
              <div key={item.name} className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300"
                >
                  Menu <ChevronDown size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white text-black shadow-lg rounded-md z-50">
                    {loadingBranches ? (
                      <p className="p-3">Loading...</p>
                    ) : (
                      branches.map((branch) => (
                        <button
                          key={branch.id}
                          onClick={() => handleBranchClick(branch.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {branch.name}
                          {branch.location ? ` (${branch.location})` : ""}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 font-semibold hover:text-emerald-300 text-white ${pathname === item.href ? "text-emerald-300" : ""
                  }`}
              >
                {item.name}
              </Link>
            )
          )}

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={logout}
              className="px-3 py-2 font-semibold text-white hover:text-emerald-300 flex items-center gap-1"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 font-semibold text-white hover:text-emerald-300 flex items-center gap-1"
            >
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden text-white"
        >
          {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 text-white px-4 py-4 space-y-2">

          {/* Login / Logout Mobile */}
          {user ? (
            <button
              onClick={logout}
              className="w-full px-3 py-2 font-semibold hover:text-emerald-300 flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 font-semibold hover:text-emerald-300 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
