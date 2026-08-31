// app/(dashboard)/ai-center/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { analyzeCropImage } from "./actions";
import type { DiagnosisResult } from "./actions";
import type { CropDiagnostic } from "@/lib/database.types";
import Link from "next/link";
// Live Camera Scanner (primary input)
import LiveCameraScanner from "@/components/features/LiveCameraScanner";
// IndexedDB offline cache
import { cacheScan, getCachedScans, pruneOldScans } from "@/lib/idb/diseaseCache";
// Background Sync queue for offline scans
import {
  enqueueDiseaseScan,
  getPendingCount,
  removeSyncItem,
  getPendingScans,
} from "@/lib/idb/syncQueue";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
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
  X,
} from "lucide-react";
import {
  FarmerPageHeader,
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
  FarmerEmptyState,
} from "@/components/farmer/ui";

const PAGE_SIZE = 5;

function ConfidencePill({ confidence }: { confidence: string | null }) {
  if (!confidence) return null;
  const variant =
    confidence === "high"
      ? ("success" as const)
      : confidence === "medium"
      ? ("warn" as const)
      : ("danger" as const);
  return (
    <FarmerBadge variant={variant}>
      {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
    </FarmerBadge>
  );
}

function HealthBadge({ isHealthy }: { isHealthy: boolean | null }) {
  if (isHealthy === true)
    return (
      <FarmerBadge variant="success">
        <CheckCircle2 className="h-3 w-3 inline mr-1" /> Healthy
      </FarmerBadge>
    );
  if (isHealthy === false)
    return (
      <FarmerBadge variant="danger">
        <AlertTriangle className="h-3 w-3 inline mr-1" /> Disease Detected
      </FarmerBadge>
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
    <div className="flex gap-3.5 p-3.5 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-zinc-100 border border-zinc-100">
        {scan.image_url ? (
          <img
            src={scan.image_url}
            alt={result.crop_name ?? "Crop"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="h-6 w-6 text-zinc-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-zinc-900 text-xs sm:text-sm truncate">
              {result.crop_name ?? "Unknown Crop"}
            </p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {result.disease_name && result.disease_name !== "None"
                ? result.disease_name
                : "No disease detected"}
            </p>
          </div>
          <HealthBadge isHealthy={result.is_healthy} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <ConfidencePill confidence={result.confidence} />
          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
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
    <div className="space-y-4">
      {/* Header banner */}
      <div
        className={`flex items-start gap-3 p-3.5 rounded-lg border ${
          result.is_healthy
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-red-50/70 border-red-200 text-red-950"
        }`}
      >
        {result.is_healthy ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-bold text-sm">
              {result.crop_name ?? "Unknown Crop"}
            </h3>
            <ConfidencePill confidence={result.confidence} />
          </div>
          {result.disease_name && result.disease_name !== "None" && (
            <p className="text-xs text-red-700 font-semibold mt-0.5">
              {result.disease_name}
            </p>
          )}
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Microscope className="h-3.5 w-3.5 text-zinc-500" />
          <h4 className="font-semibold text-zinc-700 text-xs uppercase tracking-wider">
            Diagnosis
          </h4>
        </div>
        <p className="text-zinc-600 text-xs leading-relaxed bg-zinc-50 rounded-md p-3 border border-zinc-100">
          {result.diagnosis}
        </p>
      </div>

      {/* Healthy Practices */}
      {result.healthy_practices.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <h4 className="font-semibold text-zinc-700 text-xs uppercase tracking-wider">
              Recommended Practices
            </h4>
          </div>
          <ol className="space-y-1.5">
            {result.healthy_practices.map((practice, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-zinc-700">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-zinc-100 text-zinc-700 font-bold text-[10px] flex items-center justify-center mt-0.5 border border-zinc-200">
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

  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingOfflineScans, setPendingOfflineScans] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");

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

    getPendingCount().then(setPendingOfflineScans).catch(() => {});

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
        .range(offset, offset + PAGE_SIZE);

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
            }).catch(() => {});
          }
          pruneOldScans(userId, 50).catch(() => {});
        }
      } else if (error && replace && userId) {
        const cached = await getCachedScans(userId, PAGE_SIZE);
        if (cached.length > 0) {
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
        if (typeof result.scansRemaining === "number") {
          setScansRemaining(result.scansRemaining);
        }
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
      if (imageFile) {
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          await enqueueDiseaseScan({ imageBase64: base64 });
          setPendingOfflineScans((n) => n + 1);
          if ("serviceWorker" in navigator) {
            const sw = await navigator.serviceWorker.ready;
            if ("sync" in sw) {
              await (sw as any).sync.register("sync-disease-scans");
            }
          }
          setError(
            "No internet connection. Your scan has been queued and will upload automatically when you're back online."
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
    <div className="space-y-6">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Agronomy & AI Diagnostics"
        badgeIcon={Sparkles}
        title="AI Diagnostic Center"
        description="Scan crop foliage for disease identification, disease mitigation advice, and growth optimization."
        action={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-semibold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{scansRemaining} Scan{scansRemaining !== 1 ? "s" : ""} Remaining</span>
          </div>
        }
      />

      {/* AI Suite Feature Cards */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            Intelligent Farm Operations
          </h2>
          <p className="text-xs text-zinc-500">
            AI-powered advisory tools tailored for Ghanaian farming conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1 — AI Crop Disease Scanner */}
          <FarmerCard className="p-5 flex flex-col justify-between border-zinc-300 shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Microscope className="h-4 w-4" />
                </div>
                <FarmerBadge variant="success">Active Tool</FarmerBadge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  AI Crop Disease Scanner
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Capture or upload a crop leaf photo for instant disease diagnosis and treatment.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
              <span>Ready to scan below</span>
              <span>↓</span>
            </div>
          </FarmerCard>

          {/* CARD 2 — AI Growth Plan Generator */}
          <FarmerCard className="p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Sprout className="h-4 w-4" />
                </div>
                <FarmerBadge variant="warn">
                  <Crown className="h-3 w-3 inline mr-1" /> Pro Tier
                </FarmerBadge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  AI Growth Plan Generator
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Generate week-by-week crop care schedule tailored to your region and planting dates.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              {subscriptionTier !== "premium" ? (
                <Link
                  href="/upgrade"
                  className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Crown className="h-3 w-3 text-amber-400" /> Unlock with Pro
                </Link>
              ) : (
                <Link
                  href="/farms"
                  className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                >
                  Go to Farms <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </FarmerCard>

          {/* CARD 3 — AI Market Price Predictor */}
          <FarmerCard className="p-5 flex flex-col justify-between opacity-85">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <FarmerBadge variant="muted">Coming Soon</FarmerBadge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Market Price Predictor
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Optimal selling price estimations based on historical market cycles in Ghana.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <button
                disabled
                className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-zinc-100 text-zinc-400 cursor-not-allowed text-center"
              >
                In Development
              </button>
            </div>
          </FarmerCard>

          {/* CARD 4 — Pest & Weather Risk Alert */}
          <FarmerCard className="p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-lime-50 border border-lime-100 flex items-center justify-center text-lime-700">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <FarmerBadge variant="warn">
                  <Crown className="h-3 w-3 inline mr-1" /> Pro Tier
                </FarmerBadge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Pest &amp; Weather Risk Alerts
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Proactive warnings for armyworms, blight outbreaks, and adverse rainfall anomalies.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <Link
                href="/dashboard"
                className="w-full py-1.5 px-3 rounded-md text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1"
              >
                View Dashboard Alerts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </FarmerCard>
        </div>
      </div>

      {/* Upload + Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload / Camera Panel */}
        <FarmerCard className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
              <Microscope className="h-4 w-4 text-emerald-600" />
              Scan Crop Foliage
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Point camera directly at the affected leaf surface or upload high-res image.
            </p>
          </div>

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

          {pendingOfflineScans > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                <strong>{pendingOfflineScans}</strong> scan{pendingOfflineScans > 1 ? "s" : ""} queued for upload when online.
              </span>
            </div>
          )}

          {error && (
            <div
              className={`flex items-start gap-2 p-2.5 rounded-md text-xs font-medium ${
                invalidPlant
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
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
            className="w-full py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
                <span>Analysing Crop Health…</span>
              </>
            ) : (
              <>
                <Microscope className="h-4 w-4" />
                <span>Run AI Diagnosis</span>
              </>
            )}
          </button>
        </FarmerCard>

        {/* Result Panel */}
        <FarmerCard className="p-5 min-h-[300px]">
          <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-emerald-600" />
            Diagnosis Output
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2.5 text-zinc-400">
              <div className="h-6 w-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
              <p className="text-xs font-medium text-zinc-500">
                Processing crop imagery with agronomy model…
              </p>
            </div>
          ) : analysisResult ? (
            <AnalysisResultCard result={analysisResult} />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400 gap-2">
              <Microscope className="h-8 w-8 text-zinc-300" />
              <p className="text-xs text-zinc-400 max-w-xs">
                Capture or upload an image and click{" "}
                <strong className="text-zinc-700">&ldquo;Run AI Diagnosis&rdquo;</strong> to inspect disease findings.
              </p>
            </div>
          )}
        </FarmerCard>
      </div>

      {/* Scan History */}
      <FarmerCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900">
                Diagnostic Scan History
              </h2>
              {isOfflineMode && (
                <FarmerBadge variant="warn">
                  <WifiOff className="h-3 w-3 inline mr-1" /> Offline Cache
                </FarmerBadge>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              {isOfflineMode
                ? "Showing locally cached records — reconnect to sync."
                : "Recent AI scan diagnostics logged for your crops"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs">
              {["All", "Healthy", "Disease Detected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setHistoryStatusFilter(status as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    historyStatusFilter === status
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={historyStartDate}
                onChange={(e) => setHistoryStartDate(e.target.value)}
                className="px-2 py-1 border border-zinc-200 rounded-md text-zinc-700 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <span className="text-zinc-400 text-xs">to</span>
              <input
                type="date"
                value={historyEndDate}
                onChange={(e) => setHistoryEndDate(e.target.value)}
                className="px-2 py-1 border border-zinc-200 rounded-md text-zinc-700 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {historyLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3.5 p-3.5 bg-white rounded-lg border border-zinc-100 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-md bg-zinc-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-zinc-200 rounded w-1/3" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <FarmerEmptyState
                icon={Leaf}
                title="No diagnostic scans recorded"
                description="Your previous crop scans and disease records will appear here."
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((scan) => (
                <ScanHistoryCard key={scan.id} scan={scan} />
              ))}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors disabled:opacity-50 mt-2"
                >
                  {loadingMore ? (
                    <span>Loading…</span>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Load More Scans
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </FarmerCard>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl border border-zinc-200 p-6 text-center max-w-sm w-full space-y-4">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-50 border border-amber-100 rounded-md mx-auto text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                AI Diagnostic Limit Reached
              </h2>
              <p className="text-zinc-500 mt-1 text-xs leading-relaxed">
                You have reached your free AI scans limit. Upgrade to a 5-Star Farmer plan to unlock unlimited scans and priority agronomy insights.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <Link
                href="/finances"
                className="block w-full py-2 text-xs font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors shadow-xs"
              >
                Upgrade Plan
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
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

