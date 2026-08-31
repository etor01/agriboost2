// components/ui/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/icons/logo.png";

export default function Footer() {
  const linkGroups = [
    {
      heading: "Platform",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/market", label: "Marketplace" },
        { href: "/login", label: "Sign In" },
        { href: "/signup", label: "Sign Up" },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/careers", label: "Careers & Roles" },
        { href: "/contact", label: "Contact Us" },
      ],
    },
    {
      heading: "Legal & Safety",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ],
    },
  ];

  const allLinks = linkGroups.flatMap((group) => group.links);

  return (
    <footer id="contact" className="relative py-10 md:py-14 px-4 sm:px-6">
      {/* Glass Container */}
      <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] p-6 sm:p-8 md:p-10 transition-all">
        {/* Mobile: Flat Link List */}
        <div className="md:hidden space-y-5">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-emerald-50 rounded-lg border border-emerald-100/80">
              <Image
                alt="AgriBoost logo"
                src={logo}
                width={24}
                height={24}
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900">
              Agri<span className="text-emerald-600">Boost</span>
            </span>
          </div>

          <p className="text-xs text-zinc-600">
            AI-driven agricultural ecosystem and verified produce marketplace for Ghanaian farmers and traders.
          </p>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-zinc-200/60">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-zinc-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tablet / Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-emerald-50 rounded-lg border border-emerald-100/80">
                <Image
                  alt="AgriBoost logo"
                  src={logo}
                  width={24}
                  height={24}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-900">
                Agri<span className="text-emerald-600">Boost</span>
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-2">
              The complete AI-powered farm management and verified trade platform for Ghana.
            </p>
            <p className="text-[11px] text-zinc-400 font-medium">Platform Version 1.2.0</p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2 text-xs">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-zinc-600 hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-200/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} AgriBoost Ghana. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-emerald-600 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}