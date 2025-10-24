// ReceivePaymentModal.tsx
import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ReceivePaymentModalProps, ReceivePaymentData } from './types';
import { DEFAULT_CUSTOMER, DEFAULT_AMOUNT_NEEDED } from './constants';
import { DataMapper } from './utils';
import { usePaymentState } from './hooks/usePaymentState';
import { useItemHandlers } from './hooks/useItemHandlers';
import { useFilterHandlers } from './hooks/useFilterHandlers';
import { usePaymentColumns } from './hooks/usePaymentColumns';
import { usePaymentCalculations } from './hooks/usePaymentCalculations';
import { ModalHeader } from './components/ModalHeader';
import { ModalFooter } from './components/ModalFooter';
import { PaymentFormSection } from './components/PaymentFormSection';
import { PaymentTablesSection } from './components/PaymentTablesSection';

/**
 * Main Receive Payment Modal Component
 * Following SOLID Principles:
 * - Single Responsibility: Only handles modal composition and coordination
 * - Open/Closed: Extended through props, closed for modification
 * - Liskov Substitution: Implements ReceivePaymentModalProps interface
 * - Interface Segregation: Uses focused, specific hooks
 * - Dependency Inversion: Depends on abstractions (hooks, components)
 */
export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  open,
  onOpenChange,
  onSave,
  customerId = DEFAULT_CUSTOMER,
  amountNeeded = DEFAULT_AMOUNT_NEEDED,
}) => {
  // State management
  const state = usePaymentState(customerId);
  
  // Item manipulation handlers
  const itemHandlers = useItemHandlers(
    state.setLessons,
    state.setGroupLessons,
    state.setInvoices,
    state.setCredits
  );
  
  // Filter handlers
  const filterHandlers = useFilterHandlers(
    state.setLessonColumnFilters,
    state.setGroupLessonColumnFilters
  );
  
  // Column definitions
  const columns = usePaymentColumns(
    state.lessons,
    state.groupLessons,
    state.invoices,
    state.credits,
    itemHandlers
  );
  
  // Calculations
  const calculations = usePaymentCalculations(
    state.lessons,
    state.groupLessons,
    state.invoices,
    state.credits,
    state.amountReceived
  );

  /**
   * Handle save action - transforms state into payment data
   */
  const handleSave = React.useCallback(() => {
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
      lessonPayments: DataMapper.createPaymentMap(state.lessons),
      groupLessonPayments: DataMapper.createPaymentMap(state.groupLessons),
      invoicePayments: DataMapper.createPaymentMap(state.invoices),
      creditPayments: DataMapper.createPaymentMap(state.credits),
    };
    
    onSave(paymentData);
  }, [state, onSave]);

  /**
   * Handle close action
   */
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] h-[90vh] flex flex-col p-0">
        <ModalHeader amountNeeded={amountNeeded} />

        <div className="overflow-y-auto flex-1 px-6">
          <PaymentFormSection
            customer={state.customer}
            onCustomerChange={state.setCustomer}
            paymentDate={state.paymentDate}
            onPaymentDateChange={state.setPaymentDate}
            paymentMethod={state.paymentMethod}
            onPaymentMethodChange={state.setPaymentMethod}
            reference={state.reference}
            onReferenceChange={state.setReference}
            amountReceived={state.amountReceived}
            onAmountReceivedChange={state.setAmountReceived}
            notes={state.notes}
            onNotesChange={state.setNotes}
          />

          <PaymentTablesSection
            lessons={state.lessons}
            lessonColumns={columns.lessonColumns}
            lessonColumnFilters={state.lessonColumnFilters}
            onLessonFilterChange={filterHandlers.handleLessonFilterChange}
            groupLessons={state.groupLessons}
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

        <ModalFooter onClose={handleClose} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
};