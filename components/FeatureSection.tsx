import Image from "next/image";

export default function FeatureSection() {
  const features = [
    {
      title: "AI Crop Care",
      description:
        "Receive personalized routines, disease detection, and fertilizer guides to maximize your yield.",
      icon: "/icons/logobw.png",
      alt: "leaf icon",
    },
    {
      title: "Growth Analytics",
      description:
        "Monitor your farm's performance with easy-to-understand dashboards and reports.",
      icon: "/icons/stock-market.png",
      alt: "growth icon",
    },
    {
      title: "Direct Marketplace",
      description:
        "List your harvest and sell directly to buyers, cutting out the middleman and increasing profits.",
      icon: "/icons/trolley.png",
      alt: "cart icon",
    },
    {
      title: "Financial Tools",
      description:
        "Access equipment funding, loans, and investment opportunities to grow your farming business.",
      icon: "/icons/profit.png",
      alt: "money icon",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-green-50/50 relative overflow-hidden"
    >
      {/* Decorative soft glow for depth */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-green-600 font-bold text-xs uppercase tracking-widest bg-green-100/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-green-200/20 mb-4 inline-block">
            Our Ecosystem
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            A Complete Toolkit for <br />
            <span className="text-green-600">Modern Farming</span>
          </h2>
          <p className="text-base text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            From planting to selling, AgriBoost provides the tools you need to
            succeed in the digital age.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 active:scale-95"
            >
              {/* Icon Container */}
              <div className="bg-green-50 text-green-600 rounded-full h-14 w-14 flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:rotate-[10deg] border border-green-100">
                <Image
                  alt={feature.alt}
                  src={feature.icon}
                  width={32}
                  height={32}
                  className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Progress-style indicator for interaction */}
              <div className="mt-8 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-0 transition-all duration-700 ease-out group-hover:w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// export default function FeatureSection() {
//   return (
//     <section id="features" className="py-20 bg-white">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//             A Complete Toolkit for Modern Farming
//           </h2>
//           <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
//             From planting to selling, AgriBoost provides the tools you need to
//             succeed.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
//             <div className="bg-green-100 text-green-600 hover:bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mb-6">
//               <Image
//                 alt="leaf icon"
//                 src="/icons/logobw.png"
//                 width={45}
//                 height={45}
//               />
//             </div>
//             <h3 className="text-xl font-bold mb-3">AI Crop Care</h3>
//             <p className="text-gray-600">
//               Receive personalized routines, disease detection, and fertilizer
//               guides to maximize your yield.
//             </p>
//           </div>

//           <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
//             <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
//               <Image
//                 alt="growth icon"
//                 src="/icons/stock-market.png"
//                 width={45}
//                 height={45}
//               />
//             </div>
//             <h3 className="text-xl font-bold mb-3">Growth Analytics</h3>
//             <p className="text-gray-600">
//               Monitor your farm&apos;s performance with easy-to-understand
//               dashboards and reports.
//             </p>
//           </div>

//           <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
//             <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
//               <Image
//                 alt="cart icon"
//                 src="/icons/trolley.png"
//                 width={45}
//                 height={45}
//               />
//             </div>
//             <h3 className="text-xl font-bold mb-3">Direct Marketplace</h3>
//             <p className="text-gray-600">
//               List your harvest and sell directly to buyers, cutting out the
//               middleman and increasing profits.
//             </p>
//           </div>

//           <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
//             <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
//               <Image
//                 alt="money icon"
//                 src="/icons/profit.png"
//                 width={45}
//                 height={45}
//               />
//             </div>
//             <h3 className="text-xl font-bold mb-3">Financial Tools</h3>
//             <p className="text-gray-600">
//               Access equipment funding, loans, and investment opportunities to
//               grow your farming business.
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
