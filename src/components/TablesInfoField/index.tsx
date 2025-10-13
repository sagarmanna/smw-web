// ============================================
// components/TablesInfoField/index.tsx
// ============================================
"use client";

import * as React from "react";

interface InfoFieldProps {
  label: string;
  value: string | number;
  className?: string;
}

export function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={`flex justify-center ${className || ""}`}>
      <div className="flex items-center w-full max-w-sm">
        <div className="w-40 text-right pr-4">
          <span className="font-semibold text-gray-900">{label}</span>
        </div>
        <div className="flex-1">
          <span className="text-gray-700">{value}</span>
        </div>
      </div>
    </div>
  );
}