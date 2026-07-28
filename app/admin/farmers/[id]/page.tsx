// app/admin/farmers/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateVerificationStatus } from './actions';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';

function VerificationForm({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  // Wrap bound server action in a void-returning async fn to satisfy Next.js form action types
  const approveAction = async (formData: FormData): Promise<void> => {
    await updateVerificationStatus(userId, 'verified');
  };
  const rejectAction = async (formData: FormData): Promise<void> => {
    await updateVerificationStatus(userId, 'rejected');
  };

  return (
    <div className="flex items-center gap-3">
      <form action={approveAction}>
        <button
          type="submit"
          disabled={currentStatus === 'verified'}
          className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ✓ Approve
        </button>
      </form>
      <form action={rejectAction}>
        <button
          type="submit"
          disabled={currentStatus === 'rejected'}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ✗ Reject
        </button>
      </form>
    </div>
  );
}

type FarmerDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  verified:   { label: 'Verified',      icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-200' },
  pending:    { label: 'Pending Review', icon: Clock,       className: 'bg-amber-100 text-amber-700 border-amber-200' },
  rejected:   { label: 'Rejected',      icon: XCircle,     className: 'bg-red-100 text-red-700 border-red-200' },
};

export default async function FarmerDetailsPage({ params }: FarmerDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch profile — email is now stored directly in profiles (no service-role needed)
  const { data: farmer, error } = await supabase
    .from('profiles')
    .select(`
      id, firstname, lastname, email, phone,
      location, region, bio, avatar_url,
      verification_status, verification_doc_url,
      subscription_tier, ai_scans_remaining,
      created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (error || !farmer) notFound();

  const statusUI = statusConfig[farmer.verification_status ?? 'pending'] ?? statusConfig['pending'];
  const StatusIcon = statusUI.icon;
  const fullName = [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') || 'Unnamed Farmer';
  const initials = `${farmer.firstname?.[0] ?? ''}${farmer.lastname?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/farmers"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farmer List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                {farmer.avatar_url ? (
                  <img src={farmer.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-emerald-700">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusUI.className}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusUI.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Joined {new Date(farmer.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate">{farmer.email ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{farmer.phone ?? 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{[farmer.location, farmer.region].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={`font-semibold capitalize ${farmer.subscription_tier === 'premium' ? 'text-amber-600' : 'text-gray-600'}`}>
                  {farmer.subscription_tier ?? 'free'} plan
                </span>
              </div>
            </div>

            {farmer.bio && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 italic">"{farmer.bio}"</p>
              </div>
            )}
          </div>

          {/* AI Scans remaining */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">AI Scans Remaining</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{farmer.ai_scans_remaining ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Right — Verification Document */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Verification Document
          </h2>

          {farmer.verification_doc_url ? (
            <div className="space-y-4">
              <a
                href={farmer.verification_doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-colors"
              >
                <img
                  src={farmer.verification_doc_url}
                  alt="Verification Document"
                  className="w-full h-auto"
                />
              </a>
              <VerificationForm userId={farmer.id} currentStatus={farmer.verification_status ?? 'pending'} />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No document uploaded</p>
              <p className="text-xs text-gray-400 mt-1">Farmer hasn't submitted their ID yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
