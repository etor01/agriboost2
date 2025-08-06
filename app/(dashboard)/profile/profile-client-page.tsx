// app/(dashboard)/profile/profile-client-page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddFarmModal from '@/components/features/farm/AddFarmModal';

// --- ICONS ---
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertTriangleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const MapPinIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const SettingsIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

// --- Main Profile Page Component ---
export default function ProfileClientPage({ user, profile: initialProfile, farms: initialFarms }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [farms, setFarms] = useState(initialFarms);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  
  const handleAddFarm = async (farmData) => {
    const { data, error } = await supabase
      .from('farms')
      .insert({ ...farmData, user_id: user.id })
      .select()
      .single();

    if (error) {
      alert('Error adding farm: ' + error.message);
    } else {
      setFarms([...farms, data]);
      alert('Farm added successfully!');
    }
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-green-600 text-white shadow-md'
          : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalDetailsTab user={user} profile={initialProfile} />;
      case 'farms':
        return <FarmsTab farms={farms} onAddNew={() => setIsFarmModalOpen(true)} />;
      case 'settings':
        return <SettingsTab user={user} profile={initialProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img src={initialProfile.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md" />
              {initialProfile.verification_status === 'verified' && (
                  <div className="absolute bottom-0 right-0 bg-green-500 p-1.5 rounded-full border-2 border-white">
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{initialProfile.full_name || 'New Farmer'}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className={`mt-2 inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                initialProfile.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {initialProfile.verification_status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-b border-gray-200">
          <nav className="flex flex-wrap items-center gap-2">
            <TabButton id="personal" label="Personal Details" icon={<UserIcon className="h-5 w-5" />} />
            <TabButton id="farms" label="My Farms" icon={<MapPinIcon className="h-5 w-5" />} />
            <TabButton id="settings" label="Settings & Verification" icon={<SettingsIcon className="h-5 w-5" />} />
          </nav>
        </div>
        <div className="p-6 md:p-8">{renderContent()}</div>
      </div>
      <AddFarmModal 
        isOpen={isFarmModalOpen}
        setIsOpen={setIsFarmModalOpen}
        onAddFarm={handleAddFarm}
      />
    </div>
  );
}

// --- TAB COMPONENTS ---
const PersonalDetailsTab = ({ user, profile }) => {
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '');
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleUpdate = async () => {
        setIsSaving(true);
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName, phone_number: phoneNumber })
          .eq('id', user.id);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Profile updated!');
            router.refresh();
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
            </div>
            <button onClick={handleUpdate} disabled={isSaving} className="w-full sm:w-auto text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg shadow-md transition-all disabled:bg-green-400">
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
};

const FarmsTab = ({ farms, onAddNew }) => (
    <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800">Manage Your Farms</h3>
            <button onClick={onAddNew} className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow-md">
                + Add New Farm
            </button>
        </div>
        {farms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {farms.map(farm => (
                    <Link href={`/farm/${farm.id}`} key={farm.id}>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <p className="font-bold text-gray-900">{farm.name}</p>
                            <p className="text-sm text-gray-500">{farm.location}</p>
                            <p className="text-sm text-gray-500 mt-1">{farm.size_in_acres} Acres</p>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
             <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border-2 border-dashed">
                <h3 className="text-lg font-medium text-gray-800">No farms found</h3>
                <p className="text-gray-500 mt-1">Click "Add New Farm" to get started.</p>
            </div>
        )}
    </div>
);

const SettingsTab = ({ user, profile }) => {
    const [idFile, setIdFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleUploadVerification = async () => {
        if (!idFile) return;
        setIsUploading(true);
        const filePath = `${user.id}/${idFile.name}`;
        const { error } = await supabase.storage.from('verification_docs').upload(filePath, idFile, { upsert: true });
        if (error) {
            alert('Error uploading file: ' + error.message);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('verification_docs').getPublicUrl(filePath);
            const { error: updateError } = await supabase.from('profiles').update({ verification_doc_url: publicUrl, verification_status: 'pending' }).eq('id', user.id);
            if (updateError) alert('Error updating profile: ' + updateError.message);
            else {
                alert('Document uploaded! Your verification is pending.');
                router.refresh();
            }
        }
        setIsUploading(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Farmer Verification</h3>
                {profile.verification_status === 'verified' ? (
                    <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-lg border border-green-200"><CheckCircleIcon className="h-6 w-6 mr-3" /><span>Your account is verified.</span></div>
                ) : profile.verification_status === 'pending' ? (
                     <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200"><AlertTriangleIcon className="h-6 w-6 mr-3" /><span>Your verification is pending review.</span></div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600 mb-4">Upload a valid ID document to get a verified badge.</p>
                        <input id="id-upload" type="file" onChange={(e) => setIdFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200" />
                        {idFile && <p className="text-xs text-gray-500 mt-2">Selected: {idFile.name}</p>}
                        <button onClick={handleUploadVerification} disabled={!idFile || isUploading} className="w-full sm:w-auto mt-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isUploading ? 'Uploading...' : 'Upload and Submit'}
                        </button>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Account Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors">Change Password</button>
                    <button className="w-full text-left p-4 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium transition-colors">Delete Account</button>
                </div>
            </div>
        </div>
    );
};
