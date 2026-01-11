'use client';

export default function Newsletter() {
    return (
        <section className="py-24 bg-white">
            <div className="container-custom">
                <div className="bg-primary rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">Stay ahead of the curve</h2>
                        <p className="text-xl text-blue-50/80 mb-10">
                            Get monthly updates on EV safety standards, research breakthroughs, and upcoming events delivered to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your professional email"
                                className="flex-grow px-6 py-4 rounded-xl text-gray-900 border-none outline-none focus:ring-4 focus:ring-blue-400 font-medium"
                                required
                            />
                            <button type="submit" className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors">
                                Subscribe Now
                            </button>
                        </form>
                        <p className="mt-4 text-sm text-blue-100/60">
                            We respect your privacy. No spam, only industry insights.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
