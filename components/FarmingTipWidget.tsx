"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface FarmingTipWidgetProps {
  crops: string[];
  region: string;
}

const SESSION_KEY = "agriboost_farming_tip";
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

export default function FarmingTipWidget({ crops, region }: FarmingTipWidgetProps) {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTip = async () => {
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
    <div className="mt-4 p-3.5 rounded-md bg-amber-50/60 border border-amber-200/70">
      <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-1">
        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        <span>AI Farming Tip</span>
      </div>
      {loading ? (
        <div className="space-y-1.5 mt-1.5">
          <div className="h-2.5 bg-amber-200/50 rounded animate-pulse w-full" />
          <div className="h-2.5 bg-amber-200/50 rounded animate-pulse w-4/5" />
        </div>
      ) : tip ? (
        <p className="text-xs text-amber-900 leading-relaxed font-normal">{tip}</p>
      ) : (
        <p className="text-xs text-amber-700/80 italic font-normal">
          Add crops to your farm to receive personalised AI agronomy tips.
        </p>
      )}
    </div>
  );
}

