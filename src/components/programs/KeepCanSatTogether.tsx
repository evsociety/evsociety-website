const TERM = 'CAN-7USAT';

// Renders text with every "CAN-7USAT" kept on one line, so headings never split it at the hyphen
export default function KeepCanSatTogether({ text }: { text: string }) {
    return text.split(TERM).flatMap((part, index) => index === 0
        ? [part]
        : [<span key={index} className="whitespace-nowrap">{TERM}</span>, part]);
}
