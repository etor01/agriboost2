// app/metrics/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Database, Globe, LineChart, ShieldCheck, Tractor, TrendingUp } from 'lucide-react';

export default async function PublicMetricsPage() {
  const supabase = await createClient();

  // Fetch stats from database
  const { count: totalFarms } = await supabase
    .from('farms')
    .select('*', { count: 'exact', head: true });

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalCrops } = await supabase
    .from('crops')
    .select('*', { count: 'exact', head: true });

  const { count: totalDiagnostics } = await supabase
    .from('crop_diagnostics')
    .select('*', { count: 'exact', head: true });

  const { data: farmsData } = await supabase
    .from('farms')
    .select('size_in_acres');
  const totalAcres = farmsData?.reduce((sum, f) => sum + Number(f.size_in_acres ?? 0), 0) ?? 0;

  const { data: txData } = await supabase
    .from('transactions')
    .select('amount');
  const totalVolume = txData?.reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0) ?? 0;

  const { data: cropsList } = await supabase
    .from('crops')
    .select('crop_type');

  // Count crop distributions
  const cropCounts: Record<string, number> = {};
  cropsList?.forEach(c => {
    const type = c.crop_type || 'Other';
    cropCounts[type] = (cropCounts[type] || 0) + 1;
  });
  const totalCropsCount = cropsList?.length || 1;
  const cropDistribution = Object.entries(cropCounts).map(([label, count]) => ({
    label,
    percentage: Math.round((count / totalCropsCount) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  const insights = [
    `Currently monitoring ${totalAcres.toFixed(1)} acres of registered farm land across Ghana.`,
    `AI crop disease diagnostics helper has analyzed ${totalDiagnostics ?? 0} crops to detect outbreaks early.`,
    `A total of GH₵ ${totalVolume.toFixed(2)} in platform transaction volume has been recorded securely in escrow.`,
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(135deg,_#f8fffb_0%,_#f7faf8_100%)] text-slate-800">
      <header className="border-b border-emerald-100/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/"
              className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600">
              Agriboost live metrics
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Platform Performance Dashboard
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 self-start lg:self-center">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            Live Data Feed
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10 space-y-8">
        {/* Core KPI metrics row */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Registered Farmers",
              value: totalFarms ?? 0,
              description: "Active producers registered",
              icon: Tractor,
              color: "text-emerald-600 bg-emerald-50"
            },
            {
              title: "Monitored Land Area",
              value: `${totalAcres.toFixed(1)} ac`,
              description: "Cultivated acreage tracked",
              icon: Globe,
              color: "text-sky-600 bg-sky-50"
            },
            {
              title: "Escrow Volume",
              value: `GH₵ ${totalVolume.toFixed(0)}`,
              description: "Total transaction payouts",
              icon: TrendingUp,
              color: "text-indigo-600 bg-indigo-50"
            },
            {
              title: "AI Scans Performed",
              value: totalDiagnostics ?? 0,
              description: "Diagnostics analyses logs",
              icon: ShieldCheck,
              color: "text-purple-600 bg-purple-50"
            }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.title}</p>
                  <p className="text-3xl font-extrabold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{kpi.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main overview block */}
          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">
                Eco-System Health
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 leading-snug">
                Fostering Agricultural Productivity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                An aggregated view of crops, listings, and farms currently active on our platform.
              </p>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Active Crop Types
                  </div>
                  <div className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
                    {totalCrops ?? 0}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Producers map out standard timelines to schedule weeding, watering, and harvest offsets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Listing Availability Rate</span>
                    <span className="text-emerald-600">High</span>
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-slate-900">
                    {totalListings ?? 0} <span className="text-xs font-semibold text-gray-400">active listings</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Database className="h-4 w-4 text-emerald-600" /> Platform Insights
                </p>
                <div className="space-y-3">
                  {[
                    ["Registered Farms", `${totalFarms ?? 0}`],
                    ["Total Active Listings", `${totalListings ?? 0}`],
                    ["Diagnostics Scans", `${totalDiagnostics ?? 0}`],
                    ["Monitored Land Area", `${totalAcres.toFixed(1)} acres`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm text-slate-600 border-b border-slate-200/60 pb-2 last:border-0 last:pb-0"
                    >
                      <span>{label}</span>
                      <span className="font-bold text-slate-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Snapshot sidebar block */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-lg space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
                Crop Distribution
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Dominant crop types cultivated across registered farm parcels.
              </p>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {cropDistribution.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-200">{item.label}</span>
                    <span className="font-extrabold text-emerald-400">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {cropDistribution.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">No crops recorded.</p>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic insights section */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Performance Yield Chart block */}
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">
                  Yield Ratios
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                  Performance Analysis
                </h3>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Last 90 days
              </div>
            </div>

            <div className="space-y-4">
              {cropDistribution.slice(0, 4).map((bar, idx) => (
                <div key={idx}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                    <span className="font-semibold text-gray-700">{bar.label}</span>
                    <span className="font-bold text-slate-900">
                      {bar.percentage}% of overall
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                      style={{ width: `${bar.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {cropDistribution.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">No crops recorded.</p>
              )}
            </div>
          </div>

          {/* Public Data Insights Text block */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">
                Public Insights
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                What the Data Tells Us
              </h3>
              <div className="mt-4 space-y-3">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
              This is a live, public metrics interface providing insight into farm operations. All metrics are anonymized and aggregated dynamically from our real-time database feeds.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
