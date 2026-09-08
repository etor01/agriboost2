// app/buyer/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { FarmerPageHeader } from "@/components/farmer/ui";

const supabase = createClient();

type ProfileData = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
};

export default function BuyerAccountPage() {
  const [profile, setProfile] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("firstname, lastname, email, phone, location, bio")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          firstname: data.firstname ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? user.email ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        firstname: profile.firstname,
        lastname: profile.lastname,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      setPwError(updateError.message);
    } else {
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    }
    setPwSaving(false);
  };

  const inputClass =
    "w-full px-3.5 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors text-xs sm:text-sm shadow-2xs";
  const labelClass = "block text-xs font-semibold text-zinc-700 mb-1.5";

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl animate-pulse">
        <div className="h-8 bg-zinc-200 rounded-lg w-48" />
        <div className="h-64 bg-zinc-200 rounded-xl" />
        <div className="h-48 bg-zinc-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <FarmerPageHeader
        badge="Account & Security"
        title="Buyer Account Settings"
        description="Update your personal details, contact number, delivery address, and security credentials."
      />

      {/* ── Profile Section ─────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
            <UserCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Personal Information</h2>
            <p className="text-xs text-zinc-500">Update your name, location, and bio.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar and role */}
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-lg font-bold shadow-2xs">
              {profile.firstname ? profile.firstname[0].toUpperCase() : "B"}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {profile.firstname} {profile.lastname || ""}
              </p>
              <p className="text-xs text-emerald-700 font-medium">Buyer Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={profile.firstname}
                onChange={(e) => setProfile((p) => ({ ...p, firstname: e.target.value }))}
                placeholder="First name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={profile.lastname}
                onChange={(e) => setProfile((p) => ({ ...p, lastname: e.target.value }))}
                placeholder="Last name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <Mail className="inline h-3.5 w-3.5 mr-1 text-zinc-400" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className={`${inputClass} bg-zinc-50 text-zinc-500 cursor-not-allowed`}
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Email is linked to your authentication account and cannot be modified here.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              <Phone className="inline h-3.5 w-3.5 mr-1 text-zinc-400" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+233 XX XXX XXXX"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <MapPin className="inline h-3.5 w-3.5 mr-1 text-zinc-400" />
              Default Delivery Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g., East Legon, Accra, Greater Accra"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio / Special Notes</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Delivery instructions, preferred produce types, or notes..."
              rows={3}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* ── Password Section ────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Change Password</h2>
            <p className="text-xs text-zinc-500">Update your account security password.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {pwError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{pwError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

