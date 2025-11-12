// hooks/usePaymentReceiptModal.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  AllocationRow,
  GroupLessonRow,
  InvoiceRow,
  ReceiptRow,
  EditLessonRow,
  GroupLessonEditRow,
  InvoiceEditRow,
  EditFormData,
  PaymentMethod,
} from '@/components/Modals/PaymentReceiptModal/types';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  convertToEditableRows,
  calculateTotalAllocations,
  calculateCreditAmount,
  createAllocationHandler,
} from '@/utils/paymentUtils';

// ============ MAIN HOOK ============
interface UsePaymentReceiptModalProps {
  open: boolean;
  paymentId?: string;
  location: string;
  onSaveSuccess?: () => void;
}

interface PaymentData {
  headerAmount: string;
  paymentDate: string;
  paymentMethod: string;
  customerName: string;
  showAllocations: boolean;
  allocationRows: AllocationRow[];
  groupLessonRows: GroupLessonRow[];
  invoiceRows: InvoiceRow[];
  receiptRows: ReceiptRow[];
}

// ============ CONSTANTS ============
const INITIAL_PAYMENT_DATA: PaymentData = {
  headerAmount: "$0.00",
  paymentDate: "",
  paymentMethod: "",
  customerName: "",
  showAllocations: false,
  allocationRows: [],
  groupLessonRows: [],
  invoiceRows: [],
  receiptRows: [],
};

const INITIAL_EDIT_FORM: EditFormData = {
  date: "",
  method: "",
  reference: "",
  amountReceived: "0.00",
};

export function usePaymentReceiptModal({
  open,
  paymentId,
  location,
  onSaveSuccess,
}: UsePaymentReceiptModalProps) {
  // ============ STATE MANAGEMENT ============
  
  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Payment data
  const [paymentData, setPaymentData] = useState<PaymentData>(INITIAL_PAYMENT_DATA);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Edit form
  const [editDate, setEditDate] = useState(new Date());
  const [editForm, setEditForm] = useState<EditFormData>(INITIAL_EDIT_FORM);

  // Editable rows
  const [lessonEditRows, setLessonEditRows] = useState<EditLessonRow[]>([]);
  const [groupLessonEditRows, setGroupLessonEditRows] = useState<GroupLessonEditRow[]>([]);
  const [invoiceEditRows, setInvoiceEditRows] = useState<InvoiceEditRow[]>([]);

  // ============ DATA LOADING ============

  const loadPaymentData = useCallback(async (id: string) => {
    setIsLoadingData(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock payment data - Replace with actual API call
      const mockPayment = {
        id,
        amount: 250.00,
        date: "Nov 12, 2025",
        method: "Cash",
        reference: "REF-001",
        customer: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
        },
        used: 250.00,
        remaining: 0.00,
      };

      const mockAllocations: AllocationRow[] = [
        {
          originalDate: "Nov 10, 2025",
          date: "Nov 10, 2025",
          student: "Alice Doe",
          program: "Piano - Level 1",
          teacher: "Mr. Smith",
          amount: "$100.00",
          payment: "$100.00",
          balance: "$0.00",
        },
        {
          originalDate: "Nov 11, 2025",
          date: "Nov 11, 2025",
          student: "Bob Doe",
          program: "Guitar - Beginner",
          teacher: "Ms. Johnson",
          amount: "$150.00",
          payment: "$150.00",
          balance: "$0.00",
        },
      ];

      const mockGroupLessons: GroupLessonRow[] = [
        {
          date: "Nov 12, 2025",
          student: "Charlie Doe",
          program: "Group Piano",
          invoiced: "No",
          amount: "$75.00",
          balance: "$0.00",
        },
      ];

      const mockInvoices: InvoiceRow[] = [
        {
          date: "Nov 01, 2025",
          number: "INV-001",
          amount: "$200.00",
          payment: "$200.00",
          balance: "$0.00",
        },
      ];

      const mockReceiptRows: ReceiptRow[] = [
        {
          reference: mockPayment.reference,
          date: mockPayment.date,
          method: mockPayment.method,
          amount: formatCurrency(mockPayment.amount),
        },
      ];

      setPaymentData({
        headerAmount: formatCurrency(mockPayment.amount),
        paymentDate: mockPayment.date,
        paymentMethod: mockPayment.method,
        customerName: mockPayment.customer.name,
        showAllocations: mockPayment.used > 0,
        allocationRows: mockAllocations,
        groupLessonRows: mockGroupLessons,
        invoiceRows: mockInvoices,
        receiptRows: mockReceiptRows,
      });

      // Set edit form data
      setEditForm({
        date: mockPayment.date,
        method: "1",
        reference: mockPayment.reference,
        amountReceived: mockPayment.amount.toString(),
      });
      setEditDate(new Date());
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const resetModalData = useCallback(() => {
    setPaymentData(INITIAL_PAYMENT_DATA);
    setEditForm(INITIAL_EDIT_FORM);
    setEditDate(new Date());
    setIsEditing(false);
  }, []);

  const loadPaymentMethods = useCallback(async () => {
    setIsLoadingPaymentMethods(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock payment methods - Replace with actual API call
      const mockMethods: PaymentMethod[] = [
        { id: 1, name: "Cash" },
        { id: 2, name: "Visa" },
        { id: 3, name: "Mastercard" },
        { id: 4, name: "Amex" },
        { id: 5, name: "Cheque" },
        { id: 6, name: "Debit" },
        { id: 7, name: "E-Transfer" },
      ];

      setPaymentMethods(mockMethods);

      // Set default to Cash if not already set
      if (!editForm.method) {
        setEditForm(prev => ({ ...prev, method: "1" }));
      }
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  }, [editForm.method]);

  // ============ EFFECTS ============

  // Load data when modal opens
  useEffect(() => {
    if (open && paymentId) {
      loadPaymentData(paymentId);
    } else if (open && !paymentId) {
      resetModalData();
    }
  }, [open, paymentId, loadPaymentData, resetModalData]);

  // Load payment methods
  useEffect(() => {
    if (open) {
      loadPaymentMethods();
    }
  }, [open, loadPaymentMethods]);

  // Convert to editable rows when entering edit mode - Using  utility
  useEffect(() => {
    if (isEditing) {
      setLessonEditRows(
        convertToEditableRows<EditLessonRow>(paymentData.allocationRows, 'payment')
      );
      
      setGroupLessonEditRows(
        convertToEditableRows<GroupLessonEditRow>(paymentData.groupLessonRows, 'amount')
      );
      
      setInvoiceEditRows(
        convertToEditableRows<InvoiceEditRow>(paymentData.invoiceRows, 'payment')
      );
    }
  }, [isEditing, paymentData.allocationRows, paymentData.groupLessonRows, paymentData.invoiceRows]);

  // ============ CALCULATIONS - Using  utilities ============

  const amountToApply = useMemo(() => {
    // Cast to arrays with allocation property for the utility function
    return calculateTotalAllocations(
      lessonEditRows as Array<{ allocation: number }>,
      groupLessonEditRows as Array<{ allocation: number }>,
      invoiceEditRows as Array<{ allocation: number }>
    );
  }, [lessonEditRows, groupLessonEditRows, invoiceEditRows]);

  const amountToCredit = useMemo(() => {
    return calculateCreditAmount(editForm.amountReceived, amountToApply);
  }, [editForm.amountReceived, amountToApply]);

  // ============ HANDLERS - Using  utilities ============

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Saving payment:", {
        location,
        paymentId,
        editForm,
        lessonAllocations: lessonEditRows,
        groupLessonAllocations: groupLessonEditRows,
        invoiceAllocations: invoiceEditRows,
      });

      // Refresh data if editing existing payment
      if (paymentId) {
        await loadPaymentData(paymentId);
      }

      setIsEditing(false);
      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to save payment:", error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  }, [location, paymentId, editForm, lessonEditRows, groupLessonEditRows, invoiceEditRows, loadPaymentData, onSaveSuccess]);

  const handlePrint = useCallback(() => {
    console.log("Print payment receipt");
    window.print();
  }, []);

  const handleEmail = useCallback(() => {
    console.log("Email payment receipt");
    // TODO: Implement email functionality
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      console.log("Deleting payment:", paymentId);
      setShowDeleteConfirm(false);
      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to delete payment:", error);
      // TODO: Show error toast
    }
  }, [paymentId, onSaveSuccess]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Create allocation handlers using  utility
  const handleLessonAllocationChange = useMemo(
    () => createAllocationHandler(setLessonEditRows),
    []
  );

  const handleGroupLessonAllocationChange = useMemo(
    () => createAllocationHandler(setGroupLessonEditRows),
    []
  );

  const handleInvoiceAllocationChange = useMemo(
    () => createAllocationHandler(setInvoiceEditRows),
    []
  );

  const handleEditFormChange = useCallback((updates: Partial<EditFormData>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  }, []);

  // ============ RETURN ============

  return {
    // States
    isEditing,
    showDeleteConfirm,
    isSaving,
    isLoadingPaymentMethods,
    isLoadingData,
    
    // Data
    paymentData,
    paymentMethods,
    editDate,
    editForm,
    
    // Edit rows
    lessonEditRows,
    groupLessonEditRows,
    invoiceEditRows,
    
    // Calculations
    amountToApply,
    amountToCredit,
    
    // Handlers
    handleEditClick,
    handleCancelEdit,
    handleSave,
    handlePrint,
    handleEmail,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleLessonAllocationChange,
    handleGroupLessonAllocationChange,
    handleInvoiceAllocationChange,
    setEditDate,
    handleEditFormChange,
  };
}