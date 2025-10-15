"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Settings, SlashIcon, Edit, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  getCustomerById, 
  CustomerRow,
  getCustomerInvoices,
  getCustomerOutstandingInvoices,
  getCustomerEquipmentRentals,
  getCustomerRecurringPayments,
  getCustomerPrivateLessonDue,
  getCustomerGroupLessonDue,
  getCustomerPayments
} from "../customers.api";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { formatCurrency } from "@/utils/formatCurrency";
import { LessonsDueCard, OutstandingInvoiceCard, CreditsCard, BalanceCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { InfoCardWithAction } from "@/components/InfoCardWithAction";
import { TableCard } from "@/components/TableCard";
import { TabContent } from "@/components/TabContent";
import { AddressCard } from "../components/AddressCard";
import { EmailCard } from "../components/EmailCard";
import { DiscountCard } from "../components/DiscountCard";
import { OpeningBalanceCard } from "../components/OpeningBalanceCard";
import { PhoneCard } from "../components/PhoneCard";

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
  const [showAllEquipment, setShowAllEquipment] = React.useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = React.useState<boolean>(false);

  // Handle adding new student
  const handleAddStudent = (studentData: { firstName: string; lastName: string; customerName: string; birthDate: string; gender: string }) => {
    // TODO: Implement actual student creation logic
    // For now, just add to mock data
    const newStudent = {
      name: `${studentData.firstName} ${studentData.lastName}`,
      birthDate: studentData.birthDate,
      customerName: studentData.customerName,
    };
    setStudentData(prev => [...prev, newStudent]);
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

        // Load tab data (mock data for now)
        setStudentData(mockCustomerTabData.studentData);
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

  return (
    <div className="space-y-4 bg-white px-2 sm:px-3">
      {/* Breadcrumb header (shadcn) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md px-2 sm:px-3 py-2">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); router.push("customers"); }}>Customers</BreadcrumbLink>
            </BreadcrumbItem>
            <SlashIcon className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[70vw] sm:max-w-none">
                {loading ? "Loading..." : customer ? `${customer.firstName} ${customer.lastName}` : id}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-8 sm:w-8" aria-label="Customer actions">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>Receive Payment</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Print Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Email Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>A/R Report Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Items Purchased by Category</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Notify Via Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => {}}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Payment History Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        <LessonsDueCard 
          value={formatCurrency(821.52)} 
          loading={loading} 
        />
        <OutstandingInvoiceCard 
          value={formatCurrency(20741.84)} 
          loading={loading} 
        />
        <CreditsCard 
          value={formatCurrency(0.00)} 
          loading={loading} 
        />
        <BalanceCard 
          value={customer ? formatCurrency(parseFloat(customer.balance.replace(/[^0-9.-]/g, '')) || 0) : formatCurrency(0)} 
          loading={loading} 
        />
      </div>

      {/* Details and Email Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Details Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Details</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueDisplay 
              label="Name" 
              value={loading ? "..." : customer ? `${customer.firstName} ${customer.lastName}` : "N/A"} 
            />
            <KeyValueDisplay label="Role" value="Customer" />
            <KeyValueDisplay label="Referral Source" value="Drive By" />
            <KeyValueDisplay label="Status" value="Active" />
          </CardContent>
        </Card>

        {/* Email Card */}
        <EmailCard 
          emails={emails}
          onAddClick={() => {}}
          onSave={setEmails}
        />
      </div>

      {/* Tables and Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Main Tables */}
        <div className="space-y-4">
          <TableCard 
            title="Invoices"
            data={invoiceData} 
            columns={CUSTOMER_TABLE_CONFIGS.invoices.columns}
            loading={loading}
            onAdd={() => {}}
            size={CUSTOMER_TABLE_CONFIGS.invoices.size}
            variant={CUSTOMER_TABLE_CONFIGS.invoices.variant}
            enableSorting={CUSTOMER_TABLE_CONFIGS.invoices.enableSorting}
            enableExport={CUSTOMER_TABLE_CONFIGS.invoices.enableExport}
            enablePrint={CUSTOMER_TABLE_CONFIGS.invoices.enablePrint}
            enableSearch={CUSTOMER_TABLE_CONFIGS.invoices.enableSearch}
            enableFilter={CUSTOMER_TABLE_CONFIGS.invoices.enableFilter}
            enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.invoices.enableRowsPerPage}
            iconType="chevron"
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
            iconType="chevron"
          />
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-4">
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
          
          <InfoCardWithAction title="Payment Preference">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">No payment preferences set</div>
            </div>
          </InfoCardWithAction>
        </div>
      </div>

      {/* Full Width Tables Below Outstanding Invoices */}
      <div className="space-y-4">
        <TableCard 
          title="Equipment Rentals"
          data={equipmentRentalData} 
          columns={CUSTOMER_TABLE_CONFIGS.equipmentRentals.columns}
          loading={loading}
          onAdd={() => {}}
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
          onAdd={() => {}}
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
                  loading={loading}
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
      />
    </div>
  );
}