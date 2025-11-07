"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getCustomerById } from "../../customers.api";
import { getReportOutstandingInvoices, getReportPrepaidLessons, getReportAvailableCredits, OutstandingInvoiceRaw, PrepaidLessonRaw, AvailableCreditRaw } from "./report-detail-api";
import { useRouter } from "next/navigation";
import { DetailHeader } from "@/components/DetailHeader";

// Data interfaces
interface OutstandingInvoice {
  id: string;
  date: string;
  owing: number;
}

interface PrepaidLesson {
  id: string;
  lessonDate: string;
  status: string;
  paid: number;
}

interface UnusedCredit {
  id: string;
  date: string;
  amount: number;
}

interface ReportDetailProps {
  customerId: string;
  customerName: string;
  location: string;
}

export function ReportDetail({ customerId, customerName, location }: ReportDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [, setCustomer] = React.useState<{ firstName: string; lastName: string } | null>(null);
  const [outstandingInvoices, setOutstandingInvoices] = React.useState<OutstandingInvoice[]>([]);
  const [prepaidLessons, setPrepaidLessons] = React.useState<PrepaidLesson[]>([]);
  const [unusedCredits, setUnusedCredits] = React.useState<UnusedCredit[]>([]);

  // Pagination state per table
  const [outstandingPage, setOutstandingPage] = React.useState(1);
  const [outstandingLimit, setOutstandingLimit] = React.useState(10);
  const [outstandingMeta, setOutstandingMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [prepaidPage, setPrepaidPage] = React.useState(1);
  const [prepaidLimit, setPrepaidLimit] = React.useState(10);
  const [prepaidMeta, setPrepaidMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [creditsPage, setCreditsPage] = React.useState(1);
  const [creditsLimit, setCreditsLimit] = React.useState(10);
  const [creditsMeta, setCreditsMeta] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Column definitions for Outstanding Invoices
  const outstandingInvoicesColumns: ColumnDef<OutstandingInvoice>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date,
    },
    {
      accessorKey: "owing",
      header: "Owing",
      cell: ({ row }) => {
        const amount = row.original.owing;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  // Column definitions for Prepaid Lessons
  const prepaidLessonsColumns: ColumnDef<PrepaidLesson>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "lessonDate",
      header: "Lesson Date",
      cell: ({ row }) => row.original.lessonDate,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => 
        
          row.original.status,
        
      
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: ({ row }) => {
        const amount = row.original.paid;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  // Column definitions for Unused Credits
  const unusedCreditsColumns: ColumnDef<UnusedCredit>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load customer data
        const customerData = await getCustomerById(location, Number(customerId));
        setCustomer(customerData);

        // Load outstanding invoices (Report Detail mapping)
        const outstanding = await getReportOutstandingInvoices(
          location,
          Number(customerId),
          outstandingPage,
          outstandingLimit
        );
        const formattedOutstanding = (outstanding.data || []).map((row: OutstandingInvoiceRaw) => ({
          id: row.id,
          date: row.date,
          owing: typeof row.balanceDue === 'number'
            ? row.balanceDue
            : parseCurrencyToNumber(String(row.balanceDue ?? row.owing ?? 0))
        }));
        setOutstandingInvoices(formattedOutstanding);
        setOutstandingMeta(outstanding.pagination);

        // Load prepaid lessons
        const prepaid = await getReportPrepaidLessons(
          location,
          Number(customerId),
          prepaidPage,
          prepaidLimit
        );
        const formattedPrepaid = (prepaid.data || []).map((row: PrepaidLessonRaw) => ({
          id: String(row.lessonId),
          lessonDate: row.lessonDate,
          status: row.status,
          paid: parseCurrencyToNumber(row.paid)
        }));
        setPrepaidLessons(formattedPrepaid);
        setPrepaidMeta(prepaid.pagination);

        // Load available credits (unused credits)
        const credits = await getReportAvailableCredits(
          location,
          Number(customerId),
          creditsPage,
          creditsLimit
        );
        const formattedCredits = (credits.data || []).map((row: AvailableCreditRaw) => ({
          id: row.id,
          date: row.date,
          amount: parseCurrencyToNumber(row.amount)
        }));
        setUnusedCredits(formattedCredits);
        setCreditsMeta(credits.pagination);

      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, customerId, outstandingPage, outstandingLimit, prepaidPage, prepaidLimit, creditsPage, creditsLimit]);

  // Calculate totals
  const outstandingTotal = outstandingInvoices.reduce((sum, invoice) => sum + invoice.owing, 0);
  const prepaidTotal = prepaidLessons.reduce((sum, lesson) => sum + lesson.paid, 0);
  const unusedTotal = unusedCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const netTotal = outstandingTotal - (prepaidTotal + unusedTotal);
 

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  const parseCurrencyToNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading report data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      {/* Header */}
      <div className="mb-6">
        <DetailHeader
          breadcrumbItems={[
            { label: "Customers", onClick: () => router.push(`/${location}/customers`) },
            { label: customerName, onClick: () => router.push(`/${location}/customers/${customerId}`) },
          ]}
          currentPageTitle="Account"
          showActions={false}
          actionMenuGroups={[]}
        />
      </div>

      {/* Outstanding Invoices Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Outstanding Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={outstandingInvoicesColumns}
            data={outstandingInvoices}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={true}
            onPrint={handlePrint}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={outstandingLimit}
            onRowsPerPageChange={(n) => { setOutstandingLimit(n); setOutstandingPage(1); }}
            serverSidePagination={outstandingMeta}
            onServerSidePageChange={(p) => setOutstandingPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "Total:",
              date: "",
              owing: outstandingTotal
            }}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Prepaid Lessons Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Prepaid Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={prepaidLessonsColumns}
            data={prepaidLessons}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={true}
            onPrint={handlePrint}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={prepaidLimit}
            onRowsPerPageChange={(n) => { setPrepaidLimit(n); setPrepaidPage(1); }}
            serverSidePagination={prepaidMeta}
            onServerSidePageChange={(p) => setPrepaidPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "Total:",
              lessonDate: "",
              status: "",
              paid: prepaidTotal
            }}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Unused Credits Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Unused Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={unusedCreditsColumns}
            data={unusedCredits}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={true}
            onPrint={handlePrint}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={true}
            rowsPerPage={creditsLimit}
            onRowsPerPageChange={(n) => { setCreditsLimit(n); setCreditsPage(1); }}
            serverSidePagination={creditsMeta}
            onServerSidePageChange={(p) => setCreditsPage(p)}
            hideRecordCount={false}
            footerRow={{
              id: "",
              date: "",
              amount: unusedTotal
            }}
            isLoading={loading}
          />
          <div className="mt-4 text-right text-lg font-bold text-gray-900">
            {formatCurrency(netTotal)}
          </div>
        </CardContent>
      </Card>

        
      </div>
  );
}