import Link from "next/link";
import Image from "next/image";
import logo from "../../public/icons/logo.png";

export default function Header() {
  return (
    // Changed to a floating fixed header for a more "app-like" modern feel
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl bg-white/70 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl">
        <div className="px-6 py-3 flex justify-between items-center">
          {/* Logo Section: Using a tighter tracking for a premium feel */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-1.5 bg-green-50 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <Image
                alt="AgriBoost logo"
                src={logo}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Agri<span className="text-green-600">Boost</span>
            </span>
          </Link>

          {/* Navigation: Added "Indicator dots" on hover for a subtle touch */}
          <div className="hidden md:flex items-center space-x-10">
            {["Features", "Marketplace", "Contact"].map((item) => (
              <Link
                key={item}
                href={
                  item === "Marketplace"
                    ? "/market"
                    : `#${item.toLowerCase()}`
                }
                className="relative text-sm font-medium text-slate-600 hover:text-green-600 transition-colors py-2 group"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>

          {/* Actions: Soft "Google-style" colors and rounded-full buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold rounded-full shadow-lg hover:bg-green-600 hover:shadow-green-200/50 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

{
  /*
export default function Header() {
  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl transition-colors duration-300">
        <div className="px-6 py-3 flex justify-between items-center">
          
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <Image alt="AgriBoost logo" src={logo} width={32} height={32} className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Agri<span className="text-green-600">Boost</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            {['Features', 'Marketplace', 'Contact'].map((item) => (
              <Link 
                key={item}
                href={item === 'Marketplace' ? '/marketplace' : `#${item.toLowerCase()}`}
                className="relative text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 group"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-slate-900 dark:bg-green-600 text-white dark:text-slate-100 px-5 py-2.5 text-sm font-semibold rounded-full shadow-lg hover:bg-green-600 dark:hover:bg-green-500 hover:shadow-green-200/50 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}    
 OPTION WITH THE DARK MODE IMPLEMENTED
    */
}
