"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { DetailHeaderWithProfile } from "../components/DetailHeaderWithProfile";
import {
  getCustomerById,
  CustomerRow,
  getCustomerInvoices,
  getCustomerOutstandingInvoices,
  getCustomerEquipmentRentals,
  getCustomerRecurringPayments,
  getCustomerPrivateLessonDue,
  getCustomerPrivateLessons,
  getCustomerGroupLessons,
  getCustomerGroupLessonDue,
  getCustomerPayments,
  getCustomerStudents,
  getCustomerSummary,
  getCustomerInfo,
  getCustomerEnrolments,
  getCustomerProformaInvoices,
  getCustomerComments,
  getCustomerHistory,
  CustomerSummaryData,
  CustomerInfoData,
  getCustomerPaymentById,
} from "../customers.api";
import { SummaryCard } from "@/components/SummaryCard";
import { BookOpen, FileText, Star, DollarSign, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCardWithAction } from "@/components/InfoCardWithAction";
import { TableCard } from "@/components/TableCard";
import { TabContent } from "@/components/TabContent";
import { AddressCard } from "../components/AddressCard";
import { EmailCard } from "../components/EmailCard";
import { DiscountCard } from "../components/DiscountCard";
import { OpeningBalanceCard } from "../components/OpeningBalanceCard";
import { PhoneCard } from "../components/PhoneCard";
import { RecurringPaymentModal } from "../components/RecurringPaymentModal";
import { EquipmentRentalsModal } from "../components/EquipmentRentalsModal";
import { DetailsCard } from "../components/DetailsCard";
import { InvoiceTable } from "../components/InvoicesTable";
import { ReceivePaymentModal } from "../components/ReceivePaymentModal";
import { PaymentReceiptModal } from "../components/PaymentReceiptModal";
import AddStudentModal from "../components/AddStudentModal/index";
import { NotifyViaEmailReasonsModal } from "../components/NotifyViaEmailModal";
import { CustomerDeleteModal } from "../components/CustomerDeleteModal";
import EmailStatementModal, {
  EmailFormData,
} from "../components/EmailStatementModal/index";
import { createStudent, createNote } from "@/lib/api/legacyApiAdapter";
import type { PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

import {
  InvoiceData,
  OutstandingInvoiceData,
  EquipmentRentalData,
  RecurringPaymentData,
  PrivateLessonDueData,
  GroupLessonDueData,
  PaymentData,
  CUSTOMER_TABLE_CONFIGS,
} from "../tableConfigs";
import {
  CUSTOMER_TAB_CONFIGS,
  TAB_ORDER,
  StudentData,
  EnrolmentData,
  PrivateLessonData,
  GroupLessonData,
  ProformaInvoiceData,
  CommentData,
  HistoryData,
} from "../tabConfigs";

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

interface Email {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  postalCode: string;
  note?: string;
  isPrimary?: boolean;
}

interface CustomerDetailClientProps {
  location: string;
  id: string;
}

export function CustomerDetailClient({
  location,
  id,
}: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [_customerInfo, setCustomerInfo] =
    React.useState<CustomerInfoData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [studentsLoading, setStudentsLoading] = React.useState<boolean>(false);
  const [studentsError, setStudentsError] = React.useState<string | null>(null);
  const [studentsPagination, setStudentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Outstanding invoices pagination state
  const [outstandingInvoicesPagination, setOutstandingInvoicesPagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [outstandingInvoicesLoading, setOutstandingInvoicesLoading] =
    React.useState<boolean>(false);

  // Equipment rentals pagination state
  const [equipmentRentalsPagination, setEquipmentRentalsPagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [equipmentRentalsLoading, setEquipmentRentalsLoading] =
    React.useState<boolean>(false);

  // Simple pagination state for all tabs - CONSOLIDATED (removed duplicates)
  const [tabPagination, setTabPagination] = React.useState<
    Record<
      string,
      {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    >
  >({});
  const [tabRowsPerPage, setTabRowsPerPage] = React.useState<
    Record<string, number>
  >({});
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] =
    React.useState<boolean>(false);
  const [isRecurringPaymentModalOpen, setIsRecurringPaymentModalOpen] =
    React.useState<boolean>(false);
  const [selectedRecurringPaymentId, setSelectedRecurringPaymentId] =
    React.useState<number | undefined>(undefined);
  const [isEquipmentRentalsModalOpen, setIsEquipmentRentalsModalOpen] =
    React.useState<boolean>(false);
  const [selectedRentalId, setSelectedRentalId] = React.useState<number | null>(null);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] =
    React.useState<boolean>(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState<boolean>(false);
  const [isPaymentReceiptModalOpen, setIsPaymentReceiptModalOpen] =
    React.useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] =
    React.useState<PaymentData | null>(null);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = React.useState<
    number | null
  >(null);
  const [isEmailStatementModalOpen, setIsEmailStatementModalOpen] =
    React.useState<boolean>(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Local state for editable customer details
  const [localFirstName, setLocalFirstName] = React.useState<string>("");
  const [localLastName, setLocalLastName] = React.useState<string>("");
  const [referralSource, setReferralSource] =
    React.useState<string>("Drive By");
  const [status, setStatus] = React.useState<string>("Active");
  const [picture, setPicture] = React.useState<string | undefined>(undefined);
  const [role, setRole] = React.useState<string>("Customer");

  // Summary data state
  const [summaryData, setSummaryData] = React.useState<CustomerSummaryData>({
    lessonsDue: "$0.00",
    outstandingInvoice: "$0.00",
    totalCredits: "$0.00",
    balance: "$0.00",
  });

  // Handle adding new student
  const handleAddStudent = async (studentData: StudentData) => {
    try {
      setStudentsLoading(true);
      setStudentsError(null);

      // Call legacy API to create student
      const response = await createStudent(location, Number(id), {
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        customerId: Number(id),
        birthDate: studentData.birthDate || "",
        gender:
          (studentData.gender as "not-specified" | "male" | "female") ||
          "not-specified",
      });

      if (response.status) {
        // Success: reload students from API to get the newly created student with proper data
        const { data: students, pagination: sPag } = await getCustomerStudents(
          location,
          Number(id),
          studentsPagination.page,
          studentsPagination.limit
        );
        setStudentData(students);
        setStudentsPagination(sPag);
      } else {
        // API returned an error
        const errorMessage =
          response.errors?.join(", ") || "Failed to create student";
        setStudentsError(errorMessage);
        console.error("Error creating student:", errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create student";
      setStudentsError(errorMessage);
      console.error("Error creating student:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Handle students pagination
  const handleStudentsPageChange = (_page: number) => {
    setStudentsPagination((prev) => ({ ...prev, page: _page }));
  };

  const handleStudentsRowsPerPageChange = (rowsPerPage: number) => {
    setStudentsPagination((prev) => ({
      ...prev,
      limit: rowsPerPage,
      page: 1,
      totalPages: Math.ceil(prev.total / rowsPerPage),
    }));
  };

  // Handle outstanding invoices pagination
  const handleOutstandingInvoicesPageChange = React.useCallback(
    async (page: number) => {
      setOutstandingInvoicesLoading(true);
      try {
        const limit =
          outstandingInvoicesPagination.limit === -1
            ? 99999
            : outstandingInvoicesPagination.limit;
        const result = await getCustomerOutstandingInvoices(
          location,
          Number(id),
          page,
          limit
        );

        setOutstandingInvoiceData(result.data);
        setOutstandingInvoicesPagination(result.pagination);
        setOutstandingInvoiceFooterTotal(result.footer.totalAmount);
      } catch (error) {
        console.error("Error loading outstanding invoices:", error);
      } finally {
        setOutstandingInvoicesLoading(false);
      }
    },
    [location, id, outstandingInvoicesPagination.limit]
  );

  const handleOutstandingInvoicesRowsPerPageChange = React.useCallback(
    async (rowsPerPage: number) => {
      setOutstandingInvoicesLoading(true);
      try {
        const limit = rowsPerPage === -1 ? 99999 : rowsPerPage;
        const result = await getCustomerOutstandingInvoices(
          location,
          Number(id),
          1,
          limit
        );

        setOutstandingInvoiceData(result.data);
        setOutstandingInvoicesPagination(result.pagination);
        setOutstandingInvoiceFooterTotal(result.footer.totalAmount);
      } catch (error) {
        console.error("Error loading outstanding invoices:", error);
      } finally {
        setOutstandingInvoicesLoading(false);
      }
    },
    [location, id]
  );

  // Handle equipment rentals pagination
  const handleEquipmentRentalsPageChange = React.useCallback(
    async (page: number) => {
      setEquipmentRentalsLoading(true);
      try {
        const limit =
          equipmentRentalsPagination.limit === -1
            ? 99999
            : equipmentRentalsPagination.limit;
        const result = await getCustomerEquipmentRentals(
          location,
          Number(id),
          page,
          limit
        );

        setEquipmentRentalData(result.data);
        setEquipmentRentalsPagination(result.pagination);
      } catch (error) {
        console.error("Error loading equipment rentals:", error);
      } finally {
        setEquipmentRentalsLoading(false);
      }
    },
    [location, id, equipmentRentalsPagination.limit]
  );

  const handleEquipmentRentalsRowsPerPageChange = React.useCallback(
    async (rowsPerPage: number) => {
      setEquipmentRentalsLoading(true);
      try {
        const limit = rowsPerPage === -1 ? 99999 : rowsPerPage;
        const result = await getCustomerEquipmentRentals(
          location,
          Number(id),
          1,
          limit
        );

        setEquipmentRentalData(result.data);
        setEquipmentRentalsPagination(result.pagination);
      } catch (error) {
        console.error("Error loading equipment rentals:", error);
      } finally {
        setEquipmentRentalsLoading(false);
      }
    },
    [location, id]
  );

  // Simple pagination handlers for all tabs (following AccountReceivableClient pattern)
  const handleTabPageChange = React.useCallback(
    (tabKey: string, page: number) => {
      setTabPagination((prev) => ({
        ...prev,
        [tabKey]: { ...prev[tabKey], page },
      }));
    },
    []
  );

  const handleTabRowsPerPageChange = React.useCallback(
    (tabKey: string, rowsPerPage: number) => {
      setTabRowsPerPage((prev) => ({ ...prev, [tabKey]: rowsPerPage }));
      setTabPagination((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          limit: rowsPerPage,
          page: 1,
          totalPages: Math.ceil((prev[tabKey]?.total || 0) / rowsPerPage),
        },
      }));
    },
    []
  );

  // Handle adding new recurring payment
  const handleAddRecurringPayment = async () => {
    setIsRecurringPaymentModalOpen(false);
    setSelectedRecurringPaymentId(undefined);
    // Refresh recurring payments list
    try {
      const { data, pagination } = await getCustomerRecurringPayments(
        location,
        Number(id),
        recurringPaymentsPagination.page,
        recurringPaymentsPagination.limit === -1 ? 99999 : recurringPaymentsPagination.limit
      );
      setRecurringPaymentData(data || []);
      setRecurringPaymentsPagination(pagination);
    } catch (error) {
      console.error('Error refreshing recurring payments:', error);
    }
  };

  // Handle deleting recurring payment
  const handleDeleteRecurringPayment = async () => {
    setIsRecurringPaymentModalOpen(false);
    setSelectedRecurringPaymentId(undefined);
    // Refresh recurring payments list
    try {
      const { data, pagination } = await getCustomerRecurringPayments(
        location,
        Number(id),
        recurringPaymentsPagination.page,
        recurringPaymentsPagination.limit === -1 ? 99999 : recurringPaymentsPagination.limit
      );
      setRecurringPaymentData(data || []);
      setRecurringPaymentsPagination(pagination);
    } catch (error) {
      console.error('Error refreshing recurring payments:', error);
    }
  };

  // Handle adding new equipment rental
  const handleAddEquipmentRental = async (data: unknown) => {
    setIsEquipmentRentalsModalOpen(false);
    // Reload equipment rentals after adding new one
    const result = await getCustomerEquipmentRentals(
      location,
      Number(id),
      equipmentRentalsPagination.page,
      equipmentRentalsPagination.limit
    );
    setEquipmentRentalData(result.data);
    setEquipmentRentalsPagination(result.pagination);
  };

  const handleSendEmailStatement = (emailData: EmailFormData) => {
    console.log("Sending email statement:", emailData);
    setIsEmailStatementModalOpen(false);
    // Show success toast notification
  };

  // Handle creating a new comment/note
  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      return; // Don't submit empty comments
    }

    try {
      setCommentLoading(true);
      const response = await createNote(
        location,
        Number(id),
        2, // instanceType = 2 for customer notes
        commentInput.trim()
      );

      if (response.status) {
        // Success: reload comments from API to get the newly created comment
        const comments = await getCustomerComments(location, Number(id));
        setCommentData(comments);
        setCommentInput(""); // Clear input
      } else {
        // API returned an error
        const errorMessage =
          response.errors?.join(", ") || "Failed to create comment";
        console.error("Error creating comment:", errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create comment";
      console.error("Error creating comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Navigate to legacy Proforma Invoice create page (new tab)
  const handleProformaInvoiceNavigate = () => {
    const legacyUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/create?Invoice%5Bcustomer_id%5D=${id}`;
    if (typeof window !== "undefined") {
      window.open(legacyUrl, "_blank", "noopener,noreferrer");
    } else {
      router.push(legacyUrl);
    }
  };

  // Handle invoice actions
  const handleAddInvoice = () => {
    // TODO: Implement invoice creation logic
  };

  const handlePrintInvoice = () => {};

  // Handle receiving payment
  const handleReceivePayment = async (paymentData: {
    customer: string;
    date: string;
    paymentMethod: string;
    reference: string;
    amountReceived: number;
    notes: string;
    selectedLessons: string[];
    selectedGroupLessons?: string[];
    selectedInvoices?: string[];
    selectedCredits?: string[];
    lessonPayments: Record<string, number>;
    groupLessonPayments?: Record<string, number>;
    invoicePayments?: Record<string, number>;
    creditPayments?: Record<string, number>;
  }) => {
    setIsSavingPayment(true);
    try {
      // Import the legacy API function
      const { receivePayment } = await import("@/lib/api/legacyApiAdapter");
      
      // Payment method value is already the ID as a string, just convert to number
      const paymentMethodId = Number(paymentData.paymentMethod) || 1; // Default to 1 if invalid

      // Helper function to format numbers to 2 decimal places
      const formatToTwoDecimals = (value: number): number => {
        return Math.round(value * 100) / 100;
      };

      // Calculate amount needed (sum of all selected items)
      const lessonPaymentsTotal = Object.values(paymentData.lessonPayments || {}).reduce((sum, val) => sum + val, 0);
      const groupLessonPaymentsTotal = Object.values(paymentData.groupLessonPayments || {}).reduce((sum, val) => sum + val, 0);
      const invoicePaymentsTotal = Object.values(paymentData.invoicePayments || {}).reduce((sum, val) => sum + val, 0);
      const amountNeeded = formatToTwoDecimals(lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal);
      const amountToDistribute = formatToTwoDecimals(amountNeeded);

      // Prepare invoice payments array
      // Strip "I-" prefix from invoice IDs if present (legacy API expects numeric ID only)
      const invoicePaymentsArray = paymentData.invoicePayments
        ? Object.entries(paymentData.invoicePayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => {
              // Remove "I-" prefix if present (e.g., "I-52343" -> "52343")
              let cleanId = id.startsWith('I-') ? id.substring(2) : id;
              // Ensure it's a valid numeric ID (remove any other prefixes or non-numeric characters)
              cleanId = cleanId.replace(/[^0-9]/g, '');
              // Convert to number if it's a valid numeric string
              const numericId = cleanId && !isNaN(Number(cleanId)) ? Number(cleanId) : cleanId;
              return {
                id: numericId,
                value: value,
              };
            })
            .filter(({ id }) => id !== null && id !== undefined && id !== '') // Filter out invalid IDs
        : [];

      // Prepare invoice payments array with formatted values
      const formattedInvoicePayments = invoicePaymentsArray.map(inv => ({
        id: inv.id,
        value: formatToTwoDecimals(inv.value),
      }));

      // Prepare payment data for legacy API
      const legacyPaymentData: PaymentReceiveData = {
        userId: Number(id),
        date: paymentData.date, // Already in "MMM dd, yyyy" format
        paymentMethodId: paymentMethodId,
        reference: paymentData.reference || '',
        amount: formatToTwoDecimals(paymentData.amountReceived),
        amountNeeded: amountNeeded,
        selectedCreditValue: 0.00,
        amountToDistribute: amountToDistribute,
        notes: paymentData.notes || '',
        invoicePayments: formattedInvoicePayments.length > 0 ? formattedInvoicePayments : undefined,
        canUsePaymentCredits: 0,
        canUseInvoiceCredits: 0,
        prId: '',
      };

      // Call legacy API
      const response = await receivePayment(location, legacyPaymentData);

      if (response.status) {
        // Success - close receive payment modal
        setIsReceivePaymentModalOpen(false);
        
        // Refresh payments list and related data to get the latest payment
        try {
          // Refresh payments list to get the latest payment
          const paymentsResponse = await getCustomerPayments(location, Number(id), 1, 1);
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0];
            setSelectedPayment(latestPayment);
            setSelectedPaymentIndex(0);
            
            // Refresh related data for the receipt modal
            // Refresh private lesson due data
            try {
              const privateLessonDueResult = await getCustomerPrivateLessonDue(
                location,
                Number(id),
                1,
                99999
              );
              setPrivateLessonDueData(privateLessonDueResult.data || []);
            } catch {}
            
            // Refresh group lesson due data
            try {
              const groupLessonDueResult = await getCustomerGroupLessonDue(
                location,
                Number(id),
                1,
                99999
              );
              setGroupLessonDueData(groupLessonDueResult.data || []);
            } catch {}
            
            // Refresh invoice data
            try {
              const invoiceResult = await getCustomerInvoices(location, Number(id), 1);
              setInvoiceData(invoiceResult || []);
            } catch {}
            
            // Refresh summary data
            try {
              const summaryResult = await getCustomerSummary(location, Number(id));
              if (summaryResult && summaryResult.data) {
                setSummaryData(summaryResult.data);
              }
            } catch {}
            
            // Open payment receipt modal
            setIsPaymentReceiptModalOpen(true);
          } else {
            // If we can't get the payment, still show success
            toast.success("Payment saved successfully");
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
          toast.success("Payment saved successfully");
        }
      } else {
        const errorMessage = response.message || response.errors?.join(", ") || "Failed to save payment";
        console.error("Payment save error:", errorMessage);
        toast.error(errorMessage);
        // Don't close modal on error so user can retry
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save payment";
      toast.error(errorMessage);
      // Don't close modal on error so user can retry
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Helper function to calculate amount needed
  const calculateAmountNeeded = () => {
    const parseAmount = (value: string) => {
      const num = parseFloat(value.replace(/[$,]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const lessonsDue = parseAmount(summaryData.lessonsDue);
    const outstanding = parseAmount(summaryData.outstandingInvoice);

    return lessonsDue + outstanding;
  };

  // Table data states
  const [invoiceData, setInvoiceData] = React.useState<InvoiceData[]>([]);
  const [outstandingInvoiceData, setOutstandingInvoiceData] = React.useState<
    OutstandingInvoiceData[]
  >([]);
  const [outstandingInvoiceFooterTotal, setOutstandingInvoiceFooterTotal] =
    React.useState<number>(0);
  const [equipmentRentalData, setEquipmentRentalData] = React.useState<
    EquipmentRentalData[]
  >([]);
  const [_recurringPaymentData, setRecurringPaymentData] = React.useState<
    RecurringPaymentData[]
  >([]);
  const [recurringPaymentsPagination, setRecurringPaymentsPagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [privateLessonDueData, setPrivateLessonDueData] = React.useState<
    PrivateLessonDueData[]
  >([]);
  const [groupLessonDueData, setGroupLessonDueData] = React.useState<
    GroupLessonDueData[]
  >([]);
  const [groupLessonDuePagination, setGroupLessonDuePagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [groupLessonDueFooterTotal, setGroupLessonDueFooterTotal] =
    React.useState<string>("$0.00");
  const [paymentData, setPaymentData] = React.useState<PaymentData[]>([]);
  const [paymentsPagination, setPaymentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [paymentsFooterRemaining, setPaymentsFooterRemaining] =
    React.useState<string>("$0.00");
  const [paymentsLoading, setPaymentsLoading] = React.useState<boolean>(false);

  // Tab data states
  const [studentData, setStudentData] = React.useState<StudentData[]>([]);
  const [enrolmentData, setEnrolmentData] = React.useState<EnrolmentData[]>([]);
  const [privateLessonData, setPrivateLessonData] = React.useState<
    PrivateLessonData[]
  >([]);
  const [groupLessonData, setGroupLessonData] = React.useState<
    GroupLessonData[]
  >([]);
  const [proformaInvoiceData, setProformaInvoiceData] = React.useState<
    ProformaInvoiceData[]
  >([]);
  const [commentData, setCommentData] = React.useState<CommentData[]>([]);
  const [commentInput, setCommentInput] = React.useState<string>("");
  const [commentLoading, setCommentLoading] = React.useState<boolean>(false);
  const [historyData, setHistoryData] = React.useState<HistoryData[]>([]);

  // Enrolments server-side pagination state
  const [enrolmentsPagination, setEnrolmentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [enrolmentsLoading, setEnrolmentsLoading] =
    React.useState<boolean>(false);

  // History server-side pagination state
  const [historyPagination, setHistoryPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [historyLoading, setHistoryLoading] = React.useState<boolean>(false);

  // Private lessons server-side pagination state
  const [privateLessonsPagination, setPrivateLessonsPagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [privateLessonsLoading, setPrivateLessonsLoading] =
    React.useState<boolean>(false);

  // Group lessons server-side pagination state
  const [groupLessonsPagination, setGroupLessonsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [groupLessonsLoading, setGroupLessonsLoading] =
    React.useState<boolean>(false);

  // Pro-forma invoices server-side pagination state
  const [proformaInvoicesPagination, setProformaInvoicesPagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [proformaInvoicesLoading, setProformaInvoicesLoading] =
    React.useState<boolean>(false);

  // Additional customer data states
  const [phones, setPhones] = React.useState<PhoneNumber[]>([]);
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [discount, setDiscount] = React.useState<number>(0);
  const [openingBalance, setOpeningBalance] = React.useState<number>(0);
  const [openingBalanceId, setOpeningBalanceId] = React.useState<number | null>(
    null
  );
  const [hasOpeningBalance, setHasOpeningBalance] =
    React.useState<boolean>(false);

  // Private lesson due server-side pagination and footer
  const [privateLessonDuePagination, setPrivateLessonDuePagination] =
    React.useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  const [privateLessonDueFooterTotal, setPrivateLessonDueFooterTotal] =
    React.useState<string>("$0.00");

  // Calculate footer for outstanding invoices
  // Use API total only when showing all records, otherwise calculate from visible data
  const calculateOutstandingTotal = () => {
    if (
      outstandingInvoicesPagination.limit === -1 ||
      outstandingInvoicesPagination.total <= outstandingInvoicesPagination.limit
    ) {
      // Showing all records - use API footer total
      return outstandingInvoiceFooterTotal;
    } else {
      // Paginated view - calculate from visible rows only
      return outstandingInvoiceData.reduce(
        (sum, item) => sum + item.balanceDue,
        0
      );
    }
  };

  const outstandingInvoiceFooterRow: OutstandingInvoiceData = {
    id: "Total:",
    date: "",
    amount: 0,
    payments: 0,
    balanceDue: calculateOutstandingTotal(),
  };

  // Calculate footer for payments (only remaining column)
  const paymentFooterRow: PaymentData = {
    date: "",
    notes: "",
    amount: 0,
    used: 0,
    remaining: paymentsFooterRemaining,
  };

  // Tab data mapping for easy access
  const tabDataMap = {
    studentData,
    enrolmentData,
    privateLessonData,
    groupLessonData,
    proformaInvoiceData,
    commentData,
    historyData,
  };

  // Handle payments pagination
  const handlePaymentsPageChange = React.useCallback(
    async (page: number) => {
      setPaymentsLoading(true);
      try {
        const result = await getCustomerPayments(
          location,
          Number(id),
          page,
          paymentsPagination.limit === -1 ? 99999 : paymentsPagination.limit
        );

        setPaymentData(result.data || []);
        setPaymentsPagination(result.pagination);
        if (result.footer?.totalRemaining) {
          setPaymentsFooterRemaining(result.footer.totalRemaining);
        }
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setPaymentsLoading(false);
      }
    },
    [location, id, paymentsPagination.limit]
  );

  const handlePaymentsRowsPerPageChange = React.useCallback(
    async (rowsPerPage: number) => {
      setPaymentsLoading(true);
      try {
        const result = await getCustomerPayments(
          location,
          Number(id),
          1,
          rowsPerPage === -1 ? 99999 : rowsPerPage
        );

        setPaymentData(result.data || []);
        setPaymentsPagination(result.pagination);
        if (result.footer?.totalRemaining) {
          setPaymentsFooterRemaining(result.footer.totalRemaining);
        }
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setPaymentsLoading(false);
      }
    },
    [location, id]
  );

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Load customer data
        const customerData = await getCustomerById(location, Number(id));
        setCustomer(customerData);

        // Set local names from loaded customer data
        if (customerData) {
          setLocalFirstName(customerData.firstName);
          setLocalLastName(customerData.lastName);
        }

        const infoResponse = await getCustomerInfo(location, Number(id));

        if (infoResponse?.success && infoResponse.data) {
          setCustomerInfo(infoResponse.data);

          if (infoResponse.data.profile?.name) {
            const nameParts = infoResponse.data.profile.name.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            setLocalFirstName(firstName);
            setLocalLastName(lastName);
          }

          if (infoResponse.data.profile) {
            setRole(infoResponse.data.profile.role || "Customer");
            setReferralSource(
              infoResponse.data.profile.referralSource || "Drive By"
            );
            setStatus(infoResponse.data.profile.status || "Active");
          }

          // FIXED: Email handling with notes
          if (
            infoResponse.data.email &&
            Array.isArray(infoResponse.data.email)
          ) {
            const formattedEmails = infoResponse.data.email.map((e) => ({
              id: String(e.id),
              label: e.label,
              email: e.email,
              note: e.note || "",
              isPrimary: e.isPrimary,
            }));
            setEmails(formattedEmails);
          }

          if (
            infoResponse.data.phone &&
            Array.isArray(infoResponse.data.phone)
          ) {
            const formattedPhones = infoResponse.data.phone.map((p) => ({
              id: String(p.id),
              label: p.label,
              number: p.number,
              extension: p.extension?.toString(),
              note: p.note,
            }));
            setPhones(formattedPhones);
          }

          if (
            infoResponse.data.addresses &&
            Array.isArray(infoResponse.data.addresses)
          ) {
            const formattedAddresses = infoResponse.data.addresses.map((a) => ({
              id: String(a.id),
              label: a.label,
              address: a.address,
              city: a.city,
              cityId: a.cityId,
              provinceId: a.provinceId,
              countryId: a.countryId,
              postalCode: a.postalCode,
              note: a.note,
              isPrimary: a.isPrimary,
            }));
            setAddresses(formattedAddresses);
          }

          if (infoResponse.data.discount) {
            setDiscount(infoResponse.data.discount.value || 0);
          }

          // FIXED: Opening balance handling
          if (infoResponse.data.openingBalance) {
            const amount = infoResponse.data.openingBalance.amount || 0;
            const id = infoResponse.data.openingBalance.id;
            setOpeningBalance(amount);
            setOpeningBalanceId(id);
            setHasOpeningBalance(true);
          }
        }

        const summary = await getCustomerSummary(location, Number(id));
        if (summary?.success && summary.data) {
          setSummaryData(summary.data);
        }

        // Load outstanding invoices with pagination
        const outstandingInvoicesResult = await getCustomerOutstandingInvoices(
          location,
          Number(id),
          1,
          10
        );
        setOutstandingInvoiceData(outstandingInvoicesResult.data);
        setOutstandingInvoicesPagination(outstandingInvoicesResult.pagination);
        setOutstandingInvoiceFooterTotal(
          outstandingInvoicesResult.footer.totalAmount
        );

        // Load equipment rentals with pagination
        setEquipmentRentalsLoading(true);
        const equipmentRentalsResult = await getCustomerEquipmentRentals(
          location,
          Number(id),
          1,
          10
        );
        setEquipmentRentalData(equipmentRentalsResult.data);
        setEquipmentRentalsPagination(equipmentRentalsResult.pagination);
        setEquipmentRentalsLoading(false);

        // Load other table data in parallel
        const [invoices, _paymentsIgnore] = await Promise.all([
          getCustomerInvoices(location, Number(id), 1),
          Promise.resolve([]),
        ]);

        setInvoiceData(invoices || []);
        // Load recurring payments (no transform) with server-side pagination
        try {
          const { data: recurring, pagination: rPag } =
            await getCustomerRecurringPayments(location, Number(id), 1, 10);
          setRecurringPaymentData(recurring || []);
          setRecurringPaymentsPagination(rPag);
        } catch {}

        // Load private lesson dues with footer and pagination (no transform)
        try {
          const privateLessonDueResult = await getCustomerPrivateLessonDue(
            location,
            Number(id),
            1,
            10
          );
          setPrivateLessonDueData(privateLessonDueResult.data || []);
          setPrivateLessonDuePagination(privateLessonDueResult.pagination);
          if (privateLessonDueResult.footer?.totalAmount) {
            setPrivateLessonDueFooterTotal(
              privateLessonDueResult.footer.totalAmount
            );
          } else {
            setPrivateLessonDueFooterTotal("$0.00");
          }
        } catch {}

        // Load group lesson dues with footer and pagination (no transform)
        try {
          const groupLessonDueResult = await getCustomerGroupLessonDue(
            location,
            Number(id),
            1,
            10
          );
          setGroupLessonDueData(groupLessonDueResult.data || []);
          setGroupLessonDuePagination(groupLessonDueResult.pagination);
          if (groupLessonDueResult.footer?.totalAmount) {
            setGroupLessonDueFooterTotal(
              groupLessonDueResult.footer.totalAmount
            );
          } else {
            setGroupLessonDueFooterTotal("$0.00");
          }
        } catch {}
        // Load payments with footer (no transform)
        try {
          setPaymentsLoading(true);
          const paymentsResult = await getCustomerPayments(
            location,
            Number(id),
            1,
            10
          );
          setPaymentData(paymentsResult.data || []);
          setPaymentsPagination(paymentsResult.pagination);
          if (paymentsResult.footer?.totalRemaining) {
            setPaymentsFooterRemaining(paymentsResult.footer.totalRemaining);
          } else {
            setPaymentsFooterRemaining("$0.00");
          }
        } finally {
          setPaymentsLoading(false);
        }

        // Load students data from API (server-side pagination)
        setStudentsLoading(true);
        setStudentsError(null);
        try {
          const { data: students, pagination: sPag } =
            await getCustomerStudents(location, Number(id), 1, 10);
          setStudentData(students);
          setStudentsPagination(sPag);
        } catch {
          setStudentsError("Failed to load students data");
          setStudentData([]);
          setStudentsPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setStudentsLoading(false);
        }

        // Load enrolments data from API (server-side pagination)
        try {
          setEnrolmentsLoading(true);
          const { data: enrolments, pagination: ePag } =
            await getCustomerEnrolments(location, Number(id), 1, 10);
          setEnrolmentData(enrolments);
          setEnrolmentsPagination(ePag);
        } catch {
          setEnrolmentData([]);
          setEnrolmentsPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setEnrolmentsLoading(false);
        }

        // Load private lessons tab data from API (server-side pagination)
        try {
          setPrivateLessonsLoading(true);
          const { data: privateLessons, pagination: plPagination } =
            await getCustomerPrivateLessons(location, Number(id), 1, 10);
          setPrivateLessonData(privateLessons);
          setPrivateLessonsPagination(plPagination);
        } catch {
          setPrivateLessonData([]);
          setPrivateLessonsPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setPrivateLessonsLoading(false);
        }

        // Load group lessons tab data from API (server-side pagination)
        try {
          setGroupLessonsLoading(true);
          const { data: groupLessons, pagination: glPagination } =
            await getCustomerGroupLessons(location, Number(id), 1, 10);
          setGroupLessonData(groupLessons);
          setGroupLessonsPagination(glPagination);
        } catch {
          setGroupLessonData([]);
          setGroupLessonsPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setGroupLessonsLoading(false);
        }

        // Load pro-forma invoices tab data from API (server-side pagination)
        try {
          setProformaInvoicesLoading(true);
          const { data: proformas, pagination: pfPagination } =
            await getCustomerProformaInvoices(location, Number(id), 1, 10);
          setProformaInvoiceData(proformas);
          setProformaInvoicesPagination(pfPagination);
        } catch {
          setProformaInvoiceData([]);
          setProformaInvoicesPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setProformaInvoicesLoading(false);
        }
        // Load comments tab data from API
        try {
          const comments = await getCustomerComments(location, Number(id));
          setCommentData(comments);
        } catch {
          setCommentData([]);
        }
        // Load history tab data from API (server-side pagination)
        try {
          setHistoryLoading(true);
          const { data: history, pagination: hPag } = await getCustomerHistory(
            location,
            Number(id),
            1,
            10
          );
          setHistoryData(history);
          setHistoryPagination(hPag);
        } catch {
          setHistoryData([]);
          setHistoryPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        } finally {
          setHistoryLoading(false);
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setLoading(false);
        // const summary = await getCustomerSummary(location, Number(id));
        // if (summary?.success && summary.data) {
        //   setSummaryData(summary.data);
        // }
      }
    };

    loadData();
  }, [location, id]);

  // Initialize pagination after data is loaded
  React.useEffect(() => {
    if (!loading && studentData.length >= 0) {
      // Use keys that exactly match TAB_ORDER/CUSTOMER_TAB_CONFIGS ids
      const tabData = {
        students: studentData,
        enrolments: enrolmentData,
        "private-lessons": privateLessonData,
        "group-lessons": groupLessonData,
        "proforma-invoices": proformaInvoiceData,
        comments: commentData,
        history: historyData,
      } as Record<string, unknown[]>;

      const initialPagination: Record<
        string,
        {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        }
      > = {};
      const initialRowsPerPage: Record<string, number> = {};

      Object.entries(tabData).forEach(([key, data]) => {
        const total = Array.isArray(data) ? data.length : 0;
        const limit = 10;
        initialPagination[key] = {
          page: 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        };
        initialRowsPerPage[key] = limit;
      });

      setTabPagination(initialPagination);
      setTabRowsPerPage(initialRowsPerPage);
    }
  }, [
    loading,
    studentData,
    enrolmentData,
    privateLessonData,
    groupLessonData,
    proformaInvoiceData,
    commentData,
    historyData,
  ]);

  // Handle details save
  const handleDetailsSave = React.useCallback(
    (newData: {
      firstName: string;
      lastName: string;
      role: string;
      referralSource: string;
      status: string;
      picture?: string;
    }) => {
      // Update local names immediately
      setLocalFirstName(newData.firstName);
      setLocalLastName(newData.lastName);

      // Update customer state with new data
      setCustomer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          firstName: newData.firstName,
          lastName: newData.lastName,
        };
      });

      setRole(newData.role);
      setReferralSource(newData.referralSource);
      setStatus(newData.status);
      setPicture(newData.picture);

      // TODO: Call API to update customer details
    },
    []
  );

  // Define action menu groups
  const customerActionMenuGroups: ActionMenuGroup[] = [
    {
      label: "Actions",
      items: [
        {
          label: "Receive Payment",
          onClick: () => setIsReceivePaymentModalOpen(true),
        },
        
        { 
          label: "Print Statement", 
          onClick: () => {
            const legacyUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/print/customer-statement?id=${id}`;
            window.open(legacyUrl, '_blank');
          } 
        },
        {
          label: "Email Statement",
          onClick: () => setIsEmailStatementModalOpen(true),
        },
        { label: "A/R Report Detail", onClick: () => {{
          const url = `/admin/v2/${location}/report/account-receivable/${id}`;
          window.open(url, '_blank');
        } } },
        // { label: "Items Purchased by Category", onClick: () => {} },
        // { label: "A/R Report Detail", onClick: () => {} },
        { label: "Items Purchased by Category", onClick: () => {
          const url = `/admin/v2/${location}/customers/${id}/items-purchased-by-category`;
          window.open(url, '_blank');
        } },
        {
          label: "Notify Via Email",
          onClick: () => setIsNotifyModalOpen(true),
        },
      ],
      separator: true,
    },
    {
      items: [
        {
          label: "Delete",
          onClick: () => setIsDeleteModalOpen(true),
          variant: "destructive",
        },
      ],
    },
  ];

  // Auto-dismiss error after 5 seconds
  React.useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  return (
    <div className="bg-white dark:bg-black -mt-2">
      <DetailHeaderWithProfile
        breadcrumbItems={[
          {
            label: "Customers",
            onClick: () => router.push(`/${location}/customers/`),
          },
        ]}
        currentPageTitle={
          localFirstName && localLastName
            ? `${localFirstName} ${localLastName}`
            : id
        }
        loading={loading}
        actionMenuGroups={customerActionMenuGroups}
        actionButtonAriaLabel="Customer actions"
        showProfileIcon={true}
        profileIconSize="md"
      />

      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {deleteError}
        </div>
      )}

      {/* Payment History Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
        <SummaryCard
          title="Lessons Due"
          value={summaryData.lessonsDue}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-cyan-500"
          loading={loading}
        />
        <SummaryCard
          title="Outstanding Invoice"
          value={summaryData.outstandingInvoice}
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-orange-500"
          loading={loading}
        />
        <SummaryCard
          title="Credits"
          value={summaryData.totalCredits}
          icon={<Star className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-green-500"
          loading={loading}
        />
        <SummaryCard
          title="Balance"
          value={summaryData.balance}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-orange-400"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 lg:items-start">
        {/* Left Column */}
        <div className="space-y-3 sm:space-y-4">
          {/* Details Card */}
          <DetailsCard
            data={{
              firstName: localFirstName,
              lastName: localLastName,
              role: role,
              referralSource: referralSource,
              status: status,
              picture: picture,
            }}
            onSave={handleDetailsSave}
            loading={loading}
            location={location}
            customerId={Number(id)}
          />

          {/* Invoices Table */}
          <InvoiceTable
            data={invoiceData}
            loading={loading}
            id={id}
            onAddInvoice={handleAddInvoice}
            onPrintInvoice={handlePrintInvoice}
            location={location}
            customerId={id}
            customerName={`${localFirstName || ""}${
              localLastName ? ` ${localLastName}` : ""
            }`}
          />

          {/* Outstanding Invoices */}
          <TableCard
            title="Outstanding Invoices"
            data={outstandingInvoiceData}
            columns={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.columns}
            loading={outstandingInvoicesLoading || loading}
            footerRow={outstandingInvoiceFooterRow}
            onRowClick={(row) => {
              const invoiceUrl = (row as OutstandingInvoiceData).url;
              if (invoiceUrl) {
                const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/${invoiceUrl}`;
                window.open(url, "_blank", "noopener");
              }
            }}
            onAdd={() => {}}
            size={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.size}
            variant={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.variant}
            enableSorting={
              CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableSorting
            }
            enableExport={
              CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableExport
            }
            enablePrint={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enablePrint}
            enableSearch={
              CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableSearch
            }
            enableFilter={
              CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableFilter
            }
            iconType="none"
            enableShowAll={outstandingInvoicesPagination.total > 10}
            showAllLabel="Show All"
            serverSidePagination={outstandingInvoicesPagination}
            onServerSidePageChange={handleOutstandingInvoicesPageChange}
            rowsPerPage={outstandingInvoicesPagination.limit}
            onRowsPerPageChange={handleOutstandingInvoicesRowsPerPageChange}
            rowsPerPageOptions={[10]}
          />

          {/* Mobile Email and Phone Cards - Only on Mobile */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            <EmailCard
              emails={emails}
              onAddClick={() => {}}
              onSave={setEmails}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />

            <PhoneCard
              phones={phones}
              onSave={(newPhones) => setPhones(newPhones)}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-3 sm:space-y-4">
          {/* Desktop Email and Phone Cards */}
          <div className="hidden lg:block">
            <EmailCard
              emails={emails}
              onAddClick={() => {}}
              onSave={setEmails}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>

          <div className="hidden lg:block">
            <PhoneCard
              phones={phones}
              onSave={(newPhones) => setPhones(newPhones)}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>

          <AddressCard
            addresses={addresses}
            onSave={(newAddresses) => setAddresses(newAddresses)}
            loading={loading}
            location={location}
            customerId={Number(id)}
          />

          <DiscountCard
            discount={discount}
            onSave={(newDiscount) => setDiscount(newDiscount)}
            loading={loading}
            location={location}
            customerId={Number(id)}
          />

          <OpeningBalanceCard
            amount={openingBalance}
            hasBalance={hasOpeningBalance}
            customerId={id}
            openingBalanceId={openingBalanceId ?? undefined}
            location={location}
            onSave={async (amount, balanceType, invoiceId) => {
              // UPDATE: Add invoiceId parameter
              const savedAmount = balanceType === "credit" ? -amount : amount;
              setOpeningBalance(savedAmount);
              setOpeningBalanceId(invoiceId);
              setHasOpeningBalance(true);
              
              // Refresh summary data to update credits & outstanding invoice
              try {
                const summary = await getCustomerSummary(location, Number(id));
                if (summary?.success && summary.data) {
                  setSummaryData(summary.data);
                }
              } catch (error) {
                console.error("Error refreshing summary data:", error);
              }
            }}
            loading={loading}
          />

          <InfoCardWithAction title="Payment Preference" showAddButton={false}>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Payment Preference</div>
            </div>
          </InfoCardWithAction>
        </div>
      </div>

      {/* Full Width Tables Below Outstanding Invoices */}
      <div className="space-y-3 sm:space-y-4 mt-4">
        <TableCard
          title="Equipment Rentals"
          data={equipmentRentalData}
          columns={CUSTOMER_TABLE_CONFIGS.equipmentRentals.columns}
          loading={equipmentRentalsLoading || loading}
          onAdd={() => setIsEquipmentRentalsModalOpen(true)}
          onRowClick={(row) => {
            const r = row as unknown as EquipmentRentalData;
            if (r && typeof r.id === "number") {
              setSelectedRentalId(r.id);
              setIsEquipmentRentalsModalOpen(true);
            }
          }}
          size={CUSTOMER_TABLE_CONFIGS.equipmentRentals.size}
          variant={CUSTOMER_TABLE_CONFIGS.equipmentRentals.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableFilter}
          enableRowsPerPage={
            CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableRowsPerPage
          }
          iconType="plus"
          enableShowAll={true}
          showAllLabel="Show All"
          serverSidePagination={equipmentRentalsPagination}
          onServerSidePageChange={handleEquipmentRentalsPageChange}
          rowsPerPage={equipmentRentalsPagination.limit}
          onRowsPerPageChange={handleEquipmentRentalsRowsPerPageChange}
          rowsPerPageOptions={[10]}
        />

        <TableCard
          title="Recurring Payments"
          data={_recurringPaymentData}
          columns={CUSTOMER_TABLE_CONFIGS.recurringPayments.columns}
          loading={loading}
          onAdd={() => {
            setSelectedRecurringPaymentId(undefined);
            setIsRecurringPaymentModalOpen(true);
          }}
          onRowClick={(row) => {
            // Extract ID from row - check common ID field names
            const rec = row as unknown as Record<string, unknown>;
            const paymentId = rec["id"] ?? rec["paymentId"] ?? rec["payment_id"] ?? rec["recurringPaymentId"];
            if (paymentId !== undefined && paymentId !== null) {
              setSelectedRecurringPaymentId(Number(paymentId));
              setIsRecurringPaymentModalOpen(true);
            }
          }}
          size={CUSTOMER_TABLE_CONFIGS.recurringPayments.size}
          variant={CUSTOMER_TABLE_CONFIGS.recurringPayments.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.recurringPayments.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableFilter}
          enableRowsPerPage={true}
          iconType="plus"
          serverSidePagination={recurringPaymentsPagination}
          onServerSidePageChange={async (page: number) => {
            try {
              const { data, pagination } = await getCustomerRecurringPayments(
                location,
                Number(id),
                page,
                recurringPaymentsPagination.limit === -1
                  ? 99999
                  : recurringPaymentsPagination.limit
              );
              setRecurringPaymentData(data || []);
              setRecurringPaymentsPagination(pagination);
            } catch {}
          }}
          rowsPerPage={recurringPaymentsPagination.limit}
          onRowsPerPageChange={async (limit: number) => {
            try {
              const { data, pagination } = await getCustomerRecurringPayments(
                location,
                Number(id),
                1,
                limit
              );
              setRecurringPaymentData(data || []);
              setRecurringPaymentsPagination(pagination);
            } catch {}
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />

        <TableCard
          title="Private Lesson Due"
          data={privateLessonDueData}
          columns={CUSTOMER_TABLE_CONFIGS.privateLessonDue.columns}
          loading={loading}
          footerRow={{
            lessonDate: "",
            studentName: "",
            programName: "",
            teacherName: "",
            amount: privateLessonDueFooterTotal,
            url: "",
          }}
          onRowClick={(row) => {
            const lessonUrl = (row as PrivateLessonDueData).url;
            if (lessonUrl) {
              const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/${lessonUrl}`;
              window.open(url, "_blank", "noopener");
            }
          }}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.privateLessonDue.size}
          variant={CUSTOMER_TABLE_CONFIGS.privateLessonDue.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableFilter}
          enableRowsPerPage={true}
          iconType="none"
          enableShowAll={false}
          showAllLabel="Show All"
          serverSidePagination={privateLessonDuePagination}
          onServerSidePageChange={async (page: number) => {
            try {
              const result = await getCustomerPrivateLessonDue(
                location,
                Number(id),
                page,
                privateLessonDuePagination.limit === -1
                  ? 99999
                  : privateLessonDuePagination.limit
              );
              setPrivateLessonDueData(result.data || []);
              setPrivateLessonDuePagination(result.pagination);
              if (result.footer?.totalAmount) {
                setPrivateLessonDueFooterTotal(result.footer.totalAmount);
              }
            } catch {}
          }}
          rowsPerPage={privateLessonDuePagination.limit}
          onRowsPerPageChange={async (limit: number) => {
            try {
              const result = await getCustomerPrivateLessonDue(
                location,
                Number(id),
                1,
                limit
              );
              setPrivateLessonDueData(result.data || []);
              setPrivateLessonDuePagination(result.pagination);
              if (result.footer?.totalAmount) {
                setPrivateLessonDueFooterTotal(result.footer.totalAmount);
              }
            } catch {}
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />

        <TableCard
          title="Group Lesson Due"
          data={groupLessonDueData}
          columns={CUSTOMER_TABLE_CONFIGS.groupLessonDue.columns}
          loading={loading}
          footerRow={{
            lessonDate: "",
            studentName: "",
            programName: "",
            teacherName: "",
            amount: groupLessonDueFooterTotal,
          }}
          onRowClick={(row) => {
            const lessonUrl = (row as GroupLessonDueData).url;
            if (lessonUrl) {
              const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/${lessonUrl}`;
              window.open(url, "_blank", "noopener");
            }
          }}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.groupLessonDue.size}
          variant={CUSTOMER_TABLE_CONFIGS.groupLessonDue.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableFilter}
          enableRowsPerPage={true}
          iconType="none"
          enableShowAll={false}
          showAllLabel="Show All"
          serverSidePagination={groupLessonDuePagination}
          onServerSidePageChange={async (page: number) => {
            try {
              const result = await getCustomerGroupLessonDue(
                location,
                Number(id),
                page,
                groupLessonDuePagination.limit === -1
                  ? 99999
                  : groupLessonDuePagination.limit
              );
              setGroupLessonDueData(result.data || []);
              setGroupLessonDuePagination(result.pagination);
              if (result.footer?.totalAmount) {
                setGroupLessonDueFooterTotal(result.footer.totalAmount);
              }
            } catch {}
          }}
          rowsPerPage={groupLessonDuePagination.limit}
          onRowsPerPageChange={async (limit: number) => {
            try {
              const result = await getCustomerGroupLessonDue(
                location,
                Number(id),
                1,
                limit
              );
              setGroupLessonDueData(result.data || []);
              setGroupLessonDuePagination(result.pagination);
              if (result.footer?.totalAmount) {
                setGroupLessonDueFooterTotal(result.footer.totalAmount);
              }
            } catch {}
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />

        <TableCard
          title="Payments"
          data={paymentData}
          columns={CUSTOMER_TABLE_CONFIGS.payments.columns}
          loading={paymentsLoading || loading}
          footerRow={paymentFooterRow}
          onRowClick={async (row) => {
            const rec = row as unknown as Record<string, unknown>;
            const pid = rec["paymentId"] ?? rec["id"] ?? rec["payment_id"];
            if (pid !== undefined && pid !== null) {
              try {
                const detail = await getCustomerPaymentById(
                  location,
                  Number(id),
                  String(pid)
                );
                if (detail) {
                  setSelectedPayment(detail);
                  const idx = paymentData.findIndex((p) => {
                    const anyP = p as unknown as Record<string, unknown>;
                    const pId =
                      anyP["paymentId"] ?? anyP["id"] ?? anyP["payment_id"];
                    return pId !== undefined && String(pId) === String(pid);
                  });
                  setSelectedPaymentIndex(idx >= 0 ? idx : null);
                  setIsPaymentReceiptModalOpen(true);
                  return;
                }
              } catch {}
            }
            // Fallback to existing behavior when no paymentId found or fetch failed
            const payment = row as PaymentData;
            setSelectedPayment(payment);
            const idx = paymentData.findIndex((p) => p === payment);
            setSelectedPaymentIndex(idx >= 0 ? idx : null);
            setIsPaymentReceiptModalOpen(true);
          }}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.payments.size}
          variant={CUSTOMER_TABLE_CONFIGS.payments.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.payments.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.payments.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.payments.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.payments.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.payments.enableFilter}
          enableRowsPerPage={true}
          iconType="chevron"
          dropdownItems={[
            {
              label: "Receive Payment",
              onClick: () => setIsReceivePaymentModalOpen(true),
            },
          ]}
          dropdownLabel="Payment Actions"
          serverSidePagination={paymentsPagination}
          onServerSidePageChange={handlePaymentsPageChange}
          rowsPerPage={paymentsPagination.limit}
          onRowsPerPageChange={handlePaymentsRowsPerPageChange}
          rowsPerPageOptions={[10]}
        />
      </div>

      {/* Tabbed Interface */}
      <div className="mt-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
            {TAB_ORDER.map((tabKey) => (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
              >
                {CUSTOMER_TAB_CONFIGS[tabKey].title}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_ORDER.map((tabKey) => {
            const config = CUSTOMER_TAB_CONFIGS[tabKey];
            const fullData =
              tabDataMap[config.dataKey as keyof typeof tabDataMap] || [];

            const pagination = tabPagination[tabKey];

            const isPrivateLessonsTab = tabKey === "private-lessons";
            const isGroupLessonsTab = tabKey === "group-lessons";
            const isProformaInvoicesTab = tabKey === "proforma-invoices";
            const isStudentsTab = tabKey === "students";
            const isEnrolmentsTab = tabKey === "enrolments";
            const isHistoryTab = tabKey === "history";

            let data = fullData;
            if (
              !isPrivateLessonsTab &&
              !isGroupLessonsTab &&
              !isProformaInvoicesTab
            ) {
              const startIndex = pagination
                ? (pagination.page - 1) * pagination.limit
                : 0;
              const endIndex = pagination
                ? startIndex + pagination.limit
                : fullData.length;
              data = fullData.slice(startIndex, endIndex);
            }

            const shouldShowPagination =
              (pagination && pagination.total > 10) ||
              (isPrivateLessonsTab &&
                privateLessonsPagination.total >
                  privateLessonsPagination.limit) ||
              (isGroupLessonsTab &&
                groupLessonsPagination.total > groupLessonsPagination.limit) ||
              (isProformaInvoicesTab &&
                proformaInvoicesPagination.total >
                  proformaInvoicesPagination.limit);

            const isLoading =
              tabKey === "students"
                ? studentsLoading
                : isPrivateLessonsTab
                ? privateLessonsLoading || loading
                : isGroupLessonsTab
                ? groupLessonsLoading || loading
                : isProformaInvoicesTab
                ? proformaInvoicesLoading || loading
                : isEnrolmentsTab
                ? enrolmentsLoading || loading
                : isHistoryTab
                ? historyLoading || loading
                : loading;
            const error = tabKey === "students" ? studentsError : null;

            const commentsBottomContent =
              tabKey === "comments" ? (
                <div className="mt-4 flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Type message"
                    className="flex-grow"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        commentInput.trim() &&
                        !commentLoading
                      ) {
                        handleAddComment();
                      }
                    }}
                    disabled={commentLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                    onClick={handleAddComment}
                    disabled={!commentInput.trim() || commentLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : undefined;

            const commentsCustomContent =
              tabKey === "comments" ? (
                <div className="space-y-4">
                  {Array.isArray(commentData) && commentData.length > 0 ? (
                    commentData.map((c: CommentData, idx: number) => (
                      <div
                        key={c.id ?? idx}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-blue-600">
                              {c.createdUser}
                            </div>
                            <div className="text-sm text-gray-800 dark:text-gray-200">
                              {c.content}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {c.createdOn}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No comments found.
                    </div>
                  )}
                </div>
              ) : undefined;

            return (
              <TabsContent key={tabKey} value={tabKey} className="mt-4">
                <TabContent
                  title={config.title}
                  data={data}
                  columns={config.columns || []}
                  loading={isLoading}
                  error={error}
                  hasAddButton={config.hasAddButton}
                  onAdd={() => {
                    if (tabKey === "students") {
                      setIsAddStudentModalOpen(true);
                    } else if (tabKey === "proforma-invoices") {
                      handleProformaInvoiceNavigate();
                    } else {
                      // TODO: Implement add functionality for other tabs
                    }
                  }}
                  emptyState={config.emptyState}
                  hasTable={config.hasTable}
                  customContent={commentsCustomContent}
                  bottomContent={commentsBottomContent}
                  enablePagination={shouldShowPagination}
                  serverSidePagination={
                    isPrivateLessonsTab
                      ? privateLessonsPagination
                      : isGroupLessonsTab
                      ? groupLessonsPagination
                      : isProformaInvoicesTab
                      ? proformaInvoicesPagination
                      : isStudentsTab
                      ? studentsPagination
                      : isEnrolmentsTab
                      ? enrolmentsPagination
                      : isHistoryTab
                      ? historyPagination
                      : shouldShowPagination
                      ? tabPagination[tabKey]
                      : undefined
                  }
                  onPageChange={
                    isPrivateLessonsTab
                      ? (page: number) => {
                          setPrivateLessonsLoading(true);
                          getCustomerPrivateLessons(
                            location,
                            Number(id),
                            page,
                            privateLessonsPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setPrivateLessonData(data);
                              setPrivateLessonsPagination(pagination);
                            })
                            .finally(() => setPrivateLessonsLoading(false));
                        }
                      : isGroupLessonsTab
                      ? (page: number) => {
                          setGroupLessonsLoading(true);
                          getCustomerGroupLessons(
                            location,
                            Number(id),
                            page,
                            groupLessonsPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setGroupLessonData(data);
                              setGroupLessonsPagination(pagination);
                            })
                            .finally(() => setGroupLessonsLoading(false));
                        }
                      : isStudentsTab
                      ? (page: number) => {
                          setStudentsLoading(true);
                          getCustomerStudents(
                            location,
                            Number(id),
                            page,
                            studentsPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setStudentData(data);
                              setStudentsPagination(pagination);
                            })
                            .finally(() => setStudentsLoading(false));
                        }
                      : isEnrolmentsTab
                      ? (page: number) => {
                          setEnrolmentsLoading(true);
                          getCustomerEnrolments(
                            location,
                            Number(id),
                            page,
                            enrolmentsPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setEnrolmentData(data);
                              setEnrolmentsPagination(pagination);
                            })
                            .finally(() => setEnrolmentsLoading(false));
                        }
                      : isHistoryTab
                      ? (page: number) => {
                          setHistoryLoading(true);
                          getCustomerHistory(
                            location,
                            Number(id),
                            page,
                            historyPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setHistoryData(data);
                              setHistoryPagination(pagination);
                            })
                            .finally(() => setHistoryLoading(false));
                        }
                      : isProformaInvoicesTab
                      ? (page: number) => {
                          setProformaInvoicesLoading(true);
                          getCustomerProformaInvoices(
                            location,
                            Number(id),
                            page,
                            proformaInvoicesPagination.limit
                          )
                            .then(({ data, pagination }) => {
                              setProformaInvoiceData(data);
                              setProformaInvoicesPagination(pagination);
                            })
                            .finally(() => setProformaInvoicesLoading(false));
                        }
                      : shouldShowPagination
                      ? (page: number) => handleTabPageChange(tabKey, page)
                      : undefined
                  }
                  onRowsPerPageChange={
                    isPrivateLessonsTab
                      ? (rowsPerPage: number) => {
                          setPrivateLessonsLoading(true);
                          getCustomerPrivateLessons(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setPrivateLessonData(data);
                              setPrivateLessonsPagination(pagination);
                            })
                            .finally(() => setPrivateLessonsLoading(false));
                        }
                      : isGroupLessonsTab
                      ? (rowsPerPage: number) => {
                          setGroupLessonsLoading(true);
                          getCustomerGroupLessons(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setGroupLessonData(data);
                              setGroupLessonsPagination(pagination);
                            })
                            .finally(() => setGroupLessonsLoading(false));
                        }
                      : isStudentsTab
                      ? (rowsPerPage: number) => {
                          setStudentsLoading(true);
                          getCustomerStudents(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setStudentData(data);
                              setStudentsPagination(pagination);
                            })
                            .finally(() => setStudentsLoading(false));
                        }
                      : isEnrolmentsTab
                      ? (rowsPerPage: number) => {
                          setEnrolmentsLoading(true);
                          getCustomerEnrolments(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setEnrolmentData(data);
                              setEnrolmentsPagination(pagination);
                            })
                            .finally(() => setEnrolmentsLoading(false));
                        }
                      : isHistoryTab
                      ? (rowsPerPage: number) => {
                          setHistoryLoading(true);
                          getCustomerHistory(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setHistoryData(data);
                              setHistoryPagination(pagination);
                            })
                            .finally(() => setHistoryLoading(false));
                        }
                      : isProformaInvoicesTab
                      ? (rowsPerPage: number) => {
                          setProformaInvoicesLoading(true);
                          getCustomerProformaInvoices(
                            location,
                            Number(id),
                            1,
                            rowsPerPage
                          )
                            .then(({ data, pagination }) => {
                              setProformaInvoiceData(data);
                              setProformaInvoicesPagination(pagination);
                            })
                            .finally(() => setProformaInvoicesLoading(false));
                        }
                      : shouldShowPagination
                      ? (rowsPerPage: number) =>
                          handleTabRowsPerPageChange(tabKey, rowsPerPage)
                      : undefined
                  }
                  rowsPerPage={
                    isPrivateLessonsTab
                      ? privateLessonsPagination.limit
                      : isGroupLessonsTab
                      ? groupLessonsPagination.limit
                      : isProformaInvoicesTab
                      ? proformaInvoicesPagination.limit
                      : isStudentsTab
                      ? studentsPagination.limit
                      : isEnrolmentsTab
                      ? enrolmentsPagination.limit
                      : isHistoryTab
                      ? historyPagination.limit
                      : tabRowsPerPage[tabKey] || 10
                  }
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  initialRowsPerPage={10}
                  onRowClick={(row: unknown) => {
                    const getScalarField = (
                      obj: unknown,
                      keys: string[]
                    ): string | number | undefined => {
                      if (!obj || typeof obj !== "object") return undefined;
                      const rec = obj as Record<string, unknown>;
                      for (const key of keys) {
                        const value = rec[key];
                        if (
                          typeof value === "string" ||
                          typeof value === "number"
                        ) {
                          return value;
                        }
                      }
                      return undefined;
                    };
                    const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";

                    if (isStudentsTab) {
                      const studentId = getScalarField(row, [
                        "id",
                        "studentId",
                      ]);
                      if (studentId) {
                        window.open(
                          `${legacyBase}/${location}/student/view?id=${studentId}`,
                          "_blank",
                          "noopener"
                        );
                      }
                    } else if (isEnrolmentsTab) {
                      const enrolmentId = getScalarField(row, [
                        "id",
                        "enrolmentId",
                        "enrollmentId",
                      ]);
                      if (enrolmentId) {
                        window.open(
                          `${legacyBase}/${location}/enrolment/view?id=${enrolmentId}`,
                          "_blank",
                          "noopener"
                        );
                      }
                    } else if (isPrivateLessonsTab || isGroupLessonsTab) {
                      // Get url field from row
                      const url = getScalarField(row, ["url"]);

                      if (url && typeof url === "string") {
                        // Use the url directly from API
                        window.open(
                          `${legacyBase}/${location}/${url}`,
                          "_blank",
                          "noopener"
                        );
                      } else {
                        // Fallback: construct URL from id if url field is missing
                        const lessonId = getScalarField(row, [
                          "id",
                          "lessonId",
                        ]);
                        if (lessonId) {
                          window.open(
                            `${legacyBase}/${location}/lesson/view?id=${lessonId}`,
                            "_blank",
                            "noopener"
                          );
                        } else {
                          console.error(
                            "No url or id found for lesson row:",
                            row
                          );
                        }
                      }
                    }
                  }}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Modals */}

      {/* Add Student Modal */}
      <AddStudentModal
        open={isAddStudentModalOpen}
        onOpenChange={setIsAddStudentModalOpen}
        onSave={handleAddStudent}
        customerName={
          (customer &&
            `${customer.firstName || ""} ${customer.lastName || ""}`.trim()) ||
          _customerInfo?.profile?.name ||
          ""
        }
      />

      {/* Recurring Payment Modal */}
      <RecurringPaymentModal
        open={isRecurringPaymentModalOpen}
        onOpenChange={(open) => {
          setIsRecurringPaymentModalOpen(open);
          if (!open) {
            setSelectedRecurringPaymentId(undefined);
          }
        }}
        onSave={handleAddRecurringPayment}
        onDelete={handleDeleteRecurringPayment}
        customerName={
          (customer &&
            `${customer.firstName || ""} ${customer.lastName || ""}`.trim()) ||
          _customerInfo?.profile?.name ||
          ""
        }
        location={location}
        customerId={Number(id)}
        recurringPaymentId={selectedRecurringPaymentId}
      />

      {/* Equipment Rentals Modal */}
      <EquipmentRentalsModal
        open={isEquipmentRentalsModalOpen}
        onOpenChange={(open) => {
          setIsEquipmentRentalsModalOpen(open);
          if (!open) setSelectedRentalId(null);
        }}
        onSave={handleAddEquipmentRental}
        customerId={Number(id)}
        location={location}
        rentalId={selectedRentalId ?? undefined}
        onEquipmentReturned={(rid) => {
          setEquipmentRentalData((prev) => prev.filter((r) => (r as EquipmentRentalData).id !== rid));
          setEquipmentRentalsPagination((prev) => ({
            ...prev,
            total: Math.max((prev.total || 0) - 1, 0),
          }));
          setIsEquipmentRentalsModalOpen(false);
          setSelectedRentalId(null);
        }}
        onReprintAgreement={(rid) => {
          // Placeholder: integrate actual print endpoint if available
          console.info("Reprint Agreement for rental", rid);
        }}
      />

      {/* Email Statement Modal */}
      <EmailStatementModal
        open={isEmailStatementModalOpen}
        onOpenChange={setIsEmailStatementModalOpen}
        onSend={handleSendEmailStatement}
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
        customerEmails={emails.map((e) => e.email)}
        locationName="Arcadia Academy of Music"
        privateLessonDueData={privateLessonDueData}
        groupLessonDueData={groupLessonDueData}
        invoiceData={invoiceData}
        totalBalance={summaryData.balance}
      />

      {/* Receive Payment Modal */}
      <ReceivePaymentModal
        open={isReceivePaymentModalOpen}
        onOpenChange={setIsReceivePaymentModalOpen}
        onSave={handleReceivePayment}
        location={location}
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
        customerId={id}
        amountNeeded={calculateAmountNeeded()}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        open={isPaymentReceiptModalOpen}
        onOpenChange={setIsPaymentReceiptModalOpen}
        location={location}
        customerId={Number(id)}
        payment={selectedPayment || undefined}
        customerName={
          (customer &&
            `${customer.firstName || ""} ${customer.lastName || ""}`.trim()) ||
          _customerInfo?.profile?.name ||
          emails[0]?.email ||
          "Customer"
        }
        customerEmail={emails[0]?.email}
        customerEmails={emails.map((e) => e.email)}
        customerPhone={phones[0]?.number}
        privateLessonDue={
          privateLessonDueData as unknown as Array<{
            lessonDate: string;
            studentName: string;
            programName: string;
            teacherName: string;
            amount: number | string;
          }>
        }
        groupLessonDueData={groupLessonDueData}
        invoiceData={invoiceData}
        totalBalance={summaryData.balance}
        locationName="Arcadia Academy of Music"
        onEdit={(data) => {
          if (selectedPaymentIndex === null) return;
          const parseNum = (v: unknown) =>
            typeof v === "number"
              ? v
              : typeof v === "string"
              ? parseFloat(v.replace(/[^0-9.-]+/g, ""))
              : 0;
          setPaymentData((prev) =>
            prev.map((p, i) => {
              if (i !== selectedPaymentIndex) return p;
              const usedNum = parseNum(p.used);
              const newAmount = data.amountReceived;
              const newRemaining = Math.max(0, newAmount - usedNum);
              return {
                ...p,
                date: data.date || p.date,
                notes: data.method || p.notes,
                amount: newAmount,
                remaining: newRemaining,
              };
            })
          );
          setSelectedPayment((prev) => {
            if (!prev) return prev;
            const usedNum =
              typeof prev.used === "number"
                ? prev.used
                : parseFloat(String(prev.used).replace(/[^0-9.-]+/g, "")) || 0;
            const newRemaining = Math.max(0, data.amountReceived - usedNum);
            return {
              ...prev,
              date: data.date || prev.date,
              notes: data.method || prev.notes,
              amount: data.amountReceived,
              remaining: newRemaining,
            };
          });
        }}
        onDelete={() => {
          if (selectedPaymentIndex === null) return;
          setPaymentData((prev) =>
            prev.filter((_, i) => i !== selectedPaymentIndex)
          );
          setPaymentsPagination((prev) => ({
            ...prev,
            total: Math.max((prev.total || 0) - 1, 0),
          }));
          setSelectedPayment(null);
          setSelectedPaymentIndex(null);
        }}
        onPrint={() => {}}
        onEmail={() => {}}
      />

      {/* Notify Via Email Modal */}
      <NotifyViaEmailReasonsModal
        open={isNotifyModalOpen}
        onOpenChange={setIsNotifyModalOpen}
        location={location}
        customerId={Number(id)}
      />

      {/* Customer Delete Modal */}
      <CustomerDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        location={location}
        customerId={Number(id)}
        onDeleteSuccess={() => router.push(`/${location}/customers/`)}
        onDeleteError={(error) => setDeleteError(error)}
      />
    </div>
  );
}
