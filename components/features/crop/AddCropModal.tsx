// components/features/crop/AddCropModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

export default function AddCropModal({ isOpen, setIsOpen, onAddCrop }) {
  const [cropType, setCropType] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropType || !plantingDate) {
        alert("Please fill in all required fields.");
        return;
    }
    setIsSaving(true);
    await onAddCrop({
      crop_type: cropType,
      planting_date: plantingDate,
      expected_harvest_date: harvestDate || null,
    });
    setIsSaving(false);
    setIsOpen(false); // Close modal on success
    toast({ title: "Crop Registered!", description: "Your crop has been added to the farm.", type: "success" });
    // Reset form
    setCropType('');
    setPlantingDate('');
    setHarvestDate('');
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Add a New Crop to Your Farm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cropType" className="block text-sm font-medium text-gray-700">
            Crop Type
          </label>
          <input
            id="cropType"
            type="text"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Maize, Rice, Cassava"
          />
        </div>
        <div>
          <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700">
            Planting Date
          </label>
          <input
            id="plantingDate"
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
            Expected Harvest Date (Optional)
          </label>
          <input
            id="harvestDate"
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="pt-4 flex justify-end space-x-2">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400"
            >
                {isSaving ? 'Saving...' : 'Add Crop'}
            </button>
        </div>
      </form>
    </Modal>
  );
}