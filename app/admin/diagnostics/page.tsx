// app/admin/diagnostics/page.tsx

import { createClient } from '@/lib/supabase/server';
import { Sparkles, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle },
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 border-amber-200',  icon: Clock },
  failed:    { label: 'Failed',    cls: 'bg-red-100 text-red-700 border-red-200',         icon: AlertTriangle },
};

// Dummy regional trend data — replace with real aggregated queries later
const REGIONAL_TRENDS = [
  { region: 'Ashanti Region', scans: 24, topDisease: 'Maize Rust', severity: 'high', pct: 82 },
  { region: 'Eastern Region', scans: 18, topDisease: 'Tomato Blight', severity: 'medium', pct: 60 },
  { region: 'Brong-Ahafo', scans: 11, topDisease: 'Cassava Mosaic', severity: 'low', pct: 35 },
  { region: 'Northern Region', scans: 7,  topDisease: 'Leaf Spot', severity: 'low', pct: 20 },
  { region: 'Volta Region', scans: 5,   topDisease: 'Root Rot', severity: 'medium', pct: 45 },
];

const severityColor: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-green-600 bg-green-50 border-green-200',
};

const barColor: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export default async function DiagnosticsPage() {
  const supabase = await createClient();

  const [
    { data: diagnostics },
    { count: totalScans },
    { count: completedScans },
    { count: failedScans },
  ] = await Promise.all([
    supabase
      .from('crop_diagnostics')
      .select(`
        id, status, created_at, image_url, ai_result,
        farmers ( profiles ( firstname, lastname, region ) )
      `)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('crop_diagnostics').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
  ]);

  const successRate = totalScans && totalScans > 0
    ? Math.round(((completedScans ?? 0) / totalScans) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Diagnostics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor crop disease scan activity, regional trends, and AI model performance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: totalScans ?? 0, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Completed', value: completedScans ?? 0, color: 'text-green-600', bg: 'bg-white' },
          { label: 'Failed', value: failedScans ?? 0, color: 'text-red-600', bg: 'bg-white' },
          { label: 'Success Rate', value: `${successRate}%`, color: successRate >= 90 ? 'text-green-600' : 'text-amber-600', bg: 'bg-white' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 shadow-sm border border-gray-100 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Disease Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">Regional Disease Trends</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Demo data</span>
          </div>
          <div className="space-y-4">
            {REGIONAL_TRENDS.map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{r.region}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${severityColor[r.severity]}`}>
                      {r.severity}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{r.scans} scans</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${barColor[r.severity]}`} style={{ width: `${r.pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Top disease: <strong className="text-gray-600">{r.topDisease}</strong></p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Admin Actions</h2>
          <div className="space-y-3">
            {[
              { title: 'Broadcast Disease Alert', desc: 'Push a regional warning to all affected farmers', action: 'Broadcast', color: 'bg-red-600 hover:bg-red-700' },
              { title: 'Update AI Model Parameters', desc: 'Adjust confidence thresholds and disease definitions', action: 'Configure', color: 'bg-gray-900 hover:bg-gray-800' },
              { title: 'Export Scan Report', desc: 'Download this month\'s diagnostic log as CSV', action: 'Export CSV', color: 'bg-emerald-600 hover:bg-emerald-700' },
              { title: 'Review Failed Scans', desc: `${failedScans ?? 0} scans failed and need manual review`, action: 'Review', color: 'bg-amber-600 hover:bg-amber-700' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button className={`text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${item.color}`}>
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-700">Recent Diagnostic Scans (last 20)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Result</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {diagnostics && diagnostics.map((d) => {
                const ui = statusConfig[d.status] ?? statusConfig['pending'];
                const Icon = ui.icon;
                const farmer = (d.farmers as any)?.profiles;
                const farmerName = farmer ? [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') : 'Unknown';
                const aiLabel = (d.ai_result as any)?.disease ?? (d.ai_result as any)?.label ?? '—';
                return (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{farmerName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{farmer?.region ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{aiLabel}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}>
                        <Icon className="w-3 h-3" />
                        {ui.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(d.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!diagnostics || diagnostics.length === 0) && (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No scans yet</p>
            <p className="text-sm text-gray-400 mt-1">AI diagnostic scans will appear here as farmers use the feature.</p>
          </div>
        )}
      </div>
    </div>
  );
}
