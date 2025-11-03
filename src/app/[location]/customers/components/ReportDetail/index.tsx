"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getCustomerById, getCustomerOutstandingInvoices, getCustomerPayments } from "../../customers.api";

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
  const [loading, setLoading] = React.useState(true);
  const [, setCustomer] = React.useState<{ firstName: string; lastName: string } | null>(null);
  const [outstandingInvoices, setOutstandingInvoices] = React.useState<OutstandingInvoice[]>([]);
  const [prepaidLessons, setPrepaidLessons] = React.useState<PrepaidLesson[]>([]);
  const [unusedCredits, setUnusedCredits] = React.useState<UnusedCredit[]>([]);

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

        // Load outstanding invoices
        const outstandingData = await getCustomerOutstandingInvoices(location, Number(customerId), 1, 99999);
        const formattedOutstanding = outstandingData.data.map(invoice => ({
          id: invoice.id,
          date: invoice.date,
          owing: invoice.balanceDue
        }));
        setOutstandingInvoices(formattedOutstanding);

        // Load payments data for prepaid lessons and unused credits
        await getCustomerPayments(location, Number(customerId));
        
        // Mock prepaid lessons data (replace with actual API call)
        const mockPrepaidLessons: PrepaidLesson[] = [
          { id: "L-4799933", lessonDate: "Oct 23, 2025", status: "Scheduled", paid: 28.75 },
          { id: "L-4798557", lessonDate: "Nov 06, 2025", status: "Scheduled", paid: 28.75 },
          { id: "L-4798558", lessonDate: "Nov 13, 2025", status: "Scheduled", paid: 28.75 },
          { id: "L-4798559", lessonDate: "Nov 20, 2025", status: "Scheduled", paid: 28.75 },
          { id: "L-4798560", lessonDate: "Nov 27, 2025", status: "Scheduled", paid: 28.75 }
        ];
        setPrepaidLessons(mockPrepaidLessons);

        // Mock unused credits data (replace with actual API call)
        const mockUnusedCredits: UnusedCredit[] = [
          { id: "", date: "2025-10-23 00:00:00", amount: 100.00 }
        ];
        setUnusedCredits(mockUnusedCredits);

      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, customerId]);

  // Calculate totals
  const outstandingTotal = outstandingInvoices.reduce((sum, invoice) => sum + invoice.owing, 0);
  const prepaidTotal = prepaidLessons.reduce((sum, lesson) => sum + lesson.paid, 0);
  const unusedTotal = unusedCredits.reduce((sum, credit) => sum + credit.amount, 0);
 

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
        
          <p className="text-sm text-gray-600">Customers / {customerName} / Account</p>
        </div>
        
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
            enableRowsPerPage={false}
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
            enableRowsPerPage={false}
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
            enableRowsPerPage={false}
            footerRow={{
              id: "",
              date: "",
              amount: unusedTotal
            }}
            isLoading={loading}
          />
          <div className="mt-4 text-right text-lg font-bold text-gray-900">
            {formatCurrency(14.8)}
          </div>
        </CardContent>
      </Card>

        
      </div>
  );
}