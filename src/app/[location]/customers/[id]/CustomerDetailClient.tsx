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
        setStudentData([
          { name: "321123 123", birthDate: "Jan 06, 2005", customerName: "123 123" },
        ]);
        setEnrolmentData([
          { studentName: "321123 123", programName: "Ukulele", teacherName: "Art Tatum", day: "Monday", fromTime: "08:00 AM", duration: "00:30", startDate: "Jan 31, 2022", renewalDate: "Jan 26, 2026" },
          { studentName: "321123 123", programName: "xPiano Core", teacherName: "Alexander Hamilton", day: "Friday", fromTime: "09:00 AM", duration: "00:30", startDate: "Apr 08, 2022", renewalDate: "Apr 24, 2026" },
          { studentName: "321123 123", programName: "Guitar Core", teacherName: "Daniel Clain", day: "Thursday", fromTime: "10:15 AM", duration: "00:30", startDate: "Jun 03, 2022", renewalDate: "May 22, 2026" },
          { studentName: "321123 123", programName: "Drums Core", teacherName: "Amy Macaluso", day: "Saturday", fromTime: "11:15 AM", duration: "00:30", startDate: "Jul 01, 2022", renewalDate: "Jun 26, 2026" },
          { studentName: "321123 123", programName: "xTrombone", teacherName: "tes123 12345", day: "Saturday", fromTime: "11:30 AM", duration: "00:30", startDate: "Apr 28, 2022", renewalDate: "Sep 24, 2026" },
          { studentName: "321123 123", programName: "xGuitar Contemporary", teacherName: "Art Tatum", day: "Friday", fromTime: "10:45 AM", duration: "00:30", startDate: "May 07, 2022", renewalDate: "Dec 26, 2026" },
          { studentName: "321123 123", programName: "xPiano Hybrid", teacherName: "Alexander Hamilton", day: "Monday", fromTime: "09:30 AM", duration: "00:30", startDate: "Dec 30, 2022", renewalDate: "Mar 26, 2027" },
          { studentName: "321123 123", programName: "Ukulele", teacherName: "Daniel Clain", day: "Saturday", fromTime: "12:00 PM", duration: "00:30", startDate: "Mar 20, 2023", renewalDate: "May 24, 2027" },
        ]);

        setPrivateLessonData([
          { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 13, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
          { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 20, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
          { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 27, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xGuitar Contemporary", date: "Oct 13, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 27.03, owing: 27.03 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Hybrid", date: "Oct 13, 2025 @ 12:00 PM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Drums Core", date: "Oct 16, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Core", date: "Oct 17, 2025 @ 09:00 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Core", date: "Oct 17, 2025 @ 09:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Guitar Core", date: "Oct 17, 2025 @ 10:15 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Guitar Core", date: "Oct 17, 2025 @ 11:15 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xTrombone", date: "Oct 18, 2025 @ 10:45 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xGuitar Contemporary", date: "Oct 20, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 27.03, owing: 27.03 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Hybrid", date: "Oct 20, 2025 @ 12:00 PM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
          { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Drums Core", date: "Oct 23, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
        ]);

        setGroupLessonData([]);
        setProformaInvoiceData([]);
        setCommentData([]);
        setHistoryData([
          { message: "On Sep 9, 2022, at 12:15 AM, seng Added new payment of $60.27 for 123 123" },
          { message: "On Sep 9, 2022, at 12:53 AM, seng Added new payment of $4621.04 for 123 123" },
          { message: "On Oct 15, 2023, at 07:00 PM, Prateek Panwar Added new payment of $13890.21 for 123 123" },
          { message: "On Nov 13, 2023, at 02:51 PM, Giancarlo Macaluso Added new payment of $18.45 for 123 123" },
          { message: "On Mar 8, 2024, at 10:43 AM, Prateek Panwar Added new payment of $3367.96 for 123 123" },
          { message: "On Mar 8, 2024, at 10:45 AM, Prateek Panwar Added new payment of $122.50 for 123 123" },
        ]);
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
              <DropdownMenuItem onClick={() => console.log('Receive Payment')}>Receive Payment</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Print Statement')}>Print Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Email Statement')}>Email Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('A/R Report Detail')}>A/R Report Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Items Purchased by Category')}>Items Purchased by Category</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Notify Via Email')}>Notify Via Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => console.log('Delete')}>Delete</DropdownMenuItem>
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
          onAddClick={() => console.log('Add email clicked')}
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
            onAdd={() => console.log('Add invoice')}
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
            onAdd={() => console.log('Add outstanding invoice')}
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
          onAdd={() => console.log('Add equipment rental')}
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
          onAdd={() => console.log('Add recurring payment')}
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
          onAdd={() => console.log('Add private lesson')}
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
          onAdd={() => console.log('Add group lesson')}
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
          onAdd={() => console.log('Add payment')}
          size={CUSTOMER_TABLE_CONFIGS.payments.size}
          variant={CUSTOMER_TABLE_CONFIGS.payments.variant}
          enableSorting={CUSTOMER_TABLE_CONFIGS.payments.enableSorting}
          enableExport={CUSTOMER_TABLE_CONFIGS.payments.enableExport}
          enablePrint={CUSTOMER_TABLE_CONFIGS.payments.enablePrint}
          enableSearch={CUSTOMER_TABLE_CONFIGS.payments.enableSearch}
          enableFilter={CUSTOMER_TABLE_CONFIGS.payments.enableFilter}
          enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.payments.enableRowsPerPage}
          iconType="chevron"
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
                  onAdd={() => console.log(`Add ${config.title.toLowerCase()}`)}
                  emptyState={config.emptyState}
                  hasTable={config.hasTable}
                  bottomContent={commentsBottomContent}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}