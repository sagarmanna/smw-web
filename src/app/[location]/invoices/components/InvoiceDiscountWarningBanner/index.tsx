"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

interface InvoiceDiscountWarningBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export function InvoiceDiscountWarningBanner({
  show,
  onDismiss,
}: InvoiceDiscountWarningBannerProps) {
  if (!show) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-orange-500 text-white rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm leading-relaxed">
          You have entered a non-approved Arcadia discount. All non-approved discounts must be
          submitted in writing and approved by Head Office prior to entering a discount, otherwise you
          are in breach of your agreement.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white hover:text-gray-200 transition-colors"
        aria-label="Dismiss warning"
      >
        <span className="text-xl leading-none">&times;</span>
      </button>
    </div>
  );
}

