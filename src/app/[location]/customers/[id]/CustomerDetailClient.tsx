"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DetailHeader, ActionMenuGroup } from "@/components/DetailHeader";
import { 
  getCustomerById, 
  CustomerRow,
  getCustomerInvoices,
  getCustomerOutstandingInvoices,
  getCustomerEquipmentRentals,
  getCustomerRecurringPayments,
  getCustomerPrivateLessonDue,
  getCustomerGroupLessonDue,
  getCustomerPayments,
  getCustomerStudents,
  getCustomerSummary,
  getCustomerInfo,
  CustomerSummaryData,
  CustomerInfoData
} from "../customers.api";
import { SummaryCard } from "@/components/SummaryCard";
import { BookOpen, FileText, Star, DollarSign } from "lucide-react";
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

import { 
  InvoiceData, 
  OutstandingInvoiceData, 
  EquipmentRentalData, 
  RecurringPaymentData, 
  PrivateLessonDueData, 
  GroupLessonDueData, 
  PaymentData,
  CUSTOMER_TABLE_CONFIGS
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
  HistoryData
} from "../tabConfigs";
import { mockCustomerTabData } from "../mockData/customersMockData";
import AddStudentModal from "../components/AddStudentModal/index";

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

export function CustomerDetailClient({ location, id }: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [customerInfo, setCustomerInfo] = React.useState<CustomerInfoData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [studentsLoading, setStudentsLoading] = React.useState<boolean>(false);
  const [studentsError, setStudentsError] = React.useState<string | null>(null);
  const [studentsPagination, setStudentsPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [studentsRowsPerPage, setStudentsRowsPerPage] = React.useState<number>(10);

  // Simple pagination state for all tabs
  const [tabPagination, setTabPagination] = React.useState<Record<string, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>>({});
  const [tabRowsPerPage, setTabRowsPerPage] = React.useState<Record<string, number>>({});
  const [showAllEquipment, setShowAllEquipment] = React.useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = React.useState<boolean>(false);
  const [isRecurringPaymentModalOpen, setIsRecurringPaymentModalOpen] = React.useState<boolean>(false);
  const [isEquipmentRentalsModalOpen, setIsEquipmentRentalsModalOpen] = React.useState<boolean>(false);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState<boolean>(false);

  // Local state for editable customer details
  const [localFirstName, setLocalFirstName] = React.useState<string>("");
  const [localLastName, setLocalLastName] = React.useState<string>("");
  const [referralSource, setReferralSource] = React.useState<string>("Drive By");
  const [status, setStatus] = React.useState<string>("Active");
  const [picture, setPicture] = React.useState<string | undefined>(undefined);
  const [role, setRole] = React.useState<string>("Customer");

  // Summary data state
  const [summaryData, setSummaryData] = React.useState<CustomerSummaryData>({
    lessonsDue: '$0.00',
    outstandingInvoice: '$0.00',
    totalCredits: '$0.00',
    balance: '$0.00'
  });

  // Handle adding new student
  const handleAddStudent = (studentData: StudentData) => {
    setStudentData(prev => [...prev, studentData]);
    // Update pagination when adding new student
    setStudentsPagination(prev => ({
      ...prev,
      total: prev.total + 1,
      totalPages: Math.ceil((prev.total + 1) / prev.limit)
    }));
  };

  // Handle students pagination
  const handleStudentsPageChange = (page: number) => {
    setStudentsPagination(prev => ({ ...prev, page }));
  };

  const handleStudentsRowsPerPageChange = (rowsPerPage: number) => {
    setStudentsRowsPerPage(rowsPerPage);
    setStudentsPagination(prev => ({
      ...prev,
      limit: rowsPerPage,
      page: 1,
      totalPages: Math.ceil(prev.total / rowsPerPage)
    }));
  };

  // Simple pagination handlers for all tabs (following AccountReceivableClient pattern)
  const handleTabPageChange = React.useCallback((tabKey: string, page: number) => {
    setTabPagination(prev => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], page }
    }));
  }, []);

  const handleTabRowsPerPageChange = React.useCallback((tabKey: string, rowsPerPage: number) => {
    setTabRowsPerPage(prev => ({ ...prev, [tabKey]: rowsPerPage }));
    setTabPagination(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        limit: rowsPerPage,
        page: 1,
        totalPages: Math.ceil((prev[tabKey]?.total || 0) / rowsPerPage)
      }
    }));
  }, []);

  // Handle adding new recurring payment
  const handleAddRecurringPayment = () => {
    setIsRecurringPaymentModalOpen(false);
  };

  // Handle adding new equipment rental
  const handleAddEquipmentRental = (data: unknown) => {
    setIsEquipmentRentalsModalOpen(false);
  };

  // Handle invoice actions
  const handleAddInvoice = () => {
    // TODO: Implement invoice creation logic
  };

  const handlePrintInvoice = (invoiceId: string) => {
    // TODO: Implement invoice printing logic
  };

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

  // ADD THIS HELPER FUNCTION
  const calculateAmountNeeded = () => {
    const parseAmount = (value: string) => {
      const num = parseFloat(value.replace(/[$,]/g, ''));
      return isNaN(num) ? 0 : num;
    };
    
    const lessonsDue = parseAmount(summaryData.lessonsDue);
    const outstanding = parseAmount(summaryData.outstandingInvoice);
    
    return lessonsDue + outstanding;
  };
  
  // Table data states
  const [invoiceData, setInvoiceData] = React.useState<InvoiceData[]>([]);
  const [outstandingInvoiceData, setOutstandingInvoiceData] = React.useState<OutstandingInvoiceData[]>([]);
  const [equipmentRentalData, setEquipmentRentalData] = React.useState<EquipmentRentalData[]>([]);
  const [recurringPaymentData, setRecurringPaymentData] = React.useState<RecurringPaymentData[]>([]);
  const [privateLessonDueData, setPrivateLessonDueData] = React.useState<PrivateLessonDueData[]>([]);
  const [groupLessonDueData, setGroupLessonDueData] = React.useState<GroupLessonDueData[]>([]);
  const [paymentData, setPaymentData] = React.useState<PaymentData[]>([]);

  // Tab data states
  const [studentData, setStudentData] = React.useState<StudentData[]>([]);
  const [enrolmentData, setEnrolmentData] = React.useState<EnrolmentData[]>([]);
  const [privateLessonData, setPrivateLessonData] = React.useState<PrivateLessonData[]>([]);
  const [groupLessonData, setGroupLessonData] = React.useState<GroupLessonData[]>([]);
  const [proformaInvoiceData, setProformaInvoiceData] = React.useState<ProformaInvoiceData[]>([]);
  const [commentData, setCommentData] = React.useState<CommentData[]>([]);
  const [historyData, setHistoryData] = React.useState<HistoryData[]>([]);

  // Additional customer data states
  const [phones, setPhones] = React.useState<PhoneNumber[]>([]);
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [discount, setDiscount] = React.useState<number>(0);
  const [openingBalance, setOpeningBalance] = React.useState<number>(0);

  // Calculate footer for private lesson due
  const privateLessonDueTotal = privateLessonDueData.reduce((sum, item) => sum + item.amount, 0);
  const privateLessonDueFooterRow: PrivateLessonDueData = {
    lessonDate: "Total:",
    student: "",
    program: "",
    teacher: "",
    amount: privateLessonDueTotal,
  };

  // Calculate footer for payments (only remaining column)
  const paymentRemainingTotal = paymentData.reduce((sum, item) => sum + item.remaining, 0);
  const paymentFooterRow: PaymentData = {
    date: "",
    notes: "",
    amount: 0,
    used: 0,
    remaining: paymentRemainingTotal,
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
            const nameParts = infoResponse.data.profile.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            setLocalFirstName(firstName);
            setLocalLastName(lastName);
          }
          
          if (infoResponse.data.profile) {
            setRole(infoResponse.data.profile.role || 'Customer');
            setReferralSource(infoResponse.data.profile.referralSource || 'Drive By');
            setStatus(infoResponse.data.profile.status || 'Active');
          }
          
          if (infoResponse.data.email && Array.isArray(infoResponse.data.email)) {
            const formattedEmails = infoResponse.data.email.map(e => ({
              id: String(e.id),
              label: e.label,
              email: e.email,
              note: e.note,
              isPrimary: e.isPrimary
            }));
            setEmails(formattedEmails);
          }
          
          if (infoResponse.data.phone && Array.isArray(infoResponse.data.phone)) {
            const formattedPhones = infoResponse.data.phone.map(p => ({
              id: String(p.id),
              label: p.label,
              number: p.number,
              extension: p.extension?.toString(),
              note: p.note
            }));
            setPhones(formattedPhones);
          }
          
          if (infoResponse.data.addresses && Array.isArray(infoResponse.data.addresses)) {
            const formattedAddresses = infoResponse.data.addresses.map(a => ({
              id: String(a.id),
              label: a.label,
              address: a.address,
              city: a.city,
              province: a.province,
              country: a.country,
              postalCode: a.postalCode,
              isPrimary: a.isPrimary
            }));
            setAddresses(formattedAddresses);
          }
          
          if (infoResponse.data.discount) {
            setDiscount(infoResponse.data.discount.value || 0);
          }
          
          if (infoResponse.data.openingBalance) {
            const amount = infoResponse.data.openingBalance.amount || 0;
            const type = infoResponse.data.openingBalance.type || 'owing';
            setOpeningBalance(type === 'owing' ? amount : -amount);
          }
        }
        
        const summary = await getCustomerSummary(location, Number(id));
        if (summary?.success && summary.data) {
          setSummaryData(summary.data);
        }
        
        // Load all table data in parallel
        const [
          invoices,
          outstandingInvoices,
          equipmentRentals,
          recurringPayments,
          privateLessonDue,
          groupLessonDue,
          payments
        ] = await Promise.all([
          getCustomerInvoices(location, Number(id), 1),
          getCustomerOutstandingInvoices(location, Number(id)),
          getCustomerEquipmentRentals(location, Number(id)),
          getCustomerRecurringPayments(location, Number(id)),
          getCustomerPrivateLessonDue(location, Number(id)),
          getCustomerGroupLessonDue(location, Number(id)),
          getCustomerPayments(location, Number(id))
        ]);
        
        setInvoiceData(invoices || []);
        setOutstandingInvoiceData(outstandingInvoices || []);
        setEquipmentRentalData(equipmentRentals || []);
        setRecurringPaymentData(recurringPayments || []);
        setPrivateLessonDueData(privateLessonDue || []);
        setGroupLessonDueData(groupLessonDue || []);
        setPaymentData(payments || []);

        // Load students data from API
        setStudentsLoading(true);
        setStudentsError(null);
        try {
          const students = await getCustomerStudents(location, Number(id));
          setStudentData(students);
          // Update pagination state based on API response
          setStudentsPagination(prev => ({
            ...prev,
            total: students.length,
            totalPages: Math.ceil(students.length / prev.limit)
          }));
        } catch (error) {
          setStudentsError('Failed to load students data');
          setStudentData([]);
        } finally {
          setStudentsLoading(false);
        }
        
        // Load other tab data (mock data for now)
        setEnrolmentData(mockCustomerTabData.enrolmentData);
        setPrivateLessonData(mockCustomerTabData.privateLessonData);
        setGroupLessonData(mockCustomerTabData.groupLessonData);
        setProformaInvoiceData(mockCustomerTabData.proformaInvoiceData);
        setCommentData(mockCustomerTabData.commentData);
        setHistoryData(mockCustomerTabData.historyData);
      } catch (error) {
        console.error('Error loading customer data:', error);
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

      const initialPagination: Record<string, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }> = {};
      const initialRowsPerPage: Record<string, number> = {};

      Object.entries(tabData).forEach(([key, data]) => {
        const total = Array.isArray(data) ? data.length : 0;
        const limit = 10;
        initialPagination[key] = {
          page: 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        };
        initialRowsPerPage[key] = limit;
      });

      setTabPagination(initialPagination);
      setTabRowsPerPage(initialRowsPerPage);
    }
  }, [loading, studentData, enrolmentData, privateLessonData, groupLessonData, proformaInvoiceData, commentData, historyData]);

  // Handle details save
  const handleDetailsSave = React.useCallback((newData: {
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
    setCustomer(prev => {
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
  }, []);

  // UPDATED: Define action menu groups with Receive Payment handler
  const customerActionMenuGroups: ActionMenuGroup[] = [
    {
      label: "Actions",
      items: [
        { label: "Receive Payment", onClick: () => setIsReceivePaymentModalOpen(true) }, // UPDATED THIS LINE
        { label: "Print Statement", onClick: () => {} },
        { label: "Email Statement", onClick: () => {} },
        { label: "A/R Report Detail", onClick: () => {} },
        { label: "Items Purchased by Category", onClick: () => {} },
        { label: "Notify Via Email", onClick: () => {} },
      ],
      separator: true
    },
    {
      items: [
        { label: "Delete", onClick: () => {}, variant: "destructive" }
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-black -mt-2">
      <DetailHeader
        breadcrumbItems={[
          { label: "Customers", onClick: () => router.push(`/${location}/customers/`) }
        ]}
        currentPageTitle={localFirstName && localLastName ? `${localFirstName} ${localLastName}` : id}
        loading={loading}
        actionMenuGroups={customerActionMenuGroups}
        actionButtonAriaLabel="Customer actions"
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

      {/* Details and Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {/* Details Card */}
        <DetailsCard 
          data={{
            firstName: localFirstName,
            lastName: localLastName,
            role: role,
            referralSource: referralSource,
            status: status,
            picture: picture
          }}
          onSave={handleDetailsSave}
          loading={loading}
        />

        {/* Right Column - Info Cards */}
        <div className="space-y-3 sm:space-y-4">
          <EmailCard 
            emails={emails}
            onAddClick={() => {}}
            onSave={setEmails}
            loading={loading}
          />
          
          <PhoneCard 
            phones={phones}
            onSave={(newPhones) => setPhones(newPhones)}
            loading={loading}
          />
        </div>
      </div>

      {/* Tables and Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {/* Left Column - Main Tables */}
        <div className="space-y-3 sm:space-y-4">
          <InvoiceTable
            data={invoiceData}
            loading={loading}
            onAddInvoice={handleAddInvoice}
            onPrintInvoice={handlePrintInvoice}
          />
          
          <TableCard 
            title="Outstanding Invoices"
            data={outstandingInvoiceData} 
            columns={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.columns}
            loading={loading}
            onAdd={() => {}}
            size={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.size}
            variant={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.variant}
            enableSorting={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableSorting}
            enableExport={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableExport}
            enablePrint={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enablePrint}
            enableSearch={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableSearch}
            enableFilter={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableFilter}
            enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.outstandingInvoices.enableRowsPerPage}
            iconType="none"
          />
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-3 sm:space-y-4">
          <AddressCard 
            addresses={addresses}
            onSave={(newAddresses) => setAddresses(newAddresses)}
            loading={loading}
          />
          
          <DiscountCard 
            discount={discount}
            onSave={(newDiscount) => setDiscount(newDiscount)}
            loading={loading}
          />
          
          <OpeningBalanceCard 
            amount={Math.abs(openingBalance)}
            onSave={(amount, type) => {
              setOpeningBalance(type === "owing" ? amount : -amount);
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
          loading={loading}
          onAdd={() => setIsEquipmentRentalsModalOpen(true)}
          size={CUSTOMER_TABLE_CONFIGS.equipmentRentals.size}
          variant={CUSTOMER_TABLE_CONFIGS.equipmentRentals.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableFilter}
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.equipmentRentals.enableRowsPerPage}
          iconType="plus"
          showCheckbox={true}
          checkboxLabel="Show All"
          checkboxChecked={showAllEquipment}
          onCheckboxChange={setShowAllEquipment}
        />
        
        <TableCard 
          title="Recurring Payments"
          data={recurringPaymentData} 
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
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.recurringPayments.enableRowsPerPage}
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
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.privateLessonDue.enableRowsPerPage}
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
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.groupLessonDue.enableRowsPerPage}
          iconType="none"
        />
        
        <TableCard 
          title="Payments"
          data={paymentData} 
          columns={CUSTOMER_TABLE_CONFIGS.payments.columns}
          loading={loading}
          footerRow={paymentFooterRow}
          onAdd={() => {}}
          size={CUSTOMER_TABLE_CONFIGS.payments.size}
          variant={CUSTOMER_TABLE_CONFIGS.payments.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.payments.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.payments.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.payments.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.payments.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.payments.enableFilter}
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.payments.enableRowsPerPage}
          iconType="chevron"
          dropdownItems={[
            {
              label: "Receive Payment",
              onClick: () => setIsReceivePaymentModalOpen(true) // UPDATED THIS LINE TOO
            }
          ]}
          dropdownLabel="Payment Actions"
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
            const fullData = tabDataMap[config.dataKey as keyof typeof tabDataMap] || [];
            
            // Get pagination info for this tab
            const pagination = tabPagination[tabKey];
            const rowsPerPage = tabRowsPerPage[tabKey] || 10;
            
            // Slice data based on current page and rows per page (like AccountReceivableClient)
            const startIndex = pagination ? (pagination.page - 1) * pagination.limit : 0;
            const endIndex = pagination ? startIndex + pagination.limit : fullData.length;
            const data = fullData.slice(startIndex, endIndex);
            
            // Show pagination if total records > 10
            const shouldShowPagination = pagination && pagination.total > 10;
            
            // Use specific loading state for students tab
            const isLoading = tabKey === "students" ? studentsLoading : loading;
            const error = tabKey === "students" ? studentsError : null;
            
            // Define bottom content for comments tab
            const commentsBottomContent = tabKey === "comments" ? (
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
                    } else {
                      // TODO: Implement add functionality for other tabs
                    }
                  }}
                  emptyState={config.emptyState}
                  hasTable={config.hasTable}
                  bottomContent={commentsBottomContent}
                  // Simple pagination following AccountReceivableClient pattern
                  enablePagination={shouldShowPagination}
                  serverSidePagination={shouldShowPagination ? tabPagination[tabKey] : undefined}
                  onPageChange={shouldShowPagination ? (page: number) => handleTabPageChange(tabKey, page) : undefined}
                  onRowsPerPageChange={shouldShowPagination ? (rowsPerPage: number) => handleTabRowsPerPageChange(tabKey, rowsPerPage) : undefined}
                  rowsPerPage={tabRowsPerPage[tabKey] || 10}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  initialRowsPerPage={10}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={isAddStudentModalOpen}
        onOpenChange={setIsAddStudentModalOpen}
        onSave={handleAddStudent}
        customerName={customer ? `${customer.firstName} ${customer.lastName}` : undefined}
      />

      {/* Recurring Payment Modal */}
      <RecurringPaymentModal
        open={isRecurringPaymentModalOpen}
        onOpenChange={setIsRecurringPaymentModalOpen}
        onSave={handleAddRecurringPayment}
        customerName={customer ? `${customer.firstName} ${customer.lastName}` : undefined}
      />

      {/* Equipment Rentals Modal */}
      <EquipmentRentalsModal
        open={isEquipmentRentalsModalOpen}
        onOpenChange={setIsEquipmentRentalsModalOpen}
        onSave={handleAddEquipmentRental}
        customerName={customer ? `${customer.firstName} ${customer.lastName}` : undefined}
        customerEmail={customer?.email}
      />

      {/* ADD RECEIVE PAYMENT MODAL */}
      <ReceivePaymentModal
        open={isReceivePaymentModalOpen}
        onOpenChange={setIsReceivePaymentModalOpen}
        onSave={handleReceivePayment}
        customerName={customer ? `${customer.firstName} ${customer.lastName}` : undefined}
        customerId={id}
        amountNeeded={calculateAmountNeeded()}
      />
    </div>
  );
}