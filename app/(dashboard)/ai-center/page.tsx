// app/(dashboard)/ai-center/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analyzeCropImage } from './actions';
import Link from 'next/link';

// --- ICONS ---
const UploadCloudIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertTriangleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

export default function AiCenterPage() {
    const supabase = createClient();

    const [scansRemaining, setScansRemaining] = useState(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchScanCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('ai_scans_remaining')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setScansRemaining(profile.ai_scans_remaining);
                }
            }
        };
        fetchScanCount();
    }, [supabase]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAnalysisResult(null);
            setError('');
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (scansRemaining <= 0) {
            setShowUpgradeModal(true);
            return;
        }

        if (!imageFile) {
            setError('Please select an image to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('image', imageFile);

        const result = await analyzeCropImage(formData);

        if (result.success) {
            setAnalysisResult(result.analysis);
            // Decrement the count on the client-side for immediate feedback
            setScansRemaining(prev => prev - 1);
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">AI Disease Detection Center</h1>
                <div className="text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded-lg shadow-md">
                    {scansRemaining} Scans Remaining
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        {isLoading ? 'Analyzing with AI...' : 'Analyze Crop Health'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Result</h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">Running AI analysis, please wait...</p>
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-4">
                            <div className={`flex items-start p-4 rounded-lg ${analysisResult.is_healthy ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {analysisResult.is_healthy ? <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" /> : <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />}
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

            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
                        <h2 className="text-2xl font-bold text-gray-900">Out of Scans!</h2>
                        <p className="text-gray-600 mt-2">You&apos;ve used all your free AI scans. Upgrade to a 5-Star Farmer plan to get unlimited scans and more premium features.</p>
                        <div className="mt-6">
                            <Link href="/finances" className="block w-full px-6 py-3 text-base font-bold text-white bg-green-600 rounded-lg">Upgrade Now</Link>
                            <button onClick={() => setShowUpgradeModal(false)} className="mt-2 w-full px-6 py-3 text-base font-medium text-gray-700">Maybe Later</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
