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
  Box,
  ShoppingCart,
  Building
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

  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBranchesOpen, setMobileBranchesOpen] = useState(false);
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

  const baseNavItems = [
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
  ];

  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

  // تابع برای بررسی وضعیت احراز هویت
  const checkAuth = async () => {
    try {

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {

    }
  };

  // تابع برای بارگذاری پروفایل
  const loadProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        return;
      }

      setProfile(profileData);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

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

  // گوش دادن به تغییرات وضعیت احراز هویت
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
    });

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



  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCartToggle = () => setCartOpen(prev => !prev);

  const removeFromCart = (id: number, branchId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, branchId } });
  };

  const isSuperAdmin = profile?.role === 'super_admin';



  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">

        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          <div className="flex justify-between items-center">
            <Image src="/images/logo/menu-item-1.png" alt="Logo" width={40} height={40} className="cursor-pointer" />
            <div className="text-xl font-bold text-white ml-4 cursor-pointer">Ariana Feast</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6 relative">



          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300 cursor-pointer"
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
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {branch.name}{branch.location ? ` (${branch.location})` : ""}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div>
            {user && (
              <Link
                href="/profile"
                className="px-3 py-2 font-semibold text-white hover:text-emerald-300 cursor-pointer"
              >
                My Profile
              </Link>
            )}
          </div>

          {/* Regular Menu Items */}
          {baseNavItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 font-semibold hover:text-emerald-300 text-white cursor-pointer ${pathname === item.href ? "text-emerald-300" : ""}`}
              onClick={() => {
                setMenuOpen(false);

                setBranchesDropdownOpen(false);
              }}
            >
              {item.name}
            </Link>
          ))}

          {/* Branches Management Dropdown - فقط برای Super Admin */}
          {isSuperAdmin && (
            <div className="relative">
              <button
                onClick={() => setBranchesDropdownOpen(prev => !prev)}
                className="flex items-center gap-1 px-3 py-2 font-semibold text-white hover:text-emerald-300 cursor-pointer"
              >
                <Building size={16} />
                Branches
                <ChevronDown size={16} />
              </button>

              {branchesDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-white text-black shadow-lg rounded-md z-50">
                  <Link
                    href="/dashboard/add_branch"
                    className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-200 cursor-pointer"
                    onClick={() => setBranchesDropdownOpen(false)}
                  >
                    <div className="font-medium">Add New Branch</div>
                    <div className="text-sm text-gray-500">Create a new branch</div>
                  </Link>

                  <Link
                    href="/dashboard/manage_branches"
                    className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-200 cursor-pointer"
                    onClick={() => setBranchesDropdownOpen(false)}
                  >
                    <div className="font-medium">Manage Branches</div>
                    <div className="text-sm text-gray-500">View, edit, and delete branches</div>
                  </Link>

                  <Link
                    href="/dashboard/set_branch_admin"
                    className="block px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setBranchesDropdownOpen(false)}
                  >
                    <div className="font-medium">Set Branch Admin</div>
                    <div className="text-sm text-gray-500">Assign admins to branches</div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={logout}
              className="px-3 py-2 font-semibold text-white cursor-pointer hover:text-emerald-300 flex items-center gap-1"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-2 font-semibold cursor-pointer text-white hover:text-emerald-300 flex items-center gap-1"
            >
              <LogIn size={16} /> Login
            </Link>
          )}

          {/* Cart Button - Desktop */}
          <div className="relative">
            <button
              onClick={handleCartToggle}
              className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20 cursor-pointer"
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
                            <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-lg object-cover cursor-pointer" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-sm text-gray-500 cursor-pointer">No image</div>
                          )}
                          <div className="flex flex-1 flex-col text-sm">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-gray-500">Qty: {item.quantity} · ${item.price.toFixed(2)}</span>
                          </div>
                          <button
                            className="text-xs font-semibold text-red-500 cursor-pointer"
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
                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 cursor-pointer"
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

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center space-x-4">
          {/* Cart Button - Mobile */}
          <div className="relative">
            <button
              onClick={handleCartToggle}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 cursor-pointer"
            >
              <ShoppingCart size={20} />
              {isClient && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="text-white cursor-pointer"
          >
            {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 text-white px-4 py-4 space-y-2">


          {/* Menu Dropdown - Mobile */}
          <div className="space-y-2">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300 w-full text-left cursor-pointer"
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
                      className="block w-full text-left px-3 py-2 hover:text-emerald-300 cursor-pointer"
                    >
                      {branch.name}{branch.location ? ` (${branch.location})` : ""}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Regular Menu Items - Mobile */}
          {baseNavItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 font-semibold hover:text-emerald-300 cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* User Profile - Mobile */}
          {user && (
            <Link
              href="/profile"
              className="block px-3 py-2 font-semibold hover:text-emerald-300 cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              My Profile
            </Link>
          )}

          {/* Branches Management - Mobile */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <button
                onClick={() => setMobileBranchesOpen(prev => !prev)}
                className="flex items-center gap-1 font-semibold px-3 py-2 text-white hover:text-emerald-300 w-full text-left cursor-pointer"
              >
                <Building size={16} />
                Branches Management
                <ChevronDown size={16} />
              </button>
              {mobileBranchesOpen && (
                <div className="ml-4 space-y-1">
                  <Link
                    href="/dashboard/add_branch"
                    className="block px-3 py-2 hover:text-emerald-300 cursor-pointer"
                    onClick={() => setMobileOpen(false)}
                  >
                    Add New Branch
                  </Link>
                  <Link
                    href="/dashboard/manage_branches"
                    className="block px-3 py-2 hover:text-emerald-300 cursor-pointer"
                    onClick={() => setMobileOpen(false)}
                  >
                    Manage Branches
                  </Link>
                  <Link
                    href="/dashboard/set_branch_admin"
                    className="block px-3 py-2 hover:text-emerald-300 cursor-pointer"
                    onClick={() => setMobileOpen(false)}
                  >
                    Set Branch Admin
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Login / Logout Mobile */}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="w-full px-3 py-2 font-semibold hover:text-emerald-300 flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 font-semibold hover:text-emerald-300 flex items-center gap-2 cursor-pointer"
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