// app/(dashboard)/marketplace/page.tsx
import MarketplaceClient from "@/app/marketplace/MarketplaceClient";

export const metadata = {
  title: "Marketplace | AgriBoost Dashboard",
  description:
    "Browse and list fresh produce on the AgriBoost marketplace.",
};

export default function DashboardMarketplacePage() {
  return (
    <div className="min-h-screen">
      <MarketplaceClient />
    </div>
  );
}
