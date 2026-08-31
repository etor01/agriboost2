import Link from "next/link";
import Image from "next/image";
import logo from "../../public/icons/logo.png";

export default function Header() {
  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl bg-white/85 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] rounded-2xl transition-all">
        <div className="px-4 py-2 sm:px-6 sm:py-2.5 flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="p-1 bg-emerald-50 rounded-lg group-hover:scale-105 transition-transform duration-200 border border-emerald-100/80">
              <Image
                alt="AgriBoost logo"
                src={logo}
                width={28}
                height={28}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
              Agri<span className="text-emerald-600">Boost</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Marketplace", href: "/market" },
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative text-xs sm:text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors py-1 group"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-600 text-white px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md shadow-2xs hover:bg-emerald-700 transition-colors active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

