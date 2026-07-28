'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminProfile, AdminLevel } from '@/lib/admin';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Star,
  Shield,
  Sparkles,
  Settings,
  Activity,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Crown,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  levels: AdminLevel[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Nav Definition ───────────────────────────────────────────────────────────

const ALL_LEVELS: AdminLevel[] = ['super_admin', 'moderator', 'support'];
const MOD_AND_ABOVE: AdminLevel[] = ['super_admin', 'moderator'];
const SUPER_ONLY: AdminLevel[] = ['super_admin'];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, levels: ALL_LEVELS },
      { name: 'Activity Log', href: '/admin/activity', icon: Activity, levels: ALL_LEVELS },
    ],
  },
  {
    title: 'USERS',
    items: [
      { name: 'Farmers', href: '/admin/farmers', icon: Users, levels: MOD_AND_ABOVE },
      { name: 'Buyers', href: '/admin/buyers', icon: ShoppingBag, levels: MOD_AND_ABOVE },
      { name: 'Support Chat', href: '/admin/support', icon: MessageSquare, levels: ALL_LEVELS },
      { name: 'Admin Team', href: '/admin/team', icon: Shield, levels: SUPER_ONLY },
    ],
  },
  {
    title: 'MARKETPLACE',
    items: [
      { name: 'Orders & Disputes', href: '/admin/orders', icon: ShoppingCart, levels: MOD_AND_ABOVE },
      { name: 'AI Diagnostics', href: '/admin/diagnostics', icon: Sparkles, levels: MOD_AND_ABOVE },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: CreditCard, levels: SUPER_ONLY },
      { name: 'Subscriptions', href: '/admin/subscriptions', icon: Star, levels: SUPER_ONLY },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings, levels: SUPER_ONLY },
    ],
  },
];

// ── Level meta helpers ───────────────────────────────────────────────────────

function getLevelStyle(level: AdminLevel) {
  switch (level) {
    case 'super_admin':
      return { label: 'Super Admin', text: 'text-amber-400', bg: 'bg-amber-400/10 border border-amber-400/30' };
    case 'moderator':
      return { label: 'Moderator', text: 'text-blue-400', bg: 'bg-blue-400/10 border border-blue-400/30' };
    case 'support':
      return { label: 'Support', text: 'text-purple-400', bg: 'bg-purple-400/10 border border-purple-400/30' };
    default:
      return { label: 'Admin', text: 'text-gray-400', bg: 'bg-gray-400/10 border border-gray-400/30' };
  }
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({
  isOpen,
  setIsOpen,
  adminProfile,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  adminProfile: AdminProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const adminLevel = adminProfile?.admin_level ?? 'moderator';
  const levelStyle = getLevelStyle(adminLevel);
  const initials =
    `${adminProfile?.firstname?.[0] ?? ''}${adminProfile?.lastname?.[0] ?? ''}`.toUpperCase() || 'A';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Filter sections and items based on current admin level
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.levels.includes(adminLevel)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-gray-950 border-r border-gray-800/60
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">AgriBoost</p>
              <p className="text-[10px] text-gray-500 leading-none">Admin Panel</p>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Level Badge */}
        {adminLevel === 'super_admin' && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-400/5 border border-amber-400/20 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Super Admin Access</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-extrabold tracking-widest text-gray-600 uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin/dashboard'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                        ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                      {/* Super-admin only indicator */}
                      {item.levels.length === 1 && item.levels[0] === 'super_admin' && (
                        <Crown className="w-3 h-3 text-amber-500/60 ml-auto flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Identity Footer */}
        <div className="border-t border-gray-800/60 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              {adminProfile?.avatar_url ? (
                <img src={adminProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {adminProfile?.firstname} {adminProfile?.lastname}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${levelStyle.bg} ${levelStyle.text}`}>
                {levelStyle.label}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Main Shell ───────────────────────────────────────────────────────────────

export default function AdminShell({
  children,
  adminProfile,
}: {
  children: React.ReactNode;
  adminProfile: AdminProfile | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} adminProfile={adminProfile} />

      {/* Main content area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-gray-950 border-b border-gray-800/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
          <div className="w-5" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
