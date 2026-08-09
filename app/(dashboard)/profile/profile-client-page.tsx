// app/(dashboard)/profile/profile-client-page.tsx
"use client";

import Image from "next/image";
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
  Upload,
  Loader2,
  FileText,
  User,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Camera,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addFarm } from "../farm/new/actions";

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
  verification_doc_url?: string | null;
  id_card_url?: string | null;
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

interface ProfileClientPageProps {
  user: any;
  profile: any;
  initialFarms: any[];
  initialListings: any[];
  ratingData?: { average: number; count: number };
}

export default function ProfileClientPage({
  user,
  profile: dbProfile,
  initialFarms,
  initialListings,
  ratingData,
}: ProfileClientPageProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [supabaseClient] = useState(() => createClient());

  const [profile, setProfile] = useState<ProfileState>(() => {
    const firstNameValue = dbProfile?.firstname ?? "";
    const lastNameValue = dbProfile?.lastname ?? "";
    const fullNameValue = [firstNameValue, lastNameValue].filter(Boolean).join(" ") || user.email || FALLBACK_PROFILE.full_name;
    return {
      id: user.id,
      first_name: firstNameValue,
      last_name: lastNameValue,
      full_name: fullNameValue,
      email: user.email ?? "",
      phone: dbProfile?.phone ?? "",
      region: dbProfile?.region ?? FALLBACK_PROFILE.region,
      bio: dbProfile?.bio ?? FALLBACK_PROFILE.bio,
      verification_status: dbProfile?.verification_status ?? FALLBACK_PROFILE.verification_status,
      avatar_url: dbProfile?.avatar_url ?? null,
      verification_doc_url: dbProfile?.verification_doc_url ?? dbProfile?.id_card_url ?? null,
      id_card_url: dbProfile?.id_card_url ?? dbProfile?.verification_doc_url ?? null,
      member_since: new Date(user.created_at).toLocaleDateString("en-GH", { month: "long", year: "numeric" }),
      total_sales: formatCurrency(initialListings.reduce((sum, item) => sum + Number(item.price_per_unit ?? 0), 0)),
      rating: ratingData?.average || 4.8,
      reviews: ratingData?.count || 0,
    };
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `avatars/${profile.id}-${Date.now()}.${fileExt}`;

      let { error } = await supabaseClient.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      let bucketUsed = "avatars";
      if (error) {
        // Fallback to product_images bucket if avatars bucket is not yet created
        const fallback = await supabaseClient.storage
          .from("product_images")
          .upload(fileName, file, { upsert: true });
        if (!fallback.error) {
          error = null;
          bucketUsed = "product_images";
        } else {
          throw new Error(error.message || fallback.error.message);
        }
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from(bucketUsed).getPublicUrl(fileName);

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      setUploadMessage("Profile picture uploaded successfully!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setUploadError(err.message || "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdCard(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `verification_docs/${profile.id}-${Date.now()}.${fileExt}`;

      let { error } = await supabaseClient.storage
        .from("verification_docs")
        .upload(fileName, file, { upsert: true });

      let bucketUsed = "verification_docs";
      if (error) {
        // Fallback to product_images bucket if verification_docs bucket is not yet created
        const fallback = await supabaseClient.storage
          .from("product_images")
          .upload(fileName, file, { upsert: true });
        if (!fallback.error) {
          error = null;
          bucketUsed = "product_images";
        } else {
          throw new Error(error.message || fallback.error.message);
        }
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from(bucketUsed).getPublicUrl(fileName);

      let { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          verification_doc_url: publicUrl,
          id_card_url: publicUrl,
          verification_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError && updateError.message?.includes("id_card_url")) {
        const fallbackUpdate = await supabaseClient
          .from("profiles")
          .update({
            verification_doc_url: publicUrl,
            verification_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
        updateError = fallbackUpdate.error;
      }

      if (updateError) throw updateError;

      setProfile((prev) => ({
        ...prev,
        verification_doc_url: publicUrl,
        id_card_url: publicUrl,
        verification_status: "pending",
      }));
      setUploadMessage(
        "ID Card document uploaded successfully! Your verification is now pending admin review."
      );
    } catch (err: any) {
      console.error("ID card upload error:", err);
      setUploadError(err.message || "Failed to upload ID Card document.");
    } finally {
      setUploadingIdCard(false);
    }
  };

  const [farms, setFarms] = useState<FarmState[]>(() =>
    initialFarms.map((farm) => ({
      id: String(farm.id ?? ""),
      name: String(farm.name ?? "Unnamed farm"),
      location: String(farm.location ?? "Location not set"),
      size_in_acres: Number(farm.size_in_acres ?? 0),
      crop: String(farm.primary_crop ?? "Mixed Crops"),
      status: "Active",
    }))
  );

  const [listings, setListings] = useState<ListingState[]>(() =>
    initialListings.map((listing) => ({
      id: String(listing.id ?? ""),
      title: String(listing.name ?? "Listing"),
      price: formatCurrency(Number(listing.price_per_unit ?? 0)),
      qty: Number(listing.quantity ?? 0),
      status: String(listing.status ?? "active"),
    }))
  );

  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [region, setRegion] = useState(profile.region);

  const [showAddFarm, setShowAddFarm] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="max-w-5xl mx-auto space-y-6 ">
      <div className="bg-green-100 p-2 rounded-2xl m-2">
        <p className="text-sm text-emerald-600 font-semibold">Profile</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <GlassCard className="overflow-hidden">
        <div className=" pt-14">
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
              <Image
                src={profile.avatar_url ?? "/icons/logo.png"}
                alt={profile.full_name}
                width={24}
                height={24}
                unoptimized
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

      <GlassCard className="overflow-hidden scrollbar-none">
        <div className="flex overflow-x-auto scrollbar-none border-b border-gray-100 px-4 pt-4 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all border-b-2 -mb-px ${
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

              {/* Verification Documents Upload Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Identity &amp; Verification Documents
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload your profile photo and ID card for admin verification.
                    </p>
                  </div>
                </div>

                {uploadMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span>✓ {uploadMessage}</span>
                    <button onClick={() => setUploadMessage(null)} className="text-emerald-600 hover:text-emerald-900 ml-2">×</button>
                  </div>
                )}
                {uploadError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center justify-between">
                    <span>⚠ {uploadError}</span>
                    <button onClick={() => setUploadError(null)} className="text-red-600 hover:text-red-900 ml-2">×</button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Profile Picture Upload Card */}
                  <div className="p-4 rounded-2xl bg-white/90 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-600" /> Profile Picture
                        </span>
                        {profile.avatar_url ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-3">
                        Clear headshot of yourself for your seller profile badge.
                      </p>

                      {profile.avatar_url ? (
                        <div className="relative aspect-square w-full max-w-[140px] mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={profile.avatar_url}
                            alt="Profile Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full max-w-[140px] mx-auto mb-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-center">
                          <Camera className="w-7 h-7 text-gray-300 mb-1" />
                          <span className="text-[11px] text-gray-400">No profile photo</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <input
                        id="upload-avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                      <label
                        htmlFor="upload-avatar-input"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            {profile.avatar_url ? "Change Photo" : "Upload Photo"}
                          </>
                        )}
                      </label>

                      {profile.avatar_url && (
                        <a
                          href={profile.avatar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-[11px] font-semibold text-emerald-600 hover:underline"
                        >
                          View Current Photo ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ID Card Document Upload Card */}
                  <div className="p-4 rounded-2xl bg-white/90 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" /> Government ID
                        </span>
                        {profile.verification_doc_url || profile.id_card_url ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-3">
                        National ID, Voter ID, Passport, or Farmer ID card.
                      </p>

                      {profile.verification_doc_url || profile.id_card_url ? (
                        <div className="relative aspect-square w-full max-w-[140px] mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={(profile.id_card_url || profile.verification_doc_url)!}
                            alt="Government ID"
                            className="w-full h-full object-contain bg-white"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full max-w-[140px] mx-auto mb-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-7 h-7 text-gray-300 mb-1" />
                          <span className="text-[11px] text-gray-400">No ID card</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <input
                        id="upload-id-card-input"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleIdCardUpload}
                        disabled={uploadingIdCard}
                        className="hidden"
                      />
                      <label
                        htmlFor="upload-id-card-input"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        {uploadingIdCard ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            {profile.verification_doc_url || profile.id_card_url ? "Change ID Card" : "Upload ID Card"}
                          </>
                        )}
                      </label>

                      {(profile.verification_doc_url || profile.id_card_url) && (
                        <a
                          href={(profile.id_card_url || profile.verification_doc_url)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-[11px] font-semibold text-emerald-600 hover:underline"
                        >
                          View Current Document ↗
                        </a>
                      )}
                    </div>
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
    </div>
  );
}
