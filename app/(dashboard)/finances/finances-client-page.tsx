// app/(dashboard)/finances/finances-client-page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { recordSuccessfulTransaction } from './actions';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// --- ICONS ---
const StarIcon = (props) => <svg {...props} xmlns="http://www.w.3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ZapIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const ToolIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>;

const dummyTransactions = [
    { id: 'TXN7241', service_name: 'Market Ad', amount: '50.00', status: 'Completed', created_at: '2025-07-28' },
    { id: 'TXN7239', service_name: 'Equipment Fund Repayment', amount: '500.00', status: 'Completed', created_at: '2025-07-15' },
];

const getStatusClass = (status) => status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

export default function FinancesClientPage() {
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserEmail(user.email);
      };
      fetchUser();
    }, []);
    
    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: userEmail,
        amount: 12000,
        currency: 'GHS',
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    const onPaymentSuccess = (reference) => {
        recordSuccessfulTransaction({
            service_name: '5-Star Farmer Subscription',
            amount: 120.00,
            payment_gateway_ref: reference.reference,
        }).then(result => {
            if (result.success) alert('Payment successful and recorded!');
            else alert('Payment was successful but failed to record. Please contact support. Ref: ' + reference.reference);
        });
    };

    const onPaymentClose = () => console.log('Payment widget closed.');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Finances & Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-500 flex flex-col">
                    <div className="flex items-center text-green-600 mb-3"><StarIcon className="h-6 w-6 mr-2" /><h2 className="text-xl font-bold">5-Star Farmer</h2></div>
                    <p className="text-gray-600 flex-grow">Unlock premium tools, an ad-free experience, and advanced AI features.</p>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">GH₵120 <span className="text-base font-medium text-gray-500">/ year</span></p>
                        <button onClick={() => { if(userEmail) initializePayment(onPaymentSuccess, onPaymentClose); else alert("Please wait, user details are loading.") }} className="w-full mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">Upgrade Now</button>
                    </div>
                </div>
                <ServiceCard title="Marketplace Ads" description="Boost your listings to reach more buyers on the marketplace." icon={<ZapIcon className="h-6 w-6 mr-2 text-blue-500"/>} />
                <ServiceCard title="Equipment Funding" description="Apply for funding to get the tools and equipment you need to grow." icon={<ToolIcon className="h-6 w-6 mr-2 text-orange-500"/>} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b"><th className="p-3 font-semibold text-gray-600">Transaction ID</th><th className="p-3 font-semibold text-gray-600">Service</th><th className="p-3 font-semibold text-gray-600">Amount</th><th className="p-3 font-semibold text-gray-600">Date</th><th className="p-3 font-semibold text-gray-600">Status</th></tr></thead>
                        <tbody>
                            {dummyTransactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm text-gray-500">{txn.id}</td>
                                    <td className="p-3 font-medium text-gray-800">{txn.service_name}</td>
                                    <td className="p-3 font-medium text-gray-800">GH₵{txn.amount}</td>
                                    <td className="p-3 text-gray-600">{new Date(txn.created_at).toLocaleDateString()}</td>
                                    <td className="p-3"><span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(txn.status)}`}>{txn.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const ServiceCard = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <div className="flex items-center text-gray-800 mb-3">{icon}<h2 className="text-xl font-bold">{title}</h2></div>
        <p className="text-gray-600 flex-grow">{description}</p>
        <div className="mt-4"><button disabled className="w-full mt-3 px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-lg cursor-not-allowed">Coming Soon</button></div>
    </div>
);
