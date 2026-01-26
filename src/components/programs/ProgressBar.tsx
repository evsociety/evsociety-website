interface ProgressBarProps {
    value: number; // 0 to 100
    label?: string; // Optional text label (e.g. "4/5 completed")
    className?: string;
    showPercentage?: boolean;
}

export default function ProgressBar({ value, label, className = '', showPercentage = true }: ProgressBarProps) {
    // Clamp value between 0 and 100
    const progress = Math.min(Math.max(value, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-center mb-1">
                {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
                {showPercentage && <span className="text-sm font-medium text-gray-700">{progress}%</span>}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
        </div>
    );
}
