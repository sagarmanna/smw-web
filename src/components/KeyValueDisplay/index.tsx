import React from "react";

interface KeyValueDisplayProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function KeyValueDisplay({ label, value, className }: KeyValueDisplayProps) {
  return (
    <div className={`flex justify-center ${className || ""}`}>
      <div className="flex items-center w-full max-w-sm">
        <div className="w-40 text-right pr-4">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{label}</span>
        </div>
        <div className="flex-1">
          <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
        </div>
      </div>
    </div>
  );
}