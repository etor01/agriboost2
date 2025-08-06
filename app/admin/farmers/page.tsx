// app/admin/farmers/page.tsx

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// --- ICONS ---
const SearchIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const AlertCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

const getStatusUI = (status) => {
    switch (status) {
        case 'verified':
            return { icon: <CheckCircleIcon className="h-4 w-4 mr-1.5" />, className: 'bg-green-100 text-green-800' };
        case 'pending':
            return { icon: <ClockIcon className="h-4 w-4 mr-1.5" />, className: 'bg-yellow-100 text-yellow-800' };
        default:
            return { icon: <AlertCircleIcon className="h-4 w-4 mr-1.5" />, className: 'bg-red-100 text-red-800' };
    }
};

export default async function FarmerManagementPage() {
    const supabase = await createClient();

    const { data: farmers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'farmer')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching farmers:", error);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Farmer Management</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative w-full md:max-w-xs">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full bg-gray-50 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-semibold text-gray-600">Full Name</th>
                                <th className="p-3 font-semibold text-gray-600">Contact</th>
                                <th className="p-3 font-semibold text-gray-600">Verification Status</th>
                                <th className="p-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmers && farmers.map((farmer) => {
                                const statusUI = getStatusUI(farmer.verification_status);
                                return (
                                    <tr key={farmer.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{farmer.full_name || 'N/A'}</td>
                                        <td className="p-3">
                                            <p className="text-sm text-gray-500">{farmer.phone_number || 'No phone number'}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusUI.className}`}>
                                                {statusUI.icon}
                                                {farmer.verification_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <Link href={`/admin/farmers/${farmer.id}`} className="font-medium text-blue-600 hover:underline">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {farmers && farmers.length === 0 && (
                     <div className="text-center py-10 px-4">
                        <h3 className="text-lg font-medium text-gray-800">No Farmers Found</h3>
                        <p className="text-gray-500 mt-1">As new farmers sign up, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
