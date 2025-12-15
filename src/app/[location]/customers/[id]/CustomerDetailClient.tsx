"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Plus, User } from "lucide-react";
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
  getEmailStatement,
  EmailStatementData,
} from "../customers.api";
import { getPaymentReceiptData } from "../components/ReceiptPaymentModal/receipt-payment.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableCard } from "@/components/TableCard";
import { TabContent } from "@/components/TabContent";
import { AddressCard } from "../components/AddressCard";
import { EmailCard } from "../components/EmailCard";
import { DiscountCard } from "../components/DiscountCard";
import { PhoneCard } from "../components/PhoneCard";
import { RecurringPaymentModal } from "../components/RecurringPaymentModal";
import { EquipmentRentalsModal } from "../components/EquipmentRentalsModal";
import { DetailsCard } from "../components/DetailsCard";
import { InvoiceTable } from "../components/InvoicesTable";
import { ReceivePaymentModal } from "../components/ReceivePaymentModal";
import { PaymentReceiptModalContainer} from "../components/ReceiptPaymentModal";
import { 
  printCustomerStatement, 
  CustomerStatementData,
} from "@/components/PrintStatement";
import { apiClient } from "@/lib/api/client";
import { getPaymentCredits, getInvoiceCredits } from "../components/ReceivePaymentModal/api/receive-payment.api";

import AddStudentModal from "../components/AddStudentModal/index";
import { NotifyViaEmailReasonsModal } from "../components/NotifyViaEmailModal";
import { CustomerDeleteModal } from "../components/CustomerDeleteModal";
import EmailStatementModal, {
  EmailFormData,
} from "../components/EmailStatementModal/index";
import { SummaryCards } from "./components/SummaryCards";
import {
  createNote,
  sendEmail,
  deletePayment,
} from "@/lib/api/legacyApiAdapter";
import { createStudent } from "@/lib/api/student.api";
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
import {
  PhoneNumber,
  Email,
  Address,
  CustomerDetailClientProps,
  DirectPaymentReceiptData,
  EmailModalOverrides,
  ReceivePaymentFormData,
  CustomerDetailsSaveData,
  TabPagination,
} from "./customer-details.interface";

export function CustomerDetailClient({
  location,
  id,
}: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [_customerInfo, setCustomerInfo] =
    React.useState<CustomerInfoData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true); // For critical above-the-fold data (summary, info, invoices)
  const [loadingSecondary, setLoadingSecondary] = React.useState<boolean>(false); // For secondary data
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
  const [showAllEquipmentRentals, setShowAllEquipmentRentals] =
    React.useState<boolean>(false);

  // Simple pagination state for all tabs - CONSOLIDATED (removed duplicates)
  const [tabPagination, setTabPagination] = React.useState<
    Record<string, TabPagination>
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
  const [selectedRentalId, setSelectedRentalId] = React.useState<number | null>(
    null
  );
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] =
    React.useState<boolean>(false);
  const [isSavingPayment, setIsSavingPayment] = React.useState<boolean>(false);
  const [isPaymentReceiptModalOpen, setIsPaymentReceiptModalOpen] =
    React.useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<
    number | null
  >(null);
  const [selectedPayment, setSelectedPayment] =
    React.useState<PaymentData | null>(null);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = React.useState<
    number | null
  >(null);
  const [directPaymentReceiptData, setDirectPaymentReceiptData] =
    React.useState<DirectPaymentReceiptData | null>(null);
  const [isEmailStatementModalOpen, setIsEmailStatementModalOpen] =
    React.useState<boolean>(false);
  const [emailStatementData, setEmailStatementData] =
    React.useState<EmailStatementData | null>(null);
  const [emailModalOverrides, setEmailModalOverrides] =
    React.useState<EmailModalOverrides | null>(null);
  const [isLoadingEmailStatement, setIsLoadingEmailStatement] =
    React.useState<boolean>(false);
  const [locationHstNumber, setLocationHstNumber] = React.useState<string | undefined>(undefined);
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

      // Call new API to create student
      const response = await createStudent(location, Number(id), {
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        customerId: Number(id),
        birthDate: studentData.birthDate || undefined,
        gender:
          (studentData.gender as "not-specified" | "male" | "female") ||
          "not-specified",
      });

      if (response.success && response.data?.status) {
        toast.success("Student created successfully");
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
        const errorMessage = response.message || "Failed to create student";
        setStudentsError(errorMessage);
        toast.error(errorMessage);
        console.error("Error creating student:", errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        (error as { errorCode?: string; message?: string })?.message ||
        "Failed to create student";
      setStudentsError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating student:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleEmailModalOpenChange = React.useCallback((open: boolean) => {
    setIsEmailStatementModalOpen(open);
    if (!open) {
      setEmailModalOverrides(null);
    }
  }, []);

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
        recurringPaymentsPagination.limit === -1
          ? 99999
          : recurringPaymentsPagination.limit
      );
      setRecurringPaymentData(data || []);
      setRecurringPaymentsPagination(pagination);
    } catch (error) {
      console.error("Error refreshing recurring payments:", error);
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
        recurringPaymentsPagination.limit === -1
          ? 99999
          : recurringPaymentsPagination.limit
      );
      setRecurringPaymentData(data || []);
      setRecurringPaymentsPagination(pagination);
    } catch (error) {
      console.error("Error refreshing recurring payments:", error);
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

  // Fetch email statement data when modal opens
  React.useEffect(() => {
    if (isEmailStatementModalOpen && location && id) {
      // Skip API call if emailModalOverrides is set (e.g., from equipment rental receipt)
      // This means we already have the content and don't need to fetch from API
      if (emailModalOverrides) {
        setIsLoadingEmailStatement(false);
        return;
      }
      
      setIsLoadingEmailStatement(true);
      
      // Fetch location details for HST number
      apiClient.get<{
        success: boolean;
        data: {
          hstRegistrationNo: string;
        };
      }>(`/admin/v2/locations/${location}/details`)
        .then((response) => {
          if (response.data.success && response.data.data?.hstRegistrationNo) {
            setLocationHstNumber(response.data.data.hstRegistrationNo);
          }
        })
        .catch((error: unknown) => {
          console.error("Error fetching location details:", error);
        });
      
      getEmailStatement(location, Number(id))
        .then((data: EmailStatementData | null) => {
          if (data) {
            setEmailStatementData(data);
          }
        })
        .catch((error: unknown) => {
          console.error("Error fetching email statement:", error);
          toast.error("Failed to load email statement data");
        })
        .finally(() => {
          setIsLoadingEmailStatement(false);
        });
    } else if (!isEmailStatementModalOpen) {
      // Clear email statement data when modal closes
      setEmailStatementData(null);
      // Also clear emailModalOverrides when modal closes
      setEmailModalOverrides(null);
      setLocationHstNumber(undefined);
    }
  }, [isEmailStatementModalOpen, location, id, emailModalOverrides]);

  const handleSendEmailStatement = async (emailData: EmailFormData) => {
    try {
      // Send email using legacy API
      // EmailObject::OBJECT_CUSTOMER_STATEMENT = 8
      const response = await sendEmail(location, {
        objectId: 8, // Customer Statement
        userId: Number(id),
        to: emailData.recipients,
        subject: emailData.subject,
        content: emailData.content,
      });

      if (response.status) {
        toast.success("Email sent successfully");
        setIsEmailStatementModalOpen(false);
      } else {
        const errorMessage = response.message || "Failed to send email";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send email";
      toast.error(errorMessage);
    }
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
  const handleReceivePayment = async (paymentData: ReceivePaymentFormData) => {
    setIsSavingPayment(true);
    try {
      // Import the legacy API function
      const { receivePayment } = await import("@/lib/api/legacyApiAdapter");
      const paymentMethodId = Number(paymentData.paymentMethod) || 1; // Default to 1 if invalid

      // Helper function to format numbers to 2 decimal places
      const formatToTwoDecimals = (value: number): number => {
        return Math.round(value * 100) / 100;
      };

      // Calculate amount needed (sum of all selected items)
      const lessonPaymentsTotal = Object.values(
        paymentData.lessonPayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const groupLessonPaymentsTotal = Object.values(
        paymentData.groupLessonPayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const invoicePaymentsTotal = Object.values(
        paymentData.invoicePayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const amountNeeded = formatToTwoDecimals(
        lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal
      );
      const amountToDistribute = formatToTwoDecimals(amountNeeded);

      // Prepare lesson payments array (IDs are already numeric from API)
      const lessonPaymentsArray = paymentData.lessonPayments
        ? Object.entries(paymentData.lessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare group lesson payments array (IDs are already numeric from API)
      const groupLessonPaymentsArray = paymentData.groupLessonPayments
        ? Object.entries(paymentData.groupLessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice payments array (IDs are already numeric from API, no "I-" prefix needed)
      const invoicePaymentsArray = paymentData.invoicePayments
        ? Object.entries(paymentData.invoicePayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare payment credits array (IDs are already numeric from API)
      const paymentCreditsArray = paymentData.paymentCredits
        ? Object.entries(paymentData.paymentCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice credits array (IDs are already numeric from API)
      const invoiceCreditsArray = paymentData.invoiceCredits
        ? Object.entries(paymentData.invoiceCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Calculate selected credit value (sum of all selected credits)
      const selectedCreditValue = formatToTwoDecimals(
        paymentCreditsArray.reduce((sum, c) => sum + c.value, 0) +
          invoiceCreditsArray.reduce((sum, c) => sum + c.value, 0)
      );

      // Calculate amount received following legacy logic (matches _form.php line 272):
      // amountNeeded - creditAmount < 0 ? (amountNeeded > 0 ? '0.00' : amountNeeded - creditAmount) : (-(creditAmount - amountNeeded))
      // Simplified: if credits fully cover and amountNeeded > 0, return 0.00, otherwise return amountNeeded - creditAmount
      const amountAfterCredits = amountNeeded - selectedCreditValue;
      let calculatedAmount: number;
      if (amountAfterCredits < 0) {
        // Credits exceed amount needed
        calculatedAmount = amountNeeded > 0 ? 0.0 : amountAfterCredits;
      } else {
        // Credits don't fully cover amount needed (or exactly match)
        // (-(creditAmount - amountNeeded)) = amountNeeded - creditAmount
        calculatedAmount = amountAfterCredits;
      }

      // Use the calculated amount when credits are present (matching legacy auto-calculation behavior)
      // When no credits are used, use the user-entered amount
      const finalAmount =
        selectedCreditValue > 0
          ? formatToTwoDecimals(calculatedAmount)
          : formatToTwoDecimals(paymentData.amountReceived);

      // Prepare payment data for legacy API
      const legacyPaymentData: PaymentReceiveData = {
        userId: Number(id),
        date: paymentData.date, // Already in "MMM dd, yyyy" format
        paymentMethodId: paymentMethodId,
        reference: paymentData.reference || "",
        amount: finalAmount,
        amountNeeded: amountNeeded,
        selectedCreditValue: selectedCreditValue,
        amountToDistribute: amountToDistribute,
        notes: paymentData.notes || "",
        lessonPayments:
          lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
        groupLessonPayments:
          groupLessonPaymentsArray.length > 0
            ? groupLessonPaymentsArray
            : undefined,
        invoicePayments:
          invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
        paymentCredits:
          paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
        invoiceCredits:
          invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
        canUsePaymentCredits: paymentCreditsArray.length > 0 ? 1 : 0,
        canUseInvoiceCredits: invoiceCreditsArray.length > 0 ? 1 : 0,
        prId: "",
      };

      // Call legacy API
      const response = await receivePayment(location, legacyPaymentData);
      // const response = await legacyReceivePayment(location, legacyPaymentData);

      if (response.status) {
        // Success - close receive payment modal
        setIsReceivePaymentModalOpen(false);

        // Helper function to format currency
        const formatCurrency = (amount: number): string => {
          return `$${amount.toFixed(2)}`;
        };

        // Build credits data for Payments Used table from paymentData
        const credits: Array<{
          type: string;
          reference: string;
          paymentMethod?: string;
          amount: string;
          amountUsed: string;
        }> = [];
        
        // Get credit details if available
        const creditDetailsMap = new Map<string, { id: string; reference: string; payment: string; type: string }>();
        if (paymentData.creditDetails && Array.isArray(paymentData.creditDetails)) {
          paymentData.creditDetails.forEach((credit) => {
            creditDetailsMap.set(credit.id, credit);
          });
        }
        
        // Add invoice credits first (they should appear first in the table)
        if (paymentData.invoiceCredits && Object.keys(paymentData.invoiceCredits).length > 0) {
          Object.entries(paymentData.invoiceCredits).forEach(([id, amount]) => {
            const creditDetail = creditDetailsMap.get(id);
            // For invoice credits, reference should be the invoice number (like "I-94673")
            // Use creditDetail.reference if available, otherwise format the id
            const invoiceRef = creditDetail?.reference || (id.startsWith("I-") ? id : `I-${id}`);
            credits.push({
              type: "Invoice Credit",
              reference: invoiceRef,
              paymentMethod: "", // Empty for invoice credit
              amount: "$0.00", // Always $0.00 for invoice credit
              amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount), // Payment column value from credit table
            });
          });
        }
        
        // Add payment credits
        if (paymentData.paymentCredits && Object.keys(paymentData.paymentCredits).length > 0) {
          Object.entries(paymentData.paymentCredits).forEach(([id, amount]) => {
            const creditDetail = creditDetailsMap.get(id);
            credits.push({
              type: "Payment Credit",
              reference: "", // Empty for payment credit
              paymentMethod: paymentData.paymentMethodName || "Visa", // Use payment method name if available
              amount: formatCurrency(amount), // Amount to apply
              amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount), // Payment column value from credit table
            });
          });
        }

        // Always fetch receipt data to build directPaymentReceiptData for new UI
        // Refresh payments list to get the latest payment
        try {
          // Refresh payments list to get the latest payment
          const paymentsResponse = await getCustomerPayments(
            location,
            Number(id),
            1,
            1
          );
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0];
            setSelectedPayment(latestPayment);
            setSelectedPaymentIndex(0);
            setSelectedPaymentId(latestPayment.id);

              // Fetch payment receipt data which includes lessons
              try {
                // Small delay to ensure payment is fully saved in database
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const receiptData = await getPaymentReceiptData(location, latestPayment.id);
                
                // Use payment method name from paymentData if available, otherwise use from receiptData
                let paymentMethodName = paymentData.paymentMethodName;
                if (!paymentMethodName) {
                  paymentMethodName = receiptData.info?.paymentMethod || paymentData.paymentMethod;
                }
                
                // Build directPaymentData from receipt data
                const directData = {
                  date: receiptData.info?.date || paymentData.date,
                  paymentMethod: paymentMethodName,
                  reference: receiptData.info?.reference || paymentData.reference || "",
                  amount: receiptData.info?.amount || paymentData.amountReceived,
                  lessons: receiptData.lessons.data.map(lesson => ({
                    date: lesson.date,
                    student: lesson.student,
                    program: lesson.program,
                    teacher: lesson.teacher,
                    amount: lesson.amount,
                    payment: lesson.payment,
                    balance: "$0.00", // Set balance to $0.00 for new payment receipt
                  })),
                  groupLessons: receiptData.groupLessons.data.map(gl => ({
                    date: gl.date,
                    student: gl.student,
                    program: gl.program,
                    amount: gl.amount,
                    balance: "$0.00", // Set balance to $0.00 for new payment receipt
                  })),
                  invoices: receiptData.invoices.data.map(inv => ({
                    date: inv.date,
                    number: inv.number,
                    amount: inv.amount,
                    payment: inv.payment,
                    balance: "$0.00", // Set balance to $0.00 for new payment receipt
                  })),
                  credits: credits.length > 0 ? credits : undefined,
                };
                
                setDirectPaymentReceiptData(directData);
              } catch (error) {
                console.error("Error fetching payment receipt data:", error);
                // Continue without directPaymentData - modal will fetch from API
                setDirectPaymentReceiptData(null);
              }

            // Refresh related data for the receipt modal
            // Refresh private lesson due data
            try {
              const privateLessonDueResult =
                await getCustomerPrivateLessonDue(
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
              const invoiceResult = await getCustomerInvoices(
                location,
                Number(id),
                1
              );
              setInvoiceData(invoiceResult || []);
            } catch {}

            // Refresh summary data
            try {
              const summaryResult = await getCustomerSummary(
                location,
                Number(id)
              );
              if (summaryResult && summaryResult.data) {
                setSummaryData(summaryResult.data);
              }
            } catch {}

              // Open payment receipt modal
            setIsPaymentReceiptModalOpen(true);
            
            // Refresh payment data after successful save
            try {
              await refreshPaymentData();
            } catch (error) {
              console.error("Error refreshing payment data:", error);
            }
          } else {
            // If we can't get the payment, still show success
            toast.success("Payment saved successfully");
            
            // Refresh payment data even if we can't get the payment
            try {
              await refreshPaymentData();
            } catch (error) {
              console.error("Error refreshing payment data:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
          toast.success("Payment saved successfully");
          
          // Refresh payment data even if there was an error fetching details
          try {
            await refreshPaymentData();
          } catch (refreshError) {
            console.error("Error refreshing payment data:", refreshError);
          }
        }
      } else {
        const errorMessage =
          response.message ||
          response.errors?.join(", ") ||
          "Failed to save payment";
        console.error("Payment save error:", errorMessage);
        toast.error(errorMessage);
        // Don't close modal on error so user can retry
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save payment";
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

  // Track which tabs have been loaded (lazy loading)
  const [loadedTabs, setLoadedTabs] = React.useState<Set<string>>(
    new Set(["students"]) // Students tab is loaded by default
  );
  const [activeTab, setActiveTab] = React.useState<string>("students");
  // Track which tabs are currently loading to prevent race conditions
  const loadingTabsRef = React.useRef<Set<string>>(new Set());
  // Track if initial data is being loaded to prevent double calls
  const isLoadingDataRef = React.useRef<boolean>(false);

  // Additional customer data states
  const [phones, setPhones] = React.useState<PhoneNumber[]>([]);
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [discount, setDiscount] = React.useState<number>(0);

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
    id: 0,
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
        const isAllSelected = paymentsPagination.limit === -1;
        const result = await getCustomerPayments(
          location,
          Number(id),
          page,
          isAllSelected ? 99999 : paymentsPagination.limit
        );

        setPaymentData(result.data || []);
        // Preserve -1 in pagination state when "All" is selected, even though API returns 99999
        setPaymentsPagination({
          ...result.pagination,
          limit: isAllSelected ? -1 : result.pagination.limit,
        });
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
        // Preserve -1 in pagination state when "All" is selected, even though API returns 99999
        setPaymentsPagination({
          ...result.pagination,
          limit: rowsPerPage === -1 ? -1 : result.pagination.limit,
        });
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

  // Function to load tab data when tab is first accessed (lazy loading)
  const loadTabData = React.useCallback(
    async (tabKey: string) => {
      // Prevent duplicate calls if already loading
      if (loadingTabsRef.current.has(tabKey)) {
        return;
      }
      loadingTabsRef.current.add(tabKey);

      try {
        switch (tabKey) {
          case "enrolments":
            setEnrolmentsLoading(true);
            const { data: enrolments, pagination: ePag } =
              await getCustomerEnrolments(location, Number(id), 1, 10);
            setEnrolmentData(enrolments);
            setEnrolmentsPagination(ePag);
            setEnrolmentsLoading(false);
            break;

          case "private-lessons":
            setPrivateLessonsLoading(true);
            const { data: privateLessons, pagination: plPagination } =
              await getCustomerPrivateLessons(location, Number(id), 1, 10);
            setPrivateLessonData(privateLessons);
            setPrivateLessonsPagination(plPagination);
            setPrivateLessonsLoading(false);
            break;

          case "group-lessons":
            setGroupLessonsLoading(true);
            const { data: groupLessons, pagination: glPagination } =
              await getCustomerGroupLessons(location, Number(id), 1, 10);
            setGroupLessonData(groupLessons);
            setGroupLessonsPagination(glPagination);
            setGroupLessonsLoading(false);
            break;

          case "proforma-invoices":
            setProformaInvoicesLoading(true);
            const { data: proformas, pagination: pfPagination } =
              await getCustomerProformaInvoices(location, Number(id), 1, 10);
            setProformaInvoiceData(proformas);
            setProformaInvoicesPagination(pfPagination);
            setProformaInvoicesLoading(false);
            break;

          case "comments":
            const comments = await getCustomerComments(location, Number(id));
            setCommentData(comments);
            break;

          case "history":
            setHistoryLoading(true);
            const { data: history, pagination: hPag } = await getCustomerHistory(
              location,
              Number(id),
              1,
              10
            );
            setHistoryData(history);
            setHistoryPagination(hPag);
            setHistoryLoading(false);
            break;

          default:
            // Students tab is already loaded on initial mount
            break;
        }

        // Mark tab as loaded
        setLoadedTabs((prev) => {
          if (prev.has(tabKey)) {
            return prev;
          }
          return new Set(prev).add(tabKey);
        });
      } catch (error) {
        console.error(`Error loading ${tabKey} tab data:`, error);
        // Set empty data on error
        switch (tabKey) {
          case "enrolments":
            setEnrolmentData([]);
            setEnrolmentsPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
            setEnrolmentsLoading(false);
            break;
          case "private-lessons":
            setPrivateLessonData([]);
            setPrivateLessonsPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
            setPrivateLessonsLoading(false);
            break;
          case "group-lessons":
            setGroupLessonData([]);
            setGroupLessonsPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
            setGroupLessonsLoading(false);
            break;
          case "proforma-invoices":
            setProformaInvoiceData([]);
            setProformaInvoicesPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
            setProformaInvoicesLoading(false);
            break;
          case "comments":
            setCommentData([]);
            break;
          case "history":
            setHistoryData([]);
            setHistoryPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
            setHistoryLoading(false);
            break;
        }
        // Mark tab as loaded even on error to prevent retry loops
        setLoadedTabs((prev) => {
          if (prev.has(tabKey)) {
            return prev;
          }
          return new Set(prev).add(tabKey);
        });
      } finally {
        // Remove from loading set
        loadingTabsRef.current.delete(tabKey);
      }
    },
    [location, id]
  );

  //refresh function for after edit/delete
  const refreshPaymentData = React.useCallback(async () => {
    setPaymentsLoading(true);
    try {
      // Fetch all related data in parallel for speed
      const isAllSelected = paymentsPagination.limit === -1;
      const [paymentsRes, summaryRes, outstandingRes] = await Promise.all([
        getCustomerPayments(
          location,
          Number(id),
          paymentsPagination.page,
          isAllSelected ? 99999 : paymentsPagination.limit
        ),
        getCustomerSummary(location, Number(id)),
        getCustomerOutstandingInvoices(
          location,
          Number(id),
          outstandingInvoicesPagination.page,
          outstandingInvoicesPagination.limit
        ),
      ]);

      // Update payments data
      setPaymentData(paymentsRes.data || []);
      // Preserve -1 in pagination state when "All" is selected, even though API returns 99999
      setPaymentsPagination({
        ...paymentsRes.pagination,
        limit: isAllSelected ? -1 : paymentsRes.pagination.limit,
      });
      if (paymentsRes.footer?.totalRemaining) {
        setPaymentsFooterRemaining(paymentsRes.footer.totalRemaining);
      }

      // Update summary
      if (summaryRes?.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }

      // Update outstanding invoices
      setOutstandingInvoiceData(outstandingRes.data);
      setOutstandingInvoicesPagination(outstandingRes.pagination);
      setOutstandingInvoiceFooterTotal(outstandingRes.footer.totalAmount);
    } finally {
      setPaymentsLoading(false);
    }
  }, [
    location,
    id,
    paymentsPagination.page,
    paymentsPagination.limit,
    outstandingInvoicesPagination.page,
    outstandingInvoicesPagination.limit,
  ]);

  React.useEffect(() => {
    // Prevent double calls - if already loading, skip
    if (isLoadingDataRef.current) {
      return;
    }

    isLoadingDataRef.current = true;
    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      // Prevent double calls
      if (!isMounted) return;

      setLoading(true);
      setLoadingSecondary(false);

      try {
        // ============================================
        // PHASE 1: Load critical above-the-fold data
        // (Summary, Info, Invoices - visible first)
        // ============================================
        const [customerData, infoResponse, summary, invoices] =
          await Promise.all([
            getCustomerById(location, Number(id)),
            getCustomerInfo(location, Number(id)),
            getCustomerSummary(location, Number(id)),
            getCustomerInvoices(location, Number(id), 1),
          ]);

        // Check if component is still mounted before updating state
        if (!isMounted) return;

        // Process customer data
        setCustomer(customerData);
        if (customerData) {
          setLocalFirstName(customerData.firstName);
          setLocalLastName(customerData.lastName);
        }

        // Process customer info
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
        }

        // Process summary (critical - above the fold)
        if (summary?.success && summary.data) {
          setSummaryData(summary.data);
        }

        // Process invoices (critical - above the fold)
        setInvoiceData(invoices || []);

        // Phase 1 complete - show above-the-fold content
        setLoading(false);

        // Check if component is still mounted before proceeding to Phase 2
        if (!isMounted) return;

        // ============================================
        // PHASE 2: Load secondary data (below the fold)
        // ============================================
        setLoadingSecondary(true);
        setEquipmentRentalsLoading(true);
        setPaymentsLoading(true);
        setStudentsLoading(true);
        setStudentsError(null);

        const [
          outstandingInvoicesResult,
          equipmentRentalsResult,
          recurringPaymentsResult,
          privateLessonDueResult,
          groupLessonDueResult,
          paymentsResult,
          studentsResult,
        ] = await Promise.allSettled([
          getCustomerOutstandingInvoices(location, Number(id), 1, 10),
          getCustomerEquipmentRentals(location, Number(id), 1, 10),
          getCustomerRecurringPayments(location, Number(id), 1, 10),
          getCustomerPrivateLessonDue(location, Number(id), 1, 10),
          getCustomerGroupLessonDue(location, Number(id), 1, 10),
          getCustomerPayments(location, Number(id), 1, 10),
          getCustomerStudents(location, Number(id), 1, 10),
        ]);

        // Check if component is still mounted before updating state
        if (!isMounted) return;

        // Process outstanding invoices
        if (outstandingInvoicesResult.status === "fulfilled") {
          const result = outstandingInvoicesResult.value;
          setOutstandingInvoiceData(result.data);
          setOutstandingInvoicesPagination(result.pagination);
          setOutstandingInvoiceFooterTotal(result.footer.totalAmount);
        }

        // Process equipment rentals
        if (equipmentRentalsResult.status === "fulfilled") {
          const result = equipmentRentalsResult.value;
          setEquipmentRentalData(result.data);
          setEquipmentRentalsPagination(result.pagination);
        }
        setEquipmentRentalsLoading(false);

        // Process recurring payments
        if (recurringPaymentsResult.status === "fulfilled") {
          const { data: recurring, pagination: rPag } =
            recurringPaymentsResult.value;
          setRecurringPaymentData(recurring || []);
          setRecurringPaymentsPagination(rPag);
        }

        // Process private lesson dues
        if (privateLessonDueResult.status === "fulfilled") {
          const result = privateLessonDueResult.value;
          setPrivateLessonDueData(result.data || []);
          setPrivateLessonDuePagination(result.pagination);
          if (result.footer?.totalAmount) {
            setPrivateLessonDueFooterTotal(result.footer.totalAmount);
          } else {
            setPrivateLessonDueFooterTotal("$0.00");
          }
        }

        // Process group lesson dues
        if (groupLessonDueResult.status === "fulfilled") {
          const result = groupLessonDueResult.value;
          setGroupLessonDueData(result.data || []);
          setGroupLessonDuePagination(result.pagination);
          if (result.footer?.totalAmount) {
            setGroupLessonDueFooterTotal(result.footer.totalAmount);
          } else {
            setGroupLessonDueFooterTotal("$0.00");
          }
        }

        // Process payments
        if (paymentsResult.status === "fulfilled") {
          const result = paymentsResult.value;
          setPaymentData(result.data || []);
          setPaymentsPagination(result.pagination);
          if (result.footer?.totalRemaining) {
            setPaymentsFooterRemaining(result.footer.totalRemaining);
          } else {
            setPaymentsFooterRemaining("$0.00");
          }
        }
        setPaymentsLoading(false);

        // Process students data - only tab loaded on initial mount
        if (studentsResult.status === "fulfilled") {
          const { data: students, pagination: sPag } = studentsResult.value;
          setStudentData(students);
          setStudentsPagination(sPag);
        } else {
          setStudentsError("Failed to load students data");
          setStudentData([]);
          setStudentsPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        }
        setStudentsLoading(false);

        // Phase 2 complete
        setLoadingSecondary(false);

        // Reset loading flag after successful load
        if (isMounted) {
          isLoadingDataRef.current = false;
        }

        // Other tabs (enrolments, private-lessons, group-lessons, proforma-invoices, comments, history)
        // are now loaded lazily when the user switches to those tabs
      } catch (error) {
        console.error("Error loading customer data:", error);
        if (isMounted) {
          setLoading(false);
          setLoadingSecondary(false);
          isLoadingDataRef.current = false;
        }
      }
    };

    loadData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      isLoadingDataRef.current = false;
      abortController.abort();
    };
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
    (newData: CustomerDetailsSaveData) => {
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
    },
    []
  );

  // Define action menu groups
  const customerActionMenuGroups: ActionMenuGroup[] = [
    {
      label: "Action",
      items: [
        {
          label: "Receive Payment",
          onClick: () => setIsReceivePaymentModalOpen(true),
        },

        {
          label: "Print Statement",
          onClick: async () => {
            try {
              toast.loading("Loading print statement...", { id: "print-statement" });
              
              // Fetch all data in parallel
              const [locationDetailsRes, privateLessonsRes, groupLessonsRes, outstandingInvoicesRes, paymentCreditsRes, invoiceCreditsRes] = await Promise.all([
                // Fetch location details
                apiClient.get<{
                  success: boolean;
                  data: {
                    id: number;
                    name: string;
                    address: string;
                    phoneNumber: string;
                    city: string;
                    province: string;
                    country: string;
                    postalCode: string;
                    email: string;
                    hstRegistrationNo: string;
                  };
                }>(`/admin/v2/locations/${location}/details`).catch(() => null),
                // Fetch all private lesson due data
                getCustomerPrivateLessonDue(location, Number(id), 1, 9999),
                // Fetch all group lesson due data
                getCustomerGroupLessonDue(location, Number(id), 1, 9999),
                // Fetch all outstanding invoices data
                getCustomerOutstandingInvoices(location, Number(id), 1, 9999),
                // Fetch all payment credits
                getPaymentCredits(location, Number(id), 1, 9999),
                // Fetch all invoice credits
                getInvoiceCredits(location, Number(id), 1, 9999),
              ]);

              // Process location details
              let locationDetails = null;
              
              if (locationDetailsRes?.data?.success && locationDetailsRes.data.data) {
                const locationData = locationDetailsRes.data.data;                
                locationDetails = {
                  name: locationData.name || "",
                  address: locationData.address || "",
                  city: locationData.city || "",
                  province: locationData.province || "",
                  country: locationData.country || "",
                  postalCode: locationData.postalCode || "",
                  phoneNumber: locationData.phoneNumber || "",
                  email: locationData.email || "",
                  hstRegistrationNo: locationData.hstRegistrationNo || "",
                };
              }

              // Format currency helper
              const formatCurrency = (value: number | string): string => {
                if (typeof value === 'string') return value;
                return `$${value.toFixed(2)}`;
              };

              // Parse amount helper to handle strings like "$12.00" or numbers
              const parseAmount = (value: number | string | undefined): number => {
                if (typeof value === "number") return value;
                if (!value) return 0;
                const cleaned = String(value).replace(/[^0-9.-]/g, "");
                const num = Number(cleaned);
                return Number.isFinite(num) ? num : 0;
              };

              // Transform private lesson due data
              const lessonRows = (privateLessonsRes.data || []).map(lesson => {
                const rawAmount = parseAmount(lesson.amount);
                const amount = formatCurrency(rawAmount);
                const balanceValue: number = parseAmount(
                  (lesson as { balanceDue?: number | string }).balanceDue ?? rawAmount
                );
                const balance = formatCurrency(balanceValue);
                return {
                  date: lesson.lessonDate || "",
                  student: lesson.studentName || "",
                  program: lesson.programName || "",
                  teacher: lesson.teacherName || "",
                  amount,
                  balance,
                };
              });

              // Transform group lesson due data
              const groupLessonRows = (groupLessonsRes.data || []).map(lesson => {
                const rawAmount = parseAmount(lesson.amount);
                const amount = formatCurrency(rawAmount);
                const balanceValue: number = parseAmount(
                  (lesson as { balanceDue?: number | string }).balanceDue ?? rawAmount
                );
                const balance = formatCurrency(balanceValue);
                return {
                  date: lesson.lessonDate || "",
                  student: lesson.studentName || "",
                  program: lesson.programName || "",
                  teacher: lesson.teacherName || "",
                  amount,
                  balance,
                };
              });

              // Transform outstanding invoices data
              const invoiceRows = (outstandingInvoicesRes.data || []).map(invoice => ({
                date: invoice.date || "",
                number: invoice.id || "",
                amount: formatCurrency(invoice.amount),
                payment: formatCurrency(invoice.payments),
                balance: formatCurrency(invoice.balanceDue),
              }));

              // Transform credits data - combine payment credits and invoice credits
              const paymentCredits = (paymentCreditsRes.data || []).map(credit => ({
                type: credit.type || "Payment Credit",
                reference: credit.reference || "",
                date: "", // Credits don't have date field in API response
                amount: credit.amount || "$0.00",
              }));

              const invoiceCredits = (invoiceCreditsRes.data || []).map(credit => ({
                type: credit.type || "Invoice Credit",
                reference: credit.reference || "",
                date: "", // Credits don't have date field in API response
                amount: credit.amount || "$0.00",
              }));

              const creditRows = [...paymentCredits, ...invoiceCredits];

              // Build statement data
              const statementData: CustomerStatementData = {
                customerName: customer 
                  ? _customerInfo?.profile.name.trim() 
                  : "",
                customerPhone: _customerInfo?.phone?.[0]?.number || "",
                customerEmail: _customerInfo?.email?.[0]?.email || customer?.email || "",
                hstNumber: locationDetails?.hstRegistrationNo || "",
                locationDetails: locationDetails,
                lessonRows: lessonRows.length > 0 ? lessonRows : undefined,
                groupLessonRows: groupLessonRows.length > 0 ? groupLessonRows : undefined,
                invoiceRows: invoiceRows.length > 0 ? invoiceRows : undefined,
                creditRows: creditRows.length > 0 ? creditRows : undefined,
                totalBalance: summaryData.balance || "$0.00",
              };

              toast.dismiss("print-statement");
              
              // Print the statement
              const success = printCustomerStatement(statementData);
              if (!success) {
                toast.error("Failed to open print dialog. Please check if pop-ups are blocked.");
              }
            } catch (error) {
              console.error("Error printing statement:", error);
              toast.dismiss("print-statement");
              toast.error("Failed to load statement data");
            }
          },
        },
        {
          label: "Email Statement",
          onClick: () => setIsEmailStatementModalOpen(true),
        },
        {
          label: "A/R Report Detail",
          onClick: () => {
            {
              const url = `/admin/v2/${location}/report/account-receivable/${id}`;
              window.open(url, "_blank");
            }
          },
        },
        // { label: "Items Purchased by Category", onClick: () => {} },
        // { label: "A/R Report Detail", onClick: () => {} },
        {
          label: "Items Purchased by Category",
          onClick: () => {
            const url = `/admin/v2/${location}/customers/${id}/items-purchased-by-category`;
            window.open(url, "_blank");
          },
        },
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
      <SummaryCards summaryData={summaryData} loading={loading} />

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
            loading={outstandingInvoicesLoading || loadingSecondary}
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

        </div>
      </div>

      {/* Full Width Tables Below Outstanding Invoices */}
      <div className="space-y-3 sm:space-y-4 mt-4">
        <TableCard
          title="Equipment Rentals"
          data={
            showAllEquipmentRentals
              ? equipmentRentalData
              : equipmentRentalData.filter(
                  (rental) => rental.equipmentReturned !== "Yes"
                )
          }
          columns={CUSTOMER_TABLE_CONFIGS.equipmentRentals.columns}
          loading={equipmentRentalsLoading || loadingSecondary}
          onAdd={() => setIsEquipmentRentalsModalOpen(true)}
          onRowClick={(row) => {
            const r = row as unknown as EquipmentRentalData;
            // Prevent clicking on returned rentals
            if (r && r.equipmentReturned === "Yes") {
              return;
            }
            if (r && typeof r.id === "number") {
              setSelectedRentalId(r.id);
              setIsEquipmentRentalsModalOpen(true);
            }
          }}
          rowClassName={(row) => {
            const r = row as unknown as EquipmentRentalData;
            // Style returned rentals as disabled/non-clickable
            if (r && r.equipmentReturned === "Yes") {
              return "opacity-60 cursor-not-allowed";
            }
            return "";
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
          onShowAllChange={setShowAllEquipmentRentals}
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
          loading={loadingSecondary}
          onAdd={() => {
            setSelectedRecurringPaymentId(undefined);
            setIsRecurringPaymentModalOpen(true);
          }}
          onRowClick={(row) => {
            // Extract ID from row - check common ID field names
            const rec = row as unknown as Record<string, unknown>;
            const paymentId =
              rec["id"] ??
              rec["paymentId"] ??
              rec["payment_id"] ??
              rec["recurringPaymentId"];
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
          loading={loadingSecondary}
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
          loading={loadingSecondary}
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
          loading={paymentsLoading || loadingSecondary}
          footerRow={paymentFooterRow}
          onRowClick={(row) => {
            // Extract payment ID from the row
            const rec = row as unknown as Record<string, unknown>;
            const paymentId = rec["id"]; // API returns "id" field directly

            if (paymentId !== undefined && paymentId !== null) {
              setSelectedPaymentId(Number(paymentId));
              setIsPaymentReceiptModalOpen(true);
            } else {
              console.error("Payment ID not found in row data:", row);
              toast.error("Unable to open payment details");
            }
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            // Load tab data when switching to a tab that hasn't been loaded yet
            if (!loadedTabs.has(value) && !loadingTabsRef.current.has(value)) {
              loadTabData(value);
            }
          }}
          className="w-full"
        >
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
          setEquipmentRentalData((prev) =>
            prev.filter((r) => (r as EquipmentRentalData).id !== rid)
          );
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
        onEmail={({ subject, content }) => {
          setEmailModalOverrides({ subject, content });
          setIsEmailStatementModalOpen(true);
        }}
      />

      {/* Email Statement Modal */}
      <EmailStatementModal
        open={isEmailStatementModalOpen}
        onOpenChange={handleEmailModalOpenChange}
        onSend={handleSendEmailStatement}
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
        customerEmails={
          emailStatementData?.customerEmails || emails.map((e) => e.email)
        }
        locationName="Arcadia Academy of Music"
        hstNumber={locationHstNumber}
        initialSubject={
          emailModalOverrides?.subject ?? emailStatementData?.emailSubject
        }
        initialContent={
          emailModalOverrides?.content ?? emailStatementData?.emailHeader
        }
        privateLessonDueData={
          emailStatementData?.privateLessonsDue || privateLessonDueData
        }
        groupLessonDueData={
          emailStatementData?.groupLessonsDue || groupLessonDueData
        }
        invoiceData={emailStatementData?.invoices || invoiceData}
        creditData={emailStatementData?.credits || []}
        totalBalance={
          emailStatementData
            ? `$${emailStatementData.totalBalance.toFixed(2)}`
            : summaryData.balance
        }
        showDeleteButton={false}
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
      <PaymentReceiptModalContainer
        open={isPaymentReceiptModalOpen}
        onOpenChange={(open) => {
          setIsPaymentReceiptModalOpen(open);
          if (!open) {
            setSelectedPaymentId(null);
            setDirectPaymentReceiptData(null);
          }
        }}
        location={location}
        customerId={Number(id)}
        paymentId={selectedPaymentId ?? undefined}
        mode={directPaymentReceiptData ? "new" : "view"}
        directPaymentData={directPaymentReceiptData ?? undefined}
        customerName={`${localFirstName} ${localLastName}`.trim()}
        customerEmail={
          emails.find((e) => e.isPrimary)?.email ?? emails[0]?.email
        }
        customerPhone={
          phones.find((p) => p.label === "Mobile")?.number ?? phones[0]?.number
        }
        onEdit={async () => {
          try {
            await refreshPaymentData();
            // Toast is already shown by the modal component
          } catch (error) {
            console.error("Error refreshing data after payment edit:", error);
            toast.error("Payment updated but failed to refresh data");
          }
        }}
        onDelete={async () => {
          if (!selectedPaymentId) {
            toast.error("Payment ID not found");
            return;
          }

          try {
            // Call legacy API to delete payment
            const response = await deletePayment(location, selectedPaymentId);

            if (response.status) {
              // Close the modal
              setIsPaymentReceiptModalOpen(false);
              setSelectedPaymentId(null);
              setDirectPaymentReceiptData(null);

              // Refresh payment data
              await refreshPaymentData();
              toast.success(response.message || "Payment deleted successfully");
            } else {
              const errorMessage =
                response.message ||
                response.errors?.join(", ") ||
                "Failed to delete payment";
              toast.error(errorMessage);
            }
          } catch (error) {
            console.error("Error deleting payment:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete payment";
            toast.error(errorMessage);
          }
        }}
        onEmail={({ subject, content }) => {
          setEmailModalOverrides({ subject, content });
          setIsEmailStatementModalOpen(true);
        }}
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
