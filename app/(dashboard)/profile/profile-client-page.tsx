// app/(dashboard)/profile/profile-client-page.tsx
// NOTE: All Supabase logic commented out — MVP demo with dummy interactive frontend

// --- ORIGINAL SUPABASE LOGIC COMMENTED OUT ---
// import { createClient } from '@/lib/supabase/client';
// const supabase = createClient();
// const handleUpdate = async () => { await supabase.from('profiles').update(...) }
// const handleAddFarm = async (farmData) => { await supabase.from('farms').insert(...) }
// const handleUploadVerification = async () => { await supabase.storage.from('verification_docs').upload(...) }

"use client";

import React, { useState } from "react";
import Link from "next/link";

// ── Dummy Data ─────────────────────────────────────────────────────
const DUMMY_PROFILE = {
  id: "demo-user-001",
  full_name: "Kwame Asante",
  email: "kwame.asante@agriboost.gh",
  phone_number: "+233 24 456 7890",
  region: "Ashanti Region",
  bio: "Passionate smallholder farmer with 12 years of experience growing maize, cassava, and yam in the Ashanti region. Committed to sustainable and profitable farming.",
  verification_status: "verified",
  avatar_url: "https://i.pravatar.cc/150?img=52",
  member_since: "January 2024",
  total_sales: "GH₵ 18,450",
  rating: 4.8,
  reviews: 34,
};

const DUMMY_FARMS = [
  { id: "farm-1", name: "Asante North Farm", location: "Ejisu, Ashanti", size_in_acres: 12, crop: "Maize & Cassava", status: "Active" },
  { id: "farm-2", name: "Volta Valley Plot", location: "Ho, Volta Region", size_in_acres: 5, crop: "Tomatoes & Pepper", status: "Active" },
  { id: "farm-3", name: "Brong Highlands", location: "Sunyani, Brong-Ahafo", size_in_acres: 8, crop: "Yam & Cocoyam", status: "Dormant" },
];

const DUMMY_LISTINGS = [
  { id: "listing-1", title: "White Maize (50kg bag)", price: "GH₵ 180", qty: 24, status: "active" },
  { id: "listing-2", title: "Cassava (Fresh, 50kg)", price: "GH₵ 95", qty: 40, status: "active" },
  { id: "listing-3", title: "Pona Yam (per tuber)", price: "GH₵ 25", qty: 60, status: "sold_out" },
];

// ── Reusable Glass Card ────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function ProfileClientPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [farms, setFarms] = useState(DUMMY_FARMS);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Form state for personal details
  const [fullName, setFullName] = useState(DUMMY_PROFILE.full_name);
  const [phone, setPhone] = useState(DUMMY_PROFILE.phone_number);
  const [bio, setBio] = useState(DUMMY_PROFILE.bio);
  const [region, setRegion] = useState(DUMMY_PROFILE.region);

  const handleSaveProfile = () => {
    setSavedMsg("✅ Profile updated successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const TABS = [
    { id: "personal", label: "Personal Details", emoji: "👤" },
    { id: "farms", label: "My Farms", emoji: "🚜" },
    { id: "listings", label: "My Listings", emoji: "📦" },
    { id: "settings", label: "Settings", emoji: "⚙️" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-emerald-600 font-semibold">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">My Profile</h1>
      </div>

      {/* Profile Hero Card */}
      <GlassCard className="overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/features.jpg')", backgroundSize: "cover" }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <img
                src={DUMMY_PROFILE.avatar_url}
                alt={DUMMY_PROFILE.full_name}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                ✓ Verified
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900">{fullName}</h2>
              <p className="text-gray-500 text-sm">{DUMMY_PROFILE.email}</p>
              <p className="text-gray-400 text-xs mt-0.5">📍 {region} · Member since {DUMMY_PROFILE.member_since}</p>
            </div>
            <div className="flex gap-3 sm:mb-1">
              <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-lg font-extrabold text-emerald-700">{DUMMY_PROFILE.total_sales}</p>
                <p className="text-xs text-gray-500">Total Sales</p>
              </div>
              <div className="text-center px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-lg font-extrabold text-amber-600">⭐ {DUMMY_PROFILE.rating}</p>
                <p className="text-xs text-gray-500">{DUMMY_PROFILE.reviews} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs + Content */}
      <GlassCard className="overflow-hidden">
        {/* Tab Bar */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-4 pt-4 gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Personal Details Tab */}
          {activeTab === "personal" && (
            <div className="max-w-xl space-y-5">
              <h3 className="text-base font-bold text-gray-800 mb-1">Personal Information</h3>
              {savedMsg && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">
                  {savedMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                  <input
                    type="email" value={DUMMY_PROFILE.email} disabled
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Region</label>
                  <select
                    value={region} onChange={e => setRegion(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  >
                    {["Ashanti Region","Greater Accra","Volta Region","Northern Region","Eastern Region","Western Region","Brong-Ahafo","Central Region","Upper East","Upper West"].map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bio</label>
                <textarea
                  value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm resize-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95 text-sm"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Farms Tab */}
          {activeTab === "farms" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Manage Your Farms ({farms.length})</h3>
                <button
                  onClick={() => setShowAddFarm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95"
                >
                  + Add Farm
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map(farm => (
                  <Link key={farm.id} href={`/farm/${farm.id}`}>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                        🌾
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{farm.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">📍 {farm.location}</p>
                        <p className="text-xs text-gray-500">🌿 {farm.crop}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-gray-700">{farm.size_in_acres} acres</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${farm.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {farm.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-300 text-lg flex-shrink-0">›</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === "listings" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Active Listings ({DUMMY_LISTINGS.length})</h3>
                <Link href="/marketplace" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all">
                  + New Listing
                </Link>
              </div>
              <div className="space-y-3">
                {DUMMY_LISTINGS.map(l => (
                  <div key={l.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{l.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{l.price} · {l.qty} units left</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${l.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                      {l.status === "active" ? "● Active" : "Sold Out"}
                    </span>
                    <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Verification Status</h3>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-bold text-emerald-800">Your account is Verified</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Your identity has been confirmed by our team.</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: "Email notifications", desc: "Receive order and weather alerts via email", on: true },
                    { label: "SMS alerts", desc: "Get critical farm alerts via SMS", on: true },
                    { label: "Marketplace updates", desc: "Notify when listing receives an inquiry", on: false },
                  ].map(n => (
                    <div key={n.label} className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{n.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${n.on ? "bg-emerald-500" : "bg-gray-200"}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${n.on ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Account Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-left">
                    🔑 Change Password
                  </button>
                  <button className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors text-left">
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Farm Modal */}
      {showAddFarm && (
        <AddFarmModal
          onClose={() => setShowAddFarm(false)}
          onAdd={(farm) => {
            setFarms(prev => [...prev, farm]);
            setShowAddFarm(false);
            setActiveTab("farms");
          }}
        />
      )}
    </div>
  );
}

// ── Add Farm Modal ─────────────────────────────────────────────────
function AddFarmModal({ onClose, onAdd }: { onClose: () => void; onAdd: (farm: typeof DUMMY_FARMS[0]) => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [acres, setAcres] = useState("");
  const [crop, setCrop] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !acres) return;
    onAdd({
      id: `farm-${Date.now()}`,
      name,
      location,
      size_in_acres: parseFloat(acres),
      crop: crop || "Mixed Crops",
      status: "Active",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">🚜 Add New Farm</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Farm Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Asante North Farm"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Ejisu, Ashanti"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Size (Acres) *</label>
              <input type="number" value={acres} onChange={e => setAcres(e.target.value)} required min="0.1" step="0.1" placeholder="e.g. 5"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Primary Crop</label>
              <input type="text" value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g. Maize"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95">
              Add Farm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
