"use client";

import { useState } from "react";
import { X, Wheat, Store } from "lucide-react";
import { markCropHarvested } from "./actions";
import { toast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function HarvestModal({
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
  const router = useRouter();

  if (!isOpen) return null;

  const handleHarvest = async (listOnMarket: boolean) => {
    setLoading(true);

    const res = await markCropHarvested(farmId, crop.id, crop.crop_type);

    if (res.success) {
      toast.success(`${crop.crop_type} marked as harvested!`);
      onClose();
      if (listOnMarket) {
        router.push(`/my-listings`);
      }
    } else {
      toast.error(res.message || "Failed to mark as harvested");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-amber-50">
          <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Wheat className="h-5 w-5 text-amber-600" /> Harvest Complete
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
            <Wheat className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Congratulations!
          </h3>
          <p className="text-sm text-gray-600">
            You are about to mark your <strong>{crop.crop_type}</strong> crop as harvested. What would you like to do next?
          </p>

          <div className="pt-4 grid gap-3">
            <button
              onClick={() => handleHarvest(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors disabled:opacity-50"
            >
              <Store className="h-4 w-4" /> List on Marketplace
            </button>
            <button
              onClick={() => handleHarvest(false)}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Just mark as harvested
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
