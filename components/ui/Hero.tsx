// components/ui/Hero.tsx
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, MapPin, Sprout } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen w-full overflow-hidden flex items-center py-28 lg:py-36">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/features.jpg')" }}
      />
      <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px]" />

      {/* Soft Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/10 via-transparent to-zinc-950/30 pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 z-10">
        <div className="max-w-4xl mx-auto text-center p-6 sm:p-10 md:p-14 bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full shadow-2xs">
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            <span>Better Farming, Better Ghana</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[1.15] mb-5 tracking-tight">
            Building the Future of <br />
            <span className="text-emerald-600">Farming in Ghana</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Monitor crop development, diagnose plant diseases with AI, and trade
            produce directly through secure escrow payments.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-2xs flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/market"
              className="w-full sm:w-auto bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200/90 px-6 py-2.5 sm:px-8 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-2xs flex items-center justify-center"
            >
              Explore Marketplace
            </Link>
          </div>

          {/* Trust Highlights Strip */}
          <div className="mt-10 pt-6 border-t border-zinc-200/70 grid grid-cols-3 gap-3 text-center text-zinc-600 text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-zinc-800 text-[11px] sm:text-xs">100% Escrow Protection</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-zinc-800 text-[11px] sm:text-xs">AI Disease Scanner</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-zinc-800 text-[11px] sm:text-xs">Nationwide Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}