'use client';

import { useEffect, useState, useRef } from "react";
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
  Building,
  Camera,
  GalleryVertical,
  User,
  Package,
  Home,
  Store,
  Users,
  Settings
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  const { state, dispatch } = useCart();
  const cartItems: CartItem[] = state.items;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const navItems = [
    { 
      name: "About", 
      href: "/about", 
      icon: <Users size={18} className="mr-2" />
    },
    { 
      name: "Gallery", 
      href: "/gallery", 
      icon: <Camera size={18} className="mr-2" />
    },
  ];

  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

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
    }
  };

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

  useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

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

  // هندل کلیک خارج برای بستن dropdownها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // بستن dropdown منو
      if (menuOpen && !(event.target as Element).closest('.menu-dropdown-container')) {
        setMenuOpen(false);
      }
      
      // بستن dropdown شعب
      if (branchesDropdownOpen && !(event.target as Element).closest('.branches-dropdown-container')) {
        setBranchesDropdownOpen(false);
      }
      
      // بستن سبد خرید اگر کلیک خارج از آن باشد
      if (cartOpen && cartRef.current && !cartRef.current.contains(event.target as Node) && 
          cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
      
      // بستن منوی موبایل اگر کلیک خارج باشد
      if (mobileOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, branchesDropdownOpen, cartOpen, mobileOpen]);

  const handleBranchClick = (branchId: number) => {
    setMenuOpen(false);
    setMobileOpen(false);
    router.push(`/${branchId}/menu`);
  };

  // تابع logout بهبود یافته
  const logout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // بستن تمام dropdownها
      setMenuOpen(false);
      setBranchesDropdownOpen(false);
      setCartOpen(false);
      setMobileOpen(false);
      
      // خروج از سیستم
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
        return;
      }
      
      // پاک کردن state
      setUser(null);
      setProfile(null);
      
      // ریدایرکت به صفحه اصلی
      router.push("/");
      router.refresh(); // رفرش صفحه برای به روز رسانی state
      
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCartToggle = () => {
    setCartOpen(prev => !prev);
    // بستن دیگر dropdownها
    setMenuOpen(false);
    setBranchesDropdownOpen(false);
  };

  const removeFromCart = (id: number, branchId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, branchId } });
  };

  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-md shadow-xl" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="cursor-pointer group" onClick={() => {
          setMenuOpen(false);
          setBranchesDropdownOpen(false);
          setCartOpen(false);
        }}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image 
                src="/images/logo/menu-item-1.png" 
                alt="Ariana Feast Logo" 
                width={40} 
                height={40} 
                className="rounded-lg transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Ariana Feast
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 relative">

          {/* Menu Dropdown */}
          <div className="relative menu-dropdown-container">
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setBranchesDropdownOpen(false);
                setCartOpen(false);
              }}
              className="flex items-center gap-2 font-semibold px-4 py-2.5 rounded-lg text-white hover:text-emerald-300 hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <Box size={18} />
              Menu
              <ChevronDown size={16} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full mt-2 left-0 min-w-64 bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-xl z-50 overflow-hidden">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Select Branch
                  </div>
                  {loadingBranches ? (
                    <div className="px-4 py-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                      <p className="mt-2 text-sm text-gray-400">Loading branches...</p>
                    </div>
                  ) : branches.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">No branches available</p>
                  ) : (
                    branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchClick(branch.id)}
                        className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors duration-150 cursor-pointer group"
                      >
                        <Store size={16} className="mr-3 text-gray-400 group-hover:text-emerald-400" />
                        <div>
                          <div className="font-medium text-white group-hover:text-emerald-300">
                            {branch.name}
                          </div>
                          {branch.location && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {branch.location}
                            </div>
                          )}
                        </div>
                        <ChevronDown size={16} className="ml-auto -rotate-90 text-gray-600" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Regular Menu Items */}
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                pathname === item.href 
                  ? "text-emerald-400 bg-emerald-400/10" 
                  : "text-white hover:text-emerald-300 hover:bg-white/5"
              }`}
              onClick={() => {
                setMenuOpen(false);
                setBranchesDropdownOpen(false);
                setCartOpen(false);
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {/* User Info */}
          {user && (
            <>
              <Link
                href="/profile"
                className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  pathname === '/profile'
                    ? "text-emerald-400 bg-emerald-400/10" 
                    : "text-white hover:text-emerald-300 hover:bg-white/5"
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  setBranchesDropdownOpen(false);
                  setCartOpen(false);
                }}
              >
                <User size={18} className="mr-2" />
                My Profile
              </Link>
              
              <Link
                href="/orders"
                className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  pathname === '/orders'
                    ? "text-emerald-400 bg-emerald-400/10" 
                    : "text-white hover:text-emerald-300 hover:bg-white/5"
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  setBranchesDropdownOpen(false);
                  setCartOpen(false);
                }}
              >
                <Package size={18} className="mr-2" />
                My Orders
              </Link>
            </>
          )}

          {/* Branches Management Dropdown - فقط برای Super Admin */}
          {isSuperAdmin && (
            <div className="relative branches-dropdown-container">
              <button
                onClick={() => {
                  setBranchesDropdownOpen(!branchesDropdownOpen);
                  setMenuOpen(false);
                  setCartOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  branchesDropdownOpen
                    ? "text-emerald-400 bg-emerald-400/10" 
                    : "text-white hover:text-emerald-300 hover:bg-white/5"
                }`}
              >
                <Building size={18} />
                Branches
                <ChevronDown size={16} className={`transition-transform duration-200 ${branchesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {branchesDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-xl z-50 overflow-hidden">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Branch Management
                    </div>
                    
                    <Link
                      href="/dashboard/add_branch"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors duration-150 cursor-pointer group"
                      onClick={() => setBranchesDropdownOpen(false)}
                    >
                      <div className="mr-3 p-2 bg-emerald-500/10 rounded-lg">
                        <Settings size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-emerald-300">
                          Add New Branch
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Create a new branch
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/manage_branches"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors duration-150 cursor-pointer group"
                      onClick={() => setBranchesDropdownOpen(false)}
                    >
                      <div className="mr-3 p-2 bg-blue-500/10 rounded-lg">
                        <Store size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-emerald-300">
                          Manage Branches
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          View, edit, and delete branches
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/set_branch_admin"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-800 rounded-lg transition-colors duration-150 cursor-pointer group"
                      onClick={() => setBranchesDropdownOpen(false)}
                    >
                      <div className="mr-3 p-2 bg-purple-500/10 rounded-lg">
                        <Users size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-emerald-300">
                          Set Branch Admin
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Assign admins to branches
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login / Logout */}
          <div className="ml-2">
            {user ? (
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  isLoggingOut 
                    ? "opacity-70 cursor-not-allowed" 
                    : "text-white hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    Logout
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  setBranchesDropdownOpen(false);
                  setCartOpen(false);
                }}
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>

          {/* Cart Button - Desktop */}
          <div className="relative">
            <button
              ref={cartButtonRef}
              onClick={handleCartToggle}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
            >
              <ShoppingCart size={20} />
              <span className="text-sm font-semibold">Cart</span>
              {isClient && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>

            {cartOpen && (
              <div 
                ref={cartRef}
                className="absolute right-0 top-full mt-3 w-96 rounded-2xl bg-gray-900 border border-gray-800 p-6 text-white shadow-2xl z-[60]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    Your Shopping Cart
                  </h3>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <Box size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-1">Add items from the menu to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                      {cartItems.map(item => (
                        <div 
                          key={`${item.id}-${item.branchId}`} 
                          className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-4 hover:bg-gray-800 transition-colors"
                        >
                          <div className="relative h-16 w-16 flex-shrink-0">
                            {item.imageUrl ? (
                              <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                width={64} 
                                height={64} 
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-gray-700 flex items-center justify-center">
                                <Box size={24} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-gray-400">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-emerald-400 font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ${item.price.toFixed(2)} each
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.branchId)}
                            className="ml-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-800">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Items</span>
                          <span className="text-white">{totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-emerald-400 font-semibold">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-3">
                        <Link
                          href="/cart"
                          onClick={() => setCartOpen(false)}
                          className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer"
                        >
                          View Cart
                        </Link>
                        <Link
                          href="/checkout"
                          onClick={() => setCartOpen(false)}
                          className="flex-1 text-center py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          Checkout
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Cart Button - Mobile */}
          <div className="relative">
            <button
              ref={cartButtonRef}
              onClick={handleCartToggle}
              className="relative p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg cursor-pointer"
            >
              <ShoppingCart size={22} />
              {isClient && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Cart Dropdown */}
            {cartOpen && (
              <div 
                ref={cartRef}
                className="fixed inset-x-4 top-20 mt-2 rounded-2xl bg-gray-900 border border-gray-800 p-4 text-white shadow-2xl z-[60] max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    Your Cart
                  </h3>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="py-6 text-center">
                    <Box size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cartItems.map(item => (
                        <div 
                          key={`${item.id}-${item.branchId}`} 
                          className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3"
                        >
                          <div className="relative h-14 w-14 flex-shrink-0">
                            {item.imageUrl ? (
                              <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                width={56} 
                                height={56} 
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-gray-700 flex items-center justify-center">
                                <Box size={20} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-emerald-400 font-semibold text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.branchId)}
                            className="p-1.5 text-gray-400 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Items</span>
                          <span className="text-white">{totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total</span>
                          <span className="text-emerald-400 font-semibold">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <Link
                          href="/cart"
                          onClick={() => {
                            setCartOpen(false);
                            setMobileOpen(false);
                          }}
                          className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold cursor-pointer"
                        >
                          Go to Cart
                        </Link>
                        <Link
                          href="/checkout"
                          onClick={() => {
                            setCartOpen(false);
                            setMobileOpen(false);
                          }}
                          className="w-full text-center py-3 rounded-xl bg-gray-800 text-white font-semibold cursor-pointer"
                        >
                          Checkout
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800"
        >
          <div className="px-4 py-3 space-y-1">
            
            {/* Menu Dropdown - Mobile */}
            <div className="space-y-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <Box size={20} className="mr-3" />
                  <span className="font-medium">Menu</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuOpen && (
                <div className="ml-8 space-y-1 border-l border-gray-800 pl-3">
                  {loadingBranches ? (
                    <div className="px-4 py-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : branches.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-gray-400">No branches</p>
                  ) : (
                    branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchClick(branch.id)}
                        className="flex items-center w-full px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <Store size={16} className="mr-3 text-emerald-400" />
                        <div className="text-left">
                          <div className="font-medium">{branch.name}</div>
                          {branch.location && (
                            <div className="text-xs text-gray-400">{branch.location}</div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Regular Menu Items - Mobile */}
            {navItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => {
                  setMobileOpen(false);
                  setCartOpen(false);
                }}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* User Profile Links - Mobile */}
            {user && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    setMobileOpen(false);
                    setCartOpen(false);
                  }}
                >
                  <User size={20} className="mr-3" />
                  <span className="font-medium">My Profile</span>
                </Link>
                
                <Link
                  href="/orders"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    setMobileOpen(false);
                    setCartOpen(false);
                  }}
                >
                  <Package size={20} className="mr-3" />
                  <span className="font-medium">My Orders</span>
                </Link>
              </>
            )}

            {/* Branches Management - Mobile */}
            {isSuperAdmin && (
              <div className="space-y-1">
                <button
                  onClick={() => setMobileBranchesOpen(!mobileBranchesOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <Building size={20} className="mr-3" />
                    <span className="font-medium">Branches Management</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${mobileBranchesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileBranchesOpen && (
                  <div className="ml-8 space-y-1 border-l border-gray-800 pl-3">
                    <Link
                      href="/dashboard/add_branch"
                      className="flex items-center px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings size={16} className="mr-3 text-emerald-400" />
                      <span>Add New Branch</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/manage_branches"
                      className="flex items-center px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Store size={16} className="mr-3 text-blue-400" />
                      <span>Manage Branches</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/set_branch_admin"
                      className="flex items-center px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Users size={16} className="mr-3 text-purple-400" />
                      <span>Set Branch Admin</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Login / Logout Mobile */}
            <div className="pt-2 border-t border-gray-800 mt-2">
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isLoggingOut 
                      ? "opacity-70 cursor-not-allowed text-gray-400" 
                      : "text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400 mr-3"></div>
                      <span className="font-medium">Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={20} className="mr-3" />
                      <span className="font-medium">Logout</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  onClick={() => {
                    setMobileOpen(false);
                    setCartOpen(false);
                  }}
                >
                  <LogIn size={20} className="mr-3" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}