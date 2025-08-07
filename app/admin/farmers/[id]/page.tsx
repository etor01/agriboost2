// app/admin/farmers/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateVerificationStatus } from './actions';
import Link from 'next/link';

// --- ICONS ---
const ArrowLeftIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const PhoneIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

// Form component to wrap the buttons and handle the action
function VerificationForm({ userId, currentStatus }) {
    const approveAction = updateVerificationStatus.bind(null, userId, 'verified');
    const rejectAction = updateVerificationStatus.bind(null, userId, 'not_verified');

    return (
        <div className="flex items-center gap-4">
            <form action={approveAction}>
                <button 
                    type="submit"
                    disabled={currentStatus === 'verified'}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Approve
                </button>
            </form>
            <form action={rejectAction}>
                <button 
                    type="submit"
                    disabled={currentStatus === 'not_verified'}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Reject
                </button>
            </form>
        </div>
    );
}

// export default async function FarmerDetailsPage({ params }: { params: { id: string } }) {
//     const supabase = await createClient();

//     const { data: farmer, error } = await supabase
//         .from('profiles')
//         .select(`*`)
//         .eq('id', params.id)
//         .single();
    
//     // To get the user's email, we must use an admin client
//     // as the auth.users table is not directly queryable.
//     const { data: { user: authUser } } = await supabase.auth.admin.getUserById(params.id);

//     if (error || !farmer) {
//         notFound();
//     }
    export default async function FarmerDetailsPage({ params }: FarmerDetailsPageProps) {
    const supabase = await createClient();

    const { data: farmer, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', params.id)
        .single();

    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(params.id);

    if (error || !farmer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Link href="/admin/farmers" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Farmer List
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{farmer.full_name}</h1>
                        <p className="text-gray-500 capitalize">Status: {farmer.verification_status.replace('_', ' ')}</p>
                    </div>
                    <div className="border-t pt-6 space-y-4">
                        <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="text-gray-700">{authUser?.email}</span>
                        </div>
                        <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="text-gray-700">{farmer.phone_number || 'No phone number provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Document</h2>
                    {farmer.verification_doc_url ? (
                        <div className="space-y-4">
                            <a href={farmer.verification_doc_url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden">
                                <img src={farmer.verification_doc_url} alt="Verification Document" className="w-full h-auto" />
                            </a>
                            <VerificationForm userId={farmer.id} currentStatus={farmer.verification_status} />
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-gray-500">No document uploaded by this farmer yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
