import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative pb-12 pt-24 bg-white overflow-hidden"
    >
      {/* Soft Background Accent - creating a subtle tech glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-[100px] opacity-60 -z-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="relative p-10 md:p-16 bg-white/70 backdrop-blur-md border border-white/40 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Brand Identity Section */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 transition-transform hover:rotate-6">
                <span className="text-white font-black italic text-xl">A</span>
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900 tracking-tighter">
                AgriBoost
              </h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
              The future of Ghanaian Farm Management. Empowering the next
              generation of digital farmers.
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
              v1.1.0 Stable
            </div>
          </div>

          {/* Link Clusters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10">
            {/* Platform Links */}
            <div className="space-y-5">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Platform
              </h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-5">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Company
              </h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-5 col-span-2 md:col-span-1">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Legal
              </h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-all hover:translate-x-1 inline-block"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Subtle Floating Contact Card (Optional Interaction Point) */}
          <div className="lg:absolute -top-6 right-16 hidden lg:block">
            <Link
              href="/signup"
              className="bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-bold shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-[1.05] active:scale-95 flex items-center gap-2"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center px-10 border-t border-slate-50 pt-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} AgriBoost. All rights reserved.
          </p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-4 h-4 bg-slate-300 group-hover:bg-green-600 rounded-sm transition-colors"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-4 h-4 bg-slate-300 group-hover:bg-green-600 rounded-sm transition-colors"></div>
            </div>
          </div>
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
