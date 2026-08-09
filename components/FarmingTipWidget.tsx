"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface FarmingTipWidgetProps {
  crops: string[];   // e.g. ["Maize", "Tomato"]
  region: string;    // e.g. "Ashanti Region"
}

const SESSION_KEY = "agriboost_farming_tip";
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

export default function FarmingTipWidget({ crops, region }: FarmingTipWidgetProps) {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTip = async () => {
      // Check sessionStorage cache first
      try {
        const cached = sessionStorage.getItem(SESSION_KEY);
        if (cached) {
          const { tip: cachedTip, timestamp, key } = JSON.parse(cached);
          const cacheKey = `${crops.join(",")}-${region}`;
          if (
            key === cacheKey &&
            Date.now() - timestamp < CACHE_TTL &&
            cachedTip
          ) {
            setTip(cachedTip);
            setLoading(false);
            return;
          }
        }
      } catch {
        // sessionStorage unavailable
      }

      // Fetch from API route
      try {
        const params = new URLSearchParams({
          crops: crops.length > 0 ? crops.join(",") : "Maize",
          region: region || "Ghana",
        });
        const res = await fetch(`/api/ai-daily-snippets?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tip) {
            setTip(data.tip);
            try {
              sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                  tip: data.tip,
                  timestamp: Date.now(),
                  key: `${crops.join(",")}-${region}`,
                })
              );
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error("FarmingTipWidget fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTip();
  }, [crops, region]);

  return (
    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 min-h-[62px]">
      <p className="text-xs font-bold text-amber-800 mb-0.5 flex items-center gap-1">
        <Sparkles className="h-3.5 w-3.5" /> AI Farming Tip
      </p>
      {loading ? (
        <div className="space-y-1.5 mt-1">
          <div className="h-2.5 bg-amber-200/60 rounded animate-pulse w-full" />
          <div className="h-2.5 bg-amber-200/60 rounded animate-pulse w-4/5" />
        </div>
      ) : tip ? (
        <p className="text-[11px] text-amber-700 leading-relaxed">{tip}</p>
      ) : (
        <p className="text-[11px] text-amber-600 italic">
          Add crops to your farm to receive personalised tips.
        </p>
      )}
    </div>
  );
}
