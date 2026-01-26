import Image from "next/image";

export default function FeatureSection(){ 
    return(
        <section id="features" className="py-20 bg-white">
              <div className="container mx-auto px-6">
                  <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">A Complete Toolkit for Modern Farming</h2>
                      <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">From planting to selling, AgriBoost provides the tools you need to succeed.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
                      <div className="bg-green-100 text-green-600 hover:bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mb-6">
                        <Image alt="leaf icon" src="/icons/logobw.png" width={45} height={45} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">AI Crop Care</h3>
                      <p className="text-gray-600">Receive personalized routines, disease detection, and fertilizer guides to maximize your yield.</p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
                      <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
                        <Image alt="growth icon" src="/icons/stock-market.png" width={45} height={45} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Growth Analytics</h3>
                      <p className="text-gray-600">Monitor your farm&apos;s performance with easy-to-understand dashboards and reports.</p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
                      <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
                        <Image alt="cart icon" src="/icons/trolley.png" width={45} height={45} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Direct Marketplace</h3>
                      <p className="text-gray-600">List your harvest and sell directly to buyers, cutting out the middleman and increasing profits.</p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl hover:bg-green-200/40 transition-shadow duration-300">
                      <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6">
                        <Image alt="money icon" src="/icons/profit.png" width={45} height={45} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Financial Tools</h3>
                      <p className="text-gray-600">Access equipment funding, loans, and investment opportunities to grow your farming business.</p>
                    </div>

                  </div>
              </div>
        </section>
    );
}