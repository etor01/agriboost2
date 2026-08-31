// app/(dashboard)/farm/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Sprout, Tractor } from "lucide-react";
import { addFarm } from "./actions";
import {
  FarmerPageHeader,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
} from "@/components/farmer/ui";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !acres) return;
    setIsSubmitting(true);
    setError("");

    const result = await addFarm({
      name,
      location,
      region,
      size_in_acres: parseFloat(acres),
      primary_crop: crop,
      soil_type: soil,
      irrigation_type: irrigation,
      established_date: established,
      notes,
    });

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/farms");
      }, 1500);
    } else {
      setError(result.message || "An error occurred while creating the farm.");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center max-w-sm w-full shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Farm Registered!</h2>
            <p className="text-xs text-zinc-500 mt-1">
              <strong>{name}</strong> has been created. Redirecting to your farms overview…
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-600 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/farms"
          className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 font-medium transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Farms
        </Link>
        <FarmerPageHeader
          badge="Property Setup"
          badgeIcon={Tractor}
          title="Add New Farm"
          description="Register a new agricultural plot to track crops, field operations, and market yields."
        />
      </div>

      <FarmerCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Farm Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Farm Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Asante North Farm"
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
            />
          </div>

          {/* Location + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Town / City *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g. Ejisu"
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Region *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Size + Primary Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
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
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Primary Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                {CROP_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Soil + Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Soil Type
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                Irrigation Method
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Established Date */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Date Established
            </label>
            <input
              type="date"
              value={established}
              onChange={(e) => setEstablished(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any extra operational details regarding soil quality, topography, or access…"
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <Link
              href="/farms"
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sprout className="h-4 w-4" /> {isSubmitting ? "Adding..." : "Register Farm"}
            </button>
          </div>
        </form>
      </FarmerCard>

      {/* Info box */}
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-900">
            Next steps after registration
          </p>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
            Once registered, you can log individual crop plantings, view AI-generated care timelines, run disease diagnostics, and post listings directly to the marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}

