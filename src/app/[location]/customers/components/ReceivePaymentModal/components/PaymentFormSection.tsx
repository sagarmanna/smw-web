// components/PaymentFormSection.tsx
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './FormField';
import { DatePicker } from './DatePicker';

interface PaymentFormSectionProps {
  customer: string;
  customerId?: number;
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
  availablePaymentMethods: Array<{ value: string; label: string }>;
  isLoadingPaymentMethods?: boolean;
  // NEW: Customer dropdown props
  isCustomerRoute?: boolean;
  customersList?: Array<{ value: string; label: string; id: number }>;
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
}

/**
 * Payment form section with dynamic payment methods from API
 * Following Single Responsibility Principle - handles only form display
 * Conditionally renders customer field based on route type
 */
export const PaymentFormSection: React.FC<PaymentFormSectionProps> = ({
  customer,
  customerId,
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
  availablePaymentMethods,
  isLoadingPaymentMethods = false,
  // NEW: Customer dropdown props
  isCustomerRoute = true,
  customersList = [],
  isLoadingCustomers = false,
  onCustomerSelect,
}) => {
  // Auto-select Cash as default payment method when methods are loaded
  React.useEffect(() => {
    if (!paymentMethod && availablePaymentMethods.length > 0) {
      const cashMethod = availablePaymentMethods.find(
        m => m.label.toLowerCase() === 'cash'
      );
      if (cashMethod) {
        onPaymentMethodChange(cashMethod.value);
      }
    }
  }, [availablePaymentMethods, paymentMethod, onPaymentMethodChange]);

  return (
    <div className="space-y-5 py-4">
      <div className="grid grid-cols-5 gap-4">
        <FormField label="Customer" required>
          {isCustomerRoute ? (
            // Customer Route Mode: Show disabled input with customer name
            <div className="relative">
              <Input
                value={customer || 'Loading...'}
                onChange={e => onCustomerChange(e.target.value)}
                className="h-9 pr-20"
                disabled
                placeholder="Loading customer..."
              />
            </div>
          ) : (
            // Non-Customer Route Mode: Show searchable dropdown
            <Select 
              value={customerId?.toString() || ''} 
              onValueChange={onCustomerSelect}
              disabled={isLoadingCustomers || customersList.length === 0}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select customer"} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {isLoadingCustomers ? (
                  <SelectItem value="loading" disabled>
                    Loading customers...
                  </SelectItem>
                ) : customersList.length > 0 ? (
                  customersList.map(customer => (
                    <SelectItem key={customer.id} value={customer.value}>
                      {customer.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No customers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField label="Date" required>
          <DatePicker date={paymentDate} onDateChange={onPaymentDateChange} />
        </FormField>

        <FormField label="Payment Method" required>
          <Select 
            value={paymentMethod} 
            onValueChange={onPaymentMethodChange}
            disabled={isLoadingPaymentMethods || availablePaymentMethods.length === 0}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={isLoadingPaymentMethods ? "Loading..." : "Cash"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingPaymentMethods ? (
                <SelectItem value="loading" disabled>
                  Loading payment methods...
                </SelectItem>
              ) : availablePaymentMethods.length > 0 ? (
                availablePaymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No payment methods available
                </SelectItem>
              )}
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
};