// app/(dashboard)/ai-center/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { analyzeCropImage } from "./actions";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

export default function AiCenterPage() {
  const supabase = createClient();

  const [scansRemaining, setScansRemaining] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScanCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("ai_scans_remaining")
          .eq("id", user.id)
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
      setError("");
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
      setError("Please select an image to analyze.");
      return;
    }
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);

    const result = await analyzeCropImage(formData);

    if (result.success) {
      setAnalysisResult(result.analysis);
      setScansRemaining((prev) => prev - 1);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            AI Disease Detection Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload plant imagery and review instant health insights.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded-lg shadow-md">
          <Sparkles className="h-4 w-4" /> {scansRemaining} Scans Remaining
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Upload Crop Image
          </h2>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="mx-auto h-48 w-auto rounded-md"
                />
              ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
                >
                  <span>Choose a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
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
            {isLoading ? "Analyzing with AI..." : "Analyze Crop Health"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Analysis Result
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">
                Running AI analysis, please wait...
              </p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              <div
                className={`flex items-start p-4 rounded-lg ${analysisResult.is_healthy ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
              >
                {analysisResult.is_healthy ? (
                  <CheckCircle2 className="h-6 w-6 mr-3 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {analysisResult.disease_name}
                  </h3>
                  <p className="text-sm">
                    Confidence:{" "}
                    {(analysisResult.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">
                  Recommendations:
                </h4>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {analysisResult.recommendations}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-center text-gray-500">
              <p>
                Upload an image and click &quot;Analyze&quot; to see the results
                here.
              </p>
            </div>
          )}
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900">Out of Scans!</h2>
            <p className="text-gray-600 mt-2">
              You&apos;ve used all your free AI scans. Upgrade to a 5-Star
              Farmer plan to get unlimited scans and more premium features.
            </p>
            <div className="mt-6">
              <Link
                href="/finances"
                className="block w-full px-6 py-3 text-base font-bold text-white bg-green-600 rounded-lg"
              >
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
