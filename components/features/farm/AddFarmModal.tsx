// components/features/farm/AddFarmModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function AddFarmModal({ isOpen, setIsOpen, onAddFarm }) {
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onAddFarm({
      name: farmName,
      location: location,
      size_in_acres: parseFloat(size) || 0,
    });
    setIsSaving(false);
    setIsOpen(false); // Close modal on success
    // Reset form
    setFarmName('');
    setLocation('');
    setSize('');
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Create a New Virtual Farm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
            Farm Name
          </label>
          <input
            id="farmName"
            type="text"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Sunrise Farm"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Ejisu, Ashanti"
          />
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Size (in Acres)
          </label>
          <input
            id="size"
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., 15"
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
                {isSaving ? 'Saving...' : 'Add Farm'}
            </button>
        </div>
      </form>
    </Modal>
  );
}