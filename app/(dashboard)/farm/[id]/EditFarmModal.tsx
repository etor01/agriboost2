"use client";

import { useState } from "react";
import { X, Tractor, MapPin, Save } from "lucide-react";
import { updateFarm } from "./actions";
import { toast } from "@/components/ui/Toast";

export default function EditFarmModal({
  isOpen,
  onClose,
  farm,
}: {
  isOpen: boolean;
  onClose: () => void;
  farm: any;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: farm.name || "",
    location: farm.location || "",
    size_in_acres: farm.size_in_acres?.toString() || "",
    primary_crop: farm.primary_crop || "",
    soil_type: farm.soil_type || "",
    irrigation_type: farm.irrigation_type || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateFarm(farm.id, {
      name: formData.name,
      location: formData.location,
      size_in_acres: formData.size_in_acres ? Number(formData.size_in_acres) : 0,
      primary_crop: formData.primary_crop,
      soil_type: formData.soil_type,
      irrigation_type: formData.irrigation_type,
    });

    if (res.success) {
      toast.success("Farm details updated successfully");
      onClose();
    } else {
      toast.error(res.message || "Failed to update farm");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Tractor className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Edit Farm Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Farm Name
            </label>
            <div className="relative">
              <Tractor className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                required
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Size (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.size_in_acres}
                onChange={(e) => setFormData({ ...formData, size_in_acres: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Primary Crop
              </label>
              <input
                type="text"
                value={formData.primary_crop}
                onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Soil Type
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              >
                <option value="">Select...</option>
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Clay">Clay</option>
                <option value="Silt">Silt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Irrigation
              </label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              >
                <option value="">Select...</option>
                <option value="Rain-fed">Rain-fed</option>
                <option value="Drip">Drip</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

