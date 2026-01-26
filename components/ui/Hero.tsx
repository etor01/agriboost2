import Link from "next/link";

export default function Hero(){
    return(
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
                        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('/background.jpg')"}}></div>
                        <div className="relative container mx-auto px-6 text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                                Empowering Farmers with <span className="text-green-600">Smart Technology</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Monitor crop growth, get AI-driven insights, and sell your produce directly on our marketplace. Join the future of farming today.
                            </p>
                            <Link href="/signup" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all">
                                Create Your Virtual Farm
                            </Link>
                        </div>
        </section>
    );
}