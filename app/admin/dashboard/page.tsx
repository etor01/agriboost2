// app/admin/dashboard/page.tsx

import { createClient } from '@/lib/supabase/server';

// --- ICONS ---
const UsersIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const MapIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const LeafIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" /><path d="M11 20A7 7 0 0 1 4 13V8" /><path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" /></svg>;
const DollarSignIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {icon}
    </div>
    <div className="mt-2">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const { count: farmerCount, error: farmerError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'farmer');

  const { count: farmCount, error: farmError } = await supabase
    .from('farms')
    .select('*', { count: 'exact', head: true });

  const { count: cropCount, error: cropError } = await supabase
    .from('crops')
    .select('*', { count: 'exact', head: true });

  if (farmerError || farmError || cropError) {
      console.error("Error fetching admin stats:", farmerError || farmError || cropError);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Farmers" value={farmerCount ?? 0} icon={<UsersIcon className="h-6 w-6 text-gray-400"/>} />
        <StatCard title="Total Farms" value={farmCount ?? 0} icon={<MapIcon className="h-6 w-6 text-gray-400"/>} />
        <StatCard title="Total Crops Logged" value={cropCount ?? 0} icon={<LeafIcon className="h-6 w-6 text-gray-400"/>} />
        <StatCard title="Total Revenue (July)" value="GH₵0" icon={<DollarSignIcon className="h-6 w-6 text-gray-400"/>} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center">
            <p className="text-gray-500">Farmer Growth Chart - Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center">
            <p className="text-gray-500">Recent Activity Feed - Placeholder</p>
        </div>
      </div>
    </div>
  );
}
