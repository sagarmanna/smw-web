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
  amountError?: string;
  notes: string;
  onNotesChange: (value: string) => void;
  availablePaymentMethods: Array<{ value: string; label: string }>;
  isLoadingPaymentMethods?: boolean;
  isCustomerRoute?: boolean;
  customersList?: Array<{ value: string; label: string; id: number }>;
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
}

const { useState } = React;

/**
 * Payment form section with dynamic payment methods from API
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
  amountError,
  notes,
  onNotesChange,
  availablePaymentMethods,
  isLoadingPaymentMethods = false,
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

  // State for customer search
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Filter customers based on search
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch.trim()) return customersList;
    
    const searchLower = customerSearch.toLowerCase();
    return customersList.filter(customer =>
      customer.label.toLowerCase().includes(searchLower)
    );
  }, [customersList, customerSearch]);

  // Auto-focus search input when dropdown opens
  React.useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isDropdownOpen]);

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!isDropdownOpen) {
      setCustomerSearch('');
    }
  }, [isDropdownOpen]);

  // Handle amount received change with numeric validation
  const handleAmountReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      onAmountReceivedChange('');
      return;
    }
    
    // Allow only numbers and single decimal point
    const numericRegex = /^\d*\.?\d*$/;
    if (numericRegex.test(value)) {
      onAmountReceivedChange(value);
    }
  };

  return (
    <div className="space-y-5 py-4">
      <div className="grid grid-cols-5 gap-4">
        <FormField label="Customer" required>
          {isCustomerRoute ? (
            // Customer Route Mode: Show disabled input with customer name
            <Input
              value={customer || 'Loading...'}
              onChange={e => onCustomerChange(e.target.value)}
              className="h-9"
              disabled
              placeholder="Loading customer..."
            />
          ) : (
            // Non-Customer Route Mode: Show searchable dropdown
            <Select 
              value={customerId?.toString() || ''} 
              onValueChange={onCustomerSelect}
              disabled={isLoadingCustomers}
              onOpenChange={setIsDropdownOpen}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select customer"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* Search input */}
                <div className="sticky top-0 bg-background border-b px-2 py-2 z-10">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      // Prevent closing dropdown on Enter
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                </div>
                
                {isLoadingCustomers ? (
                  <SelectItem value="loading" disabled>
                    Loading customers...
                  </SelectItem>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <SelectItem key={customer.id} value={customer.value}>
                      {customer.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {customerSearch ? 'No customers found' : 'No customers available'}
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
              <SelectValue placeholder={isLoadingPaymentMethods ? "Loading..." : "Select method"} />
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
            onChange={handleAmountReceivedChange}
            className={`h-9 text-right ${amountError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            placeholder="0.00"
          />
          {amountError && (
            <p className="text-xs text-red-500 mt-1">{amountError}</p>
          )}
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
