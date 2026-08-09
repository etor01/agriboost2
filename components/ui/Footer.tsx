import Link from "next/link";

export default function Footer() {
  const linkGroups = [
    {
      heading: "Links",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/market", label: "Marketplace" },
        { href: "/login", label: "Sign In" },
        { href: "/signup", label: "Sign Up" },
      ],
    },
    {
      heading: "Project & Team",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/careers", label: "Careers & Roles" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ],
    },
  ];

  const allLinks = linkGroups.flatMap((group) => group.links);

  return (
    <footer id="contact" className="relative py-10 md:py-16 px-6">
      {/* Glass container */}
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-6 md:p-10 transition-all">
        {/* Brand - shown on all sizes, centered on mobile */}
        {/* <div className="text-center md:text-left mb-6 md:mb-0">
          <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-2 md:mb-3">
            AgriBoosaaaaaat
          </h4>
          <p className="text-sm text-slate-600">
            The future of Ghanaian Farm Management.
          </p>
          <p className="text-sm text-slate-500 mt-2">Version 1.1.0</p>
        </div> */}

        {/* Mobile: flat centered link row */}
        <nav className="md:hidden mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-slate-600 hover:text-green-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Tablet/Desktop: full column grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 md:mt-0">
          {/* Brand repeated here for grid position on desktop */}
          <div>
            <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
              AgriBoost
            </h4>
            <p className="text-sm text-slate-600">
              The future of Ghanaian Farm Management.
            </p>
            <p className="text-sm text-slate-500 mt-2">Version 1.1.0</p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 mt-8 md:mt-10 pt-6 text-center">
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            &copy; {new Date().getFullYear()} AgriBoost - All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}