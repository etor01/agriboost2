"use client";

import { useState } from "react";
import { X, Sprout, Save } from "lucide-react";
import { updateCrop } from "./actions";
import { toast } from "@/components/ui/Toast";

export default function EditCropModal({
  isOpen,
  onClose,
  farmId,
  crop,
}: {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  crop: any;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop_type: crop.crop_type || "",
    planting_date: crop.planting_date || "",
    estimated_harvest_date: crop.estimated_harvest_date || "",
    area: crop.area?.toString() || "",
    current_growth_stage: crop.current_growth_stage || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateCrop(farmId, crop.id, {
      crop_type: formData.crop_type,
      planting_date: formData.planting_date,
      estimated_harvest_date: formData.estimated_harvest_date || null,
      area: formData.area ? Number(formData.area) : undefined,
      current_growth_stage: formData.current_growth_stage,
    });

    if (res.success) {
      toast.success("Crop details updated successfully");
      onClose();
    } else {
      toast.error(res.message || "Failed to update crop");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" /> Edit Crop
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
              Crop Type
            </label>
            <input
              required
              type="text"
              value={formData.crop_type}
              onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Growth Stage
              </label>
              <select
                value={formData.current_growth_stage}
                onChange={(e) => setFormData({ ...formData, current_growth_stage: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="Seedling">Seedling</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
                <option value="Maturation">Maturation</option>
                <option value="Harvesting">Harvesting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Planting Date
              </label>
              <input
                required
                type="date"
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Est. Harvest Date
              </label>
              <input
                type="date"
                value={formData.estimated_harvest_date}
                onChange={(e) => setFormData({ ...formData, estimated_harvest_date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
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
