import Link from 'next/link';

export default function CTA(){
    return(
        <section id="about" className="py-20 bg-green-700 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your Harvest?</h2>
                    <p className="text-lg text-green-100 max-w-3xl mx-auto mb-8">
                        Become part of a growing community of forward-thinking farmers in Ghana.
                        Sign up in minutes and start managing your farm like never before.
                    </p>
                    <Link href="/signup" className="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all">
                        Sign Up for Free
                    </Link>
                </div>
        </section>
    );
}