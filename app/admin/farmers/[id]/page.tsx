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
  User,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Eye,
} from 'lucide-react';

function VerificationForm({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const approveAction = async (formData: FormData): Promise<void> => {
    'use server';
    await updateVerificationStatus(userId, 'verified');
  };
  const rejectAction = async (formData: FormData): Promise<void> => {
    'use server';
    await updateVerificationStatus(userId, 'rejected');
  };

  return (
    <div className="flex items-center gap-3 pt-2">
      <form action={approveAction} className="flex-1">
        <button
          type="submit"
          disabled={currentStatus === 'verified'}
          className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          Approve Verification
        </button>
      </form>
      <form action={rejectAction} className="flex-1">
        <button
          type="submit"
          disabled={currentStatus === 'rejected'}
          className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </form>
    </div>
  );
}

type FarmerDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string; description: string }> = {
  verified:   { label: 'Verified',      icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-200', description: 'Farmer is verified and displays trusted badges.' },
  pending:    { label: 'Pending Review', icon: Clock,       className: 'bg-amber-100 text-amber-700 border-amber-200', description: 'Documents submitted and awaiting admin verification.' },
  rejected:   { label: 'Rejected',      icon: XCircle,     className: 'bg-red-100 text-red-700 border-red-200', description: 'Verification request was rejected.' },
};

export default async function FarmerDetailsPage({ params }: FarmerDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch profile with all fields including verification_doc_url, id_card_url, and avatar_url
  const { data: farmer, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !farmer) notFound();

  const statusUI = statusConfig[farmer.verification_status ?? 'pending'] ?? statusConfig['pending'];
  const StatusIcon = statusUI.icon;
  const fullName = [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') || 'Unnamed Farmer';
  const initials = `${farmer.firstname?.[0] ?? ''}${farmer.lastname?.[0] ?? ''}`.toUpperCase() || '?';

  // Support both verification_doc_url and id_card_url for ID card document
  const idCardDoc = farmer.id_card_url || farmer.verification_doc_url;
  const profilePic = farmer.avatar_url;

  return (
    <div className="space-y-6 max-w-6xl">
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
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-emerald-200">
                {profilePic ? (
                  <img src={profilePic} alt={fullName} className="w-full h-full object-cover" />
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

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 italic">&ldquo;{farmer.bio}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Side-by-side Document Preview Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Identity &amp; Verification Documents
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review both the farmer&apos;s profile picture and ID card document to verify identity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  profilePic && idCardDoc ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {[profilePic, idCardDoc].filter(Boolean).length} / 2 Docs Submitted
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Profile Picture Card */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Profile Picture
                    </span>
                    {profilePic ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Missing
                      </span>
                    )}
                  </div>

                  {profilePic ? (
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                      <img
                        src={profilePic}
                        alt="Farmer Profile Picture"
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={profilePic}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full Image
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-square w-full rounded-xl bg-gray-100/80 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                      <User className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-600">No profile picture</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Farmer has not uploaded a profile photo yet.</p>
                    </div>
                  )}
                </div>

                {profilePic && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <a
                      href={profilePic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Original ↗
                    </a>
                  </div>
                )}
              </div>

              {/* ID Card Document Card */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-400" /> ID Card Document
                    </span>
                    {idCardDoc ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Missing
                      </span>
                    )}
                  </div>

                  {idCardDoc ? (
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                      <img
                        src={idCardDoc}
                        alt="Farmer ID Card Document"
                        className="w-full h-full object-contain bg-white"
                      />
                      <a
                        href={idCardDoc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full Document
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-square w-full rounded-xl bg-gray-100/80 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                      <FileText className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-600">No ID document</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Farmer has not uploaded a national ID yet.</p>
                    </div>
                  )}
                </div>

                {idCardDoc && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <a
                      href={idCardDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Original ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Verification Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verification Action
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Verify this farmer after confirming their profile photo matches their government ID.
            </p>

            <div className={`p-3.5 rounded-xl border mb-5 ${statusUI.className}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <StatusIcon className="w-4 h-4" />
                Status: {statusUI.label}
              </div>
              <p className="text-xs opacity-90">{statusUI.description}</p>
            </div>

            <VerificationForm userId={farmer.id} currentStatus={farmer.verification_status ?? 'pending'} />

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Verification Checklist
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${profilePic ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  Profile picture is clear and visible
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${idCardDoc ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  Government ID card is legible
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${profilePic && idCardDoc ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  Name and photo match across documents
                </li>
              </ul>
            </div>
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
      </div>
    </div>
  );
}
