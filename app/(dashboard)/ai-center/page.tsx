'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { analyzeCropImage } from './actions';

// --- ICONS ---
const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// --- TYPES ---
interface AnalysisResult {
  is_healthy: boolean;
  disease_name: string;
  confidence_score: number;
  recommendations: string;
}

export default function AiCenterPage() {
  const supabase = createClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [scansRemaining, setScansRemaining] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch scan count on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_scans_remaining')
        .eq('id', user.id)
        .single();

      setScansRemaining(profile?.ai_scans_remaining ?? 0);
    })();
  }, [supabase]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisResult(null);
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (scansRemaining <= 0) return setShowUpgradeModal(true);
    if (!imageFile) return setError('Please select an image to analyze.');

    setIsLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in.');
      setIsLoading(false);
      return;
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('disease_images')
      .upload(fileName, imageFile);

    if (uploadError) {
      setError(`Error uploading image: ${uploadError.message}`);
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('disease_images')
      .getPublicUrl(fileName);

    const result = await analyzeCropImage(publicUrl, null);

    if (result.success) {
      setAnalysisResult(result.analysis);
    } else {
      setError(result.message || 'An error occurred during analysis.');
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">AI Disease Detection Center</h1>
        <div className="text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded-lg">
          {scansRemaining} Scans Remaining
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Crop Image</h2>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Crop preview" className="mx-auto h-48 w-auto rounded-md" />
              ) : (
                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                  <span>Choose a file</span>
                  <input id="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || isLoading}
            className="w-full mt-4 py-3 text-base font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Crop Health'}
          </button>
        </div>

        {/* Analysis Result */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Result</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Running AI analysis, please wait...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              <div className={`flex items-start p-4 rounded-lg ${analysisResult.is_healthy ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {analysisResult.is_healthy
                  ? <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                  : <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />}
                <div>
                  <h3 className="font-bold text-lg">{analysisResult.disease_name}</h3>
                  <p className="text-sm">Confidence: {(analysisResult.confidence_score * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Recommendations:</h4>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{analysisResult.recommendations}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-center text-gray-500">
              <p>Upload an image and click &quot;Analyze&quot; to see the results here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900">Out of Scans!</h2>
            <p className="text-gray-600 mt-2">
              You&apos;ve used all your free AI scans. Upgrade to a 5-Star Farmer plan to get unlimited scans and more premium features.
            </p>
            <div className="mt-6">
              <Link href="/finances" className="block w-full px-6 py-3 text-base font-bold text-white bg-green-600 rounded-lg">
                Upgrade Now
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="mt-2 w-full px-6 py-3 text-base font-medium text-gray-700"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
