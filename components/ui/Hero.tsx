import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center py-24 lg:py-32">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/features.jpg')" }}
      ></div>

      {/* Soft Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-green-50/50 to-transparent -z-10"></div>

      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center p-6 sm:p-8 md:p-12 bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Building the Future of <br />
            <span className="text-green-600">Farming in Ghana</span>
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
              Get Started
            </Link>

            <Link
              href="#features"
              className="text-slate-600 font-medium text-sm hover:text-green-600 transition-colors"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}