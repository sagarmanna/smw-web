"use client";

import * as React from "react";

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-1">
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">
        {label}
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
        {value ?? ""}
      </div>
    </div>
  );
}


