// app/(dashboard)/layout.tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { AgriBoostToaster } from "@/components/ui/Toast";
import {
  type LucideIcon,
  Crown,
  BadgeCheck,
  Home,
  UserCircle2,
  Wallet,
  Sparkles,
  ShoppingBag,
  Package,
  LogOut,
  Menu,
  X,
  Tractor,
  Tag,
  ClipboardList,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

// ── Nav Items ──────────────────────────────────────────────────────
const navItems: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
  desc: string;
}> = [
  { name: "Dashboard", href: "/dashboard", icon: Home, desc: "Overview" },
  { name: "My Profile", href: "/profile", icon: UserCircle2, desc: "Account" },
  { name: "My Farms", href: "/farms", icon: Tractor, desc: "Manage Land" },
  { name: "Tasks", href: "/tasks", icon: ClipboardList, desc: "To-do List" },
  { name: "My Listings", href: "/my-listings", icon: Tag, desc: "Produce Ads" },
  { name: "Orders & Sales", href: "/orders", icon: Package, desc: "Escrow OTPs" },
  { name: "Finances", href: "/finances", icon: Wallet, desc: "Earnings" },
  {
    name: "AI Center",
    href: "/ai-center",
    icon: Sparkles,
    desc: "Smart Tools",
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    desc: "Sell Produce",
  },
];

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Dynamic profile state
  const [profile, setProfile] = useState<{
    firstname: string | null;
    lastname: string | null;
    subscription_tier: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setProfileLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setProfileLoading(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('firstname, lastname, subscription_tier')
        .eq('id', user.id)
        .single();
      if (!cancelled) {
        setProfile(data ?? null);
        setProfileLoading(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName = profileLoading
    ? null
    : profile?.firstname
      ? `${profile.firstname}${profile.lastname ? ` ${profile.lastname}` : ''}`
      : 'Farmer';

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'F';
  const tierLabel =
    !profileLoading && profile?.subscription_tier
      ? profile.subscription_tier.charAt(0).toUpperCase() +
        profile.subscription_tier.slice(1) +
        ' Plan'
      : 'Free Plan';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-2xl">
          <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-gray-100/80">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Image
                  src="/icons/logo.png"
                  alt="AgriBoost"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-base font-bold text-gray-900">
                  AgriBoost
                </span>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                  Farm Dashboard
                </p>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
                (item.href === "/farms" && pathname.startsWith("/farm"));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-emerald-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p
                        className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white/70 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pb-6 space-y-3 border-t border-gray-100/80 pt-4">
            {!profileLoading && profile?.subscription_tier === 'premium' ? (
            // Premium member badge
            <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-4 text-white shadow-lg shadow-amber-200 flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Premium Member</p>
                <p className="text-[10px] text-white/80 mt-0.5">All features unlocked ✓</p>
              </div>
            </div>
          ) : (
            // Upgrade prompt for free users
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white shadow-lg shadow-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4" />
                <p className="text-xs font-bold">Upgrade to Pro</p>
              </div>
              <p className="text-[11px] text-white/80 mb-3">
                Unlock AI crop analysis &amp; premium market insights
              </p>
              <button className="w-full py-1.5 rounded-lg bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow">
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0">
                {profileLoading ? (
                  <>
                    <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse mb-1.5" />
                    <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{tierLabel}</p>
                  </>
                )}
              </div>
              <NotificationBell userId={profile?.id} />
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/30 via-white/60 to-green-900/20 -z-10" />

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <AgriBoostToaster />

      <div className="lg:pl-72">
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user?.id} />
            <Link href="/profile" className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow">
                {user?.email?.charAt(0).toUpperCase() || "F"}
              </div>
            </Link>
          </div>
          <div className="w-10" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
