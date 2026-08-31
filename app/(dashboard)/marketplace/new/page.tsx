// app/(dashboard)/marketplace/new/page.tsx
'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Store, Sparkles } from 'lucide-react';
import {
  FarmerPageHeader,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
} from '@/components/farmer/ui';

export default function NewListingPage() {
  const supabase = createClient();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    const {
      data: { publicUrl },
    } = supabase.storage.from('product_images').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('listings').insert({
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
      delivery_available: true,
    });

    if (insertError) {
      setError('Error creating listing: ' + insertError.message);
    } else {
      await supabase.from('activities').insert({
        profile_id: user.id,
        activity_type: 'listing_created',
        title: 'New Marketplace Listing',
        description: `Listed ${title} (Qty: ${quantity} ${unit}) on the marketplace`,
      });
      router.push('/my-listings');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/my-listings"
          className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 font-medium transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Listings
        </Link>
        <FarmerPageHeader
          badge="Produce Sales"
          badgeIcon={Store}
          title="Create Marketplace Listing"
          description="Publish your freshly harvested produce directly to buyers, hotels, and agricultural off-takers."
        />
      </div>

      <FarmerCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Produce Image *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 border-dashed rounded-lg bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative mx-auto h-40 w-56 rounded-md overflow-hidden border border-zinc-200">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                )}
                <div className="flex text-xs text-zinc-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer font-medium text-emerald-600 hover:text-emerald-700 focus-within:outline-none"
                  >
                    <span>{imagePreview ? 'Replace file' : 'Upload photo'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-zinc-400">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Produce Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
                placeholder="e.g. Fresh Organic Maize"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Location / Pickup Point *
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
                placeholder="e.g. Kumasi, Ashanti"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm resize-none"
              placeholder="Describe variety, quality, harvesting date, packaging, or bulk transport availability…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Price per Unit (GH₵) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
                placeholder="e.g. 150.00"
              />
            </div>
            <div>
              <label
                htmlFor="unit"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
              >
                <option value="kg">kg</option>
                <option value="50kg bag">50kg bag</option>
                <option value="100kg bag">100kg bag</option>
                <option value="bunch">bunch</option>
                <option value="crate">crate</option>
                <option value="piece">piece</option>
                <option value="ton">ton</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Quantity Available *
              </label>
              <input
                type="number"
                min="1"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <Link
              href="/my-listings"
              className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Listing…' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </FarmerCard>
    </div>
  );
}

