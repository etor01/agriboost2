// app/marketplace/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageProps } from '@/lib/types';

// --- ICONS ---
const LeafIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4l2 4-2 4h4a2 2 0 0 1 2 2v2a7 7 0 0 1-7 7z" /><path d="M11 20A7 7 0 0 1 4 13V8" /><path d="M13 8V4.5A1.5 1.5 0 0 1 14.5 3L16 4.5V8" /></svg>;
const MapPinIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ArrowLeftIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

// --- Reusable Components ---
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
            <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>
);

const PublicFooter = () => (
     <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h4 className="text-lg font-semibold mb-4">AgriBoost</h4><p className="text-gray-400">The future of farming technology.</p></div>
            <div><h4 className="text-lg font-semibold mb-4">Links</h4><ul><li className="mb-2"><Link href="/marketplace" className="hover:text-green-400">Marketplace</Link></li><li className="mb-2"><Link href="/login" className="hover:text-green-400">Sign In</Link></li></ul></div>
            <div><h4 className="text-lg font-semibold mb-4">Company</h4><ul><li className="mb-2"><Link href="/#about" className="hover:text-green-400">About Us</Link></li></ul></div>
            <div><h4 className="text-lg font-semibold mb-4">Legal</h4><ul><li className="mb-2"><a href="#" className="hover:text-green-400">Privacy Policy</a></li></ul></div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500"><p>&copy; {new Date().getFullYear()} AgriBoost. All rights reserved.</p></div>
        </div>
      </footer>
);

export default async function ListingDetailPage({ params }: PageProps) {
    const supabase = createClient();

    const { data: listing, error } = await supabase
        .from('market_listings')
        .select(`*, profile:profiles (full_name, avatar_url, verification_status)`)
        .eq('id', params.id)
        .eq('status', 'active')
        .single();

    if (error || !listing) {
        notFound();
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <PublicHeader />
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Marketplace
                    </Link>
                </div>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div>
                            <img 
                                src={listing.image_urls[0] || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'} 
                                alt={listing.title}
                                className="w-full h-64 md:h-full object-cover"
                            />
                        </div>
                        <div className="p-8 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{listing.title}</h1>
                            <div className="mt-4 flex items-center text-gray-500">
                                <MapPinIcon className="h-5 w-5 mr-2" />
                                <span>{listing.location}</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900 mt-6">
                                GH₵{listing.price}
                                <span className="text-base font-medium text-gray-500"> / {listing.unit}</span>
                            </p>
                            <div className="mt-6 border-t pt-6">
                                <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{listing.description || 'No description provided.'}</p>
                            </div>
                            <div className="mt-6 border-t pt-6">
                                <h2 className="text-lg font-semibold text-gray-800">About the Farmer</h2>
                                <div className="flex items-center mt-4">
                                    <img 
                                        src={listing.profile.avatar_url || `https://i.pravatar.cc/150?u=${listing.user_id}`}
                                        alt={listing.profile.full_name}
                                        className="h-14 w-14 rounded-full object-cover"
                                    />
                                    <div className="ml-4">
                                        <p className="font-bold text-gray-800">{listing.profile.full_name}</p>
                                        {listing.profile.verification_status === 'verified' && (
                                            <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                                                Verified Farmer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-8">
                                <button className="w-full px-6 py-4 text-base font-bold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700">
                                    Contact Farmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
