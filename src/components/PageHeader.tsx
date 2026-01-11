export default function PageHeader({ title, description, breadcrumb }: { title: string, description?: string, breadcrumb?: string }) {
    return (
        <div className="bg-white border-b border-gray-100 pt-20 pb-16">
            <div className="container-custom">
                {breadcrumb && (
                    <nav className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-widest">
                        {breadcrumb}
                    </nav>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
