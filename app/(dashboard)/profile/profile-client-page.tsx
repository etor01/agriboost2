// app/(dashboard)/profile/profile-client-page.tsx
"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  MapPin,
  Settings2,
  Trash2,
  UserCircle2,
  Upload,
  Loader2,
  FileText,
  User,
  ShieldCheck,
  CheckCircle,
  Camera,
  AlertCircle,
  Mail,
  Phone,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  FarmerPageHeader,
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
} from "@/components/farmer/ui";

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
    const fullNameValue =
      [firstNameValue, lastNameValue].filter(Boolean).join(" ") ||
      user.email ||
      FALLBACK_PROFILE.full_name;
    return {
      id: user.id,
      first_name: firstNameValue,
      last_name: lastNameValue,
      full_name: fullNameValue,
      email: user.email ?? "",
      phone: dbProfile?.phone ?? "",
      region: dbProfile?.region ?? FALLBACK_PROFILE.region,
      bio: dbProfile?.bio ?? FALLBACK_PROFILE.bio,
      verification_status:
        dbProfile?.verification_status ?? FALLBACK_PROFILE.verification_status,
      avatar_url: dbProfile?.avatar_url ?? null,
      verification_doc_url:
        dbProfile?.verification_doc_url ?? dbProfile?.id_card_url ?? null,
      id_card_url:
        dbProfile?.id_card_url ?? dbProfile?.verification_doc_url ?? null,
      member_since: new Date(user.created_at).toLocaleDateString("en-GH", {
        month: "long",
        year: "numeric",
      }),
      total_sales: formatCurrency(
        initialListings.reduce(
          (sum, item) => sum + Number(item.price_per_unit ?? 0),
          0
        )
      ),
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
      setUploadMessage("Profile picture updated successfully!");
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
        "ID Card document uploaded successfully! Verification is pending admin review."
      );
    } catch (err: any) {
      console.error("ID card upload error:", err);
      setUploadError(err.message || "Failed to upload ID document.");
    } finally {
      setUploadingIdCard(false);
    }
  };

  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [region, setRegion] = useState(profile.region);

  const [savedMsg, setSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSavedMsg("");

    const {
      data: { user: currentUser },
    } = await supabaseClient.auth.getUser();
    if (!currentUser) {
      setSavedMsg("You need to sign in before updating your profile.");
      setIsSaving(false);
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullNameValue = [trimmedFirstName, trimmedLastName]
      .filter(Boolean)
      .join(" ");

    const { error: upsertErr } = await supabaseClient.from("profiles").upsert({
      id: currentUser.id,
      firstname: trimmedFirstName,
      lastname: trimmedLastName,
      phone: phone,
      region,
      bio,
      role: "farmer",
    });

    if (upsertErr) {
      setSavedMsg(`Unable to save changes: ${upsertErr.message}`);
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
      setSavedMsg("Profile changes saved successfully.");
    }

    setIsSaving(false);
  };

  const TABS = [
    { id: "personal", label: "Personal Details", icon: UserCircle2 },
    { id: "verification", label: "KYC & Verification", icon: ShieldCheck },
    { id: "settings", label: "Account & Security", icon: Settings2 },
  ];

  const isVerified =
    profile.verification_status === "verified" ||
    profile.verification_status === "approved";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Account & Identity"
        badgeIcon={UserCircle2}
        title="Farmer Profile"
        description="Manage your contact details, marketplace seller credentials, and KYC verification."
      />

      {/* Profile Overview Card */}
      <FarmerCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-18 w-18 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-9 w-9 text-zinc-400" />
                )}
              </div>
              <label
                htmlFor="quick-avatar-upload"
                className="absolute -bottom-1 -right-1 h-6 w-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xs border border-white"
                title="Change Avatar"
              >
                <Camera className="h-3 w-3" />
                <input
                  id="quick-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  {profile.full_name || "AgriBoost Farmer"}
                </h2>
                <FarmerBadge variant={isVerified ? "success" : "warn"}>
                  {isVerified ? (
                    <>
                      <BadgeCheck className="h-3 w-3 inline mr-1" /> Verified Farmer
                    </>
                  ) : (
                    "Verification Pending"
                  )}
                </FarmerBadge>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2">
                <Mail className="h-3 w-3 text-zinc-400" /> {profile.email}
              </p>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-zinc-400" /> {region} · Joined {profile.member_since}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
              <p className="text-xs text-zinc-500">Seller Rating</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                ★ {profile.rating} <span className="text-[11px] font-normal text-zinc-400">({profile.reviews})</span>
              </p>
            </div>
            <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
              <p className="text-xs text-zinc-500">Produce Volume</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {profile.total_sales}
              </p>
            </div>
          </div>
        </div>
      </FarmerCard>

      {/* Tabs */}
      <FarmerCard className="p-0 overflow-hidden">
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 px-3 pt-2 gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? "border-zinc-900 text-zinc-900 bg-white shadow-2xs font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: Personal Details */}
          {activeTab === "personal" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Personal &amp; Contact Details
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update your contact details displayed to buyers upon order confirmation.
                </p>
              </div>

              {savedMsg && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                  {savedMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-400 text-xs sm:text-sm cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    Primary Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
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
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    Farm Bio &amp; Background
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs resize-none"
                    placeholder="Brief description of your agricultural background and farming specialty..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-md transition-colors shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving changes…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: KYC & Verification */}
          {activeTab === "verification" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Seller Verification Documents
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upload official ID cards to receive the Verified Seller badge on the marketplace.
                </p>
              </div>

              {uploadMessage && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between">
                  <span>✓ {uploadMessage}</span>
                  <button onClick={() => setUploadMessage(null)} className="text-emerald-700 font-bold">×</button>
                </div>
              )}
              {uploadError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center justify-between">
                  <span>⚠ {uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-red-700 font-bold">×</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Photo */}
                <div className="p-4 rounded-lg border border-zinc-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-zinc-500" /> Profile Picture
                    </span>
                    {profile.avatar_url ? (
                      <FarmerBadge variant="success">Uploaded</FarmerBadge>
                    ) : (
                      <FarmerBadge variant="warn">Missing</FarmerBadge>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    A clear portrait photo displayed on your marketplace listings.
                  </p>

                  <div className="aspect-square w-full max-w-[120px] mx-auto rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-6 w-6 text-zinc-300" />
                    )}
                  </div>

                  <div>
                    <input
                      id="upload-avatar-tab-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-avatar-tab-input"
                      className="w-full py-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          {profile.avatar_url ? "Replace Photo" : "Upload Photo"}
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Government ID */}
                <div className="p-4 rounded-lg border border-zinc-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-zinc-500" /> National ID Card
                    </span>
                    {profile.verification_doc_url || profile.id_card_url ? (
                      <FarmerBadge variant="success">Uploaded</FarmerBadge>
                    ) : (
                      <FarmerBadge variant="warn">Missing</FarmerBadge>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Ghana Card, Voter ID, or Farmer Association ID.
                  </p>

                  <div className="aspect-square w-full max-w-[120px] mx-auto rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 flex items-center justify-center p-2">
                    {profile.verification_doc_url || profile.id_card_url ? (
                      <img
                        src={(profile.id_card_url || profile.verification_doc_url)!}
                        alt="ID Document"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileText className="h-6 w-6 text-zinc-300" />
                    )}
                  </div>

                  <div>
                    <input
                      id="upload-id-card-tab-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdCardUpload}
                      disabled={uploadingIdCard}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-id-card-tab-input"
                      className="w-full py-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      {uploadingIdCard ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          {profile.verification_doc_url || profile.id_card_url
                            ? "Replace Document"
                            : "Upload ID Document"}
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Account & Security */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Notification Preferences
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Configure how you receive operational alerts and escrow order updates.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    label: "Order & Escrow Alerts",
                    desc: "SMS notifications when buyers place orders or release funds",
                    active: true,
                  },
                  {
                    label: "Weather Anomalies & Pest Warnings",
                    desc: "Early warning alerts tailored to your farming region",
                    active: true,
                  },
                  {
                    label: "Marketplace Inquiries",
                    desc: "Direct messages and inquiry notifications from buyers",
                    active: false,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-white"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        item.active ? "bg-emerald-600" : "bg-zinc-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          item.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                  Account Management
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-800 hover:bg-zinc-50 transition-colors text-left flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-zinc-500" /> Change Security Password
                  </button>
                  <button className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors text-left flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" /> Request Account Deletion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FarmerCard>
    </div>
  );
}

