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
import AddStudentModal from "../components/AddStudentModal/index";
import EmailStatementModal, {
  EmailFormData,
} from "../components/EmailStatementModal/index";

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
import { mockCustomerTabData } from "../mockData/customersMockData";

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
  province: string;
  country: string;
  postalCode: string;
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
  const [isEquipmentRentalsModalOpen, setIsEquipmentRentalsModalOpen] =
    React.useState<boolean>(false);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] =
    React.useState<boolean>(false);
  const [isEmailStatementModalOpen, setIsEmailStatementModalOpen] =
    React.useState<boolean>(false);

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
  const handleAddStudent = (studentData: StudentData) => {
    setStudentData((prev: StudentData[]) => [...prev, studentData]);
    setStudentsPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
      totalPages: Math.ceil((prev.total + 1) / prev.limit),
    }));
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
  const handleAddRecurringPayment = () => {
    setIsRecurringPaymentModalOpen(false);
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

  // Navigate to proforma invoice page
  const handleProformaInvoiceNavigate = () => {
    router.push(`/${location}/customers/${id}/proforma-invoice`);
  };

  // Handle invoice actions
  const handleAddInvoice = () => {
    // TODO: Implement invoice creation logic
  };

  const handlePrintInvoice = () => {};

  // Handle receiving payment
  const handleReceivePayment = (paymentData: {
    customer: string;
    date: string;
    paymentMethod: string;
    reference: string;
    amountReceived: number;
    notes: string;
    selectedLessons: string[];
    lessonPayments: Record<string, number>;
  }) => {
    console.log("Payment received:", paymentData);
    // TODO: Call API to save payment
    // Example: await saveCustomerPayment(location, Number(id), paymentData);

    // Refresh data after payment
    // You can reload specific sections or all data
    setIsReceivePaymentModalOpen(false);
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
  const [privateLessonDueData, setPrivateLessonDueData] = React.useState<
    PrivateLessonDueData[]
  >([]);
  const [groupLessonDueData, setGroupLessonDueData] = React.useState<
    GroupLessonDueData[]
  >([]);
  const [paymentData, setPaymentData] = React.useState<PaymentData[]>([]);
  const [paymentsPagination, setPaymentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [paymentsFooterRemaining, setPaymentsFooterRemaining] = React.useState<string>("$0.00");
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
  const [historyData, setHistoryData] = React.useState<HistoryData[]>([]);

  // Enrolments server-side pagination state
  const [enrolmentsPagination, setEnrolmentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [enrolmentsLoading, setEnrolmentsLoading] = React.useState<boolean>(false);

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
  const [hasOpeningBalance, setHasOpeningBalance] =
    React.useState<boolean>(false);

  // Calculate footer for private lesson due
  const privateLessonDueTotal = privateLessonDueData.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const privateLessonDueFooterRow: PrivateLessonDueData = {
    lessonDate: "Total:",
    student: "",
    program: "",
    teacher: "",
    amount: privateLessonDueTotal,
  };

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
              province: a.province,
              country: a.country,
              postalCode: a.postalCode,
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
            setOpeningBalance(amount);
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
        const [
          invoices,
          recurringPayments,
          privateLessonDue,
          groupLessonDue,
          _paymentsIgnore,
        ] = await Promise.all([
          getCustomerInvoices(location, Number(id), 1),
          getCustomerRecurringPayments(location, Number(id)),
          getCustomerPrivateLessonDue(location, Number(id)),
          getCustomerGroupLessonDue(location, Number(id)),
          Promise.resolve([]),
        ]);

        setInvoiceData(invoices || []);
        setRecurringPaymentData(recurringPayments || []);
        setPrivateLessonDueData(privateLessonDue || []);
        setGroupLessonDueData(groupLessonDue || []);
        // Load payments with footer (no transform)
        try {
          setPaymentsLoading(true);
          const paymentsResult = await getCustomerPayments(location, Number(id), 1, 10);
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
          const { data: students, pagination: sPag } = await getCustomerStudents(
            location,
            Number(id),
            1,
            10
          );
          setStudentData(students);
          setStudentsPagination(sPag);
        } catch {
          setStudentsError("Failed to load students data");
          setStudentData([]);
          setStudentsPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
        } finally {
          setStudentsLoading(false);
        }

        // Load enrolments data from API (server-side pagination)
        try {
          setEnrolmentsLoading(true);
          const { data: enrolments, pagination: ePag } = await getCustomerEnrolments(
            location,
            Number(id),
            1,
            10
          );
          setEnrolmentData(enrolments);
          setEnrolmentsPagination(ePag);
        } catch {
          setEnrolmentData([]);
          setEnrolmentsPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
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
          setHistoryPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
        } finally {
          setHistoryLoading(false);
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setLoading(false);
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
        { label: "Print Statement", onClick: () => {} },
        { label: "Print Statement", onClick: () => {} },
        {
          label: "Email Statement",
          onClick: () => setIsEmailStatementModalOpen(true),
        },
        { label: "A/R Report Detail", onClick: () => {} },
        { label: "Items Purchased by Category", onClick: () => {} },
        { label: "Notify Via Email", onClick: () => {} },
      ],
      separator: true,
    },
    {
      items: [{ label: "Delete", onClick: () => {}, variant: "destructive" }],
    },
  ];

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
            onAddInvoice={handleAddInvoice}
            onPrintInvoice={handlePrintInvoice}
          />

          {/* Outstanding Invoices */}
          <TableCard
            title="Outstanding Invoices"
            data={outstandingInvoiceData}
            columns={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.columns}
            loading={outstandingInvoicesLoading || loading}
            footerRow={outstandingInvoiceFooterRow}
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
            enableShowAll={true}
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
            location={location}
            onSave={(amount, balanceType) => {
              const savedAmount = balanceType === "credit" ? -amount : amount;
              setOpeningBalance(savedAmount);
              setHasOpeningBalance(true);
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
          onAdd={() => setIsRecurringPaymentModalOpen(true)}
          size={CUSTOMER_TABLE_CONFIGS.recurringPayments.size}
          variant={CUSTOMER_TABLE_CONFIGS.recurringPayments.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.recurringPayments.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableFilter}
          enableRowsPerPage={
            CUSTOMER_TABLE_CONFIGS.recurringPayments.enableRowsPerPage
          }
          iconType="plus"
        />

        <TableCard
          title="Private Lesson Due"
          data={privateLessonDueData}
          columns={CUSTOMER_TABLE_CONFIGS.privateLessonDue.columns}
          loading={loading}
          footerRow={privateLessonDueFooterRow}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.privateLessonDue.size}
          variant={CUSTOMER_TABLE_CONFIGS.privateLessonDue.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableFilter}
          enableRowsPerPage={
            CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableRowsPerPage
          }
          iconType="none"
        />

        <TableCard
          title="Group Lesson Due"
          data={groupLessonDueData}
          columns={CUSTOMER_TABLE_CONFIGS.groupLessonDue.columns}
          loading={loading}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.groupLessonDue.size}
          variant={CUSTOMER_TABLE_CONFIGS.groupLessonDue.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableFilter}
          enableRowsPerPage={
            CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableRowsPerPage
          }
          iconType="none"
        />

        <TableCard
          title="Payments"
          data={paymentData}
          columns={CUSTOMER_TABLE_CONFIGS.payments.columns}
          loading={paymentsLoading || loading}
          footerRow={paymentFooterRow}
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
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
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
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
      />

      {/* Recurring Payment Modal */}
      <RecurringPaymentModal
        open={isRecurringPaymentModalOpen}
        onOpenChange={setIsRecurringPaymentModalOpen}
        onSave={handleAddRecurringPayment}
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
      />

      {/* Equipment Rentals Modal */}
      <EquipmentRentalsModal
        open={isEquipmentRentalsModalOpen}
        onOpenChange={setIsEquipmentRentalsModalOpen}
        onSave={handleAddEquipmentRental}
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
        customerEmail={customer?.email}
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
        customerName={
          customer ? `${customer.firstName} ${customer.lastName}` : undefined
        }
        customerId={id}
        amountNeeded={calculateAmountNeeded()}
      />
    </div>
  );
}
