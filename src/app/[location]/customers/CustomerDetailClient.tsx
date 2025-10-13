"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { getCustomerById, CustomerRow } from "./customers.api";
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
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { InfoCardWithAction } from "@/components/InfoCardWithAction";

interface CustomerDetailClientProps {
  location: string;
  id: string;
}

interface InvoiceData {
  id: string;
  date: string;
  status: string;
  total: number;
  balance: number;
}

interface OutstandingInvoiceData {
  id: string;
  date: string;
  amount: number;
  payments: number;
  balanceDue: number;
}

interface EquipmentRentalData {
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  depositAmount: number;
  equipmentReturned: string;
  equipmentReturnedDate: string;
}

interface RecurringPaymentData {
  toBeEnteredOn: string;
  nextPaymentDate: string;
  frequency: string;
  expiryDate: string;
  method: string;
  amount: number;
}

interface PrivateLessonDueData {
  lessonDate: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
}

interface GroupLessonDueData {
  lessonDate: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
}

interface PaymentData {
  date: string;
  notes: string;
  amount: number;
  used: number;
  remaining: number;
}

export function CustomerDetailClient({ location, id }: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Sample invoice data - replace with actual API call
  const invoiceData: InvoiceData[] = [
    { id: "I-92268", date: "Oct 09, 2025", status: "Owing", total: 32.50, balance: 32.50 },
    { id: "I-92031", date: "Oct 06, 2025", status: "Owing", total: 31.53, balance: 31.53 },
    { id: "I-92030", date: "Oct 04, 2025", status: "Owing", total: 27.03, balance: 27.03 },
    { id: "I-92000", date: "Oct 03, 2025", status: "Owing", total: 28.75, balance: 28.75 },
    { id: "I-91911", date: "Oct 02, 2025", status: "Owing", total: 65.00, balance: 65.00 },
    { id: "I-91833", date: "Oct 01, 2025", status: "Owing", total: 45.25, balance: 45.25 },
    { id: "I-91853", date: "Sep 30, 2025", status: "Owing", total: 38.90, balance: 38.90 },
    { id: "I-91834", date: "Sep 29, 2025", status: "Owing", total: 52.15, balance: 52.15 },
    { id: "I-91831", date: "Sep 28, 2025", status: "Owing", total: 41.75, balance: 41.75 },
    { id: "I-91772", date: "Sep 27, 2025", status: "Owing", total: 33.40, balance: 33.40 },
  ];

  // Sample outstanding invoices data - replace with actual API call
  const outstandingInvoiceData: OutstandingInvoiceData[] = [
    { id: "I-33387", date: "Nov 07, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-33767", date: "Nov 14, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-34076", date: "Nov 21, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-34412", date: "Nov 28, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-34789", date: "Dec 05, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-35123", date: "Dec 12, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-35456", date: "Dec 19, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-35789", date: "Dec 26, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-36123", date: "Jan 02, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-36456", date: "Jan 09, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-36789", date: "Jan 16, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-37123", date: "Jan 23, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-37456", date: "Jan 30, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-37789", date: "Feb 06, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-38123", date: "Feb 13, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-38456", date: "Feb 20, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    { id: "I-38789", date: "Feb 27, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
  ];

  // Sample equipment rentals data - replace with actual API call
  const equipmentRentalData: EquipmentRentalData[] = [
    // Empty for now as shown in the image
  ];

  // Sample recurring payments data - replace with actual API call
  const recurringPaymentData: RecurringPaymentData[] = [
    // Empty for now as shown in the image
  ];

  // Sample private lesson due data - replace with actual API call
  const privateLessonDueData: PrivateLessonDueData[] = [
    { lessonDate: "Oct 13, 2025", student: "321123 123", program: "Ukulele", teacher: "Art Tatum", amount: 31.53 },
    { lessonDate: "Oct 20, 2025", student: "321123 123", program: "xPiano Core", teacher: "Alexander Hamilton", amount: 28.75 },
    { lessonDate: "Oct 27, 2025", student: "321123 123", program: "Guitar Core", teacher: "Amy Macaluso", amount: 32.50 },
    { lessonDate: "Oct 10, 2025", student: "321123 123", program: "xTrombone", teacher: "Daniel Clain", amount: 27.03 },
    { lessonDate: "Oct 17, 2025", student: "321123 123", program: "xGuitar Contemporary", teacher: "tes123 12345", amount: 31.53 },
    { lessonDate: "Oct 24, 2025", student: "321123 123", program: "xPiano Hybrid", teacher: "Art Tatum", amount: 28.75 },
    { lessonDate: "Oct 31, 2025", student: "321123 123", program: "Drums Core", teacher: "Alexander Hamilton", amount: 32.50 },
    { lessonDate: "Nov 07, 2025", student: "321123 123", program: "Ukulele", teacher: "Amy Macaluso", amount: 27.03 },
    { lessonDate: "Nov 14, 2025", student: "321123 123", program: "xPiano Core", teacher: "Daniel Clain", amount: 31.53 },
    { lessonDate: "Nov 21, 2025", student: "321123 123", program: "Guitar Core", teacher: "tes123 12345", amount: 28.75 },
    { lessonDate: "Nov 28, 2025", student: "321123 123", program: "xTrombone", teacher: "Art Tatum", amount: 32.50 },
    { lessonDate: "Dec 05, 2025", student: "321123 123", program: "xGuitar Contemporary", teacher: "Alexander Hamilton", amount: 27.03 },
    { lessonDate: "Dec 12, 2025", student: "321123 123", program: "xPiano Hybrid", teacher: "Amy Macaluso", amount: 31.53 },
    { lessonDate: "Dec 19, 2025", student: "321123 123", program: "Drums Core", teacher: "Daniel Clain", amount: 28.75 },
    { lessonDate: "Dec 26, 2025", student: "321123 123", program: "Ukulele", teacher: "tes123 12345", amount: 32.50 },
    { lessonDate: "Jan 02, 2026", student: "321123 123", program: "xPiano Core", teacher: "Art Tatum", amount: 27.03 },
    { lessonDate: "Jan 09, 2026", student: "321123 123", program: "Guitar Core", teacher: "Alexander Hamilton", amount: 31.53 },
    { lessonDate: "Jan 16, 2026", student: "321123 123", program: "xTrombone", teacher: "Amy Macaluso", amount: 28.75 },
    { lessonDate: "Jan 23, 2026", student: "321123 123", program: "xGuitar Contemporary", teacher: "Daniel Clain", amount: 32.50 },
    { lessonDate: "Jan 30, 2026", student: "321123 123", program: "xPiano Hybrid", teacher: "tes123 12345", amount: 27.03 },
    { lessonDate: "Feb 06, 2026", student: "321123 123", program: "Drums Core", teacher: "Art Tatum", amount: 31.53 },
    { lessonDate: "Feb 13, 2026", student: "321123 123", program: "Ukulele", teacher: "Alexander Hamilton", amount: 28.75 },
    { lessonDate: "Feb 20, 2026", student: "321123 123", program: "xPiano Core", teacher: "Amy Macaluso", amount: 32.50 },
    { lessonDate: "Feb 27, 2026", student: "321123 123", program: "Guitar Core", teacher: "Daniel Clain", amount: 27.03 },
    { lessonDate: "Mar 06, 2026", student: "321123 123", program: "xTrombone", teacher: "tes123 12345", amount: 31.53 },
  ];

  // Sample group lesson due data - replace with actual API call (empty as shown in image)
  const groupLessonDueData: GroupLessonDueData[] = [
    // Empty for now as shown in the image
  ];

  // Sample payments data - replace with actual API call
  const paymentData: PaymentData[] = [
    { date: "Mar 08, 2024", notes: "", amount: 3367.96, used: 3367.96, remaining: 0.00 },
    { date: "Mar 08, 2024", notes: "", amount: 122.50, used: 122.50, remaining: 0.00 },
    { date: "Nov 13, 2023", notes: "", amount: 18.45, used: 18.45, remaining: 0.00 },
    { date: "Oct 15, 2023", notes: "", amount: 13890.21, used: 13890.21, remaining: 0.00 },
    { date: "Sep 09, 2022", notes: "", amount: 60.27, used: 60.27, remaining: 0.00 },
    { date: "Sep 09, 2022", notes: "", amount: 4621.04, used: 4621.04, remaining: 0.00 },
  ];

  // Invoice table columns
  const invoiceColumns: ColumnDef<InvoiceData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium ">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("total"))}</div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("balance"))}</div>
      ),
    },
  ];

  // Outstanding invoices table columns
  const outstandingInvoiceColumns: ColumnDef<OutstandingInvoiceData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>
      ),
    },
    {
      accessorKey: "payments",
      header: "Payments",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("payments"))}</div>
      ),
    },
    {
      accessorKey: "balanceDue",
      header: "Balance Due",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("balanceDue"))}</div>
      ),
    },
  ];

  // Equipment rentals table columns
  const equipmentRentalColumns: ColumnDef<EquipmentRentalData>[] = [
    {
      accessorKey: "student",
      header: "Student",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "returnDate",
      header: "Return Date",
    },
    {
      accessorKey: "rentalTerm",
      header: "Rental Term",
    },
    {
      accessorKey: "depositAmount",
      header: "Deposit Amount",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("depositAmount"))}</div>
      ),
    },
    {
      accessorKey: "equipmentReturned",
      header: "Equipment Returned",
    },
    {
      accessorKey: "equipmentReturnedDate",
      header: "Equipment Returned Date",
    },
  ];

  // Recurring payments table columns
  const recurringPaymentColumns: ColumnDef<RecurringPaymentData>[] = [
    {
      accessorKey: "toBeEnteredOn",
      header: "To Be Entered On",
    },
    {
      accessorKey: "nextPaymentDate",
      header: "Next Payment Date",
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
    },
    {
      accessorKey: "method",
      header: "Method",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>
      ),
    },
  ];

  // Private lesson due table columns
  const privateLessonDueColumns: ColumnDef<PrivateLessonDueData>[] = [
    {
      accessorKey: "lessonDate",
      header: "Lesson Date",
    },
    {
      accessorKey: "student",
      header: "Student",
    },
    {
      accessorKey: "program",
      header: "Program",
    },
    {
      accessorKey: "teacher",
      header: "Teacher",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        // Handle both regular rows and footer rows
        const value = row.getValue ? (row.getValue("amount") as number) : (row.original as PrivateLessonDueData).amount;
        return (
          <div className="text-right">{formatCurrency(value)}</div>
        );
      },
    },
  ];

  // Calculate total for footer
  const privateLessonDueTotal = privateLessonDueData.reduce((sum, item) => sum + item.amount, 0);
  const privateLessonDueFooterRow: PrivateLessonDueData = {
    lessonDate: "Total:",
    student: "",
    program: "",
    teacher: "",
    amount: privateLessonDueTotal,
  };

  // Group lesson due table columns
  const groupLessonDueColumns: ColumnDef<GroupLessonDueData>[] = [
    {
      accessorKey: "lessonDate",
      header: "Lesson Date",
    },
    {
      accessorKey: "student",
      header: "Student",
    },
    {
      accessorKey: "program",
      header: "Program",
    },
    {
      accessorKey: "teacher",
      header: "Teacher",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        // Handle both regular rows and footer rows
        const value = row.getValue ? (row.getValue("amount") as number) : (row.original as GroupLessonDueData).amount;
        return (
          <div className="text-right">{formatCurrency(value)}</div>
        );
      },
    },
  ];

  // Payments table columns
  const paymentColumns: ColumnDef<PaymentData>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        // Handle both regular rows and footer rows
        const value = row.getValue ? (row.getValue("amount") as number) : (row.original as PaymentData).amount;
        // Don't show amount in footer row
        if (value === 0 && (row.original as PaymentData).date === "") {
          return <div className="text-right"></div>;
        }
        return (
          <div className="text-right">{formatCurrency(value)}</div>
        );
      },
    },
    {
      accessorKey: "used",
      header: "Used",
      cell: ({ row }) => {
        // Handle both regular rows and footer rows
        const value = row.getValue ? (row.getValue("used") as number) : (row.original as PaymentData).used;
        // Don't show used in footer row
        if (value === 0 && (row.original as PaymentData).date === "") {
          return <div className="text-right"></div>;
        }
        return (
          <div className="text-right">{formatCurrency(value)}</div>
        );
      },
    },
    {
      accessorKey: "remaining",
      header: "Remaining",
      cell: ({ row }) => {
        // Handle both regular rows and footer rows
        const value = row.getValue ? (row.getValue("remaining") as number) : (row.original as PaymentData).remaining;
        return (
          <div className="text-right">{formatCurrency(value)}</div>
        );
      },
    },
  ];

  // Calculate totals for payments footer (only remaining column)
  const paymentRemainingTotal = paymentData.reduce((sum, item) => sum + item.remaining, 0);
  const paymentFooterRow: PaymentData = {
    date: "",
    notes: "",
    amount: 0,
    used: 0,
    remaining: paymentRemainingTotal,
  };

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCustomerById(location, Number(id));
      setCustomer(data);
      setLoading(false);
    };
    load();
  }, [location, id]);88

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
          value={customer ? formatCurrency(customer.balance) : formatCurrency(0)} 
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
        <InfoCard title="Email">
          <div className="space-y-2">
            <KeyValueDisplay 
              label="Home" 
              value={loading ? "..." : customer ? customer.email : "N/A"} 
            />
            <KeyValueDisplay label="Home" value="sample1@example.com" />
          </div>
        </InfoCard>
      </div>

      {/* Invoices and Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Invoice Cards */}
        <div className="space-y-4">
          {/* Invoices Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Invoices</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={invoiceData}
                columns={invoiceColumns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
              <div className="flex justify-end mt-3">
                <Button variant="link" className="text-blue-600 p-0 h-auto">
                  Show More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Outstanding Invoices</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={outstandingInvoiceData}
                columns={outstandingInvoiceColumns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
              <div className="flex justify-end mt-3">
                <Button variant="link" className="text-blue-600 p-0 h-auto">
                  Show More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Rentals Card */}
          
        </div>

        {/* Right Side Cards */}
        <div className="space-y-4">
          <InfoCardWithAction title="Phone">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">No phone numbers added</div>
            </div>
          </InfoCardWithAction>
          
          <InfoCardWithAction title="Addresses">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">No addresses added</div>
            </div>
          </InfoCardWithAction>
          
          <InfoCardWithAction title="Discount (%)">
            <div className="space-y-2">
              <span className="font-semibold">Discount</span>
            </div>
          </InfoCardWithAction>
          
          <InfoCardWithAction title="Opening Balance">
            <KeyValueDisplay 
              label="Amount" 
              value={formatCurrency(0)} 
            />
          </InfoCardWithAction>
          
          <InfoCardWithAction title="Payment Preference">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">No payment preferences set</div>
            </div>
          </InfoCardWithAction>
        </div>

        
      </div>
      <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Equipment Rentals</CardTitle>
               <div className="flex items-center gap-2">
                 <div className="flex items-center space-x-2">
                   <input 
                     type="checkbox" 
                     id="show-all-equipment" 
                     className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   />
                   <label htmlFor="show-all-equipment" className="text-sm font-medium">
                     Show All
                   </label>
                 </div>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={equipmentRentalData}
                columns={equipmentRentalColumns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
            </CardContent>
          </Card>

          {/* Recurring Payments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Recurring Payments</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={recurringPaymentData}
                columns={recurringPaymentColumns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
            </CardContent>
          </Card>

          {/* Private Lesson Due Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Private Lesson Due</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={privateLessonDueData}
                columns={privateLessonDueColumns}
                footerRow={privateLessonDueFooterRow}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
            </CardContent>
          </Card>

          {/* Group Lesson Due Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Group Lesson Due</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={groupLessonDueData}
                columns={groupLessonDueColumns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Payments</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CustomTable
                data={paymentData}
                columns={paymentColumns}
                footerRow={paymentFooterRow}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                enableRowsPerPage={false}
                className="border-0 w-full"
              />
            </CardContent>
          </Card>

    </div>
  );
}



