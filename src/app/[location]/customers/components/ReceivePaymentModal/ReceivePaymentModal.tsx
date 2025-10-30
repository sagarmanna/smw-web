// ReceivePaymentModal.tsx
import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ReceivePaymentModalProps, ReceivePaymentData } from './types';
import { DEFAULT_AMOUNT_NEEDED } from './constants';
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
 * Main Receive Payment Modal Component with API Integration and Pagination
 */
export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  open,
  onOpenChange,
  onSave,
  customerId,
  customerName,
  location,
  amountNeeded = DEFAULT_AMOUNT_NEEDED,
}) => {
  // State management with API integration and pagination
  const state = usePaymentState(
    location || 'burlington',
    customerId ? parseInt(customerId) : 0,
    customerName
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
  
  // Calculations
  const calculations = usePaymentCalculations(
    state.lessons,
    state.groupLessons,
    state.invoices,
    state.credits,
    state.amountReceived
  );

  // Pagination handlers for lessons
  const handleLessonsPageChange = React.useCallback(
    async (page: number) => {
      await state.loadLessonsPage(page, state.lessonsPagination.limit);
    },
    [state]
  );

  const handleLessonsRowsPerPageChange = React.useCallback(
    async (rowsPerPage: number) => {
      await state.loadLessonsPage(1, rowsPerPage);
    },
    [state]
  );

  // Pagination handlers for invoices
  const handleInvoicesPageChange = React.useCallback(
    async (page: number) => {
      await state.loadInvoicesPage(page, state.invoicesPagination.limit);
    },
    [state]
  );

  const handleInvoicesRowsPerPageChange = React.useCallback(
    async (rowsPerPage: number) => {
      await state.loadInvoicesPage(1, rowsPerPage);
    },
    [state]
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
        <ModalHeader amountNeeded={amountNeeded} />

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
            onAmountReceivedChange={state.setAmountReceived}
            notes={state.notes}
            onNotesChange={state.setNotes}
            availablePaymentMethods={state.availablePaymentMethods}
            isLoadingPaymentMethods={state.isLoading}
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
            // Pagination props for lessons
            lessonsPagination={state.lessonsPagination}
            lessonsLoading={state.lessonsLoading}
            onLessonsPageChange={handleLessonsPageChange}
            onLessonsRowsPerPageChange={handleLessonsRowsPerPageChange}
            // Pagination props for invoices
            invoicesPagination={state.invoicesPagination}
            invoicesLoading={state.invoicesLoading}
            onInvoicesPageChange={handleInvoicesPageChange}
            onInvoicesRowsPerPageChange={handleInvoicesRowsPerPageChange}
          />
        </div>

        <ModalFooter onClose={handleClose} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
};