// app/marketplace/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

// --- TYPES ---
type Listing = {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity_available: number;
  location: string;
  image_urls: string[];
};

// --- ICONS ---
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// Reusable Product Card component
const ProductCard = ({ listing }: { listing: Listing }) => (
  <Link href={`/marketplace/${listing.id}`} className="group block h-full">
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={
            listing.image_urls[0] ||
            "https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image"
          }
          alt={listing.title}
          fill
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Badge */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 rounded-full shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          In Stock
        </span>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate group-hover:text-emerald-600 transition-colors line-clamp-2">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center mt-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
          <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Price and Availability */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Price
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none">
                GH₵{listing.price}
              </p>
              <span className="text-xs text-gray-400 font-medium mt-0.5">
                per {listing.unit}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Available
              </span>
              <span className="text-lg font-bold text-emerald-600">
                {listing.quantity_available}
              </span>
            </div>
          </div>
          {/* CTA Button */}
          <button className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
            View Details
          </button>
        </div>
      </div>
    </div>
  </Link>
);

// Public Header Component
// const PublicHeader = () => (
//   <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
//     <div className="container mx-auto px-6 py-4 flex justify-between items-center">
//       <Link href="/" className="flex items-center space-x-2">
//         <Image alt="leaf icon" src="/icons/logo.png" width={45} height={45} />
//         <span className="text-2xl font-bold text-gray-800">AgriBoost</span>
//       </Link>
//       <nav className="hidden md:flex items-center space-x-8">
//         <Link
//           href="/marketplace"
//           className="text-green-600 font-semibold border-b-2 border-green-600"
//         >
//           Marketplace
//         </Link>
//         <Link
//           href="/#about"
//           className="text-gray-600 hover:text-green-600 transition-colors"
//         >
//           About
//         </Link>
//         <Link
//           href="/#contact"
//           className="text-gray-600 hover:text-green-600 transition-colors"
//         >
//           Contact
//         </Link>
//       </nav>
//       <div className="flex items-center space-x-4">
//         <Link
//           href="/login"
//           className="text-green-600 hover:text-green-700 font-medium transition-colors"
//         >
//           Sign In
//         </Link>
//         <Link
//           href="/signup"
//           className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
//         >
//           Get Started
//         </Link>
//       </div>
//     </div>
//   </header>
// );

// Public Footer Component
// const PublicFooter = () => (
//   <footer id="contact" className="bg-gray-800 text-white py-12">
//     <div className="container mx-auto px-6">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//         <div>
//           <h4 className="text-lg font-semibold mb-4">AgriBoost</h4>
//           <p className="text-gray-400">The future of farming technology.</p>
//         </div>
//         <div>
//           <h4 className="text-lg font-semibold mb-4">Links</h4>
//           <ul>
//             <li className="mb-2">
//               <Link
//                 href="/marketplace"
//                 className="hover:text-green-400 transition-colors"
//               >
//                 Marketplace
//               </Link>
//             </li>
//             <li className="mb-2">
//               <Link
//                 href="/login"
//                 className="hover:text-green-400 transition-colors"
//               >
//                 Sign In
//               </Link>
//             </li>
//             <li className="mb-2">
//               <Link
//                 href="/signup"
//                 className="hover:text-green-400 transition-colors"
//               >
//                 Sign Up
//               </Link>
//             </li>
//           </ul>
//         </div>
//         <div>
//           <h4 className="text-lg font-semibold mb-4">Company</h4>
//           <ul>
//             <li className="mb-2">
//               <Link
//                 href="/#about"
//                 className="hover:text-green-400 transition-colors"
//               >
//                 About Us
//               </Link>
//             </li>
//             <li className="mb-2">
//               <Link
//                 href="/#contact"
//                 className="hover:text-green-400 transition-colors"
//               >
//                 Contact
//               </Link>
//             </li>
//           </ul>
//         </div>
//         <div>
//           <h4 className="text-lg font-semibold mb-4">Legal</h4>
//           <ul>
//             <li className="mb-2">
//               <Link href="#" className="hover:text-green-400 transition-colors">
//                 Privacy Policy
//               </Link>
//             </li>
//             <li className="mb-2">
//               <Link href="#" className="hover:text-green-400 transition-colors">
//                 Terms of Service
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>
//       <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
//         <p>&copy; {new Date().getFullYear()} AgriBoost. All rights reserved.</p>
//       </div>
//     </div>
//   </footer>
// );

export default async function MarketplacePage() {
  const supabase = await createClient();

  // Fetch all active listings from the database
  const { data: listings, error } = await supabase
    .from("market_listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching marketplace listings:", error);
  }

  return (
    // <div
    //   className="absolute inset-0 bg-cover bg-center flex flex-col pt-25"
    //   style={{ backgroundImage: "url('/s.jpg')" }}
    // >
    //   <div className=" opacity-30 blur-md -z-10">
    //     <Header />
    //     <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 ">
    //       {/* Marketplace Header */}
    //       <div className="text-center mb-12">
    //         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
    //           Marketplace
    //         </h1>
    //         <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
    //           Browse fresh produce directly from local farmers across Ghana.
    //         </p>
    //       </div>

    //       {/* Search and Filters */}
    //       <div className="mb-8 flex flex-col md:flex-row gap-4">
    //         <div className="relative flex-grow">
    //           <input
    //             type="text"
    //             placeholder="Search for maize, yams, cassava..."
    //             className="w-full bg-white rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
    //           />
    //           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    //         </div>
    //         <select className="bg-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300">
    //           <option>All Regions</option>
    //           <option>Ashanti</option>
    //           <option>Greater Accra</option>
    //           <option>Volta</option>
    //         </select>
    //       </div>

    //       {/* Listings Grid */}
    //       {listings && listings.length > 0 ? (
    //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    //           {listings.map((listing) => (
    //             <ProductCard key={listing.id} listing={listing} />
    //           ))}
    //         </div>
    //       ) : (
    //         <div className="text-center py-20 px-4 bg-white rounded-lg border-2 border-dashed">
    //           <h3 className="text-xl font-medium text-gray-800">
    //             The Market is Empty!
    //           </h3>
    //           <p className="text-gray-500 mt-2">
    //             No listings have been created yet. Check back soon!
    //           </p>
    //         </div>
    //       )}
    //     </main>
    //   </div>
    //   {/* <PublicFooter /> */}
    //   <Footer />
    // </div>

    <div className="relative min-h-screen flex flex-col pt-25 overflow-hidden">
      {/* 1. SEPARATE BACKGROUND LAYER */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm border-transparent scale-110 -z-10"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <Header />
      <main className="flex-grow  mx-auto px-4 sm:px-6 py-8 relative">
        {/* Marketplace Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Marketplace
          </h1>
          <p className="text-lg text-gray-100 mt-4 max-w-2xl mx-auto">
            Browse fresh produce directly from local farmers across Ghana.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for maize, yams, cassava..."
              className="w-full bg-white rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select className="bg-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300">
            <option>All Regions</option>
            <option>Ashanti</option>
            <option>Greater Accra</option>
            <option>Volta</option>
          </select>
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-medium text-gray-800">
              The Market is Empty!
            </h3>
            <p className="text-gray-500 mt-2">
              No listings have been created yet. Check back soon!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
