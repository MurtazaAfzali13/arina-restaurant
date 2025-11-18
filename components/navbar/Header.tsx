'use client';

import { useEffect, useState } from "react";
import { Box, ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useCart } from "@/Contexts/CartContext";
import Logo from "@/public/images/logo/menu-item-1.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ اضافه شد
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useCart();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/1/menu" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const cities = [
    { id: 1, name: "Kabul" },
    { id: 2, name: "Herat" },
  ];

  useEffect(() => {
    setIsClient(true); // ✅ حالا badge فقط در کلاینت رندر می‌شود
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [pathname]);

  const handleCitySelect = (cityId: number) => {
    setCityOpen(false);
    router.push(`/${cityId}`);
  };

  const cartItems = state.items;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCartToggle = () => setCartOpen(prev => !prev);
  const removeFromCart = (id: number, branchId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, branchId } });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image src={Logo} alt="Logo" width={40} height={40} className="rounded-full object-cover" priority />
          <span className={`text-xl font-bold transition-colors duration-500 ${scrolled ? "text-white" : "text-gray-100"}`}>Ariana Feast</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 lg:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 font-semibold transition-colors duration-300 ${pathname === item.href ? "text-emerald-300" : scrolled ? "text-gray-200 hover:text-emerald-300" : "text-white hover:text-emerald-300"}`}
              >
                {item.name}
              </Link>
            ))}

            {/* City Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCityOpen(!cityOpen)}
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
          </div>

          {/* Cart Dropdown */}
          <div className="relative">
            <button
              onClick={handleCartToggle}
              className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20"
            >
              <Box size={20} />
              <span className="hidden text-sm font-semibold lg:inline">Cart</span>
              {isClient && totalItems > 0 && ( // ✅ فقط روی کلاینت
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
                          <button className="text-xs font-semibold text-red-500" onClick={() => removeFromCart(item.id, item.branchId)}>Remove</button>
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
                      <Link href="/cart" className="mt-3 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700" onClick={() => setCartOpen(false)}>Review order</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none lg:hidden">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`lg:hidden transition-all duration-300 ${scrolled ? "bg-black" : "bg-black/50"}`}>
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="px-3 py-2 font-semibold text-white hover:text-emerald-300">{item.name}</Link>
            ))}
            <Link href="/cart" onClick={() => setIsOpen(false)} className="px-3 py-2 font-semibold text-white hover:text-emerald-300">My Cart</Link>

            {/* Mobile City Selection */}
            <div className="mt-2 flex flex-col gap-1">
              {cities.map(city => (
                <button key={city.id} className="px-3 py-2 font-semibold text-white hover:text-emerald-300 text-left" onClick={() => handleCitySelect(city.id)}>{city.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
