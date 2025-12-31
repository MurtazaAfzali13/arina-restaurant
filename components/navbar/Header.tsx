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
  User,
  Package,
  Store,
  Users,
  Settings
} from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCart } from "@/Contexts/CartContext";
import { useUser } from "@/modules/food/hooks/useAdmin";

interface Branch {
  id: number;
  name: string;
  location?: string | null;
}

export default function Navbar() {
  // State برای مدیریت شعبه‌ها
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  
  // State برای dropdownها
  const [menuOpen, setMenuOpen] = useState(false);
  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBranchesOpen, setMobileBranchesOpen] = useState(false);
  const [mobileMenuDropdownOpen, setMobileMenuDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // استفاده از hook useUser
  const { 
    user, 
    profile, 
    isBranchAdmin, 
    isSuperAdmin, 
    loading: userLoading, 
    refreshProfile 
  } = useUser();

  // Refs
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const { state, dispatch } = useCart();
  const supabase = createClientComponentClient();

  // تشخیص شعبه فعلی از URL
  const getCurrentBranchId = () => {
    const match = pathname.match(/\/(\d+)(\/|$)/);
    return match ? match[1] : null;
  };

  const currentBranchId = getCurrentBranchId();
  
  // تعداد آیتم‌های شعبه فعلی
  const currentBranchItemCount = currentBranchId 
    ? state.branchCarts[Number(currentBranchId)]?.items.reduce(
        (sum, item) => sum + item.quantity, 0
      ) || 0
    : 0;

  // هندل کلیک روی شعبه
  const handleBranchClick = (branchId: number) => {
    router.push(`/${branchId}/menu`);
    setMobileOpen(false);
    setMenuOpen(false);
    setMobileMenuDropdownOpen(false);
  };

  // تابع logout بهبود یافته
  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // بستن تمام dropdownها
      setMenuOpen(false);
      setBranchesDropdownOpen(false);
      setMobileOpen(false);
      setMobileMenuDropdownOpen(false);
      setMobileBranchesOpen(false);

      // خروج از سیستم
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
        return;
      }

      // پاک کردن سبد خرید
      dispatch({ type: "CLEAR_ALL" });

      // رفرش کردن داده‌های کاربر
      await refreshProfile();
      
      // رفرش کردن cache صفحه
      router.refresh();

      // ریدایرکت به صفحه اصلی با تاخیر مختصر
      setTimeout(() => {
        router.push("/");
      }, 100);

    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // هندل اسکرول
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

  useEffect(() => {
    // لود شعبه‌ها
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

  useEffect(() => {
    // هندل کلیک خارج برای بستن dropdownها
    const handleClickOutside = (event: MouseEvent) => {
      // بستن dropdown منو دسکتاپ
      if (menuOpen && !(event.target as Element).closest('.menu-dropdown-container')) {
        setMenuOpen(false);
      }

      // بستن dropdown شعب دسکتاپ
      if (branchesDropdownOpen && !(event.target as Element).closest('.branches-dropdown-container')) {
        setBranchesDropdownOpen(false);
      }

      // بستن منوی موبایل اگر کلیک خارج باشد
      if (mobileOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
        setMobileMenuDropdownOpen(false);
        setMobileBranchesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, branchesDropdownOpen, mobileOpen]);

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

  // Loading state
  if (userLoading) {
    return (
      <nav className="fixed w-full z-50 bg-black/95 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">
          <Link href="/" className="cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo/menu-item-1.png"
                  alt="Ariana Feast Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Ariana Feast
              </div>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="lg:hidden">
            <div className="h-8 w-8 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-md shadow-xl" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 lg:px-8">

        {/* Logo */}
        <Link 
          href="/" 
          className="cursor-pointer group"
          onClick={() => {
            setMenuOpen(false);
            setBranchesDropdownOpen(false);
          }}
        >
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
              className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${pathname === item.href
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-white hover:text-emerald-300 hover:bg-white/5"
                }`}
              onClick={() => {
                setMenuOpen(false);
                setBranchesDropdownOpen(false);
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {/* User Info - فقط اگر user وجود داشته باشد */}
          {user && profile && (
            <>
              <Link
                href="/profile"
                className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${pathname === '/profile'
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-white hover:text-emerald-300 hover:bg-white/5"
                  }`}
                onClick={() => {
                  setMenuOpen(false);
                  setBranchesDropdownOpen(false);
                }}
              >
                <User size={18} className="mr-2" />
                My Profile
              </Link>

              {/* Orders nav item - role based */}
              {isBranchAdmin && profile?.branch_id != null ? (
                <Link
                  href={`/${profile.branch_id}/orders`}
                  className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${pathname === `/${profile.branch_id}/orders`
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-white hover:text-emerald-300 hover:bg-white/5"
                    }`}
                  onClick={() => {
                    setMenuOpen(false);
                    setBranchesDropdownOpen(false);
                  }}
                >
                  <Package size={18} className="mr-2" />
                  Manage Orders
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${pathname === '/orders'
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-white hover:text-emerald-300 hover:bg-white/5"
                    }`}
                  onClick={() => {
                    setMenuOpen(false);
                    setBranchesDropdownOpen(false);
                  }}
                >
                  <Package size={18} className="mr-2" />
                  My Orders
                </Link>
              )}
            </>
          )}

          {/* Branches Management Dropdown - فقط برای Super Admin */}
          {isSuperAdmin && (
            <div className="relative branches-dropdown-container">
              <button
                onClick={() => {
                  setBranchesDropdownOpen(!branchesDropdownOpen);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${branchesDropdownOpen
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${isLoggingOut
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
                }}
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>

          {/* Cart Button - Desktop */}
          {currentBranchId && (
            <Link
              href={`/${currentBranchId}/cart`}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              <ShoppingCart size={20} />
              <span className="text-sm font-semibold">Cart</span>
              {currentBranchItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                  {currentBranchItemCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Cart Button - Mobile */}
          {currentBranchId && (
            <Link
              href={`/${currentBranchId}/cart`}
              className="relative p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
            >
              <ShoppingCart size={22} />
              {currentBranchItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
                  {currentBranchItemCount}
                </span>
              )}
            </Link>
          )}

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
                onClick={() => setMobileMenuDropdownOpen(!mobileMenuDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <Box size={20} className="mr-3" />
                  <span className="font-medium">Menu</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${mobileMenuDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {mobileMenuDropdownOpen && (
                <div className="ml-8 space-y-1 border-l border-gray-800 pl-3">
                  {loadingBranches ? (
                    <div className="px-4 py-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : branches.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-gray-400">No branches</p>
                  ) : (
                    branches.map((branch) => (
                      <Link
                        key={branch.id}
                        href={`/${branch.id}/menu`}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileMenuDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <Store size={16} className="mr-3 text-emerald-400" />
                        <div className="text-left">
                          <div className="font-medium">{branch.name}</div>
                          {branch.location && (
                            <div className="text-xs text-gray-400">{branch.location}</div>
                          )}
                        </div>
                      </Link>
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
                }}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* User Profile Links - Mobile */}
            {user && profile && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                >
                  <User size={20} className="mr-3" />
                  <span className="font-medium">My Profile</span>
                </Link>

                {/* Orders nav item - role based (mobile) */}
                {isBranchAdmin && profile?.branch_id != null ? (
                  <Link
                    href={`/${profile.branch_id}/orders`}
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      setMobileOpen(false);
                    }}
                  >
                    <Package size={20} className="mr-3" />
                    <span className="font-medium">Manage Orders</span>
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      setMobileOpen(false);
                    }}
                  >
                    <Package size={20} className="mr-3" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                )}
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
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileBranchesOpen(false);
                      }}
                    >
                      <Settings size={16} className="mr-3 text-emerald-400" />
                      <span>Add New Branch</span>
                    </Link>

                    <Link
                      href="/dashboard/manage_branches"
                      className="flex items-center px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileBranchesOpen(false);
                      }}
                    >
                      <Store size={16} className="mr-3 text-blue-400" />
                      <span>Manage Branches</span>
                    </Link>

                    <Link
                      href="/dashboard/set_branch_admin"
                      className="flex items-center px-4 py-2.5 rounded-lg text-white hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileBranchesOpen(false);
                      }}
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
                    setMobileMenuDropdownOpen(false);
                    setMobileBranchesOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors cursor-pointer ${isLoggingOut
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