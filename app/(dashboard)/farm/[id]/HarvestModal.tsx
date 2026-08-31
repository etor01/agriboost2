"use client";

import { useState } from "react";
import { X, Wheat, Store, CheckCircle2 } from "lucide-react";
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
        router.push(`/marketplace/new?crop=${encodeURIComponent(crop.crop_type)}`);
      }
    } else {
      toast.error(res.message || "Failed to mark as harvested");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Wheat className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Harvest Complete</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-200/70 rounded-full flex items-center justify-center text-amber-600 mb-1">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Ready to Log Harvest?
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-xs mx-auto">
              You are recording the harvest for your <strong>{crop.crop_type}</strong> crop. You can list the harvested produce on the marketplace immediately.
            </p>
          </div>

          <div className="pt-2 grid gap-2">
            <button
              onClick={() => handleHarvest(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
            >
              <Store className="h-4 w-4" /> List Produce on Marketplace
            </button>
            <button
              onClick={() => handleHarvest(false)}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-50 rounded-md transition-colors disabled:opacity-50"
            >
              Record as Harvested Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

