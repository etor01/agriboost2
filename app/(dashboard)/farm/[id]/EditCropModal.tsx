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
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Sprout className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Edit Crop Record</h2>
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
              Crop Name
            </label>
            <input
              required
              type="text"
              value={formData.crop_type}
              onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              placeholder="e.g. Maize, Tomatoes, Cassava"
              className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Growth Stage
              </label>
              <select
                value={formData.current_growth_stage}
                onChange={(e) => setFormData({ ...formData, current_growth_stage: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Planting Date
              </label>
              <input
                required
                type="date"
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Est. Harvest Date
              </label>
              <input
                type="date"
                value={formData.estimated_harvest_date}
                onChange={(e) => setFormData({ ...formData, estimated_harvest_date: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
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

