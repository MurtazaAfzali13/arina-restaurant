'use client';

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
  Box
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/Contexts/CartContext";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

interface CartItem {
  id: number;
  branchId: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name?: string;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { state, dispatch } = useCart();
  const cartItems: CartItem[] = state.items;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cities = [
    { id: 1, name: "Kabul" },
    { id: 2, name: "Herat" },
  ];

  // آیتم‌های منوی اصلی
  const baseNavItems = [
    { name: "Menu", href: "#" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
  ];

  // آیتم مخصوص Super Admin
  const adminNavItem = { 
    name: "Set Branch Admin", 
    href: "/dashboard/set_branch_admin" 
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll effect
  useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

  // دریافت کاربر و پروفایل
  useEffect(() => {
    async function loadUserAndProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      setUser(currentUser || null);

      if (currentUser) {
        // دریافت پروفایل کاربر
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, email, role, full_name")
          .eq("id", currentUser.id)
          .single();
        
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    }

    loadUserAndProfile();

    // گوش دادن به تغییرات وضعیت احراز هویت
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser || null);

        if (currentUser) {
          // دریافت پروفایل کاربر
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, email, role, full_name")
            .eq("id", currentUser.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load branches
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
    setProfile(null);
    router.push("/");
  };

  const handleCartToggle = () => setCartOpen(prev => !prev);

  const removeFromCart = (id: number, branchId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, branchId } });
  };

  // بررسی آیا کاربر Super Admin است
  const isSuperAdmin = profile?.role === 'super_admin';

  // ترکیب آیتم‌های منو بر اساس نقش کاربر
  const navItems = isSuperAdmin 
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">

        {/* Logo */}
        <Link href="/">
          <div className="flex justify-between items-center">
            <Image src="/images/logo/menu-item-1.png" alt="Logo" width={40} height={40} />
            <div className="text-xl font-bold text-white ml-4">Ariana Feast</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6 relative">

          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCityOpen(prev => !prev)}
              className="flex items-center gap-1 px-3 py-2 font-semibold text-white hover:text-emerald-300"
            >
              Select Branch <ChevronDown size={16} />
            </button>
            {cityOpen && (
              <div className="absolute mt-2 w-40 rounded-md bg-white text-black shadow-lg z-50">
                {cities.map(city => (
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

          {/* Menu Items */}
          {navItems.map(item =>
            item.name === "Menu" ? (
              <div key={item.name} className="relative">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300"
                >
                  Menu <ChevronDown size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute top-full mt-2 w-48 bg-white text-black shadow-lg rounded-md z-50">
                    {loadingBranches ? (
                      <p className="p-3">Loading...</p>
                    ) : (
                      branches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => handleBranchClick(branch.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {branch.name}{branch.location ? ` (${branch.location})` : ""}
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
                className={`px-3 py-2 font-semibold hover:text-emerald-300 text-white ${pathname === item.href ? "text-emerald-300" : ""}`}
                onClick={() => {
                  setMenuOpen(false);
                  setCityOpen(false);
                }}
              >
                {item.name}
              </Link>
            )
          )}

          {/* Login / Logout - بدون نمایش نام کاربر */}
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

          {/* Cart Button */}
          <div className="relative">
            <button
              onClick={handleCartToggle}
              className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20"
            >
              <Box size={20} />
              <span className="hidden text-sm font-semibold lg:inline">Cart</span>
              {isClient && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {cartOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white p-4 text-gray-900 shadow-2xl z-[60]">
                <h3 className="mb-3 text-lg font-bold">Your box</h3>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500">Cart is empty.</p>
                ) : (
                  <>
                    <ul className="max-h-64 space-y-3 overflow-y-auto pr-2">
                      {cartItems.map(item => (
                        <li key={`${item.id}-${item.branchId}`} className="flex items-center gap-3 rounded-xl bg-gray-100 p-3">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-sm text-gray-500">No image</div>
                          )}
                          <div className="flex flex-1 flex-col text-sm">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-gray-500">Qty: {item.quantity} · ${item.price.toFixed(2)}</span>
                          </div>
                          <button
                            className="text-xs font-semibold text-red-500"
                            onClick={() => removeFromCart(item.id, item.branchId)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 border-t pt-3 text-sm">
                      <div className="flex justify-between font-semibold">
                        <span>Total items</span>
                        <span>{totalItems}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-800">
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <Link
                        href="/cart"
                        onClick={() => setCartOpen(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                      >
                        Review order
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

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
          {/* Mobile Menu Items */}
          {navItems.map(item =>
            item.name === "Menu" ? (
              <div key={item.name} className="space-y-2">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300 w-full text-left"
                >
                  Menu <ChevronDown size={16} />
                </button>
                {menuOpen && (
                  <div className="ml-4 space-y-1">
                    {loadingBranches ? (
                      <p className="p-2">Loading...</p>
                    ) : (
                      branches.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => {
                            handleBranchClick(branch.id);
                            setMobileOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 hover:text-emerald-300"
                        >
                          {branch.name}{branch.location ? ` (${branch.location})` : ""}
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
                className="block px-3 py-2 font-semibold hover:text-emerald-300"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            )
          )}

          {/* Login / Logout Mobile - بدون نمایش اطلاعات کاربر */}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
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