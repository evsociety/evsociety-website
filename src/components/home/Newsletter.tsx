'use client';

export default function Newsletter() {
    return (
        <section className="bg-white pb-20 lg:pb-24" aria-labelledby="newsletter-heading">
            <div className="container-custom">
                <div className="grid gap-10 rounded-3xl bg-navy p-8 sm:p-12 lg:grid-cols-12 lg:items-center lg:p-16">
                    <div className="lg:col-span-6">
                        <h2 id="newsletter-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Stay ahead of the curve</h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-300">
                            Get monthly updates on EV safety standards, research breakthroughs, and upcoming events delivered to your inbox.
                        </p>
                    </div>
                    <div className="lg:col-span-6">
                        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="newsletter-email" className="sr-only">Professional email address</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your professional email"
                                className="min-h-12 flex-grow rounded-full border-0 bg-white px-6 font-medium text-gray-900 placeholder:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-primary-300"
                                required
                            />
                            <button type="submit" className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-primary-300 motion-reduce:transition-none">
                                Subscribe Now
                            </button>
                        </form>
                        <p className="mt-4 text-sm text-slate-300">
                            We respect your privacy. No spam, only industry insights.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
