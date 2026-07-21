// app/(dashboard)/profile/profile-client-page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  MapPin,
  Package,
  Settings2,
  Sprout,
  Tractor,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileState = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  region: string;
  bio: string;
  verification_status: string;
  avatar_url: string | null;
  member_since: string;
  total_sales: string;
  rating: number;
  reviews: number;
};

type FarmState = {
  id: string;
  name: string;
  location: string;
  size_in_acres: number | null;
  crop: string;
  status: string;
};

type ListingState = {
  id: string;
  title: string;
  price: string;
  qty: number;
  status: string;
};

const FALLBACK_PROFILE: ProfileState = {
  id: "",
  first_name: "Farmer",
  last_name: "",
  full_name: "Farmer",
  email: "",
  phone: "",
  region: "Not set",
  bio: "No bio added yet.",
  verification_status: "pending",
  avatar_url: null,
  member_since: "Recently joined",
  total_sales: "GH₵ 0.00",
  rating: 4.8,
  reviews: 0,
};

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-emerald-100/80 bg-white/85 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-emerald-500/10 via-white/70 to-teal-400/10" />
      <div className="relative">{children}</div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `GH₵ ${value.toFixed(2)}`;
}

export default function ProfileClientPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [farms, setFarms] = useState<FarmState[]>([]);
  const [listings, setListings] = useState<ListingState[]>([]);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(FALLBACK_PROFILE);
  const [firstName, setFirstName] = useState(FALLBACK_PROFILE.first_name);
  const [lastName, setLastName] = useState(FALLBACK_PROFILE.last_name);
  const [phone, setPhone] = useState(FALLBACK_PROFILE.phone);
  const [bio, setBio] = useState(FALLBACK_PROFILE.bio);
  const [region, setRegion] = useState(FALLBACK_PROFILE.region);
  const [supabaseClient] = useState(() => createClient());

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        setError("Please sign in to view your profile.");
        setIsLoading(false);
        return;
      }

      const [profileRes, farmsRes, listingsRes] = await Promise.all([
        supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
        supabaseClient
          .from("farms")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("market_listings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!isMounted) return;

      const profileRow = profileRes.data as Record<string, unknown> | null;
      const farmRows = (farmsRes.data ?? []) as Array<Record<string, unknown>>;
      const listingRows = (listingsRes.data ?? []) as Array<
        Record<string, unknown>
      >;

      const firstNameValue =
        (profileRow?.firstname as string | undefined) ??
        (profileRow?.first_name as string | undefined) ??
        (user.user_metadata?.first_name as string | undefined) ??
        (user.user_metadata?.firstname as string | undefined) ??
        "";
      const lastNameValue =
        (profileRow?.lastname as string | undefined) ??
        (profileRow?.last_name as string | undefined) ??
        (user.user_metadata?.last_name as string | undefined) ??
        (user.user_metadata?.lastname as string | undefined) ??
        "";
      const fullNameValue =
        [firstNameValue, lastNameValue].filter(Boolean).join(" ") ||
        ((profileRow?.full_name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email ??
          FALLBACK_PROFILE.full_name);

      const mappedProfile: ProfileState = {
        id: user.id,
        first_name: firstNameValue,
        last_name: lastNameValue,
        full_name: fullNameValue,
        email: user.email ?? "",
        phone:
          (profileRow?.phone as string | undefined) ??
          (user.user_metadata?.phone as string | undefined) ??
          "",
        region:
          (profileRow?.region as string | undefined) ??
          (user.user_metadata?.region as string | undefined) ??
          FALLBACK_PROFILE.region,
        bio:
          (profileRow?.bio as string | undefined) ??
          (user.user_metadata?.bio as string | undefined) ??
          FALLBACK_PROFILE.bio,
        verification_status:
          (profileRow?.verification_status as string | undefined) ??
          (profileRow?.verified_status as string | undefined) ??
          (user.user_metadata?.verified_status as string | undefined) ??
          FALLBACK_PROFILE.verification_status,
        avatar_url:
          (profileRow?.avatar_url as string | undefined) ??
          (user.user_metadata?.avatar_url as string | undefined) ??
          null,
        member_since: user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-GH", {
              month: "long",
              year: "numeric",
            })
          : FALLBACK_PROFILE.member_since,
        total_sales: formatCurrency(
          listingRows.reduce((sum, item) => sum + Number(item.price ?? 0), 0),
        ),
        rating: 4.8,
        reviews: listingRows.length * 2,
      };

      setProfile(mappedProfile);
      setFirstName(mappedProfile.first_name);
      setLastName(mappedProfile.last_name);
      setPhone(mappedProfile.phone);
      setBio(mappedProfile.bio);
      setRegion(mappedProfile.region);
      setFarms(
        farmRows.map((farm) => ({
          id: String(farm.id ?? ""),
          name: String(farm.name ?? "Unnamed farm"),
          location: String(farm.location ?? "Location not set"),
          size_in_acres: Number(farm.size_in_acres ?? 0),
          crop: String(farm.crop ?? farm.crop_type ?? "Mixed Crops"),
          status: String(
            farm.status ?? (farm.is_active ? "Active" : "Inactive"),
          ),
        })),
      );
      setListings(
        listingRows.map((listing) => ({
          id: String(listing.id ?? ""),
          title: String(listing.title ?? listing.name ?? "Listing"),
          price: formatCurrency(Number(listing.price ?? 0)),
          qty: Number(listing.quantity_available ?? 0),
          status: String(listing.status ?? "active"),
        })),
      );
      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSavedMsg("");

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      setSavedMsg("You need to sign in before updating your profile.");
      setIsSaving(false);
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullNameValue = [trimmedFirstName, trimmedLastName]
      .filter(Boolean)
      .join(" ");

    const { error } = await supabaseClient.from("profiles").upsert({
      id: user.id,
      firstname: trimmedFirstName,
      lastname: trimmedLastName,
      phone: phone,
      region,
      bio,
      role: "farmer",
    });

    if (error) {
      setSavedMsg(`Unable to save your changes right now. ${error.message}`);
    } else {
      setProfile((prev) => ({
        ...prev,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        full_name: fullNameValue,
        phone: phone,
        region,
        bio,
      }));
      setSavedMsg("✅ Profile updated successfully!");
    }

    setIsSaving(false);
  };

  const TABS = [
    { id: "personal", label: "Personal Details", icon: UserCircle2 },
    { id: "farms", label: "My Farms", icon: Tractor },
    { id: "listings", label: "My Listings", icon: Package },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  const verificationLabel = profile.verification_status
    ? "Verified"
    : "Pending review";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || profile.full_name;
  const totalListingsValue = listings.reduce(
    (sum, listing) => sum + Number(listing.price.replace(/[^0-9.-]+/g, "")),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-emerald-600 font-semibold">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
          My Profile
        </h1>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <GlassCard className="overflow-hidden">
        <div className="">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/features.jpg')",
              backgroundSize: "cover",
            }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <img
                src={profile.avatar_url ?? "/icons/logo.png"}
                alt={profile.full_name}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" /> {verificationLabel}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {displayName}
              </h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {region} · Member since{" "}
                {profile.member_since}
              </p>
            </div>
            <div className="flex gap-3 sm:mb-1">
              <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-lg font-extrabold text-emerald-700">
                  {formatCurrency(totalListingsValue)}
                </p>
                <p className="text-xs text-gray-500">Listings Value</p>
              </div>
              <div className="text-center px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-lg font-extrabold text-amber-600">
                  ⭐ {profile.rating}
                </p>
                <p className="text-xs text-gray-500">
                  {profile.reviews} reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 px-4 pt-4 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "personal" && (
            <div className="max-w-xl space-y-5">
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Personal Information
              </h3>
              {savedMsg && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">
                  {savedMsg}
                </div>
              )}
              {isLoading ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  Loading your information...
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
                  >
                    {[
                      "Ashanti Region",
                      "Greater Accra",
                      "Volta Region",
                      "Northern Region",
                      "Eastern Region",
                      "Western Region",
                      "Brong-Ahafo",
                      "Central Region",
                      "Upper East",
                      "Upper West",
                    ].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm resize-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "farms" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">
                  Manage Your Farms ({farms.length})
                </h3>
                <button
                  onClick={() => setShowAddFarm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95"
                >
                  + Add Farm
                </button>
              </div>
              {farms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  No farms have been added yet. Create one to start tracking
                  your land.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.map((farm) => (
                    <Link key={farm.id} href={`/farm/${farm.id}`}>
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                          <Sprout className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {farm.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            📍 {farm.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            🌿 {farm.crop}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-gray-700">
                              {farm.size_in_acres} acres
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${farm.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                            >
                              {farm.status}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-300 text-lg flex-shrink-0">
                          ›
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">
                  My Listings ({listings.length})
                </h3>
                <Link
                  href="/marketplace"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all"
                >
                  + New Listing
                </Link>
              </div>
              {listings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  You do not have any marketplace listings yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {listing.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {listing.price} · {listing.qty} units left
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${listing.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                      >
                        {listing.status === "active" ? "● Active" : "Sold Out"}
                      </span>
                      <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">
                  Verification Status
                </h3>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-800">
                      Your account is {verificationLabel}
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      We use this status to show trust signals across the
                      marketplace.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">
                  Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Email notifications",
                      desc: "Receive order and weather alerts via email",
                      on: true,
                    },
                    {
                      label: "SMS alerts",
                      desc: "Get critical farm alerts via SMS",
                      on: true,
                    },
                    {
                      label: "Marketplace updates",
                      desc: "Notify when listing receives an inquiry",
                      on: false,
                    },
                  ].map((n) => (
                    <div
                      key={n.label}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {n.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${n.on ? "bg-emerald-500" : "bg-gray-200"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${n.on ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">
                  Account Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-left flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Change Password
                  </button>
                  <button className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors text-left flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {showAddFarm && (
        <AddFarmModal
          onClose={() => setShowAddFarm(false)}
          onAdd={(farm) => {
            setFarms((prev) => [...prev, farm]);
            setShowAddFarm(false);
            setActiveTab("farms");
          }}
        />
      )}
    </div>
  );
}

function AddFarmModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (farm: FarmState) => void;
}) {
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Tractor className="h-5 w-5 text-emerald-600" /> Add New Farm
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Farm Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Asante North Farm"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Ejisu, Ashanti"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Size (Acres) *
              </label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                required
                min="0.1"
                step="0.1"
                placeholder="e.g. 5"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Primary Crop
              </label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Maize"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md hover:from-emerald-600 hover:to-green-600 transition-all active:scale-95"
            >
              Add Farm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
