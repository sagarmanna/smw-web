/* eslint-disable @typescript-eslint/no-explicit-any */
// FinancialSummaryClient.tsx 

"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card } from "@/components/ui/card";
import { getFinancialSummary, FinancialSummaryData } from "./financial-summary.api";
import { useExportableData } from "@/hooks/useExportableData";

interface FinancialSummaryClientProps {
  location: string;
}

const formatCurrency = (value: number) => `${Math.abs(value).toFixed(2)}${value < 0 ? ' CR' : ''}`;

export function FinancialSummaryClient({ location }: FinancialSummaryClientProps) {
  const [data, setData] = React.useState<FinancialSummaryData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    return { from: now, to: now };
  });

  // Individual pagination states for each table
  const [paidGroupPage, setPaidGroupPage] = React.useState(1);
  const [paidGroupLimit, setPaidGroupLimit] = React.useState(10);
  
  const [prepaidPrivatePage, setPrepaidPrivatePage] = React.useState(1);
  const [prepaidPrivateLimit, setPrepaidPrivateLimit] = React.useState(10);
  
  const [paidPrivatePage, setPaidPrivatePage] = React.useState(1);
  const [paidPrivateLimit, setPaidPrivateLimit] = React.useState(10);
  
  const [activeInvoicesPage, setActiveInvoicesPage] = React.useState(1);
  const [activeInvoicesLimit, setActiveInvoicesLimit] = React.useState(10);
  
  const [inactiveInvoicesPage, setInactiveInvoicesPage] = React.useState(1);
  const [inactiveInvoicesLimit, setInactiveInvoicesLimit] = React.useState(10);
  
  const [activeCreditPage, setActiveCreditPage] = React.useState(1);
  const [activeCreditLimit, setActiveCreditLimit] = React.useState(10);
  
  const [inactiveCreditPage, setInactiveCreditPage] = React.useState(1);
  const [inactiveCreditLimit, setInactiveCreditLimit] = React.useState(10);

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);
      const result = await getFinancialSummary(location, startDate, endDate);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to fetch financial summary");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [location, range.from, range.to]);

  React.useEffect(() => {
    load();
  }, [load]);


  // Column definitions for each table (moved before conditional returns)
  const groupLessonColumns = [
    { accessorKey: "lessonId", header: "Lesson ID" },
    { accessorKey: "studentName", header: "Student Name" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "duration", header: "Duration" },
    { 
      accessorKey: "amount", 
      header: "Amount", 
      cell: ({ row }: any) => formatCurrency(row.original.amount),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    { 
      accessorKey: "paidAmount", 
      header: "Paid Amount", 
      cell: ({ row }: any) => formatCurrency(row.original.paidAmount),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    { 
      accessorKey: "balance", 
      header: "Balance", 
      cell: ({ row }: any) => formatCurrency(row.original.balance),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  const invoiceColumns = [
    { accessorKey: "invoiceId", header: "Invoice ID" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "date", header: "Date" },
    { 
      accessorKey: "amount", 
      header: "Amount", 
      cell: ({ row }: any) => formatCurrency(row.original.amount),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    { 
      accessorKey: "paidAmount", 
      header: "Paid Amount", 
      cell: ({ row }: any) => formatCurrency(row.original.paidAmount),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    { 
      accessorKey: "balance", 
      header: "Balance", 
      cell: ({ row }: any) => formatCurrency(row.original.balance),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  const creditColumns = [
    { accessorKey: "customerId", header: "Customer ID" },
    { accessorKey: "customerName", header: "Customer Name" },
    { 
      accessorKey: "balance", 
      header: "Balance", 
      cell: ({ row }: any) => formatCurrency(row.original.balance),
      meta: {
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  // Export hooks for each table (must be called before any conditional returns)
  const paidGroupExport = useExportableData({
    reportTitle: 'Paid Unscheduled Group Lessons',
    columns: groupLessonColumns,
    data: data?.paidUnscheduledGroupLessons || [],
  });

  const prepaidPrivateExport = useExportableData({
    reportTitle: 'Prepaid Future Private Lessons',
    columns: groupLessonColumns,
    data: data?.prepaidFuturePrivateLessons || [],
  });

  const paidPrivateExport = useExportableData({
    reportTitle: 'Paid Unscheduled Private Lessons',
    columns: groupLessonColumns,
    data: data?.paidUnscheduledPrivateLessons || [],
  });

  const activeInvoicesExport = useExportableData({
    reportTitle: 'Active Outstanding Invoices',
    columns: invoiceColumns,
    data: data?.activeOutstandingInvoices || [],
  });

  const inactiveInvoicesExport = useExportableData({
    reportTitle: 'Inactive Outstanding Invoices',
    columns: invoiceColumns,
    data: data?.inactiveOutstandingInvoices || [],
  });

  const activeCreditExport = useExportableData({
    reportTitle: 'Active Customers With Credit',
    columns: creditColumns,
    data: data?.activeCustomersWithCredit || [],
  });

  const inactiveCreditExport = useExportableData({
    reportTitle: 'Inactive Customers With Credit',
    columns: creditColumns,
    data: data?.inactiveCustomersWithCredit || [],
  });

  // Conditional returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading financial summary..." className="text-center" />
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  // Pagination helper function
  const getPaginatedData = <T,>(data: T[], page: number, limit: number): T[] => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex);
  };

  // Conditional returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading financial summary..." className="text-center" />
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  // Assert data is not null for TypeScript after the check above
  const financialData = data;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Summary Report</h1>
          <div className="mt-2">
            <DateRangePicker 
              value={range} 
              onChange={(r) => r && setRange(r)} 
            />
          </div>
        </div>
      </div>

      {/* Paid Unscheduled Group Lessons */}
      <Card className="p-4">
        <CustomTable 
          title="Paid Unscheduled Group Lessons"
          data={getPaginatedData(financialData.paidUnscheduledGroupLessons, paidGroupPage, paidGroupLimit)} 
          columns={groupLessonColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={paidGroupLimit}
          onRowsPerPageChange={(newLimit) => {
            setPaidGroupLimit(newLimit);
            setPaidGroupPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: paidGroupPage,
            limit: paidGroupLimit,
            total: financialData.paidUnscheduledGroupLessons.length,
            totalPages: Math.ceil(financialData.paidUnscheduledGroupLessons.length / paidGroupLimit),
          }}
          onServerSidePageChange={setPaidGroupPage}
          onExport={{
            html: paidGroupExport.exportToHtml,
            csv: paidGroupExport.exportToCsv,
            text: paidGroupExport.exportToText,
            excel: paidGroupExport.exportToExcel,
            pdf: paidGroupExport.exportToPdf,
            json: paidGroupExport.exportToJson,
          }}
        />
      </Card>

      {/* Prepaid Future Private Lessons */}
      <Card className="p-4">
        <CustomTable 
          title="Prepaid Future Private Lessons"
          data={getPaginatedData(financialData.prepaidFuturePrivateLessons, prepaidPrivatePage, prepaidPrivateLimit)} 
          columns={groupLessonColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={prepaidPrivateLimit}
          onRowsPerPageChange={(newLimit) => {
            setPrepaidPrivateLimit(newLimit);
            setPrepaidPrivatePage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: prepaidPrivatePage,
            limit: prepaidPrivateLimit,
            total: financialData.prepaidFuturePrivateLessons.length,
            totalPages: Math.ceil(financialData.prepaidFuturePrivateLessons.length / prepaidPrivateLimit),
          }}
          onServerSidePageChange={setPrepaidPrivatePage}
          onExport={{
            html: prepaidPrivateExport.exportToHtml,
            csv: prepaidPrivateExport.exportToCsv,
            text: prepaidPrivateExport.exportToText,
            excel: prepaidPrivateExport.exportToExcel,
            pdf: prepaidPrivateExport.exportToPdf,
            json: prepaidPrivateExport.exportToJson,
          }}
        />
      </Card>

      {/* Paid Unscheduled Private Lessons */}
      <Card className="p-4">
        <CustomTable 
          title="Paid Unscheduled Private Lessons"
          data={getPaginatedData(financialData.paidUnscheduledPrivateLessons, paidPrivatePage, paidPrivateLimit)} 
          columns={groupLessonColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={paidPrivateLimit}
          onRowsPerPageChange={(newLimit) => {
            setPaidPrivateLimit(newLimit);
            setPaidPrivatePage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: paidPrivatePage,
            limit: paidPrivateLimit,
            total: financialData.paidUnscheduledPrivateLessons.length,
            totalPages: Math.ceil(financialData.paidUnscheduledPrivateLessons.length / paidPrivateLimit),
          }}
          onServerSidePageChange={setPaidPrivatePage}
          onExport={{
            html: paidPrivateExport.exportToHtml,
            csv: paidPrivateExport.exportToCsv,
            text: paidPrivateExport.exportToText,
            excel: paidPrivateExport.exportToExcel,
            pdf: paidPrivateExport.exportToPdf,
            json: paidPrivateExport.exportToJson,
          }}
        />
      </Card>

      {/* Active Outstanding Invoices */}
      <Card className="p-4">
        <CustomTable 
          title="Active Outstanding Invoices"
          data={getPaginatedData(financialData.activeOutstandingInvoices, activeInvoicesPage, activeInvoicesLimit)} 
          columns={invoiceColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={activeInvoicesLimit}
          onRowsPerPageChange={(newLimit) => {
            setActiveInvoicesLimit(newLimit);
            setActiveInvoicesPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: activeInvoicesPage,
            limit: activeInvoicesLimit,
            total: financialData.activeOutstandingInvoices.length,
            totalPages: Math.ceil(financialData.activeOutstandingInvoices.length / activeInvoicesLimit),
          }}
          onServerSidePageChange={setActiveInvoicesPage}
          onExport={{
            html: activeInvoicesExport.exportToHtml,
            csv: activeInvoicesExport.exportToCsv,
            text: activeInvoicesExport.exportToText,
            excel: activeInvoicesExport.exportToExcel,
            pdf: activeInvoicesExport.exportToPdf,
            json: activeInvoicesExport.exportToJson,
          }}
        />
      </Card>

      {/* Inactive Outstanding Invoices */}
      <Card className="p-4">
        <CustomTable 
          title="Inactive Outstanding Invoices"
          data={getPaginatedData(financialData.inactiveOutstandingInvoices, inactiveInvoicesPage, inactiveInvoicesLimit)} 
          columns={invoiceColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={inactiveInvoicesLimit}
          onRowsPerPageChange={(newLimit) => {
            setInactiveInvoicesLimit(newLimit);
            setInactiveInvoicesPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: inactiveInvoicesPage,
            limit: inactiveInvoicesLimit,
            total: financialData.inactiveOutstandingInvoices.length,
            totalPages: Math.ceil(financialData.inactiveOutstandingInvoices.length / inactiveInvoicesLimit),
          }}
          onServerSidePageChange={setInactiveInvoicesPage}
          onExport={{
            html: inactiveInvoicesExport.exportToHtml,
            csv: inactiveInvoicesExport.exportToCsv,
            text: inactiveInvoicesExport.exportToText,
            excel: inactiveInvoicesExport.exportToExcel,
            pdf: inactiveInvoicesExport.exportToPdf,
            json: inactiveInvoicesExport.exportToJson,
          }}
        />
      </Card>

      {/* Active Customers With Credit */}
      <Card className="p-4">
        <CustomTable 
          title="Active Customers With Credit"
          data={getPaginatedData(financialData.activeCustomersWithCredit, activeCreditPage, activeCreditLimit)} 
          columns={creditColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={activeCreditLimit}
          onRowsPerPageChange={(newLimit) => {
            setActiveCreditLimit(newLimit);
            setActiveCreditPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: activeCreditPage,
            limit: activeCreditLimit,
            total: financialData.activeCustomersWithCredit.length,
            totalPages: Math.ceil(financialData.activeCustomersWithCredit.length / activeCreditLimit),
          }}
          onServerSidePageChange={setActiveCreditPage}
          onExport={{
            html: activeCreditExport.exportToHtml,
            csv: activeCreditExport.exportToCsv,
            text: activeCreditExport.exportToText,
            excel: activeCreditExport.exportToExcel,
            pdf: activeCreditExport.exportToPdf,
            json: activeCreditExport.exportToJson,
          }}
        />
      </Card>

      {/* Inactive Customers With Credit */}
      <Card className="p-4">
        <CustomTable 
          title="Inactive Customers With Credit"
          data={getPaginatedData(financialData.inactiveCustomersWithCredit, inactiveCreditPage, inactiveCreditLimit)} 
          columns={creditColumns} 
          enableSearch={false} 
          enableExport={true}
          enableFilter={false} 
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={inactiveCreditLimit}
          onRowsPerPageChange={(newLimit) => {
            setInactiveCreditLimit(newLimit);
            setInactiveCreditPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          serverSidePagination={{
            page: inactiveCreditPage,
            limit: inactiveCreditLimit,
            total: financialData.inactiveCustomersWithCredit.length,
            totalPages: Math.ceil(financialData.inactiveCustomersWithCredit.length / inactiveCreditLimit),
          }}
          onServerSidePageChange={setInactiveCreditPage}
          onExport={{
            html: inactiveCreditExport.exportToHtml,
            csv: inactiveCreditExport.exportToCsv,
            text: inactiveCreditExport.exportToText,
            excel: inactiveCreditExport.exportToExcel,
            pdf: inactiveCreditExport.exportToPdf,
            json: inactiveCreditExport.exportToJson,
          }}
        />
      </Card>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}