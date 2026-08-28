// app/(dashboard)/ai-center/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { analyzeCropImage } from "./actions";
import type { DiagnosisResult } from "./actions";
import type { CropDiagnostic } from "@/lib/database.types";
import Link from "next/link";
// Phase 7: Live Camera Scanner (primary input)
import LiveCameraScanner from "@/components/features/LiveCameraScanner";
// Phase 3: IndexedDB offline cache
import { cacheScan, getCachedScans, pruneOldScans } from "@/lib/idb/diseaseCache";
// Phase 5: Background Sync queue for offline scans
import { enqueueDiseaseScan, getPendingCount, removeSyncItem, getPendingScans } from "@/lib/idb/syncQueue";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Leaf,
  Microscope,
  ChevronDown,
  Clock,
  XCircle,
  Shield,
  Sprout,
  TrendingUp,
  ShieldAlert,
  Lock,
  Crown,
  ArrowRight,
  WifiOff,
  RefreshCcw,
} from "lucide-react";

const PAGE_SIZE = 5;

function ConfidencePill({ confidence }: { confidence: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    high: { label: "High Confidence", cls: "bg-emerald-100 text-emerald-700" },
    medium: { label: "Medium Confidence", cls: "bg-amber-100 text-amber-700" },
    low: { label: "Low Confidence", cls: "bg-red-100 text-red-700" },
  };
  const entry = confidence ? map[confidence] : null;
  if (!entry) return null;
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${entry.cls}`}
    >
      {entry.label}
    </span>
  );
}

function HealthBadge({ isHealthy }: { isHealthy: boolean | null }) {
  if (isHealthy === true)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Healthy
      </span>
    );
  if (isHealthy === false)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="h-3 w-3" /> Disease Detected
      </span>
    );
  return null;
}

function ScanHistoryCard({ scan }: { scan: CropDiagnostic }) {
  const result = scan.ai_result as DiagnosisResult | null;
  if (!result) return null;

  const date = new Date(scan.created_at).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
        {scan.image_url ? (
          <img
            src={scan.image_url}
            alt={result.crop_name ?? "Crop"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="h-8 w-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 truncate">
              {result.crop_name ?? "Unknown Crop"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {result.disease_name && result.disease_name !== "None"
                ? result.disease_name
                : "No disease detected"}
            </p>
          </div>
          <HealthBadge isHealthy={result.is_healthy} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <ConfidencePill confidence={result.confidence} />
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}

function AnalysisResultCard({ result }: { result: DiagnosisResult }) {
  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div
        className={`flex items-start gap-3 p-4 rounded-xl ${
          result.is_healthy
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
            : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
        }`}
      >
        {result.is_healthy ? (
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-bold text-gray-800 text-base">
              {result.crop_name ?? "Unknown Crop"}
            </h3>
            <ConfidencePill confidence={result.confidence} />
          </div>
          {result.disease_name && result.disease_name !== "None" && (
            <p className="text-sm text-red-700 font-medium mt-0.5">
              {result.disease_name}
            </p>
          )}
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Microscope className="h-4 w-4 text-gray-500" />
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Diagnosis
          </h4>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
          {result.diagnosis}
        </p>
      </div>

      {/* Healthy Practices */}
      {result.healthy_practices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Recommended Practices
            </h4>
          </div>
          <ol className="space-y-2">
            {result.healthy_practices.map((practice, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{practice}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function AiCenterPage() {
  const supabase = createClient();

  const [scansRemaining, setScansRemaining] = useState<number>(3);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(
    null
  );
  const [error, setError] = useState("");
  const [invalidPlant, setInvalidPlant] = useState(false);

  // History state
  const [history, setHistory] = useState<CropDiagnostic[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<
    "All" | "Healthy" | "Disease Detected"
  >("All");

  // Phase 3: Track whether history is being shown from IndexedDB cache
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  // Phase 5: Count of pending offline scans in the sync queue
  const [pendingOfflineScans, setPendingOfflineScans] = useState(0);

  const filteredHistory = history.filter((scan) => {
    let matchStatus = true;
    const result = scan.ai_result as DiagnosisResult | null;
    if (historyStatusFilter === "Healthy") {
      matchStatus = result?.is_healthy === true;
    } else if (historyStatusFilter === "Disease Detected") {
      matchStatus = result?.is_healthy === false;
    }

    let matchDate = true;
    const txDate = new Date(scan.created_at).getTime();
    if (historyStartDate) {
      matchDate = matchDate && txDate >= new Date(historyStartDate).getTime();
    }
    if (historyEndDate) {
      matchDate =
        matchDate && txDate <= new Date(historyEndDate).getTime() + 86400000;
    }

    return matchStatus && matchDate;
  });

  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");

  // Fetch scans remaining and user id on mount
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("ai_scans_remaining, subscription_tier")
          .eq("id", user.id)
          .single();
        if (profile) {
          setScansRemaining(profile.ai_scans_remaining);
          if (profile.subscription_tier) {
            setSubscriptionTier(profile.subscription_tier);
          }
        }
      }
    };
    init();

    // Phase 5: Count pending offline scans on mount
    getPendingCount().then(setPendingOfflineScans).catch(() => {});

    // Phase 5: iOS Background Sync fallback — process queue when connectivity restores
    // (SyncManager is not supported in Safari/iOS, so we use the `online` event)
    const processSyncQueueOnline = async () => {
      const pending = await getPendingScans().catch(() => []);
      for (const item of pending) {
        try {
          const res = await fetch("/api/detectDisease", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
          if (res.ok) {
            await removeSyncItem(item.id);
          }
        } catch {
          // Will retry on next online event
        }
      }
      getPendingCount().then(setPendingOfflineScans).catch(() => {});
    };
    window.addEventListener("online", processSyncQueueOnline);
    return () => window.removeEventListener("online", processSyncQueueOnline);
  }, [supabase]);

  // Fetch history
  const fetchHistory = useCallback(
    async (offset: number, replace: boolean) => {
      if (!userId) return;
      if (replace) setHistoryLoading(true);
      else setLoadingMore(true);

      const { data, error } = await supabase
        .from("crop_diagnostics")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE); // fetch PAGE_SIZE + 1 to detect if more exist

      if (!error && data) {
        const page = data.slice(0, PAGE_SIZE);
        setHasMore(data.length > PAGE_SIZE);
        if (replace) {
          setHistory(page);
        } else {
          setHistory((prev) => [...prev, ...page]);
        }
        setHistoryOffset(offset + page.length);
        setIsOfflineMode(false);

        // Phase 3: Write fetched scans to IndexedDB cache for offline access
        if (userId) {
          for (const scan of page) {
            const result = scan.ai_result as DiagnosisResult | null;
            if (!result) continue;
            cacheScan({
              id: scan.id,
              profileId: userId,
              cropName: result.crop_name ?? "Unknown",
              diseaseName: result.disease_name ?? null,
              isHealthy: result.is_healthy ?? null,
              confidence: result.confidence ?? null,
              imageUrl: scan.image_url ?? null,
              diagnosis: result.diagnosis ?? null,
              healthyPractices: result.healthy_practices ?? [],
              createdAt: scan.created_at,
            }).catch(() => {}); // non-blocking
          }
          pruneOldScans(userId, 50).catch(() => {});
        }
      } else if (error && replace && userId) {
        // Phase 3: Supabase unreachable — fall back to IndexedDB cache
        const cached = await getCachedScans(userId, PAGE_SIZE);
        if (cached.length > 0) {
          // Map CachedDiseaseScan back to CropDiagnostic shape for ScanHistoryCard
          const fakeRows: CropDiagnostic[] = cached.map((c) => ({
            id: c.id,
            profile_id: c.profileId,
            image_url: c.imageUrl,
            created_at: c.createdAt,
            ai_result: {
              crop_name: c.cropName,
              disease_name: c.diseaseName,
              is_healthy: c.isHealthy,
              confidence: c.confidence,
              diagnosis: c.diagnosis,
              healthy_practices: c.healthyPractices,
            } as DiagnosisResult,
          } as CropDiagnostic));
          setHistory(fakeRows);
          setIsOfflineMode(true);
        }
      }

      if (replace) setHistoryLoading(false);
      else setLoadingMore(false);
    },
    [supabase, userId]
  );

  useEffect(() => {
    if (userId) {
      fetchHistory(0, true);
    }
  }, [userId, fetchHistory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalysisResult(null);
      setError("");
      setInvalidPlant(false);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Please capture or select an image to analyze.");
      return;
    }
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);
    setInvalidPlant(false);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const result = await analyzeCropImage(formData);

      if (result.success && result.analysis) {
        const aiResult = result.analysis.ai_result as DiagnosisResult;
        setAnalysisResult(aiResult);
        // Update scan count from server response
        if (typeof result.scansRemaining === "number") {
          setScansRemaining(result.scansRemaining);
        }
        // Phase 3: Cache the new scan result in IndexedDB
        if (userId && result.analysis.id) {
          cacheScan({
            id: result.analysis.id,
            profileId: userId,
            cropName: aiResult.crop_name ?? "Unknown",
            diseaseName: aiResult.disease_name ?? null,
            isHealthy: aiResult.is_healthy ?? null,
            confidence: aiResult.confidence ?? null,
            imageUrl: result.analysis.image_url ?? null,
            diagnosis: aiResult.diagnosis ?? null,
            healthyPractices: aiResult.healthy_practices ?? [],
            createdAt: new Date().toISOString(),
          }).catch(() => {});
        }
        // Refresh history to show new entry at top
        fetchHistory(0, true);
      } else {
        if ((result as any).outOfScans) {
          setShowUpgradeModal(true);
        } else if ((result as any).invalidPlant) {
          setInvalidPlant(true);
          setError(result.message ?? "Not a valid plant image.");
        } else {
          setError(result.message ?? "An unknown error occurred.");
        }
      }
    } catch {
      // Phase 5: Network error — enqueue scan for Background Sync
      if (imageFile) {
        try {
          // Convert File to base64 for queue storage
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          await enqueueDiseaseScan({ imageBase64: base64 });
          setPendingOfflineScans((n) => n + 1);
          // Register Background Sync tag (Chrome/Android) for auto-retry
          if ("serviceWorker" in navigator) {
            const sw = await navigator.serviceWorker.ready;
            if ("sync" in sw) {
              await (sw as any).sync.register("sync-disease-scans");
            }
          }
          setError(
            "📡 No internet connection. Your scan has been queued and will upload automatically when you're back online."
          );
        } catch {
          setError("Network error. Please check your connection and try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  const handleLoadMore = () => {
    fetchHistory(historyOffset, false);
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 p-4 rounded-2xl">
          <h1 className="text-3xl font-bold text-gray-800">
            AI Crop Diagnosis Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a plant photo — our AI provides a diagnosis with
            Ghana-specific farming advice.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-white bg-green-600 px-4 py-2.5 rounded-xl shadow-md">
          <Sparkles className="h-4 w-4" />
          {scansRemaining} Scan{scansRemaining !== 1 ? "s" : ""} Remaining
        </div>
      </div>

      {/* ─── AI Suite Feature Cards ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              AgriBoost AI Tools
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Intelligent farming tools designed to boost yield and market success.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CARD 1 — AI Crop Disease Scanner (EXISTING — Active/Free) */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-emerald-500 rounded-2xl p-5 shadow-md shadow-emerald-100/60 relative flex flex-col justify-between transition-all hover:shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Microscope className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  AI Crop Disease Scanner
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Upload a photo of your crop leaf for instant AI disease diagnosis.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Active Tool</span>
              <span className="flex items-center gap-1">
                Scroll to Scan ↓
              </span>
            </div>
          </div>

          {/* CARD 2 — AI Growth Plan Generator (PREMIUM) */}
          <div
            className={`bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 relative flex flex-col justify-between transition-all hover:shadow-md ${
              subscriptionTier !== "premium" ? "opacity-80" : ""
            }`}
          >
            {subscriptionTier !== "premium" && (
              <div
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm"
                title="Premium Feature"
              >
                <Lock className="h-4 w-4" />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between pr-8">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sprout className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  <Crown className="h-3 w-3 text-amber-600" />
                  Premium
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  AI Growth Plan Generator
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Generate a week-by-week care schedule for any crop, tailored to your Ghanaian region and planting date.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              {subscriptionTier !== "premium" ? (
                <Link
                  href="/upgrade"
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to Unlock
                </Link>
              ) : (
                <Link
                  href="/farms"
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Go to My Farms <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* CARD 3 — AI Market Price Predictor (COMING SOON) */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 relative flex flex-col justify-between opacity-80 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  Coming Soon
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  AI Market Price Predictor
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Get AI-predicted optimal selling prices for your produce based on current market trends across Ghanaian regions.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                disabled
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed text-center"
              >
                Notify Me When Available
              </button>
            </div>
          </div>

          {/* CARD 4 — AI Pest & Weather Risk Alert (PREMIUM) */}
          <div
            className={`bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 relative flex flex-col justify-between transition-all hover:shadow-md ${
              subscriptionTier !== "premium" ? "opacity-80" : ""
            }`}
          >
            {subscriptionTier !== "premium" && (
              <div
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-sm"
                title="Premium Feature"
              >
                <Lock className="h-4 w-4" />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between pr-8">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  <Crown className="h-3 w-3 text-amber-600" />
                  Premium
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  AI Pest & Weather Risk Alert
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Receive proactive warnings about pest outbreaks and adverse weather patterns in your farming region.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              {subscriptionTier !== "premium" ? (
                <Link
                  href="/upgrade"
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to Unlock
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  View Dashboard Alerts <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload + Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload / Camera Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Microscope className="h-5 w-5 text-green-600" />
            Scan Crop Leaf
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Point your camera at a leaf or upload a photo. Our AI will diagnose any disease.
          </p>

          {/* Phase 7: Live Camera Scanner (primary) */}
          <LiveCameraScanner
            onCapture={(file, previewUrl) => {
              setAnalysisResult(null);
              setError("");
              setInvalidPlant(false);
              setImageFile(file);
              setImagePreview(previewUrl);
            }}
            existingPreview={imagePreview || undefined}
            onReset={() => {
              setImageFile(null);
              setImagePreview("");
              setAnalysisResult(null);
              setError("");
            }}
          />

          {/* Phase 5: Pending offline scans indicator */}
          {pendingOfflineScans > 0 && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                <strong>{pendingOfflineScans}</strong> scan{pendingOfflineScans > 1 ? "s" : ""} queued for upload when online.
              </span>
            </div>
          )}

          {/* Error / invalid plant message */}
          {error && (
            <div
              className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${
                invalidPlant
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imageFile || isLoading}
            className="w-full mt-4 py-3 text-base font-semibold text-white bg-green-600 rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
                Analysing with AI...
              </>
            ) : (
              <>
                <Microscope className="h-5 w-5" />
                Analyse Crop Health
              </>
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 min-h-[280px]">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Analysis Result
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <svg
                className="animate-spin h-10 w-10 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-500">
                AI is analysing your crop, please wait...
              </p>
            </div>
          ) : analysisResult ? (
            <AnalysisResultCard result={analysisResult} />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 gap-3">
              <Microscope className="h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">
                Capture or upload a crop image and click{" "}
                <span className="font-semibold text-gray-600">
                  &quot;Analyse Crop Health&quot;
                </span>{" "}
                to see results here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Scan History ─────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Crop Scan History
              {/* Phase 3: Offline cache badge */}
              {isOfflineMode && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  <WifiOff className="h-3 w-3" /> Cached
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isOfflineMode
                ? "Showing locally cached history — reconnect to sync."
                : "Your recent AI diagnoses — most recent first."}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            Last {PAGE_SIZE} shown
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Status:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {["All", "Healthy", "Disease Detected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setHistoryStatusFilter(status as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    historyStatusFilter === status
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full sm:w-auto h-px bg-gray-100 sm:h-8 sm:w-px sm:bg-gray-200" />
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 mb-1">From</span>
              <input
                type="date"
                value={historyStartDate}
                onChange={(e) => setHistoryStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 mb-1">To</span>
              <input
                type="date"
                value={historyEndDate}
                onChange={(e) => setHistoryEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {historyLoading ? (
          /* Skeleton */
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Leaf className="h-12 w-12 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-500">No scans yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your scan history will appear here after your first analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((scan) => (
              <ScanHistoryCard key={scan.id} scan={scan} />
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load More Scans
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
            <div className="flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Out of Scans!</h2>
            <p className="text-gray-600 mt-2 text-sm">
              You&apos;ve used all your AI scans. Upgrade to a 5-Star Farmer
              plan to get unlimited scans and premium features.
            </p>
            <div className="mt-6 space-y-2">
              <Link
                href="/finances"
                className="block w-full px-6 py-3 text-base font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                Upgrade Now
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full px-6 py-3 text-base font-medium text-gray-500 hover:text-gray-700"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
