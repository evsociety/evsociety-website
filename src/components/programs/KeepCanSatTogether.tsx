const TERM = 'CAN-7USAT';

// Renders text with every "CAN-7USAT" kept on one line, so headings never split it at the hyphen.
// A preceding slash ("Model Rocketry/CAN-7USAT") gets a line-break opportunity after it, so the
// pair never becomes one unbreakable word that overflows narrow screens.
export default function KeepCanSatTogether({ text }: { text: string }) {
    const parts = text.split(TERM);
    return parts.flatMap((part, index) => {
        if (index === 0) return [part];
        const prev = parts[index - 1];
        return [
            ...(prev.endsWith('/') ? [<wbr key={`b${index}`} />] : []),
            <span key={index} className="whitespace-nowrap">{TERM}</span>,
            part,
        ];
    });
}
