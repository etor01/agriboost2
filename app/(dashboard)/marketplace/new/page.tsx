// app/(dashboard)/marketplace/new/page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- ICONS ---
const UploadCloudIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>;
const ArrowLeftIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function NewListingPage() {
    const supabase = createClient();
    const router = useRouter();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg'); // Default unit
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        if (!imageFile) {
            setError('Please upload an image for your listing.');
            return;
        }
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('You must be logged in to create a listing.');
            setIsSubmitting(false);
            return;
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(filePath, imageFile);

        if (uploadError) {
            setError('Error uploading image: ' + uploadError.message);
            setIsSubmitting(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product_images')
            .getPublicUrl(filePath);

        const { error: insertError } = await supabase
            .from('listings')
            .insert({
                profile_id: user.id,
                name: title,
                description,
                price_per_unit: parseFloat(price),
                unit_type: unit,
                quantity: parseInt(quantity),
                image_urls: [publicUrl],
                status: 'active',
                is_featured: false,
                discount: 0,
                delivery_available: true
            });

        if (insertError) {
            setError('Error creating listing: ' + insertError.message);
        } else {
            // Log to activities table!
            await supabase.from('activities').insert({
                profile_id: user.id,
                activity_type: 'listing_created',
                title: 'New Marketplace Listing',
                description: `Listed ${title} (Qty: ${quantity} ${unit}) on the marketplace`
            });
            alert('Listing created successfully!');
            router.push('/my-listings');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/my-listings" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to My Listings
            </Link>

            <h1 className="text-3xl font-bold text-gray-800">Create a New Marketplace Listing</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product preview" className="mx-auto h-48 w-auto rounded-md" />
                            ) : (
                                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="e.g., Fresh Organic Maize" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="e.g., Kumasi, Ashanti" />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="Describe your produce..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (GH₵)</label>
                        <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="e.g., 150.00" />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                        <select id="unit" value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                            <option>kg</option>
                            <option>50kg bag</option>
                            <option>bunch</option>
                            <option>crate</option>
                            <option>piece</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity Available</label>
                        <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="e.g., 100" />
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting Listing...' : 'Create Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
}
