import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Farm, Crop, Activity, TaskWithCrop, CropGrowthPlan } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Farm Dashboard | AgriBoost",
  description: "Your AgriBoost farm overview — crops, revenue, tasks, and weather at a glance.",
};
import Link from "next/link";
import {
  type LucideIcon,
  ArrowRight,
  CheckCircle2,
  Circle,
  Droplets,
  Leaf,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Sprout,
  Tractor,
  TrendingUp,
  Wallet,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Eye,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import FarmingTipWidget from "@/components/FarmingTipWidget";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// ── Ghana region / city → GPS coordinates ────────────────────────
const GHANA_REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  "Greater Accra": { lat: 5.6037, lon: -0.1870 },
  "Ashanti":       { lat: 6.6885, lon: -1.6244 },
  "Western":       { lat: 5.1186, lon: -1.7500 },
  "Eastern":       { lat: 6.2638, lon: -0.2255 },
  "Central":       { lat: 5.1135, lon: -1.2670 },
  "Volta":         { lat: 6.5735, lon:  0.4514 },
  "Northern":      { lat: 9.5583, lon: -0.9336 },
  "Upper East":    { lat: 10.7866, lon: -0.9462 },
  "Upper West":    { lat: 10.2552, lon: -2.3225 },
  "Bono":          { lat: 7.3349, lon: -1.6891 },
  "Brong-Ahafo":   { lat: 7.3349, lon: -1.6891 },
  "Savannah":      { lat: 9.0820, lon: -1.7177 },
  "Oti":           { lat: 7.9528, lon:  0.1779 },
  "Ahafo":         { lat: 7.0,    lon: -2.3    },
  "Bono East":     { lat: 7.7,    lon: -1.2    },
  "North East":    { lat: 10.5,   lon: -0.35   },
  "Western North": { lat: 6.3,    lon: -2.8    },
  // Common city shortcuts
  "Accra":         { lat: 5.6037, lon: -0.1870 },
  "Kumasi":        { lat: 6.6885, lon: -1.6244 },
  "Tamale":        { lat: 9.4008, lon: -0.8393 },
  "Cape Coast":    { lat: 5.1037, lon: -1.2465 },
  "Takoradi":      { lat: 4.8981, lon: -1.7557 },
  "Ho":            { lat: 6.6011, lon:  0.4712 },
  "Bolgatanga":    { lat: 10.7866, lon: -0.9462 },
  "Wa":            { lat: 10.0601, lon: -2.5099 },
  "Sunyani":       { lat: 7.3349, lon: -2.3287 },
};

function resolveCoords(regionOrCity: string): { lat: number; lon: number } {
  const key = Object.keys(GHANA_REGION_COORDS).find((k) =>
    regionOrCity.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(regionOrCity.toLowerCase())
  );
  return key ? GHANA_REGION_COORDS[key] : { lat: 6.6885, lon: -1.6244 };
}

// ── Weather fetch ─────────────────────────────────────────────────
async function getWeatherData(lat = 6.6885, lon = -1.6244) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    return null;
  }
}

// ── Compute which week of the AI plan "today" falls in ───────────
function computeCurrentWeek(plantingDate: string, totalWeeks: number): number {
  const planted = new Date(plantingDate).getTime();
  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - planted) / 86_400_000)
  );
  return Math.min(Math.floor(daysElapsed / 7) + 1, totalWeeks);
}

interface ThisWeekTask {
  task: string;
  category: string;
  priority: string;
  notes: string | null;
  cropType: string;
  weekNumber: number;
  totalWeeks: number;
}

// ── Category label/color for dashboard pills ──────────────────────
const TASK_CAT: Record<string, { cls: string; icon: LucideIcon }> = {
  watering: { cls: "bg-blue-100 text-blue-700", icon: Droplets },
  fertilizer: { cls: "bg-green-100 text-green-700", icon: Sprout },
  weeding: { cls: "bg-lime-100 text-lime-700", icon: Leaf },
  pest_control: { cls: "bg-orange-100 text-orange-700", icon: ShieldCheck },
  disease_prevention: { cls: "bg-red-100 text-red-700", icon: AlertTriangle },
  observation: { cls: "bg-purple-100 text-purple-700", icon: Eye },
  harvest: { cls: "bg-amber-100 text-amber-700", icon: Leaf },
};

const QUICK_ACTIONS: Array<{
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}> = [
  { label: "Add New Farm", icon: Tractor, href: "/farm/new", color: "from-emerald-500 to-green-500" },
  { label: "Create Listing", icon: Package, href: "/marketplace/new", color: "from-blue-500 to-cyan-500" },
  { label: "AI Crop Scan", icon: Sparkles, href: "/ai-center", color: "from-purple-500 to-violet-500" },
  { label: "View Finances", icon: Wallet, href: "/finances", color: "from-amber-500 to-orange-500" },
];

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  trend?: string;
}) {
  return (
    <GlassCard className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.startsWith("+")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mt-3">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5 tracking-tight">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </GlassCard>
  );
}

const getActivityMeta = (type: string) => {
  switch (type) {
    case "crop_created": return { icon: Sprout, color: "bg-green-100 text-green-600" };
    case "farm_created": return { icon: Tractor, color: "bg-emerald-100 text-emerald-600" };
    case "listing_created": return { icon: Package, color: "bg-blue-100 text-blue-600" };
    case "scan_performed": return { icon: Sparkles, color: "bg-purple-100 text-purple-600" };
    case "task_completed": return { icon: CheckCircle2, color: "bg-teal-100 text-teal-600" };
    case "payment_received": return { icon: Wallet, color: "bg-amber-100 text-amber-600" };
    default: return { icon: Sprout, color: "bg-gray-100 text-gray-600" };
  }
};

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ── Batch 1: All queries that only need the user id ──────────────────────
  const oneWeekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    profileRes,
    farmsRes,
    activeListingsRes,
    newListingsRes,
    txRes,
    activitiesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("farms").select("*").eq("profile_id", user.id),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("created_at", oneWeekAgo),
    supabase
      .from("transactions")
      .select("amount")
      .eq("profile_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("activities")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileRes.data;
  const farms = farmsRes.data ?? [];
  const activeListingsCount = activeListingsRes.count;
  const newListingsThisWeek = newListingsRes.count;
  const totalRevenue = txRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) ?? 0;
  const recentActivities: Activity[] = activitiesRes.data ?? [];

  // ── Resolve region → GPS coords for weather ───────────────────────────────
  const regionOrCity =
    (farms[0] as Farm & { region?: string })?.region ??
    (farms[0] as Farm)?.location ??
    profile?.region ??
    "Ashanti";
  const { lat, lon } = resolveCoords(regionOrCity);

  // ── Batch 2: Queries that depend on farm IDs + weather (all parallel) ─────
  const farmIds = farms.map((f: Farm) => f.id);

  const [cropsRes, weatherData] = await Promise.all([
    farmIds.length > 0
      ? supabase
          .from("crops")
          .select("*")
          .in("farm_id", farmIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] }),
    getWeatherData(lat, lon),
  ]);

  const crops = (cropsRes.data as Crop[]) ?? [];

  // ── Derive "This Week on Your Farm" tasks from ai_growth_data ─────────────
  const thisWeekTasks: ThisWeekTask[] = [];
  for (const crop of crops) {
    if (!crop.ai_growth_data || !crop.planting_date) continue;
    const plan = crop.ai_growth_data as unknown as CropGrowthPlan;
    if (!plan.weeks || !plan.total_weeks) continue;
    const currentWeekNum = computeCurrentWeek(crop.planting_date, plan.total_weeks);
    const weekData = plan.weeks.find((w) => w.week_number === currentWeekNum);
    if (weekData) {
      for (const task of weekData.tasks) {
        thisWeekTasks.push({
          task: task.task,
          category: task.category,
          priority: task.priority,
          notes: task.notes,
          cropType: crop.crop_type,
          weekNumber: currentWeekNum,
          totalWeeks: plan.total_weeks,
        });
      }
    }
  }

  // ── Fallback: fetch regular tasks if no AI plan tasks ─────────────────────
  const cropIds = crops.map((c: Crop) => c.id);
  let tasks: TaskWithCrop[] = [];
  if (thisWeekTasks.length === 0 && cropIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("tasks")
      .select(`id, description, due_date, completed, priority, crop_id, crops ( crop_type )`)
      .in("crop_id", cropIds)
      .eq("completed", false)
      .order("due_date", { ascending: true })
      .limit(8);
    // Safe cast: the query selects exactly the fields TaskWithCrop expects
    tasks = (tasksData as unknown as TaskWithCrop[]) ?? [];
  }

  const safeProfile = profile ?? {
    id: user.id,
    firstname: user.user_metadata?.firstname ?? user.email ?? "Farmer",
    avatar_url: null,
  };
  const firstName = safeProfile.firstname as string;
  const today = new Date();

  // Crop types and region for the farming tip widget
  const cropTypes = [...new Set(crops.map((c: Crop) => c.crop_type))];
  const primaryRegion = (farms[0] as Farm & { region?: string })?.region ?? (farms[0] as Farm)?.location ?? "Ghana";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-sm text-emerald-600 font-semibold">
            {today.toLocaleDateString("en-GH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
            Good{" "}
            {today.getHours() < 12
              ? "morning"
              : today.getHours() < 17
              ? "afternoon"
              : "evening"}
            , {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {"Here's what's happening on your farm today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm bg-white/80 hover:bg-emerald-50 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" /> Marketplace
          </Link>
          <Link
            href="/marketplace/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all"
          >
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Tractor}
          label="Total Farms"
          value={String(farms.length || 0)}
          sub="Registered farms"
          trend={`+${farms.filter((f) => new Date(f.created_at).getMonth() === today.getMonth()).length} this month`}
        />
        <KpiCard
          icon={Leaf}
          label="Active Crops"
          value={String(crops.length || 0)}
          sub="Across all farms"
          trend={`${crops.filter((c: Crop) => c.ai_growth_data).length} with AI plan`}
        />
        <KpiCard
          icon={Wallet}
          label="Revenue (MTD)"
          value={`GH\u20B5 ${totalRevenue.toFixed(2)}`}
          sub="Total completed payouts"
        />
        <KpiCard
          icon={Package}
          label="Active Listings"
          value={String(activeListingsCount || 0)}
          sub="On marketplace"
          trend={newListingsThisWeek ? `+${newListingsThisWeek} this week` : undefined}
        />
      </div>

      {/* Weather + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ErrorBoundary label="Weather Widget">
            <WeatherWidget initialWeatherData={weatherData} />
          </ErrorBoundary>
        </div>

        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}
                >
                  <Icon className="h-5 w-5" />
                  <p className="text-xs font-bold text-center leading-tight">
                    {action.label}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* AI Farming Tip — loads after page render */}
          <ErrorBoundary label="Farming Tip">
            <FarmingTipWidget crops={cropTypes} region={primaryRegion} />
          </ErrorBoundary>
        </GlassCard>
      </div>

      {/* This Week + Activity + My Farms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── This Week on Your Farm ── */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" /> This Week on Your Farm
            </h2>
            {thisWeekTasks.length > 0 && (
              <Link
                href="/tasks"
                className="text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors px-2.5 py-1 rounded-full flex items-center gap-1"
              >
                {thisWeekTasks.length} task{thisWeekTasks.length !== 1 ? "s" : ""}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
            {thisWeekTasks.length === 0 && tasks.length > 0 && (
              <Link
                href="/tasks"
                className="text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors px-2.5 py-1 rounded-full flex items-center gap-1"
              >
                Manage All Tasks
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* AI-plan based this-week tasks */}
          {thisWeekTasks.length > 0 ? (
            <div className="space-y-3">
              {/* Group by crop */}
              {Array.from(new Set(thisWeekTasks.map((t) => t.cropType))).map(
                (ct) => {
                  const cropTasks = thisWeekTasks.filter(
                    (t) => t.cropType === ct
                  );
                  const first = cropTasks[0];
                  return (
                    <div key={ct}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {ct}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Week {first.weekNumber} of {first.totalWeeks}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cropTasks.map((t, i) => {
                          const meta = TASK_CAT[t.category] ?? TASK_CAT.observation;
                          const Icon = meta.icon;
                          return (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${meta.cls} border-current/20`}
                              title={t.notes ?? undefined}
                            >
                              <Icon className="h-2.5 w-2.5 flex-shrink-0" />
                              {t.task}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
              <Link
                href="/farms"
                className="block text-center text-xs text-emerald-600 font-semibold pt-2 hover:underline"
              >
                View full timeline →
              </Link>
            </div>
          ) : crops.length === 0 ? (
            /* No crops at all */
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <Sprout className="h-10 w-10 text-emerald-500 animate-bounce" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  No crops registered yet
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Add a crop to get a week-by-week AI care schedule.
                </p>
              </div>
              <Link
                href="/farms"
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              >
                + Register Crop
              </Link>
            </div>
          ) : tasks.length === 0 ? (
            /* Crops exist but no tasks */
            <div className="text-center py-12 text-gray-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold">All tasks done!</p>
              <p className="text-xs text-gray-400">
                No pending tasks. Visit your farm to generate an AI care plan.
              </p>
            </div>
          ) : (
            /* Fallback: regular tasks table */
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              <p className="text-[10px] text-gray-400 italic mb-2">
                AI plan tasks shown here once a crop plan is generated.
              </p>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors"
                >
                  <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                        {(task as any).crops?.crop_type || "General"}
                      </span>
                      <span>
                        Due:{" "}
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                            })
                          : "TBD"}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "medium"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {task.priority || "medium"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" /> Recent Activity
          </h2>
          {recentActivities.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="h-8 w-8 text-purple-400 opacity-40 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-semibold">No recent activities</p>
              <p className="text-xs">Your actions will be logged here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a: Activity) => {
                const meta = getActivityMeta(a.activity_type);
                const Icon = meta.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {a.description}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {formatRelativeTime(a.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* My Farms (market snapshot removed) */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Tractor className="h-4 w-4 text-emerald-600" /> My Farms
            </h2>
            <Link
              href="/farms"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {farms.length > 0 ? (
            <div className="space-y-2">
              {farms.slice(0, 4).map(
                (farm: {
                  id: string;
                  name: string;
                  location: string;
                  size_in_acres: number;
                }) => (
                  <Link key={farm.id} href={`/farm/${farm.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-emerald-100">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                        <Sprout className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {farm.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {farm.location}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-gray-700">
                          {farm.size_in_acres} ac
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
              {farms.length > 4 && (
                <Link
                  href="/farms"
                  className="block text-center text-xs text-emerald-600 font-semibold pt-1 hover:underline"
                >
                  +{farms.length - 4} more farms
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <Sprout className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  No farms yet
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add your first farm to get started
                </p>
              </div>
              <Link
                href="/farm/new"
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
              >
                + Add Farm
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
