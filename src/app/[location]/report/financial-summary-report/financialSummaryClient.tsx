"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Card } from "@/components/ui/card";
import {
  getFinancialSummaryStats,
  FinancialSummaryData,
  SummaryData,
  fetchPrepaidFutureGroupLessons,
  fetchPrepaidFuturePrivateLessons,
  fetchPaidUnscheduledGroupLessons,
  fetchPaidUnscheduledPrivateLessons,
  fetchActiveOutstandingInvoices,
  fetchInactiveOutstandingInvoices,
  fetchActiveCustomersWithCredit,
  fetchInactiveCustomersWithCredit
} from "./financial-summary.api";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";

interface FinancialSummaryClientProps {
  location: string;
}

export function FinancialSummaryClient({ location }: FinancialSummaryClientProps) {
  const [data, setData] = React.useState<FinancialSummaryData | null>(null);
  const [summaryData, setSummaryData] = React.useState<SummaryData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    return { from: now, to: now };
  });


  // Individual pagination states for each table
  const [prepaidGroupPage, setPrepaidGroupPage] = React.useState(1);
  const [prepaidGroupLimit, setPrepaidGroupLimit] = React.useState(5);

  // Separate column filter states for each table
  const [prepaidGroupColumnFilters, setPrepaidGroupColumnFilters] = React.useState<Record<string, unknown>>({});
  const [prepaidPrivateColumnFilters, setPrepaidPrivateColumnFilters] = React.useState<Record<string, unknown>>({});

  const [paidGroupPage, setPaidGroupPage] = React.useState(1);
  const [paidGroupLimit, setPaidGroupLimit] = React.useState(5);

  const [prepaidPrivatePage, setPrepaidPrivatePage] = React.useState(1);
  const [prepaidPrivateLimit, setPrepaidPrivateLimit] = React.useState(5);

  const [paidPrivatePage, setPaidPrivatePage] = React.useState(1);
  const [paidPrivateLimit, setPaidPrivateLimit] = React.useState(5);

  const [activeInvoicesPage, setActiveInvoicesPage] = React.useState(1);
  const [activeInvoicesLimit, setActiveInvoicesLimit] = React.useState(5);

  const [inactiveInvoicesPage, setInactiveInvoicesPage] = React.useState(1);
  const [inactiveInvoicesLimit, setInactiveInvoicesLimit] = React.useState(5);

  const [activeCreditPage, setActiveCreditPage] = React.useState(1);
  const [activeCreditLimit, setActiveCreditLimit] = React.useState(5);

  const [inactiveCreditPage, setInactiveCreditPage] = React.useState(1);
  const [inactiveCreditLimit, setInactiveCreditLimit] = React.useState(5);

  // Server-side pagination state for all tables
  const [prepaidGroupPagination, setPrepaidGroupPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [prepaidPrivatePagination, setPrepaidPrivatePagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [paidGroupPagination, setPaidGroupPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [paidPrivatePagination, setPaidPrivatePagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [activeInvoicesPagination, setActiveInvoicesPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [inactiveInvoicesPagination, setInactiveInvoicesPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [activeCreditPagination, setActiveCreditPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [inactiveCreditPagination, setInactiveCreditPagination] = React.useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  const formatRangeParam = React.useCallback((d: Date) => format(d, "yyyy-MM-dd"), []);
  const isLoadingRef = React.useRef(false);

  const load = React.useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);

      // Load financial data and summary data in parallel
      const [summaryResult, prepaidGroupResult, prepaidPrivateResult, paidGroupResult, paidPrivateResult, activeInvoicesResult, inactiveInvoicesResult, activeCreditResult, inactiveCreditResult] = await Promise.all([
        getFinancialSummaryStats(location, startDate, endDate),
        fetchPrepaidFutureGroupLessons(location, startDate, endDate, prepaidGroupPage, prepaidGroupLimit),
        fetchPrepaidFuturePrivateLessons(location, startDate, endDate, prepaidPrivatePage, prepaidPrivateLimit),
        fetchPaidUnscheduledGroupLessons(location, startDate, endDate, paidGroupPage, paidGroupLimit),
        fetchPaidUnscheduledPrivateLessons(location, startDate, endDate, paidPrivatePage, paidPrivateLimit),
        fetchActiveOutstandingInvoices(location, startDate, endDate, activeInvoicesPage, activeInvoicesLimit),
        fetchInactiveOutstandingInvoices(location, startDate, endDate, inactiveInvoicesPage, inactiveInvoicesLimit),
        fetchActiveCustomersWithCredit(location, startDate, endDate, activeCreditPage, activeCreditLimit),
        fetchInactiveCustomersWithCredit(location, startDate, endDate, inactiveCreditPage, inactiveCreditLimit)
      ]);

      // Set the financial data
      const financialData: FinancialSummaryData = {
        prepaidFutureGroupLessons: prepaidGroupResult.data,
        prepaidFuturePrivateLessons: prepaidPrivateResult.data,
        paidUnscheduledGroupLessons: paidGroupResult.data,
        paidUnscheduledPrivateLessons: paidPrivateResult.data,
        activeOutstandingInvoices: activeInvoicesResult.data,
        inactiveOutstandingInvoices: inactiveInvoicesResult.data,
        activeCustomersWithCredit: activeCreditResult.data,
        inactiveCustomersWithCredit: inactiveCreditResult.data
      };
      setData(financialData);

      if (summaryResult.success) {
        setSummaryData(summaryResult.data);
      } else {
        console.error("Failed to fetch summary data:", summaryResult.message);
      }

      // Set pagination state for all tables
      setPrepaidGroupPagination(prepaidGroupResult.pagination);
      setPrepaidPrivatePagination(prepaidPrivateResult.pagination);
      setPaidGroupPagination(paidGroupResult.pagination);
      setPaidPrivatePagination(paidPrivateResult.pagination);
      setActiveInvoicesPagination(activeInvoicesResult.pagination);
      setInactiveInvoicesPagination(inactiveInvoicesResult.pagination);
      setActiveCreditPagination(activeCreditResult.pagination);
      setInactiveCreditPagination(inactiveCreditResult.pagination);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [location, range.from, range.to, formatRangeParam, prepaidGroupPage, prepaidGroupLimit, prepaidPrivatePage, prepaidPrivateLimit, paidGroupPage, paidGroupLimit, paidPrivatePage, paidPrivateLimit, activeInvoicesPage, activeInvoicesLimit, inactiveInvoicesPage, inactiveInvoicesLimit, activeCreditPage, activeCreditLimit, inactiveCreditPage, inactiveCreditLimit]);

  // Load data when location or range changes
  React.useEffect(() => {
    if (location) {
      load();
    }
  }, [location, range.from, range.to, load]);

  // Handle column filter changes for Prepaid Future Group Lessons
  const handlePrepaidGroupFilterChange = React.useCallback(async (columnKey: string, filterValue: unknown) => {
    setPrepaidGroupColumnFilters(prev => ({
      ...prev,
      [columnKey]: filterValue
    }));

    // If it's a date filter, reload only the prepaid group lessons data
    if (columnKey === 'date' && filterValue && filterValue instanceof Date) {
      try {
        const endDate = formatRangeParam(filterValue);
        const result = await fetchPrepaidFutureGroupLessons(location, endDate, endDate, prepaidGroupPage, prepaidGroupLimit);

        setData(prev => {
          if (!prev) return null;

          const updatedData = {
            ...prev,
            prepaidFutureGroupLessons: result.data
          };

          // Update pagination state
          setPrepaidGroupPagination(result.pagination);

          // Update summary data with new counts and totals
          setSummaryData(prevSummary => {
            const newSummary = [...prevSummary];

            // Find and update Prepaid Future Group Lessons row
            const groupLessonsIndex = newSummary.findIndex(item =>
              item.particulars === "Prepaid Future Group Lessons"
            );

            if (groupLessonsIndex !== -1) {
              newSummary[groupLessonsIndex] = {
                particulars: "Prepaid Future Group Lessons",
                count: result.pagination.total,
                total: result.data.reduce((sum, item) => sum + item.amount, 0)
              };
            }

            return newSummary;
          });

          return updatedData;
        });
      } catch (error) {
        console.error("Failed to fetch prepaid group lessons:", error);
      }
    }
  }, [location, formatRangeParam, prepaidGroupPage, prepaidGroupLimit]);

  // Handle column filter changes for Prepaid Future Private Lessons
  const handlePrepaidPrivateFilterChange = React.useCallback(async (columnKey: string, filterValue: unknown) => {
    setPrepaidPrivateColumnFilters(prev => ({
      ...prev,
      [columnKey]: filterValue
    }));

    if (columnKey === 'date' && filterValue && filterValue instanceof Date) {
      try {
        const endDate = formatRangeParam(filterValue);
        const result = await fetchPrepaidFuturePrivateLessons(location, endDate, endDate, prepaidPrivatePage, prepaidPrivateLimit);

        setData(prev => {
          if (!prev) return null;

          const updatedData = {
            ...prev,
            prepaidFuturePrivateLessons: result.data
          };

          // Update pagination state
          setPrepaidPrivatePagination(result.pagination);

          // Update summary data with new counts and totals
          setSummaryData(prevSummary => {
            const newSummary = [...prevSummary];

            // Find and update Prepaid Future Private Lessons row
            const privateLessonsIndex = newSummary.findIndex(item =>
              item.particulars === "Prepaid Future Private Lessons"
            );

            if (privateLessonsIndex !== -1) {
              newSummary[privateLessonsIndex] = {
                particulars: "Prepaid Future Private Lessons",
                count: result.pagination.total,
                total: result.data.reduce((sum, item) => sum + item.amount, 0)
              };
            }

            return newSummary;
          });

          return updatedData;
        });
      } catch (error) {
        console.error("Failed to fetch prepaid private lessons:", error);
      }
    }
  }, [location, formatRangeParam, prepaidPrivatePage, prepaidPrivateLimit]);

  // Handle page changes for Prepaid Future Group Lessons
  const handlePrepaidGroupPageChange = React.useCallback(async (page: number) => {
    setPrepaidGroupPage(page);
    try {
      const endDate = formatRangeParam((prepaidGroupColumnFilters.date instanceof Date ? prepaidGroupColumnFilters.date : new Date()));
      const apiLimit = prepaidGroupLimit === -1 ? 99999 : prepaidGroupLimit;
      const result = await fetchPrepaidFutureGroupLessons(location, endDate, endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          prepaidFutureGroupLessons: result.data
        };
      });

      setPrepaidGroupPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch prepaid group lessons:", error);
    }
  }, [location, formatRangeParam, prepaidGroupColumnFilters.date, prepaidGroupLimit]);

  // Handle page changes for Prepaid Future Private Lessons
  const handlePrepaidPrivatePageChange = React.useCallback(async (page: number) => {
    setPrepaidPrivatePage(page);
    try {
      const endDate = formatRangeParam((prepaidPrivateColumnFilters.date instanceof Date ? prepaidPrivateColumnFilters.date : new Date()));
      const apiLimit = prepaidPrivateLimit === -1 ? 99999 : prepaidPrivateLimit;
      const result = await fetchPrepaidFuturePrivateLessons(location, endDate, endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          prepaidFuturePrivateLessons: result.data
        };
      });

      setPrepaidPrivatePagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch prepaid private lessons:", error);
    }
  }, [location, formatRangeParam, prepaidPrivateColumnFilters.date, prepaidPrivateLimit]);

  // Handle page changes for Paid Unscheduled Group Lessons
  const handlePaidGroupPageChange = React.useCallback(async (page: number) => {
    setPaidGroupPage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = paidGroupLimit === -1 ? 99999 : paidGroupLimit;
      const result = await fetchPaidUnscheduledGroupLessons(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          paidUnscheduledGroupLessons: result.data
        };
      });

      setPaidGroupPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch paid group lessons:", error);
    }
  }, [location, formatRangeParam, range, paidGroupLimit]);

  // Handle page changes for Paid Unscheduled Private Lessons
  const handlePaidPrivatePageChange = React.useCallback(async (page: number) => {
    setPaidPrivatePage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = paidPrivateLimit === -1 ? 99999 : paidPrivateLimit;
      const result = await fetchPaidUnscheduledPrivateLessons(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          paidUnscheduledPrivateLessons: result.data
        };
      });

      setPaidPrivatePagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch paid private lessons:", error);
    }
  }, [location, formatRangeParam, range, paidPrivateLimit]);

  // Handle page changes for Active Outstanding Invoices
  const handleActiveInvoicesPageChange = React.useCallback(async (page: number) => {
    setActiveInvoicesPage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = activeInvoicesLimit === -1 ? 99999 : activeInvoicesLimit;
      const result = await fetchActiveOutstandingInvoices(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activeOutstandingInvoices: result.data
        };
      });

      setActiveInvoicesPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch active invoices:", error);
    }
  }, [location, formatRangeParam, range, activeInvoicesLimit]);

  // Handle page changes for Inactive Outstanding Invoices
  const handleInactiveInvoicesPageChange = React.useCallback(async (page: number) => {
    setInactiveInvoicesPage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = inactiveInvoicesLimit === -1 ? 99999 : inactiveInvoicesLimit;
      const result = await fetchInactiveOutstandingInvoices(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          inactiveOutstandingInvoices: result.data
        };
      });

      setInactiveInvoicesPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch inactive invoices:", error);
    }
  }, [location, formatRangeParam, range, inactiveInvoicesLimit]);

  // Handle page changes for Active Customers With Credit
  const handleActiveCreditPageChange = React.useCallback(async (page: number) => {
    setActiveCreditPage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = activeCreditLimit === -1 ? 99999 : activeCreditLimit;
      const result = await fetchActiveCustomersWithCredit(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activeCustomersWithCredit: result.data
        };
      });

      setActiveCreditPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch active credit:", error);
    }
  }, [location, formatRangeParam, range, activeCreditLimit]);

  // Handle page changes for Inactive Customers With Credit
  const handleInactiveCreditPageChange = React.useCallback(async (page: number) => {
    setInactiveCreditPage(page);
    try {
      const endDate = formatRangeParam(range.to);
      const apiLimit = inactiveCreditLimit === -1 ? 99999 : inactiveCreditLimit;
      const result = await fetchInactiveCustomersWithCredit(location, formatRangeParam(range.from), endDate, page, apiLimit);

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          inactiveCustomersWithCredit: result.data
        };
      });

      setInactiveCreditPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch inactive credit:", error);
    }
  }, [location, formatRangeParam, range, inactiveCreditLimit]);

  // Initialize with today's date for both date filters
  React.useEffect(() => {
    const today = new Date();
    setPrepaidGroupColumnFilters(prev => ({
      ...prev,
      date: today
    }));
    setPrepaidPrivateColumnFilters(prev => ({
      ...prev,
      date: today
    }));
    // Set initial range to today
    setRange({
      from: today,
      to: today
    });
  }, []);

  // Column definitions for each table (moved before conditional returns)
  const groupLessonColumns = [
    {
      accessorKey: "lessonId",
      header: "Lesson ID",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "duration",
      header: "Duration",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      cell: ({ row }: { row: { original: { amount: number } } }) => <span className="text-right block">{formatCurrency(row.original.amount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      size: 100,
      cell: ({ row }: { row: { original: { paidAmount: number } } }) => <span className="text-right block">{formatCurrency(row.original.paidAmount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "balance",
      header: "Balance",
      size: 100,
      cell: ({ row }: { row: { original: { balance: number } } }) => <span className="text-right block">{formatCurrency(row.original.balance)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  // Column definitions with date filters for lesson tables
  const lessonColumnsWithDateFilter = [
    {
      accessorKey: "lessonId",
      header: "Lesson ID",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "studentName",
      header: "Student Name",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      filter: {
        type: "date",
        initialValue: new Date(),
        disabled: (date: Date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          return date < today; // Disable past dates
        }
      },
      meta: { printable: true }
    },
    {
      accessorKey: "duration",
      header: "Duration",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      cell: ({ row }: { row: { original: { amount: number } } }) => <span className="text-right block">{formatCurrency(row.original.amount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      size: 100,
      cell: ({ row }: { row: { original: { paidAmount: number } } }) => <span className="text-right block">{formatCurrency(row.original.paidAmount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "balance",
      header: "Balance",
      size: 100,
      cell: ({ row }: { row: { original: { balance: number } } }) => <span className="text-right block">{formatCurrency(row.original.balance)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  // Summary table columns
  const summaryColumns = [
    {
      accessorKey: "particulars",
      header: "Particulars",
      size: 300,
      meta: { printable: true }
    },
    {
      accessorKey: "count",
      header: "Count",
      size: 80,
      cell: ({ row }: { row: { original: { count: number } } }) => <span className="text-right block">{row.original.count}</span>,
      meta: { printable: true }
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 120,
      cell: ({ row }: { row: { original: { total: number | null } } }) => {
        const total = row.original.total;
        return <span className="text-right block">{total && total > 0 ? formatCurrency(total) : '—'}</span>;
      },
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => {
          const total = value as number | null;
          return total && total > 0 ? formatCurrency(total) : '—';
        },
      }
    },
  ];


  const invoiceColumns = [
    {
      accessorKey: "invoiceId",
      header: "Invoice ID",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      meta: { printable: true }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      cell: ({ row }: { row: { original: { amount: number } } }) => <span className="text-right block">{formatCurrency(row.original.amount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      size: 100,
      cell: ({ row }: { row: { original: { paidAmount: number } } }) => <span className="text-right block">{formatCurrency(row.original.paidAmount)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
    {
      accessorKey: "balance",
      header: "Balance",
      size: 100,
      cell: ({ row }: { row: { original: { balance: number } } }) => <span className="text-right block">{formatCurrency(row.original.balance)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  const creditColumns = [
    {
      accessorKey: "customerId",
      header: "Customer ID",
      size: 100,
      meta: { printable: true }
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 200,
      meta: { printable: true }
    },
    {
      accessorKey: "balance",
      header: "Balance",
      size: 100,
      cell: ({ row }: { row: { original: { balance: number } } }) => <span className="text-right block">{formatCurrency(row.original.balance)}</span>,
      meta: {
        printable: true,
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      }
    },
  ];

  // Export hooks for each table (must be called before any conditional returns)
  const prepaidGroupExport = useExportableData({
    reportTitle: 'Prepaid Future Group Lessons',
    columns: lessonColumnsWithDateFilter,
    data: data?.prepaidFutureGroupLessons || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30
    },
    location: location,
  });

  const paidGroupExport = useExportableData({
    reportTitle: 'Paid Unscheduled Group Lessons',
    columns: groupLessonColumns,
    data: data?.paidUnscheduledGroupLessons || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30,
    },
    location: location,
  });

  const prepaidPrivateExport = useExportableData({
    reportTitle: 'Prepaid Future Private Lessons',
    columns: lessonColumnsWithDateFilter,
    data: data?.prepaidFuturePrivateLessons || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30,
    },
    location: location,
  });

  const paidPrivateExport = useExportableData({
    reportTitle: 'Paid Unscheduled Private Lessons',
    columns: groupLessonColumns,
    data: data?.paidUnscheduledPrivateLessons || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30,
    },
    location: location,
  });

  const activeInvoicesExport = useExportableData({
    reportTitle: 'Active Outstanding Invoices',
    columns: invoiceColumns,
    data: data?.activeOutstandingInvoices || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30,
    },
    location: location,
  });

  const inactiveInvoicesExport = useExportableData({
    reportTitle: 'Inactive Outstanding Invoices',
    columns: invoiceColumns,
    data: data?.inactiveOutstandingInvoices || [],
    rightAlignedColumns: ['Amount', 'Paid Amount', 'Balance'],
    columnWidths: {
      'Amount': 30,
      'Paid Amount': 30,
      'Balance': 30,
    },
    location: location,
  });

  const activeCreditExport = useExportableData({
    reportTitle: 'Active Customers With Credit',
    columns: creditColumns,
    data: data?.activeCustomersWithCredit || [],
    rightAlignedColumns: ['Balance'],
    columnWidths: {
      'Balance': 30,
    },
    location: location,
  });

  const inactiveCreditExport = useExportableData({
    reportTitle: 'Inactive Customers With Credit',
    columns: creditColumns,
    data: data?.inactiveCustomersWithCredit || [],
    rightAlignedColumns: ['Balance'],
    columnWidths: {
      'Balance': 30,
    },
    location: location,
  });

  const summaryExport = useExportableData({
    reportTitle: 'Financial Summary Report',
    columns: summaryColumns,
    data: summaryData,
    rightAlignedColumns: ['Count', 'Total'],
    columnWidths: {
      'Count': 25,
      'Total': 30,
    },
    location: location,
  });

  const { handlePrint } = usePrintReport<SummaryData>();

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

  // Assert data is not null for TypeScript after the check above
  const financialData = data;


  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Summary Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive overview of financial data including prepaid lessons, outstanding invoices, and customer credits</p>
        </div>
      </div>

      {/* Prepaid Future Group Lessons */}
      <Card className="p-4">
        <CustomTable
          title="Prepaid Future Group Lessons"
          data={financialData.prepaidFutureGroupLessons}
          columns={lessonColumnsWithDateFilter}
          enableSearch={false}
          enableExport={true}
          enableFilter={false}
          enablePrint={false}
          enableColumnFilters={true}
          onColumnFilterChange={handlePrepaidGroupFilterChange}
          columnFilters={prepaidGroupColumnFilters}
          enableRowsPerPage={true}
          rowsPerPage={prepaidGroupLimit}
          onRowsPerPageChange={(newLimit) => {
            setPrepaidGroupLimit(newLimit);
            setPrepaidGroupPage(1);
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam((prepaidGroupColumnFilters.date instanceof Date ? prepaidGroupColumnFilters.date : new Date()));
            fetchPrepaidFutureGroupLessons(location, endDate, endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, prepaidFutureGroupLessons: result.data };
                });
                setPrepaidGroupPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch prepaid group lessons:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={prepaidGroupPagination}
          onServerSidePageChange={handlePrepaidGroupPageChange}
          onExport={{
            html: prepaidGroupExport.exportToHtml,
            csv: prepaidGroupExport.exportToCsv,
            text: prepaidGroupExport.exportToText,
            excel: prepaidGroupExport.exportToExcel,
            pdf: prepaidGroupExport.exportToPdf,
            json: prepaidGroupExport.exportToJson,
          }}
        />
      </Card>

      {/* Paid Unscheduled Group Lessons */}
      <Card className="p-4">
        <CustomTable
          title="Paid Unscheduled Group Lessons"
          data={financialData.paidUnscheduledGroupLessons}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchPaidUnscheduledGroupLessons(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, paidUnscheduledGroupLessons: result.data };
                });
                setPaidGroupPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch paid group lessons:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={paidGroupPagination}
          onServerSidePageChange={handlePaidGroupPageChange}
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
          data={financialData.prepaidFuturePrivateLessons}
          columns={lessonColumnsWithDateFilter}
          enableColumnFilters={true}
          onColumnFilterChange={handlePrepaidPrivateFilterChange}
          columnFilters={prepaidPrivateColumnFilters}
          enableSearch={false}
          enableExport={true}
          enableFilter={false}
          enablePrint={false}
          enableRowsPerPage={true}
          rowsPerPage={prepaidPrivateLimit}
          onRowsPerPageChange={(newLimit) => {
            setPrepaidPrivateLimit(newLimit);
            setPrepaidPrivatePage(1);
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam((prepaidPrivateColumnFilters.date instanceof Date ? prepaidPrivateColumnFilters.date : new Date()));
            fetchPrepaidFuturePrivateLessons(location, endDate, endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, prepaidFuturePrivateLessons: result.data };
                });
                setPrepaidPrivatePagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch prepaid private lessons:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={prepaidPrivatePagination}
          onServerSidePageChange={handlePrepaidPrivatePageChange}
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
          data={financialData.paidUnscheduledPrivateLessons}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchPaidUnscheduledPrivateLessons(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, paidUnscheduledPrivateLessons: result.data };
                });
                setPaidPrivatePagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch paid private lessons:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={paidPrivatePagination}
          onServerSidePageChange={handlePaidPrivatePageChange}
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
          data={financialData.activeOutstandingInvoices}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchActiveOutstandingInvoices(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, activeOutstandingInvoices: result.data };
                });
                setActiveInvoicesPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch active invoices:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={activeInvoicesPagination}
          onServerSidePageChange={handleActiveInvoicesPageChange}
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
          data={financialData.inactiveOutstandingInvoices}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchInactiveOutstandingInvoices(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, inactiveOutstandingInvoices: result.data };
                });
                setInactiveInvoicesPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch inactive invoices:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={inactiveInvoicesPagination}
          onServerSidePageChange={handleInactiveInvoicesPageChange}
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
          data={financialData.activeCustomersWithCredit}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchActiveCustomersWithCredit(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, activeCustomersWithCredit: result.data };
                });
                setActiveCreditPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch active credit:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={activeCreditPagination}
          onServerSidePageChange={handleActiveCreditPageChange}
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
          data={financialData.inactiveCustomersWithCredit}
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
            // Trigger API call with new limit (convert -1 to 99999 for "All" option)
            const apiLimit = newLimit === -1 ? 99999 : newLimit;
            const endDate = formatRangeParam(range.to);
            fetchInactiveCustomersWithCredit(location, formatRangeParam(range.from), endDate, 1, apiLimit)
              .then(result => {
                setData(prev => {
                  if (!prev) return null;
                  return { ...prev, inactiveCustomersWithCredit: result.data };
                });
                setInactiveCreditPagination(result.pagination);
              })
              .catch(error => console.error("Failed to fetch inactive credit:", error));
          }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          serverSidePagination={inactiveCreditPagination}
          onServerSidePageChange={handleInactiveCreditPageChange}
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


      {/* Summary Table - Bottom */}
      <Card className="p-4">
        <CustomTable
          title="Summary"
          data={summaryData}
          columns={summaryColumns}
          enableSearch={false}
          enableExport={true}
          onExport={{
            html: summaryExport.exportToHtml,
            csv: summaryExport.exportToCsv,
            text: summaryExport.exportToText,
            excel: summaryExport.exportToExcel,
            pdf: summaryExport.exportToPdf,
            json: summaryExport.exportToJson,
          }}
          enableFilter={false}
          enablePrint={true}
          onPrint={() => handlePrint({
            reportTitle: 'Financial Summary Report',
            columns: summaryColumns,
            data: summaryData,
            location: location,
            rightAlignedColumns: ['Count', 'Total'],
          })}
          enableColumnFilters={false}
          size="compact"
        />
      </Card>
    </div>
  );
}