// components/PaymentSummary.tsx
import * as React from 'react';
import { PaymentCalculations } from '../types';

interface PaymentSummaryProps {
  calculations: PaymentCalculations;
}

interface SummaryRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

/**
 * Summary row component for displaying calculation line items
 */
const SummaryRow: React.FC<SummaryRowProps> = ({ 
  label, 
  value, 
  highlight = false 
}) => (
  <div className="flex justify-end items-center gap-8">
    <span className="font-medium">{label} :</span>
    <span className={`font-bold ${highlight ? 'text-green-600' : ''}`}>
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
    <SummaryRow 
      label="Available Credits" 
      value={calculations.availableCredits} 
    />
    <SummaryRow 
      label="Selected Credits" 
      value={calculations.selectedCredits} 
    />
    <SummaryRow 
      label="Amount To Apply" 
      value={calculations.amountToApply}
      highlight 
    />
    <SummaryRow 
      label="Amount To Credit" 
      value={calculations.amountToCredit} 
    />
  </div>
);