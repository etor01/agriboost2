import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/icons/logo.png';

export default function Header(){
    return(
         <header className="absolute top-0 left-0 w-full z-10 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
                <Image alt="leaf icon" src={logo} width={40} height={40} />
                <span className="text-2xl font-bold text-gray-800">AgriBoost</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
                <Link href="/marketplace" className="text-gray-600 hover:text-green-600 transition-colors">Marketplace</Link>
                <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
                {/* CORRECTED LINKS */}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">Sign In</Link>
                <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                Get Started
                </Link>
          </div>
        </div>
      </header>
    )
}