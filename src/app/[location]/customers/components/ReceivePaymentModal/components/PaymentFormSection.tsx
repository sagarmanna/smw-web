// components/PaymentFormSection.tsx
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './FormField';
import { DatePicker } from './DatePicker';
import { PAYMENT_METHODS, CUSTOMERS } from '../constants';

interface PaymentFormSectionProps {
  customer: string;
  onCustomerChange: (value: string) => void;
  paymentDate: Date;
  onPaymentDateChange: (date: Date) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
  amountReceived: string;
  onAmountReceivedChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

/**
 * Payment form section containing all input fields
 * Following Single Responsibility Principle - handles only form display
 */
export const PaymentFormSection: React.FC<PaymentFormSectionProps> = ({
  customer,
  onCustomerChange,
  paymentDate,
  onPaymentDateChange,
  paymentMethod,
  onPaymentMethodChange,
  reference,
  onReferenceChange,
  amountReceived,
  onAmountReceivedChange,
  notes,
  onNotesChange,
}) => (
  <div className="space-y-5 py-4">
    <div className="grid grid-cols-5 gap-4">
      <FormField label="Customer" required>
        <Select value={customer} onValueChange={onCustomerChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CUSTOMERS.map(c => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Date" required>
        <DatePicker date={paymentDate} onDateChange={onPaymentDateChange} />
      </FormField>

      <FormField label="Payment Method" required>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(method => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Reference">
        <Input
          value={reference}
          onChange={e => onReferenceChange(e.target.value)}
          className="h-9"
          placeholder="Enter reference"
        />
      </FormField>

      <FormField label="Amount Received" required>
        <Input
          type="text"
          value={amountReceived}
          onChange={e => onAmountReceivedChange(e.target.value)}
          className="h-9 text-right"
          placeholder="0.00"
        />
      </FormField>
    </div>

    <FormField label="Notes">
      <Textarea
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
        rows={3}
        className="resize-none"
        placeholder="Add any additional notes..."
      />
    </FormField>
  </div>
);