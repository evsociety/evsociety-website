// Sticky "on this page" bar for long detail pages; scrolls horizontally on small screens.
// Each item links to a section id on the page, so it works without JavaScript.
export default function InPageNav({ items, label = 'On this page' }: { items: { id: string; label: string }[]; label?: string }) {
    return (
        <nav aria-label={label} className="sticky top-[72px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <ol className="container-custom flex gap-1 overflow-x-auto py-2">
                {items.map((item) => (
                    <li key={item.id} className="shrink-0">
                        <a
                            href={`#${item.id}`}
                            className="block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary motion-reduce:transition-none"
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
