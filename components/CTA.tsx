// components/CTA.tsx
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section id="about" className="relative py-16 md:py-24 overflow-hidden bg-white/60">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-100/50 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 md:p-14 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] text-center flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ready to boost your harvest?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight leading-tight max-w-3xl">
            The future of{" "}
            <span className="text-emerald-600">Ghanaian agriculture</span> is here.
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-600 max-w-2xl mb-8 leading-relaxed">
            Join a growing community of forward-thinking farmers and trusted buyers. Sign
            up in minutes and start managing your farm with AI-driven precision.
          </p>

          {/* Interaction Group */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-emerald-600 text-white rounded-md text-xs sm:text-sm font-medium shadow-2xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Link>

            <Link
              href="/market"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200/90 rounded-md text-xs sm:text-sm font-medium shadow-2xs transition-colors flex items-center justify-center"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}