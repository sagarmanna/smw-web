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
  getCustomerStudents
} from "../customers.api";
import { formatCurrency } from "@/utils/formatCurrency";
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
}

interface Email {
  id: string;
  label: string;
  email: string;
  note?: string;
}

interface CustomerDetailClientProps {
  location: string;
  id: string;
}

export function CustomerDetailClient({ location, id }: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [studentsLoading, setStudentsLoading] = React.useState<boolean>(false);
  const [studentsError, setStudentsError] = React.useState<string | null>(null);
  const [showAllEquipment, setShowAllEquipment] = React.useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = React.useState<boolean>(false);
  const [isRecurringPaymentModalOpen, setIsRecurringPaymentModalOpen] = React.useState<boolean>(false);
  const [isEquipmentRentalsModalOpen, setIsEquipmentRentalsModalOpen] = React.useState<boolean>(false);

  // Local state for editable customer details
  const [localFirstName, setLocalFirstName] = React.useState<string>("");
  const [localLastName, setLocalLastName] = React.useState<string>("");
  const [referralSource, setReferralSource] = React.useState<string>("Drive By");
  const [status, setStatus] = React.useState<string>("Active");
  const [picture, setPicture] = React.useState<string | undefined>(undefined);

  // Handle adding new student
  const handleAddStudent = (studentData: StudentData) => {
    setStudentData(prev => [...prev, studentData]);
  };

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
  const [addresses, setAddresses] = React.useState<Array<{
    id: string;
    label: string;
    address: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  }>>([]);
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
          getCustomerInvoices(location, Number(id)),
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
        // Error handling is done in individual API calls
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [location, id]);

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
    
    // Update additional states
    setReferralSource(newData.referralSource);
    setStatus(newData.status);
    setPicture(newData.picture);
    
    // TODO: Call API to update customer details
  }, []);

  // Define action menu groups for customer
  const customerActionMenuGroups: ActionMenuGroup[] = [
    {
      label: "Actions",
      items: [
        { label: "Receive Payment", onClick: () => {} },
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

      {/* Detail Header */}
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
          value={formatCurrency(821.52)}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-cyan-500"
          loading={loading}
        />
        <SummaryCard
          title="Outstanding Invoice"
          value={formatCurrency(20741.84)}
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-orange-500"
          loading={loading}
        />
        <SummaryCard
          title="Credits"
          value={formatCurrency(0.00)}
          icon={<Star className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-green-500"
          loading={loading}
        />
        <SummaryCard
          title="Balance"
          value={customer && customer.balance ? formatCurrency(parseFloat(customer.balance.replace(/[^0-9.-]/g, '')) || 0) : formatCurrency(0)}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          iconBackgroundColor="bg-orange-400"
          loading={loading}
        />
      </div>

      {/* Details and Email Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Details Card */}
        <DetailsCard 
          data={{
            firstName: localFirstName,
            lastName: localLastName,
            role: "Customer",
            referralSource: referralSource,
            status: status,
            picture: picture
          }}
          onSave={handleDetailsSave}
          loading={loading}
        />

        {/* Email Card */}
        <EmailCard 
          emails={emails}
          onAddClick={() => {}}
          onSave={setEmails}
        />
      </div>

      {/* Tables and Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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
          <PhoneCard 
            phones={phones}
            onSave={(newPhones) => setPhones(newPhones)}
          />
          
          <AddressCard 
            addresses={addresses}
            onSave={(newAddresses) => setAddresses(newAddresses)}
          />
          
          <DiscountCard 
            discount={discount}
            onSave={(newDiscount) => setDiscount(newDiscount)}
          />
          
          <OpeningBalanceCard 
            amount={openingBalance}
            onSave={(amount, type) => {
              setOpeningBalance(type === "owing" ? amount : -amount);
            }}
          />
          
          <InfoCardWithAction title="Payment Preference" showAddButton={false}>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Payment Preference</div>
            </div>
          </InfoCardWithAction>
        </div>
      </div>

      {/* Full Width Tables Below Outstanding Invoices */}
      <div className="space-y-3 sm:space-y-4">
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
              onClick: () => {}
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
            const data = tabDataMap[config.dataKey as keyof typeof tabDataMap] || [];
            
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
    </div>
  );
}