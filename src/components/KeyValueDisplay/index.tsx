import React from "react";

interface KeyValueDisplayProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function KeyValueDisplay({ label, value, className }: KeyValueDisplayProps) {
  return (
    <div className={`flex justify-center min-w-0 ${className || ""}`}>
      <div className="flex items-center w-full max-w-sm min-w-0 gap-2 sm:gap-4">
        <div className="flex-shrink-0 w-16 sm:w-40 text-right pr-2 sm:pr-4">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{label}</span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <span className="text-gray-700 dark:text-gray-300 text-sm break-words">{value}</span>
        </div>
      </div>
    </div>
  );
}