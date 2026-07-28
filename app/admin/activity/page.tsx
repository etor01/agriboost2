// app/admin/activity/page.tsx

import { createClient } from '@/lib/supabase/server';
import { Activity, Leaf, MapPin, ShoppingBag, Sparkles, CheckSquare, CreditCard, User } from 'lucide-react';

const activityMeta: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  crop_created:      { icon: Leaf,         color: 'text-green-600',  bg: 'bg-green-100',  label: 'Crop Created' },
  farm_created:      { icon: MapPin,       color: 'text-teal-600',   bg: 'bg-teal-100',   label: 'Farm Created' },
  listing_created:   { icon: ShoppingBag,  color: 'text-blue-600',   bg: 'bg-blue-100',   label: 'Listing Created' },
  scan_performed:    { icon: Sparkles,     color: 'text-purple-600', bg: 'bg-purple-100', label: 'AI Scan' },
  task_completed:    { icon: CheckSquare,  color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Task Completed' },
  payment_received:  { icon: CreditCard,   color: 'text-emerald-600',bg: 'bg-emerald-100',label: 'Payment' },
};

const fallbackMeta = { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Activity' };

export default async function ActivityLogPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from('activities')
    .select(`
      id, activity_type, title, description, created_at,
      profiles ( firstname, lastname, role )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Group by date for display
  const grouped: Record<string, typeof activities> = {};
  activities?.forEach((act) => {
    const dateKey = new Date(act.created_at).toLocaleDateString('en-GH', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey]!.push(act);
  });

  // Compute type breakdown
  const typeCounts = activities?.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">A chronological log of all user and platform events.</p>
      </div>

      {/* Type Breakdown */}
      {activities && activities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(activityMeta).map(([type, meta]) => {
            const count = typeCounts[type] ?? 0;
            const Icon = meta.icon;
            return (
              <div key={type} className={`rounded-xl p-3.5 border border-gray-100 bg-white flex flex-col items-center gap-2 text-center`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{meta.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Grouped Feed */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, acts]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{dateLabel}</span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{acts!.length} event{acts!.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {acts!.map((act) => {
                  const meta = activityMeta[act.activity_type] ?? fallbackMeta;
                  const Icon = meta.icon;
                  const profile = act.profiles as any;
                  const userName = profile
                    ? [profile.firstname, profile.lastname].filter(Boolean).join(' ')
                    : 'System';

                  return (
                    <div key={act.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{act.title}</p>
                        {act.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{act.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            {userName}
                          </span>
                          {profile?.role && (
                            <span className="text-[10px] text-gray-300 capitalize">{profile.role}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                        {new Date(act.created_at).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No Activity Yet</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            Platform events will be logged here as farmers and buyers interact with the system.
          </p>
        </div>
      )}
    </div>
  );
}
