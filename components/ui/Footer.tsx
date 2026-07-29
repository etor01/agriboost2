import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="relative py-16 px-6">
      {/* Glass container */}
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-10 transition-all">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
              AgriBoost
            </h4>
            <p className="text-sm text-slate-600">
              The future of Ghanaian Farm Management.
            </p>
            <p className="text-sm text-slate-500 mt-2">Version 1.1.0</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
              Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/market"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
              Project & Team
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Careers & Roles
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-green-600 transition-all hover:scale-[1.02]"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AgriBoost — KNUST Final Year Project by Etornam & Doreen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// export default function Footer(){
//     return(
//         <footer id="contact" className="bg-gray-800 text-white py-12">
//             <div className="container mx-auto px-6">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//                     <div>
//                     <h4 className="text-lg font-semibold mb-4">AgriBoost</h4>
//                     <p className="text-gray-400">The future of Ghanaian Farm Management.</p>
//                     <p className="text-gray-400 mt-2">Version 1.1.0</p>
//                     </div>
//                     <div>
//                     <h4 className="text-lg font-semibold mb-4">Links</h4>
//                     <ul>
//                         <li className="mb-2"><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
//                         <li className="mb-2"><Link href="/login" className="hover:text-green-400 transition-colors">Sign In</Link></li>
//                         <li className="mb-2"><Link href="/signup" className="hover:text-green-400 transition-colors">Sign Up</Link></li>
//                     </ul>
//                     </div>
//                     <div>
//                     <h4 className="text-lg font-semibold mb-4">Company</h4>
//                     <ul>
//                         <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
//                         <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
//                         <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
//                     </ul>
//                     </div>
//                     <div>
//                     <h4 className="text-lg font-semibold mb-4">Legal</h4>
//                     <ul>
//                         <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
//                         <li className="mb-2"><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
//                     </ul>
//                     </div>
//                 </div>
//                 <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
//                     <p>&copy; {new Date().getFullYear()} AgriBoost. All rights reserved.</p>
//                 </div>
//             </div>
//       </footer>
//     );
// }
