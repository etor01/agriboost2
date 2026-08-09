// app/(buyer)/account/page.tsx
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
} from "lucide-react";

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
    "w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-white/40 rounded-xl w-48" />
        <div className="h-64 bg-white/40 rounded-2xl" />
        <div className="h-48 bg-white/40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and security settings.</p>
      </div>

      {/* ── Profile Section ─────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <UserCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-400">Update your name, location, and bio.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
              {profile.firstname ? profile.firstname[0].toUpperCase() : "B"}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {profile.firstname} {profile.lastname}
              </p>
              <p className="text-xs text-gray-400">Buyer Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Mail className="inline h-3 w-3 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Email cannot be changed here.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              <Phone className="inline h-3 w-3 mr-1" />
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
              <MapPin className="inline h-3 w-3 mr-1" />
              Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g., Accra, Greater Accra"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Short Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell us a little about yourself..."
              rows={3}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50/70 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* ── Password Section ────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400">Choose a strong password.</p>
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
            <p className="text-sm text-red-600 bg-red-50/70 border border-red-200 rounded-xl px-4 py-3">
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="text-sm text-emerald-700 bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Password changed successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
