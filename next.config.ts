import type { NextConfig } from "next";
// @ts-expect-error — next-pwa does not ship types for ESM default import
import withPWA from "next-pwa";

const baseConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "leaftezdcoitoexsztpj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

// ── Phase 2: PWA / Service Worker Configuration ─────────────────────────────
// next-pwa wraps Next.js config with Workbox-powered service worker generation.
// The SW is auto-generated on `next build` and written to /public/sw.js.
// Custom push + sync logic lives in /public/custom-sw.js (merged at build time).

const pwaConfig = withPWA({
  dest: "public",           // Output SW to /public/sw.js
  register: true,           // Auto-register SW on page load
  skipWaiting: true,        // Activate new SW immediately (no waiting)
  disable: process.env.NODE_ENV === "development", // Disable SW in dev for easier debugging
  // next-pwa v5: custom service worker code goes in /worker/ directory.
  // It is bundled and merged into the generated sw.js automatically.
  customWorkerDir: "worker",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      // Cache Next.js page navigations (stale-while-revalidate)
      // Critical for farmers on slow 2G/3G — pages load from cache instantly.
      urlPattern: /^https:\/\/.+\/(dashboard|ai-center|farm|marketplace|finances|orders|profile).*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "agriboost-pages",
        expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
      },
    },
    {
      // Cache Supabase Storage images (CacheFirst — images rarely change)
      // Crop photos and listing images load instantly even without internet.
      urlPattern: /^https:\/\/leaftezdcoitoexsztpj\.supabase\.co\/storage\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "agriboost-images",
        expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Network-first for all AgriBoost API routes
      // Falls back to cached response if offline (graceful degradation)
      urlPattern: /\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "agriboost-api",
        expiration: { maxEntries: 25, maxAgeSeconds: 60 * 60 }, // 1 hour
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache static Next.js assets (JS, CSS, fonts) permanently
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "agriboost-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 year
      },
    },
    {
      // Cache external images (Unsplash, placeholders)
      urlPattern: /^https:\/\/(images\.unsplash\.com|placehold\.co|i\.pravatar\.cc)\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "agriboost-ext-images",
        expiration: { maxEntries: 50, maxAgeSeconds: 14 * 24 * 60 * 60 }, // 14 days
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
})(baseConfig);

export default pwaConfig;
