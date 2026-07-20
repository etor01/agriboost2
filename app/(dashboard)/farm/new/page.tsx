// app/(dashboard)/farm/new/page.tsx
// Standalone "Add New Farm" page — MVP demo, no Supabase calls

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Sprout, Tractor } from "lucide-react";

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

const REGIONS = [
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
];

const SOIL_TYPES = [
  "Loamy",
  "Sandy Loam",
  "Clay Loam",
  "Sandy",
  "Clay",
  "Silty Loam",
];
const IRRIGATION_TYPES = [
  "Rain-fed",
  "Drip Irrigation",
  "Sprinkler",
  "Flood Irrigation",
  "Manual Watering",
];
const CROP_TYPES = [
  "Maize",
  "Cassava",
  "Yam",
  "Cocoyam",
  "Tomatoes",
  "Pepper",
  "Groundnuts",
  "Soybeans",
  "Rice",
  "Plantain",
  "Vegetables (Mixed)",
  "Other",
];

export default function AddFarmPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [acres, setAcres] = useState("");
  const [crop, setCrop] = useState(CROP_TYPES[0]);
  const [soil, setSoil] = useState(SOIL_TYPES[0]);
  const [irrigation, setIrrigation] = useState(IRRIGATION_TYPES[0]);
  const [established, setEstablished] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !acres) return;
    // MVP: simulate save — in production this would call Supabase
    setSubmitted(true);
    setTimeout(() => {
      router.push("/profile");
    }, 1800);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <GlassCard className="p-10 text-center max-w-sm w-full">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-emerald-100 p-4">
              <Sprout className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Farm Added!</h2>
          <p className="text-gray-500 text-sm mt-2">
            <strong>{name}</strong> has been registered. Redirecting to your
            profile…
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-[grow_1.8s_ease-in-out_forwards]"
              style={{ width: "100%" }}
            />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <Tractor className="h-6 w-6 text-emerald-600" /> Add New Farm
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Register a new farm to start tracking crops, tasks, and yields.
        </p>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Farm Name */}
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
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>

          {/* Location + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Town / City *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Ejisu"
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Region *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Size + Primary Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Farm Size (Acres) *
              </label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                required
                min="0.1"
                step="0.1"
                placeholder="e.g. 5"
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Primary Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {CROP_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Soil + Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Soil Type
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Irrigation Method
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
              >
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Established Date */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Date Established
            </label>
            <input
              type="date"
              value={established}
              onChange={(e) => setEstablished(e.target.value)}
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any extra details about this farm…"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sprout className="h-4 w-4" /> Add Farm
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Info box */}
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-amber-100 p-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800">
              After adding your farm
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              You can add crop records, assign tasks, run AI health scans, and
              create marketplace listings linked to this farm from the Farm
              Detail page.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
