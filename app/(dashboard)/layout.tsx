// app/(dashboard)/layout.tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { AgriBoostToaster } from "@/components/ui/Toast";
import type { Profile } from "@/lib/database.types";
import {
  type LucideIcon,
  Crown,
  BadgeCheck,
  LayoutDashboard,
  User,
  Wallet,
  Sparkles,
  ShoppingBag,
  Package,
  LogOut,
  Menu,
  X,
  Tractor,
  Tag,
  CheckSquare,
  ChevronRight,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import InstallPrompt from "@/components/ui/InstallPrompt";
import { registerPushSubscription } from "@/lib/idb/pushSubscription";

// ── Nav Items ─────────────────────────────────────────────────────────────
const navSections: Array<{
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: LucideIcon;
    desc: string;
  }>;
}> = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Overview" },
      { name: "My Farms", href: "/farms", icon: Tractor, desc: "Manage Land & Crops" },
      { name: "Tasks", href: "/tasks", icon: CheckSquare, desc: "Care Schedule" },
    ],
  },
  {
    title: "MARKET & SALES",
    items: [
      { name: "My Listings", href: "/my-listings", icon: Tag, desc: "Produce Ads" },
      { name: "Orders & Sales", href: "/orders", icon: Package, desc: "Escrow & Delivery" },
      { name: "Marketplace", href: "/marketplace", icon: ShoppingBag, desc: "Sell Produce" },
    ],
  },
  {
    title: "TOOLS & FINANCE",
    items: [
      { name: "AI Center", href: "/ai-center", icon: Sparkles, desc: "Disease Diagnostics" },
      { name: "Finances", href: "/finances", icon: Wallet, desc: "Wallet & Earnings" },
      { name: "My Profile", href: "/profile", icon: User, desc: "Account Settings" },
    ],
  },
];

// ── Sidebar Component ──────────────────────────────────────────────────────
function Sidebar({
  isOpen,
  setIsOpen,
  profile,
  profileLoading,
  user,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  profile: Profile | null;
  profileLoading: boolean;
  user: { id: string; email?: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName = profileLoading
    ? "Farmer"
    : profile?.firstname
      ? `${profile.firstname}${profile.lastname ? ` ${profile.lastname}` : ""}`
      : "Farmer";

  const initials = profileLoading
    ? "F"
    : profile?.firstname
      ? `${profile.firstname.charAt(0)}${profile.lastname?.charAt(0) || ""}`.toUpperCase()
      : (user?.email?.charAt(0).toUpperCase() || "F");

  const isPremium = profile?.subscription_tier === "premium";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar navigation */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-white border-r border-zinc-200/90 shadow-xs
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-2xs group-hover:bg-emerald-700 transition-colors">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 tracking-tight">AgriBoost</p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-none">Farmer Hub</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-800 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors border-l-2 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-950 font-semibold border-emerald-600 pl-[10px] shadow-2xs"
                          : "text-zinc-600 border-transparent hover:text-emerald-700 hover:bg-emerald-50/60"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-600"
                        }`}
                      />
                      <span className="truncate flex-1">{item.name}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Subscription callout + user footer */}
        <div className="border-t border-zinc-100 p-3 space-y-3">
          {isPremium ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/90 p-2.5 flex items-center gap-2 text-emerald-900 shadow-2xs">
              <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-950">5-Star Pro Member</p>
                <p className="text-[10px] text-emerald-700 truncate">All features unlocked</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-zinc-900 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold">Pro Farm Plan</span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2 leading-tight">
                AI diagnosis &amp; priority market ads
              </p>
              <Link
                href="/upgrade"
                onClick={() => setIsOpen(false)}
                className="block text-center py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-2xs transition-colors active:scale-95"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* User profile & sign-out */}
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900 truncate">{displayName}</p>
              <p className="text-[10px] text-emerald-600 font-medium truncate">
                {isPremium ? "Premium Farmer" : "Free Farmer"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Main Dashboard Layout ──────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setProfileLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser || cancelled) {
        setProfileLoading(false);
        return;
      }

      if (!cancelled) {
        setUser(authUser);
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, firstname, lastname, subscription_tier, avatar_url")
        .eq("id", authUser.id)
        .single();

      if (!cancelled) {
        setProfile(data ?? null);
        setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const mobileAvatarLetter = profile?.firstname
    ? profile.firstname.charAt(0).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() || "F");

  // Push subscription registration
  useEffect(() => {
    registerPushSubscription().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* PWA Install Prompt Banner */}
      <InstallPrompt />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        profile={profile}
        profileLoading={profileLoading}
        user={user}
      />
      <AgriBoostToaster />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center shadow-2xs">
              <Image
                src="/icons/logo.png"
                alt="AgriBoost"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">AgriBoost</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user?.id} />
            <Link href="/profile" className="flex items-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold">
                {mobileAvatarLetter}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}

