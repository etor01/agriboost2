"use client";
// components/features/LiveCameraScanner.tsx
// Phase 7 — Live Camera Scanner (Primary AI Scan Input)
// Uses getUserMedia() to stream the device rear camera.
// The farmer taps "Capture & Scan" to freeze a frame and pass it to the AI.
// Includes a fallback to file upload for browsers/devices that block camera access.

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RefreshCcw, Upload, X, ZoomIn } from "lucide-react";

interface LiveCameraScannerProps {
  /** Called with the captured File when the user captures or selects a frame. */
  onCapture: (file: File, previewUrl: string) => void;
  /** Show an existing preview (e.g. after capture) */
  existingPreview?: string;
  /** Reset back to camera mode */
  onReset?: () => void;
}

type ScannerMode = "camera" | "preview" | "fallback";

export default function LiveCameraScanner({
  onCapture,
  existingPreview,
  onReset,
}: LiveCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<ScannerMode>(
    existingPreview ? "preview" : "camera"
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // ── Start Camera ──────────────────────────────────────────────────────────

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach((t) => t.stop());

    setIsCameraLoading(true);
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported in this browser.");
      setMode("fallback");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("camera");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Camera access denied.";
      console.warn("[AgriBoost Camera]", msg);
      setCameraError("Camera access denied. Please grant permission or use file upload.");
      setMode("fallback");
    } finally {
      setIsCameraLoading(false);
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    if (!existingPreview) {
      startCamera(facingMode);
    } else {
      setMode("preview");
      setIsCameraLoading(false);
    }

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Capture Frame ─────────────────────────────────────────────────────────

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `crop-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        // Stop the stream to save battery after capture
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setMode("preview");
        onCapture(file, url);
      },
      "image/jpeg",
      0.92
    );
  };

  // ── Flip Camera ───────────────────────────────────────────────────────────

  const handleFlip = () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    startCamera(newFacing);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setMode("camera");
    startCamera(facingMode);
    onReset?.();
  };

  // ── File Upload Fallback ──────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMode("preview");
    onCapture(file, url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 border-2 border-dashed border-gray-700">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── CAMERA VIEW ── */}
      {(mode === "camera" || isCameraLoading) && !cameraError && (
        <div className="relative aspect-video w-full bg-black">
          {/* Loading overlay */}
          {isCameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-green-300 text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scan guide overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-green-400/70 rounded-2xl relative">
              {/* Corner decorations */}
              <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
            </div>
          </div>

          {/* Guide text */}
          <p className="absolute top-3 left-0 right-0 text-center text-xs text-green-300/90 font-medium">
            Point camera at crop leaf
          </p>

          {/* Controls bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
            {/* Flip camera */}
            <button
              id="camera-flip-btn"
              onClick={handleFlip}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Flip camera"
            >
              <RefreshCcw size={18} />
            </button>

            {/* Capture button */}
            <button
              id="camera-capture-btn"
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-green-400 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
              aria-label="Capture and scan"
            >
              <Camera size={28} className="text-gray-800" />
            </button>

            {/* File upload fallback */}
            <label
              htmlFor="camera-file-fallback"
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
              aria-label="Upload from gallery"
            >
              <Upload size={18} />
              <input
                id="camera-file-fallback"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODE (after capture) ── */}
      {mode === "preview" && existingPreview && (
        <div className="relative aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingPreview}
            alt="Captured crop"
            className="w-full h-full object-cover"
          />
          {/* Retake button */}
          <button
            id="camera-retake-btn"
            onClick={handleReset}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
            aria-label="Retake photo"
          >
            <RefreshCcw size={13} /> Retake
          </button>
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="inline-flex items-center gap-1.5 bg-green-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
              <ZoomIn size={12} /> Photo captured — ready to analyse
            </span>
          </div>
        </div>
      )}

      {/* ── FALLBACK MODE (camera not available) ── */}
      {mode === "fallback" && (
        <div className="aspect-video flex flex-col items-center justify-center gap-4 p-6 text-center">
          <Camera size={48} className="text-gray-500" />
          <div>
            <p className="text-gray-300 text-sm font-medium">Camera unavailable</p>
            <p className="text-gray-500 text-xs mt-1">{cameraError}</p>
          </div>
          <label
            htmlFor="fallback-file-upload"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <Upload size={16} /> Choose from Gallery
            <input
              id="fallback-file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}
