import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden bg-white">
      {/* Background Decor - Organic Soft Shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 md:w-96 md:h-96 bg-green-50 rounded-full blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 md:w-72 md:h-72 bg-slate-100 rounded-full blur-3xl opacity-50 -z-10"></div>

      <div className="container mx-auto px-6">
        <div className="relative flex flex-col items-center">
          {/* Subtle Glass Tag */}
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-green-700 bg-green-50/50 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
            Status: Beta
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight text-center max-w-4xl leading-[1.1]">
            The future of{" "}
            <span className="text-green-600">Ghanaian farming</span> is here.
          </h2>

          <p className="text-base md:text-lg text-slate-500 max-w-2xl text-center mb-12 leading-relaxed">
            Become part of a growing community of forward-thinking farmers. Sign
            up in minutes and start managing your farm with AI-driven precision.
          </p>

          {/* Interaction Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-10 py-4 bg-green-600 text-white rounded-full text-base font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:bg-green-700 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>

            <Link
              href="/metrics"
              className="w-full sm:w-auto px-8 py-4 bg-white/70 backdrop-blur-md border border-white/20 text-slate-900 rounded-full text-base font-semibold shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:bg-white hover:scale-[1.02] flex items-center justify-center"
            >
              View Platform Metrics
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}