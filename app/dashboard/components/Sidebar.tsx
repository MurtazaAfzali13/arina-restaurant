"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingBag,
  UtensilsCrossed,
  X as CloseIcon,
  LogOut,
  Building2,
  Store,
  PlusCircle,
  Users,
} from "lucide-react";
import { classNames } from "../utils/classNames";
import { useUser } from "@/modules/food/hooks/useAdmin";

type SidebarProps = {
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function Sidebar({ onLogout, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { isSuperAdmin, isBranchAdmin, loading: userLoading } = useUser();

  // Role-aware main nav: Super Admin vs Branch Manager (reuse existing routes)
  const mainNavItems: NavItem[] = [];
  mainNavItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  if (isSuperAdmin) {
    mainNavItems.push({ href: "/dashboard/foods", label: "Food Management", icon: UtensilsCrossed });
    mainNavItems.push({ href: "/dashboard/manage_branches", label: "Manage Branches", icon: Store });
    mainNavItems.push({ href: "/dashboard/set_branch_admin", label: "Manage Branch Managers", icon: Users });
  }
  if (isBranchAdmin) {
    mainNavItems.push({ href: "/dashboard/foods", label: "Food Management", icon: UtensilsCrossed });
    mainNavItems.push({ href: "/add_items", label: "Add Food", icon: PlusCircle });
  }
  // Shared: Orders and Analytics (data is already filtered by role on each page)
  mainNavItems.push({ href: "/dashboard/orders", label: "Orders", icon: ShoppingBag });
  mainNavItems.push({ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 });

  const branchesSectionItems: NavItem[] = isSuperAdmin
    ? [
        { href: "/dashboard/manage_branches", label: "Manage Branches", icon: Store },
        { href: "/dashboard/add_branch", label: "Add Branch", icon: PlusCircle },
      ]
    : [];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href) ?? false;

  const navContent = (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="rounded-2xl bg-slate-700/80 border border-slate-600/50 p-4 shadow-sm">
        <div className="text-sm text-slate-400">Arina Restaurant</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">Management</div>
        <div className="mt-2 text-xs text-slate-500">Branch & admin dashboard</div>
      </div>

      <nav className="mt-6 space-y-1">
        {!userLoading &&
          mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={classNames(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-600/80 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-600/50 hover:text-slate-100"
                )}
              >
                <Icon
                  className={classNames(
                    "h-5 w-5",
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

        {/* Branches section: Super Admin only */}
        {!userLoading && branchesSectionItems.length > 0 && (
          <>
            <div className="mt-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Branches
            </div>
            {branchesSectionItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={classNames(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-600/80 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-600/50 hover:text-slate-100"
                  )}
                >
                  <Icon
                    className={classNames(
                      "h-5 w-5",
                      active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <button
        onClick={() => {
          onCloseMobile();
          onLogout();
        }}
        className="group mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600/50 hover:text-slate-100"
      >
        <LogOut className="h-5 w-5 text-slate-400 group-hover:text-slate-200" />
        <span className="truncate">Logout</span>
      </button>

      <div className="mt-auto pt-6 text-xs text-slate-500">
        <div className="rounded-xl bg-slate-700/50 border border-slate-600/50 p-3">
          <div className="font-medium text-slate-400">Tip</div>
          <div className="mt-1 text-slate-500">Analytics gives you order & revenue trends.</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-600/50 bg-slate-800 md:block">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-800 border-r border-slate-600 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-600 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <MenuIcon className="h-4 w-4" />
                Menu
              </div>
              <button
                onClick={onCloseMobile}
                className="rounded-xl border border-slate-600 bg-slate-700 p-2 text-slate-200 hover:bg-slate-600"
                aria-label="Close sidebar"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
