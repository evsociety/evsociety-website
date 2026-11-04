export default function PageHeader({ title, description, breadcrumb }: { title: string, description?: string, breadcrumb?: string }) {
    return (
        <div className="relative overflow-hidden bg-navy text-white">
            {/* Thin teal rule along the top edge, echoing the identity bar */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
            <div className="container-custom py-14 lg:py-20">
                {breadcrumb && (
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
                        {breadcrumb}
                    </p>
                )}
                <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white md:text-4xl lg:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
