// ReceivePaymentModal.tsx
import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ReceivePaymentModalProps, ReceivePaymentData } from './types';
import { DataMapper, PaymentCalculator } from './utils';
import { usePaymentState } from './hooks/usePaymentState';
import { useItemHandlers } from './hooks/useItemHandlers';
import { useFilterHandlers } from './hooks/useFilterHandlers';
import { usePaymentColumns } from './hooks/usePaymentColumns';
import { usePaymentCalculations } from './hooks/usePaymentCalculations';
import { useFilteredLessons, useFilteredGroupLessons } from './hooks/useFilteredData';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import { PaymentFormSection } from './components/PaymentFormSection';
import { PaymentTablesSection } from './components/PaymentTablesSection';

/**
 * Utility function to check if current route contains "customer" keyword
 * Used to determine whether to show customer dropdown or fixed customer name
 */
const isCustomerInRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  // Check if path matches pattern like /customers/123
  return path.includes('/customers/') && /\/customers\/\d+/.test(path);
};

/**
 * Main Receive Payment Modal Component with API Integration
 * No pagination - loads all data at once for accurate calculations
 * Supports two modes:
 * 1. Customer Route Mode: Shows fixed customer name (route has "customer" keyword + ID)
 * 2. Dropdown Mode: Shows customer dropdown (route does NOT match pattern)
 */
export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  open,
  onOpenChange,
  onSave,
  customerId,
  customerName,
  location,
}) => {
  // Determine if we're in customer route mode
  const isInCustomerRoute: boolean = React.useMemo(() => {
    const routeCheck = isCustomerInRoute();
    // Also check if customerId is provided and valid
    const hasValidCustomerId = Boolean(customerId && customerId !== '0' && customerId !== '' && parseInt(customerId) > 0);
    return routeCheck && hasValidCustomerId;
  }, [customerId]);
  
  // State management with API integration - only load when modal is open
  const state = usePaymentState(
    location || 'burlington',
    customerId && customerId !== '0' ? parseInt(customerId) : 0,
    customerName,
    open,
    isInCustomerRoute
  );
  
  // Item manipulation handlers
  const itemHandlers = useItemHandlers(
    state.setLessons,
    state.setGroupLessons,
    state.setInvoices,
    state.setCredits
  );
  
  // Filter handlers with dynamic student options
  const filterHandlers = useFilterHandlers(
    state.setLessonColumnFilters,
    state.setGroupLessonColumnFilters,
    state.lessons,
    state.groupLessons
  );
  
  // Apply filters to get filtered data for display
  const filteredLessons = useFilteredLessons(state.lessons, state.lessonColumnFilters);
  const filteredGroupLessons = useFilteredGroupLessons(state.groupLessons, state.groupLessonColumnFilters);
  
  // Column definitions with dynamic filter options
  const columns = usePaymentColumns(
    state.lessons,
    state.groupLessons,
    state.invoices,
    state.credits,
    itemHandlers,
    filterHandlers.lessonStudentOptions,
    filterHandlers.groupLessonStudentOptions
  );
  
  // Calculations with proper formulas
  const calculations = usePaymentCalculations(
    state.lessons,
    state.groupLessons,
    state.invoices,
    state.credits,
    state.amountReceived,
    state.totalOutstanding
  );

  // AUTO-FILL on initial load only
  const hasUserEditedAmount = React.useRef(false);
  
  React.useEffect(() => {
    if (!hasUserEditedAmount.current && calculations.suggestedAmountReceived !== undefined) {
      const suggested = calculations.suggestedAmountReceived.toFixed(2);
      state.setAmountReceived(suggested);
    }
  }, [calculations.suggestedAmountReceived, state]);

  // Track when user manually edits the amount
  const handleAmountReceivedChange = React.useCallback((value: string) => {
    hasUserEditedAmount.current = true;
    state.setAmountReceived(value);
  }, [state]);

  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  /**
   * Handle save action
   */
  const handleSave = React.useCallback(async () => {
    // Validate that a customer is selected
    if (!state.customerId || state.customerId === 0) {
      alert('Please select a customer before saving payment');
      return;
    }

    const buildPaymentMap = <T extends { id: string; payment: string; selected?: boolean }>(
      items: T[]
    ): Record<string, number> => {
      return items
        .filter(item => item.selected)
        .reduce<Record<string, number>>((acc, item) => {
          const amount = PaymentCalculator.parsePaymentAmount(item.payment);
          if (amount > 0) {
            acc[item.id] = amount;
          }
          return acc;
        }, {});
    };

    const paymentCredits = buildPaymentMap(
      state.credits.filter(credit => {
        const creditType = (credit.type || '').toLowerCase();
        return creditType.includes('payment credit');
      })
    );

    const invoiceCredits = buildPaymentMap(
      state.credits.filter(credit => {
        const creditType = (credit.type || '').toLowerCase();
        return creditType.includes('invoice credit');
      })
    );

    setIsSaving(true);
    try {
      const paymentData: ReceivePaymentData = {
        customer: state.customer,
        date: format(state.paymentDate, 'MMM dd, yyyy'),
        paymentMethod: state.paymentMethod,
        reference: state.reference,
        amountReceived: parseFloat(state.amountReceived) || 0,
        notes: state.notes,
        selectedLessons: DataMapper.extractSelectedIds(state.lessons),
        selectedGroupLessons: DataMapper.extractSelectedIds(state.groupLessons),
        selectedInvoices: DataMapper.extractSelectedIds(state.invoices),
        selectedCredits: DataMapper.extractSelectedIds(state.credits),
        lessonPayments: buildPaymentMap(state.lessons),
        groupLessonPayments: buildPaymentMap(state.groupLessons),
        invoicePayments: buildPaymentMap(state.invoices),
        paymentCredits,
        invoiceCredits,
      };
      
      await onSave(paymentData);
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setIsSaving(false);
    }
  }, [state, onSave]);

  /**
   * Handle close action
   */
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Show loading state
  if (state.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1400px] h-[90vh] flex flex-col p-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[1400px] h-[90vh] flex flex-col p-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold mb-2">Error Loading Data</p>
              <p>{state.error}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] h-[90vh] flex flex-col p-0">
        <ModalHeader amountNeeded={calculations.amountNeeded} selectedCredits={calculations.selectedCredits} />

        <div className="overflow-y-auto flex-1 px-6">
          <PaymentFormSection
            customer={state.customer}
            customerId={state.customerId}
            onCustomerChange={state.setCustomer}
            paymentDate={state.paymentDate}
            onPaymentDateChange={state.setPaymentDate}
            paymentMethod={state.paymentMethod}
            onPaymentMethodChange={state.setPaymentMethod}
            reference={state.reference}
            onReferenceChange={state.setReference}
            amountReceived={state.amountReceived}
            onAmountReceivedChange={handleAmountReceivedChange}
            notes={state.notes}
            onNotesChange={state.setNotes}
            availablePaymentMethods={state.availablePaymentMethods}
            isLoadingPaymentMethods={state.isLoading}
            isCustomerRoute={isInCustomerRoute}
            customersList={state.customersList}
            isLoadingCustomers={state.isLoadingCustomers}
            onCustomerSelect={state.handleCustomerChange}
          />

          <PaymentTablesSection
            lessons={filteredLessons}
            lessonColumns={columns.lessonColumns}
            lessonColumnFilters={state.lessonColumnFilters}
            onLessonFilterChange={filterHandlers.handleLessonFilterChange}
            groupLessons={filteredGroupLessons}
            groupLessonColumns={columns.groupLessonColumns}
            groupLessonColumnFilters={state.groupLessonColumnFilters}
            onGroupLessonFilterChange={filterHandlers.handleGroupLessonFilterChange}
            invoices={state.invoices}
            invoiceColumns={columns.invoiceColumns}
            credits={state.credits}
            creditColumns={columns.creditColumns}
            calculations={calculations}
          />
        </div>

        <ModalFooter onClose={handleClose} onSave={handleSave} isLoading={isSaving} />
      </DialogContent>
    </Dialog>
  );
};