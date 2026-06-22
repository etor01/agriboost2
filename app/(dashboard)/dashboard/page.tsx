// app/(dashboard)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// ── Weather fetch ──────────────────────────────────────────────────
async function getWeatherData() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=6.6885&longitude=-1.6244&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    return null;
  }
}

function weatherEmoji(code: number) {
  if (code === 0) return { emoji: "☀️", label: "Clear Sky" };
  if ([1, 2, 3].includes(code)) return { emoji: "⛅", label: "Partly Cloudy" };
  if ([45, 48].includes(code)) return { emoji: "🌫️", label: "Foggy" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { emoji: "🌧️", label: "Rainy" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { emoji: "❄️", label: "Snow" };
  if ([95, 96, 99].includes(code)) return { emoji: "⛈️", label: "Thunderstorm" };
  return { emoji: "🌤️", label: "Partly Cloudy" };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Dummy activity ─────────────────────────────────────────────────
const RECENT_ACTIVITY = [
  { icon: "🌱", title: "Maize field watered", sub: "North Farm · 2 hours ago", color: "bg-green-100 text-green-600" },
  { icon: "📦", title: "New marketplace listing live", sub: "White Yam (50kg) · 5 hours ago", color: "bg-blue-100 text-blue-600" },
  { icon: "🤖", title: "AI crop health scan complete", sub: "Cassava field · 1 day ago", color: "bg-purple-100 text-purple-600" },
  { icon: "💰", title: "Payment received", sub: "GH₵ 340.00 from Kofi Mensah · 2 days ago", color: "bg-amber-100 text-amber-600" },
  { icon: "⚠️", title: "Weather alert: Rain expected", sub: "Kumasi region · 2 days ago", color: "bg-red-100 text-red-600" },
];

const TASKS = [
  { label: "Irrigate North Field", due: "Today", done: false, priority: "high" },
  { label: "Apply fertilizer – Maize", due: "Tomorrow", done: false, priority: "medium" },
  { label: "Harvest Cassava (Block B)", due: "Jun 25", done: false, priority: "high" },
  { label: "Update marketplace listing", due: "Jun 26", done: true, priority: "low" },
  { label: "Soil pH test – South Farm", due: "Jun 28", done: false, priority: "medium" },
];

const QUICK_ACTIONS = [
  { label: "Add New Farm", emoji: "🚜", href: "/profile", color: "from-emerald-500 to-green-500" },
  { label: "Create Listing", emoji: "📦", href: "/marketplace/new", color: "from-blue-500 to-cyan-500" },
  { label: "AI Crop Scan", emoji: "🤖", href: "/ai-center", color: "from-purple-500 to-violet-500" },
  { label: "View Finances", emoji: "💰", href: "/finances", color: "from-amber-500 to-orange-500" },
];

// ── Glass Card ────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────
function KpiCard({ emoji, label, value, sub, trend }: { emoji: string; label: string; value: string; sub: string; trend?: string }) {
  return (
    <GlassCard className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
          {emoji}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mt-3">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </GlassCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, farmsRes, weatherData] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("farms").select("*").eq("user_id", user.id),
    getWeatherData(),
  ]);

  const profile = profileRes.data;
  const farms = farmsRes.data ?? [];

  const safeProfile = profile ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email ?? "Farmer",
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  const firstName = (safeProfile.full_name as string).split(" ")[0];

  const currentWeather = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherInfo = currentWeather ? weatherEmoji(currentWeather.weather_code) : null;

  const today = new Date();

  return (
    <div className="space-y-6">

      {/* ── Top Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-emerald-600 font-semibold">
            {today.toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
            Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening on your farm today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm bg-white/80 hover:bg-emerald-50 transition-colors"
          >
            🛒 Marketplace
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-green-600 transition-all"
          >
            + New Listing
          </Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard emoji="🚜" label="Total Farms" value={String(farms.length || 0)} sub="Registered farms" trend="+1 this month" />
        <KpiCard emoji="🌿" label="Active Crops" value="12" sub="Across all farms" trend="+3 this season" />
        <KpiCard emoji="💰" label="Revenue (MTD)" value="GH₵ 4,820" sub="Month to date" trend="+18%" />
        <KpiCard emoji="📦" label="Active Listings" value="7" sub="On marketplace" trend="+2 this week" />
      </div>

      {/* ── Middle Row: Weather + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weather Card */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">🌤️ Weather Forecast</h2>
              <p className="text-xs text-gray-400 mt-0.5">📍 Kumasi, Ashanti Region</p>
            </div>
            {weatherInfo && (
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
                {weatherInfo.label}
              </span>
            )}
          </div>

          {currentWeather ? (
            <>
              {/* Current */}
              <div className="flex items-center gap-5 mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                <span className="text-5xl">{weatherInfo?.emoji}</span>
                <div>
                  <p className="text-4xl font-extrabold text-gray-900">{currentWeather.temperature_2m}°C</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    💧 Humidity: {currentWeather.relative_humidity_2m}% &nbsp;·&nbsp; 💨 Wind: {currentWeather.wind_speed_10m} km/h
                  </p>
                </div>
              </div>

              {/* 5-day forecast */}
              {daily && (
                <div className="grid grid-cols-5 gap-2">
                  {daily.time.slice(0, 5).map((dateStr: string, i: number) => {
                    const d = new Date(dateStr);
                    const { emoji } = weatherEmoji(daily.weather_code[i]);
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 hover:bg-white transition-colors">
                        <p className="text-xs font-semibold text-gray-500">{i === 0 ? "Today" : DAY_LABELS[d.getDay()]}</p>
                        <span className="text-xl">{emoji}</span>
                        <p className="text-xs font-bold text-gray-800">{Math.round(daily.temperature_2m_max[i])}°</p>
                        <p className="text-xs text-gray-400">{Math.round(daily.temperature_2m_min[i])}°</p>
                        {daily.precipitation_sum[i] > 0 && (
                          <p className="text-[10px] text-blue-500 font-medium">{daily.precipitation_sum[i]}mm</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <span className="text-4xl">🌐</span>
              <p className="text-sm font-medium">Weather data unavailable</p>
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}
              >
                <span className="text-2xl">{action.emoji}</span>
                <p className="text-xs font-bold text-center leading-tight">{action.label}</p>
              </Link>
            ))}
          </div>

          {/* Promo Tip */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-800 mb-0.5">💡 Farming Tip</p>
            <p className="text-[11px] text-amber-700">Maize performs best at 25–30°C. Current temp is ideal for planting!</p>
          </div>
        </GlassCard>
      </div>

      {/* ── Bottom Row: Tasks + Activity + Farms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Upcoming Tasks */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">📋 Upcoming Tasks</h2>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {TASKS.filter(t => !t.done).length} pending
            </span>
          </div>
          <div className="space-y-2">
            {TASKS.map((task, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${task.done ? "opacity-50 bg-gray-50" : "bg-white/60 hover:bg-white"}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${task.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}>
                  {task.done && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>{task.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due: {task.due}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  task.priority === "high" ? "bg-red-100 text-red-600" :
                  task.priority === "medium" ? "bg-amber-100 text-amber-600" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">🕐 Recent Activity</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 hover:bg-white transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${a.color}`}>
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* My Farms */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">🚜 My Farms</h2>
            <Link href="/profile" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Manage All →
            </Link>
          </div>

          {farms.length > 0 ? (
            <div className="space-y-2">
              {farms.slice(0, 4).map((farm: { id: string; name: string; location: string; size_in_acres: number }) => (
                <Link key={farm.id} href={`/farm/${farm.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-emerald-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-lg flex-shrink-0">
                      🌾
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{farm.name}</p>
                      <p className="text-xs text-gray-400 truncate">📍 {farm.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-gray-700">{farm.size_in_acres} ac</p>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                </Link>
              ))}
              {farms.length > 4 && (
                <Link href="/profile" className="block text-center text-xs text-emerald-600 font-semibold pt-1 hover:underline">
                  +{farms.length - 4} more farms
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <span className="text-4xl">🌱</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">No farms yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Add your first farm to get started</p>
              </div>
              <Link
                href="/profile"
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
              >
                + Add Farm
              </Link>
            </div>
          )}

          {/* Market Snapshot */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Market Snapshot</p>
            <div className="space-y-1.5">
              {[
                { crop: "White Maize", price: "GH₵ 180/bag", trend: "↑" },
                { crop: "Tomatoes", price: "GH₵ 85/crate", trend: "↓" },
                { crop: "Yam (Pona)", price: "GH₵ 25/tuber", trend: "↑" },
              ].map(m => (
                <div key={m.crop} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">{m.crop}</span>
                  <span className={`font-bold ${m.trend === "↑" ? "text-emerald-600" : "text-red-500"}`}>
                    {m.trend} {m.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
