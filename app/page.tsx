// app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link'; // Import the Link component

// --- ICONS ---
const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" />
    <path d="M11 20A7 7 0 0 1 4 13V8" />
    <path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" />
  </svg>
);
const BarChartIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);
const ShoppingCartIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const DollarSignIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <LeafIcon className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">AgriBoost</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <Link href="/marketplace" className="text-gray-600 hover:text-green-600 transition-colors">Marketplace</Link>
            <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center space-x-4">
            {/* CORRECTED LINKS */}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2787&auto=format&fit=crop')"}}></div>
            <div className="relative container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                    Empowering Farmers with <span className="text-green-600">Smart Technology</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    Monitor crop growth, get AI-driven insights, and sell your produce directly on our marketplace. Join the future of farming today.
                </p>
                <Link href="/signup" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all">
                    Create Your Virtual Farm
                </Link>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">A Complete Toolkit for Modern Farming</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">From planting to selling, AgriBoost provides the tools you need to succeed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6"><LeafIcon className="h-8 w-8" /></div>
                <h3 className="text-xl font-bold mb-3">AI Crop Care</h3>
                <p className="text-gray-600">Receive personalized routines, disease detection, and fertilizer guides to maximize your yield.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6"><BarChartIcon className="h-8 w-8" /></div>
                <h3 className="text-xl font-bold mb-3">Growth Analytics</h3>
                <p className="text-gray-600">Monitor your farm&apos;s performance with easy-to-understand dashboards and reports.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6"><ShoppingCartIcon className="h-8 w-8" /></div>
                <h3 className="text-xl font-bold mb-3">Direct Marketplace</h3>
                <p className="text-gray-600">List your harvest and sell directly to buyers, cutting out the middleman and increasing profits.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6"><DollarSignIcon className="h-8 w-8" /></div>
                <h3 className="text-xl font-bold mb-3">Financial Tools</h3>
                <p className="text-gray-600">Access equipment funding, loans, and investment opportunities to grow your farming business.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="about" className="py-20 bg-green-700 text-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your Harvest?</h2>
                <p className="text-lg text-green-100 max-w-3xl mx-auto mb-8">
                    Become part of a growing community of forward-thinking farmers in Ghana.
                    Sign up in minutes and start managing your farm like never before.
                </p>
                <Link href="/signup" className="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all">
                    Sign Up for Free
                </Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">AgriBoost</h4>
              <p className="text-gray-400">The future of farming technology.</p>
              <p className="text-gray-400 mt-2">Kumasi, Ashanti Region, Ghana</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul>
                <li className="mb-2"><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
                <li className="mb-2"><Link href="/login" className="hover:text-green-400 transition-colors">Sign In</Link></li>
                <li className="mb-2"><Link href="/signup" className="hover:text-green-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul>
                <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
                <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul>
                <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
                <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AgriBoost. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
