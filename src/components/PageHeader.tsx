export default function PageHeader({ title, description, breadcrumb }: { title: string, description?: string, breadcrumb?: string }) {
    return (
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
            <div className="container-custom">
                {breadcrumb && (
                    <nav className="text-sm font-medium text-blue-100 mb-6 uppercase tracking-widest">
                        {breadcrumb}
                    </nav>
                )}
                <h1 className="text-3xl md:text-4xl font-black mb-4 text-white tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-xl text-blue-50 leading-relaxed max-w-3xl">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
