import Link from "next/link";

export default function CTA() {
  return (
    <section id="about" className="relative py-32 overflow-hidden bg-white">
      {/* Background Decor - Organic Soft Shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-50 -z-10"></div>

      <div className="container mx-auto px-6">
        <div className="relative flex flex-col items-center">
          {/* Subtle Glass Tag */}
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-green-700 bg-green-50/50 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
            Status: Beta
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight text-center max-w-4xl leading-[1.1]">
            The future of{" "}
            <span className="text-green-600">Ghanaian farming</span> is here.
          </h2>

          <p className="text-base md:text-lg text-slate-500 max-w-2xl text-center mb-12 leading-relaxed">
            Become part of a growing community of forward-thinking farmers. Sign
            up in minutes and start managing your farm with AI-driven precision.
          </p>

          {/* Interaction Group */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <span className="px-10 py-4 bg-green-600 text-white rounded-full text-base font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:bg-green-700 hover:scale-[1.02] active:scale-95 flex items-center gap-2">
              Want to see our platform metrics?
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>

            <Link
              href="/metrics"
              className="px-8 py-4 bg-white/70 backdrop-blur-md border border-white/20 text-slate-900 rounded-full text-base font-semibold shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:bg-white hover:scale-[1.02]"
            >
              Click Here
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
// export default function CTA() {
//   return (
//     <section
//       id="about"
//       className="py-20  text-green-700 bg-center bg-cover opacity-30 inset-0"
//       style={{ backgroundImage: "url('/features.jpg')" }}
//     >
//       <div className="container mx-auto px-6 text-center z-50">
//         <h2 className="text-3xl md:text-4xl font-bold mb-4">
//           Ready to Boost Your Harvest?
//         </h2>
//         <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
//           Become part of a growing community of forward-thinking farmers in
//           Ghana. Sign up in minutes and start managing your farm like never
//           before.
//         </p>
//         <Link
//           href="/signup"
//           className="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all"
//         >
//           Sign Up for Free
//         </Link>
//       </div>
//     </section>
//   );
// }
