"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu as MenuIcon, X } from "lucide-react";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

export default function Navbar() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "#" }, // Dropdown روی Menu
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const cities = [
    { id: 1, name: "Kabul" },
    { id: 2, name: "Herat" },
  ];

  // بررسی Scroll
  useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

  // بارگذاری Branch ها
  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const res = await fetch("/api/branches");
        if (!res.ok) throw new Error("Failed to fetch branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.error(err);
        setBranches([]);
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

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-black shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">
        {/* Logo */}
        <div className="text-xl font-bold text-white">Ariana Feast</div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6 relative">
          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityOpen(prev => !prev)}
              className="flex items-center gap-1 px-3 py-2 font-semibold text-white hover:text-emerald-300"
            >
              Select City <ChevronDown size={16} />
            </button>
            {cityOpen && (
              <div className="absolute mt-2 w-40 rounded-md bg-white text-black shadow-lg z-50">
                {cities.map(city => (
                  <button
                    key={city.id}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleCitySelect(city.id)}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Items */}
          {navItems.map(item =>
            item.name === "Menu" ? (
              <div key={item.name} className="relative">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300"
                >
                  {item.name} <ChevronDown size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white text-black shadow-lg rounded-md z-50">
                    {loadingBranches ? (
                      <p className="p-3">Loading...</p>
                    ) : branches.length === 0 ? (
                      <p className="p-3">No branches found</p>
                    ) : (
                      branches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => handleBranchClick(branch.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {branch.name} {branch.location ? `(${branch.location})` : ""}
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
                className={`px-3 py-2 font-semibold hover:text-emerald-300 text-white ${
                  pathname === item.href ? "text-emerald-300" : ""
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="lg:hidden text-white"
        >
          {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 text-white px-4 py-4 space-y-2">
          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityOpen(prev => !prev)}
              className="flex items-center justify-between w-full px-3 py-2 font-semibold hover:text-emerald-300"
            >
              Select City <ChevronDown size={16} />
            </button>
            {cityOpen && (
              <div className="mt-2 space-y-1">
                {cities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Items Mobile */}
          {navItems.map(item =>
            item.name === "Menu" ? (
              <div key={item.name}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="flex items-center justify-between w-full px-3 py-2 font-semibold hover:text-emerald-300"
                >
                  {item.name} <ChevronDown size={16} />
                </button>
                {menuOpen && (
                  <div className="mt-2 space-y-1">
                    {loadingBranches
                      ? <p className="px-3 py-2">Loading...</p>
                      : branches.map(branch => (
                          <button
                            key={branch.id}
                            onClick={() => handleBranchClick(branch.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md"
                          >
                            {branch.name} {branch.location ? `(${branch.location})` : ""}
                          </button>
                        ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 font-semibold hover:text-emerald-300"
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
