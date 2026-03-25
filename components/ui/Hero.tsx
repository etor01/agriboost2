import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden h-screen w-full">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70 "
        style={{ backgroundImage: "url('/background.jpg')" }}
      ></div>

      {/* Soft Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-green-50/50 to-transparent -z-10"></div>

      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center p-8 md:p-12 bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Empowering Farmers with <br />
            <span className="text-green-600">Smart Technology</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Monitor crop growth, get AI-driven insights, and sell your produce
            directly on our marketplace. Join the future of farming today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center bg-green-600 text-white px-10 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:bg-green-700 shadow-md"
            >
              Create Your Virtual Farm
            </Link>

            <Link
              href="/marketplace"
              className="text-slate-600 font-medium text-sm hover:text-green-600 transition-colors"
            >
              Explore Marketplace →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// export default function Hero(){
//     return(
//         <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
//                         <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('/background.jpg')"}}></div>
//                         <div className="relative container mx-auto px-6 text-center">
//                             <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
//                                 Empowering Farmers with <span className="text-green-600">Smart Technology</span>
//                             </h1>
//                             <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
//                                 Monitor crop growth, get AI-driven insights, and sell your produce directly on our marketplace. Join the future of farming today.
//                             </p>
//                             <Link href="/signup" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all">
//                                 Create Your Virtual Farm
//                             </Link>
//                         </div>
//         </section>
//     );
// }
