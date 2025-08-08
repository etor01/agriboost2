// app/(dashboard)/layout.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

// --- ICONS ---
const MenuIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const XIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

const LogOutIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

// Sidebar Navigation Links
const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Profile', href: '/profile' },
  { name: 'Finances', href: '/finances' },
  { name: 'AI Center', href: '/ai-center' },
];

// Sidebar Component
function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Image alt="leaf icon" src="/icons/logo.png" width={40} height={40} />
            <span className="text-2xl font-bold">AgriBoost</span>
          </Link>
           <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-700">
          <button onClick={handleSignOut} className="flex w-full items-center px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
            <LogOutIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// Main Layout Component
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <header className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
            <button onClick={() => setSidebarOpen(true)}>
                <MenuIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
               <Image alt="leaf icon" src="/icons/logo.png" width={35} height={35} />
                <span className="text-xl font-bold text-gray-800">AgriBoost</span>
            </div>
            <div className="w-6"></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
