import { Suspense } from "react";
import MarketplaceClient from "@/app/marketplace/MarketplaceClient";

export const metadata = {
  title: "Marketplace | AgriBoost Dashboard",
  description:
    "Browse and list fresh produce on the AgriBoost marketplace.",
};

export default function DashboardMarketplacePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-emerald-50/30" />}>
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
