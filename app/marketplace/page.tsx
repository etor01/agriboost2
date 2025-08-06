// app/marketplace/page.tsx

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// --- ICONS ---
const SearchIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const LeafIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" /><path d="M11 20A7 7 0 0 1 4 13V8" /><path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" /></svg>;

// Reusable Product Card component
const ProductCard = ({ listing }) => (
    <Link href={`/marketplace/${listing.id}`} className="group block bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative">
            <img 
                src={listing.image_urls[0] || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'} 
                alt={listing.title}
                className="w-full h-48 object-cover"
            />
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-green-600">{listing.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1.5" />
                {listing.location}
            </p>
            <div className="mt-4 flex justify-between items-center">
                <p className="text-xl font-extrabold text-gray-900">
                    GH₵{listing.price}
                    <span className="text-sm font-medium text-gray-500"> / {listing.unit}</span>
                </p>
                <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded-full">
                    {listing.quantity_available} available
                </span>
            </div>
        </div>
    </Link>
);

// Public Header Component
const PublicHeader = () => (
     <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <LeafIcon className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">AgriBoost</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className="text-green-600 font-semibold border-b-2 border-green-600">Marketplace</Link>
            <Link href="/#about" className="text-gray-600 hover:text-green-600 transition-colors">About</Link>
            <Link href="/#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Get Started
            </Link>
          </div>
        </div>
      </header>
);

// Public Footer Component
const PublicFooter = () => (
     <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">AgriBoost</h4>
              <p className="text-gray-400">The future of farming technology.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul>
                <li className="mb-2"><Link href="/marketplace" className="hover:text-green-400 transition-colors">Marketplace</Link></li>
                <li className="mb-2"><Link href="/login" className="hover:text-green-400 transition-colors">Sign In</Link></li>
                <li className="mb-2"><Link href="/signup" className="hover:text-green-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul>
                <li className="mb-2"><Link href="/#about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li className="mb-2"><Link href="/#contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul>
                <li className="mb-2"><Link href="#" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li className="mb-2"><Link href="#" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AgriBoost. All rights reserved.</p>
          </div>
        </div>
      </footer>
);


export default async function MarketplacePage() {
    const supabase = createClient();

    // Fetch all active listings from the database
    const { data: listings, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching marketplace listings:", error);
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <PublicHeader />
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                {/* Marketplace Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Marketplace</h1>
                    <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Browse fresh produce directly from local farmers across Ghana.</p>
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
                        {listings.map(listing => (
                            <ProductCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4 bg-white rounded-lg border-2 border-dashed">
                        <h3 className="text-xl font-medium text-gray-800">The Market is Empty!</h3>
                        <p className="text-gray-500 mt-2">No listings have been created yet. Check back soon!</p>
                    </div>
                )}
            </main>
            <PublicFooter />
        </div>
    );
}