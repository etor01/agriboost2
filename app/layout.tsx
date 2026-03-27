import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AgriBoost",
  description: "Agriculture SaaS Web App",
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
