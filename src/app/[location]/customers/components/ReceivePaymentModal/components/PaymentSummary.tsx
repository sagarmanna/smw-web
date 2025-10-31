// components/PaymentSummary.tsx
import * as React from 'react';
import { PaymentCalculations } from '../types';

interface PaymentSummaryProps {
  calculations: PaymentCalculations;
}

interface SummaryRowProps {
  label: string;
  value: number;
}

/**
 * Summary row component for displaying calculation line items
 */
const SummaryRow: React.FC<SummaryRowProps> = ({ 
  label, 
  value
}) => (
  <div className="flex justify-end items-center gap-2">
    <span className="text-black w-48 text-right">{label}:</span>
    <span className="text-black font-semibold w-28 text-right">
      ${value.toFixed(2)}
    </span>
  </div>
);

/**
 * Payment summary component displaying calculated totals
 * Following Single Responsibility Principle - handles only summary display
 */
export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ calculations }) => (
  <div className="mt-4 space-y-2 text-sm">
    {calculations.availableCredits > 0 && (
      <SummaryRow 
        label="Available Credits" 
        value={calculations.availableCredits} 
      />
    )}
    {calculations.selectedCredits > 0 && (
      <SummaryRow 
        label="Selected Credits" 
        value={calculations.selectedCredits} 
      />
    )}
    <SummaryRow 
      label="Amount To Apply" 
      value={calculations.amountToApply}
    />
    <SummaryRow 
      label="Amount To Credit" 
      value={calculations.amountToCredit} 
    />
  </div>
);