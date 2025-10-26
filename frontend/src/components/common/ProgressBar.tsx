interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-900">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
