"use client";

import { useState } from "react";
import { X, Tractor, MapPin, Save, Target } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Tractor className="h-5 w-5 text-emerald-600" /> Edit Farm
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Farm Name
            </label>
            <div className="relative">
              <Tractor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Size (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.size_in_acres}
                onChange={(e) => setFormData({ ...formData, size_in_acres: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Primary Crop
              </label>
              <input
                type="text"
                value={formData.primary_crop}
                onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Soil Type
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="">Select...</option>
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Clay">Clay</option>
                <option value="Silt">Silt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Irrigation
              </label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="">Select...</option>
                <option value="Rain-fed">Rain-fed</option>
                <option value="Drip">Drip</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
