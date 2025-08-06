// app/(dashboard)/farm/[id]/farm-client-page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddCropModal from '@/components/features/crop/AddCropModal';
import { generateCropCarePlan } from './actions';

// --- ICONS ---
const ArrowLeftIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const MapPinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const MaximizeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const CropRow = ({ crop }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="p-3 font-medium text-gray-800">{crop.crop_type}</td>
        <td className="p-3">
          <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800">
            {crop.status}
          </span>
        </td>
        <td className="p-3 text-gray-600">{new Date(crop.planting_date).toLocaleDateString()}</td>
        <td className="p-3 text-gray-600">
          {crop.expected_harvest_date
            ? new Date(crop.expected_harvest_date).toLocaleDateString()
            : 'N/A'}
        </td>
        <td className="p-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm font-medium text-green-600 hover:underline"
          >
            {isOpen ? 'Hide Plan' : 'View Plan'} ({crop.crop_care_tasks.length})
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="p-4">
            <h4 className="font-bold text-md text-gray-700 mb-2">AI Care Schedule</h4>
            <ul className="space-y-2">
              {crop.crop_care_tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                  <div>
                    <p className="font-semibold">{task.task_name}</p>
                    <p className="text-xs text-gray-500">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {new Date(task.due_date).toLocaleDateString()}
                    </p>
                    <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
              {crop.crop_care_tasks.length === 0 && (
                <p className="text-sm text-gray-500">No care tasks found for this crop.</p>
              )}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
};

export default function FarmClientPage({ farm, initialCrops, user }) {
  const router = useRouter(); // ✅ safe hook usage
  const supabase = createClient(); // ✅ Supabase client for client components
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const handleAddCrop = async (cropData) => {
    const { data, error } = await supabase
      .from('crops')
      .insert({ ...cropData, farm_id: farm.id, user_id: user.id })
      .select()
      .single();

    if (error) {
      alert('Error adding crop: ' + error.message);
    } else {
      await generateCropCarePlan(data);
      alert('Crop added and care plan generated successfully!');
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Profile
      </Link>
      <div className="p-6 bg-white rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
            <div className="flex items-center text-gray-500 mt-2">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{farm.location}</span>
              <span className="mx-2">|</span>
              <MaximizeIcon className="h-5 w-5 mr-2" />
              <span>{farm.size_in_acres} Acres</span>
            </div>
          </div>
          <button
            onClick={() => setIsCropModalOpen(true)}
            className="w-full md:w-auto text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow-md"
          >
            + Add New Crop
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Crops on this Farm</h2>
        {initialCrops && initialCrops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3 font-semibold text-gray-600">Crop Type</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                  <th className="p-3 font-semibold text-gray-600">Planted On</th>
                  <th className="p-3 font-semibold text-gray-600">Expected Harvest</th>
                  <th className="p-3 font-semibold text-gray-600">Care Plan</th>
                </tr>
              </thead>
              <tbody>
                {initialCrops.map((crop) => (
                  <CropRow key={crop.id} crop={crop} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-medium text-gray-800">No crops found</h3>
            <p className="text-gray-500 mt-1">
              Click &#34;Add New Crop&#34; to get started.
            </p>
          </div>
        )}
      </div>
      <AddCropModal
        isOpen={isCropModalOpen}
        setIsOpen={setIsCropModalOpen}
        onAddCrop={handleAddCrop}
      />
    </div>
  );
}
