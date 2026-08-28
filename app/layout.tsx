import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LenisAutoScroll from "@/components/ui/LenisAutoScroll";
import SmoothScroll from "@/components/ui/SmoothScroll";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ── Phase 1 & 8: Full PWA Metadata ───────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "AgriBoost",
    template: "%s | AgriBoost",
  },
  description:
    "AI-powered crop disease detection, farm management, and direct marketplace for Ghanaian smallholder farmers.",
  manifest: "/manifest.json",
  // Apple PWA support (iOS "Add to Home Screen")
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriBoost",
    startupImage: "/icons/icon-512x512.png",
  },
  // Prevent iOS auto-linking phone numbers
  formatDetection: { telephone: false },
  // Open Graph for social sharing
  openGraph: {
    title: "AgriBoost",
    description: "AI-powered agriculture for Ghanaian farmers.",
    type: "website",
    locale: "en_GH",
  },
};

// Viewport must be a separate export in Next.js 14+
export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll>
          <LenisAutoScroll />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
