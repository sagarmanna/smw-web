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
    location || '',
    customerId && customerId !== '0' ? parseInt(customerId) : 0,
    customerName,
    open,
    isInCustomerRoute
  );

  // Optional date range for lessons (server-side filter)
  const [lessonDateRange, setLessonDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined);
  const lastDueDateRangeRef = React.useRef<{ from: Date; to: Date } | null>(null);

  // Optional date range for group lessons (server-side filter)
  const [groupLessonDateRange, setGroupLessonDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined);
  const lastGroupDueDateRangeRef = React.useRef<{ from: Date; to: Date } | null>(null);
  
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

  // Track if user has manually edited the amount
  const hasUserEditedAmount = React.useRef(false);
  const lastCalculatedAmount = React.useRef<number>(0);
  const lastSelectionsRef = React.useRef<string>("");
  
  // Calculate the required amount: sum of selected lessons - sum of selected credits
  const calculatedAmountReceived = React.useMemo(() => {
    const amountToApply = calculations.amountToApply;
    const selectedCredits = calculations.selectedCredits;
    const calculated = Math.max(0, amountToApply - selectedCredits);
    return calculated;
  }, [calculations.amountToApply, calculations.selectedCredits]);

  // Track selections to detect when they change
  const currentSelections = React.useMemo(() => {
    const lessonIds = state.lessons.filter(l => l.selected).map(l => l.id).join(",");
    const creditIds = state.credits.filter(c => c.selected).map(c => c.id).join(",");
    return `${lessonIds}|${creditIds}`;
  }, [state.lessons, state.credits]);

  // Reset user edit flag when selections change significantly
  React.useEffect(() => {
    if (lastSelectionsRef.current !== currentSelections) {
      // Selections changed - reset user edit flag to allow auto-update
      hasUserEditedAmount.current = false;
      lastSelectionsRef.current = currentSelections;
    }
  }, [currentSelections]);

  // AUTO-UPDATE amount received when lessons/credits change (unless user has manually edited)
  React.useEffect(() => {
    if (!hasUserEditedAmount.current) {
      const calculated = calculatedAmountReceived.toFixed(2);
      state.setAmountReceived(calculated);
      lastCalculatedAmount.current = calculatedAmountReceived;
    }
  }, [calculatedAmountReceived, state]);

  // Track when user manually edits the amount
  const handleAmountReceivedChange = React.useCallback((value: string) => {
    hasUserEditedAmount.current = true;
    state.setAmountReceived(value);
  }, [state]);

  // Validation: Amount Received must be at least the calculated amount (lessons - credits)
  // User can increase but cannot decrease below calculated amount
  const amountMismatch = React.useMemo(() => {
    const received = parseFloat(state.amountReceived || "0");
    if (isNaN(received)) return true;
    const receivedRounded = Math.round(received * 100) / 100;
    const calculatedRounded = Math.round(calculatedAmountReceived * 100) / 100;
    // Mismatch when user tries to reduce below calculated amount
    // Allow increases above calculated amount
    return receivedRounded < calculatedRounded;
  }, [state.amountReceived, calculatedAmountReceived]);

  const amountErrorMessage = amountMismatch
    ? "Amount mismatched with distributions"
    : "";

  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Handle lessons date range from the table toolbar: update the column filter.
  // The actual API reload is handled in an effect when the filter changes,
  // so both the toolbar picker and the column filter picker behave the same.
  const handleLessonDateRangeChange = React.useCallback(
    (range: { from: Date; to: Date }) => {
      if (!range?.from || !range?.to) {
        return;
      }

      state.setLessonColumnFilters(prev => ({
        ...prev,
        dueDate: {
          from: range.from,
          to: range.to,
        },
      }));
    },
    [state]
  );

  // Whenever the dueDate column filter changes to a valid date range,
  // trigger a backend reload for lessons with that range and keep the
  // toolbar DateRangePicker in sync.
  React.useEffect(() => {
    const raw = state.lessonColumnFilters?.dueDate as { from?: Date; to?: Date } | undefined;
    const from = raw?.from;
    const to = raw?.to;

    if (!(from instanceof Date) || !(to instanceof Date)) {
      return;
    }

    const prev = lastDueDateRangeRef.current;
    if (prev && prev.from.getTime() === from.getTime() && prev.to.getTime() === to.getTime()) {
      return;
    }

    lastDueDateRangeRef.current = { from, to };
    setLessonDateRange({ from, to });

    if (typeof state.reloadLessonsForDateRange === 'function') {
      state.reloadLessonsForDateRange(from, to);
    }
  }, [state.lessonColumnFilters, state.reloadLessonsForDateRange]);

  // Handle group lessons date range from the table toolbar: update the column filter.
  const handleGroupLessonDateRangeChange = React.useCallback(
    (range: { from: Date; to: Date }) => {
      if (!range?.from || !range?.to) {
        return;
      }

      state.setGroupLessonColumnFilters(prev => ({
        ...prev,
        dueDate: {
          from: range.from,
          to: range.to,
        },
      }));
    },
    [state]
  );

  // Whenever the group lessons dueDate column filter changes to a valid date range,
  // trigger a backend reload for group lessons with that range and keep the
  // toolbar DateRangePicker in sync.
  React.useEffect(() => {
    const raw = state.groupLessonColumnFilters?.dueDate as { from?: Date; to?: Date } | undefined;
    const from = raw?.from;
    const to = raw?.to;

    if (!(from instanceof Date) || !(to instanceof Date)) {
      return;
    }

    const prev = lastGroupDueDateRangeRef.current;
    if (prev && prev.from.getTime() === from.getTime() && prev.to.getTime() === to.getTime()) {
      return;
    }

    lastGroupDueDateRangeRef.current = { from, to };
    setGroupLessonDateRange({ from, to });

    if (typeof state.reloadGroupLessonsForDateRange === 'function') {
      state.reloadGroupLessonsForDateRange(from, to);
    }
  }, [state.groupLessonColumnFilters, state.reloadGroupLessonsForDateRange]);

  /**
   * Handle save action
   */
  const handleSave = React.useCallback(async () => {
    // Validate that a customer is selected
    if (!state.customerId || state.customerId === 0) {
      alert('Please select a customer before saving payment');
      return;
    }

    // Validate amount received vs calculated amount (lessons - credits) BEFORE building payload / calling API
    const received = parseFloat(state.amountReceived || "0");
    const receivedRounded = Math.round((isNaN(received) ? 0 : received) * 100) / 100;
    const calculatedRounded = Math.round(calculatedAmountReceived * 100) / 100;
    // Block only when underpaid (below calculated amount); overpayments are allowed
    if (receivedRounded < calculatedRounded) {
      alert('Amount received cannot be less than the calculated amount (selected lessons - selected credits)');
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
      // Find payment method name from available payment methods
      const selectedPaymentMethod = state.availablePaymentMethods.find(
        method => method.value === state.paymentMethod
      );
      const paymentMethodName = selectedPaymentMethod?.label || "Cash";

      const paymentData: ReceivePaymentData = {
        customer: state.customer,
        date: format(state.paymentDate, 'MMM dd, yyyy'),
        paymentMethod: state.paymentMethod,
        paymentMethodName: paymentMethodName,
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
        // Include full lesson details for receipt display
        lessonDetails: state.lessons.filter(lesson => lesson.selected && parseFloat(lesson.payment) > 0),
        groupLessonDetails: state.groupLessons.filter(gl => gl.selected && parseFloat(gl.payment) > 0),
        invoiceDetails: state.invoices.filter(inv => inv.selected && parseFloat(inv.payment) > 0),
        // Include full credit details for receipt display
        creditDetails: state.credits.filter(credit => credit.selected && parseFloat(credit.payment) > 0),
      };
      
      await onSave(paymentData);
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setIsSaving(false);
    }
  }, [state, calculations.amountToApply, onSave]);

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
            amountError={amountErrorMessage}
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
            lessonDateRange={lessonDateRange}
            onLessonDateRangeChange={handleLessonDateRangeChange}
            groupLessons={filteredGroupLessons}
            groupLessonColumns={columns.groupLessonColumns}
            groupLessonColumnFilters={state.groupLessonColumnFilters}
            onGroupLessonFilterChange={filterHandlers.handleGroupLessonFilterChange}
            groupLessonDateRange={groupLessonDateRange}
            onGroupLessonDateRangeChange={handleGroupLessonDateRangeChange}
            invoices={state.invoices}
            invoiceColumns={columns.invoiceColumns}
            credits={state.credits}
            creditColumns={columns.creditColumns}
            calculations={calculations}
          />
        </div>

        <ModalFooter
          onClose={handleClose}
          onSave={handleSave}
          isLoading={isSaving}
          isSaveDisabled={amountMismatch}
        />
      </DialogContent>
    </Dialog>
  );
};