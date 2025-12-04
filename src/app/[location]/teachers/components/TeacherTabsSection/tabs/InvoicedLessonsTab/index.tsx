"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/DateRangePicker";
import { startOfDay, endOfDay, format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { InvoicedLessonData } from "../../../../teacherTabConfigs";
import { fetchInvoicedLessonData } from "../../../../[id]/teacherTabs.slice";
import { formatCurrency } from "@/utils/formatCurrency";

interface InvoicedLessonsTabProps { location: string; teacherId: number }

interface SummarizedInvoicedLessonData {
  date: string;
  duration: number;
  cost: number;
}

const buildGroupedDataWithHeaders = (
  data: InvoicedLessonData[] | undefined,
  dateTotals: Record<string, { cost: string; duration: number }>
) => {
  if (!data?.length) return [];

  const grouped: Record<string, InvoicedLessonData[]> = {};

  data.forEach((item) => {
    const match = item.time.match(
      /([A-Za-z]+,\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?,\s+\d{4})/
    );
    const dateKey = match ? match[1] : item.time.split(" ").slice(0, -2).join(" ");
    (grouped[dateKey] ||= []).push(item);
  });

  const rows: (InvoicedLessonData & {
    isDateHeader?: boolean;
    isDateTotal?: boolean;
    dateLabel?: string;
  })[] = [];

  Object.keys(grouped).forEach((dateKey) => {
    const lessons = grouped[dateKey];
    const dateTotal = dateTotals[dateKey];

    rows.push({
      id: `date-header-${dateKey}`,
      time: dateKey,
      program: "",
      student: "",
      duration: "",
      ratePerHour: 0,
      cost: 0,
      isDateHeader: true,
      isDateTotal: false,
      dateLabel: dateKey,
    });

    lessons.forEach((lesson) =>
      rows.push({ ...lesson, isDateHeader: false, isDateTotal: false })
    );

    if (dateTotal) {
      rows.push({
        id: `date-total-${dateKey}`,
        time: "",
        program: "",
        student: "",
        duration: dateTotal.duration.toString(),
        ratePerHour: 0,
        cost: parseFloat(dateTotal.cost.replace(/[^0-9.-]+/g, "")) || 0,
        isDateHeader: false,
        isDateTotal: true,
        dateLabel: "",
      });
    }
  });

  return rows;
};

const createGroupedColumns = (): ColumnDef<
  InvoicedLessonData & { isDateHeader?: boolean; isDateTotal?: boolean; dateLabel?: string }
>[] => [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
        dateLabel?: string;
      };
      if (original.isDateHeader) {
        return (
          <div className="font-bold text-foreground bg-muted/40 px-3 py-2">
            {original.dateLabel}
          </div>
        );
      }
      if (original.isDateTotal) {
        return (
          <div className="font-bold text-foreground pr-3">
            Total:
          </div>
        );
      }
      const isFooterRow = original.id === "-1";
      if (isFooterRow) {
        return <div className="font-bold text-foreground">{original.time}</div>;
      }
      const timeMatch = original.time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      return <div>{timeMatch ? timeMatch[1] : original.time}</div>;
    },
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
      };
      if (original.isDateHeader || original.isDateTotal) return null;
      return <div>{original.program}</div>;
    },
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
      };
      if (original.isDateHeader || original.isDateTotal) return null;
      return <div>{original.student}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: "Duration(hrs)",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
      };
      if (original.isDateHeader) return null;
      if (original.isDateTotal) {
        return (
          <div className="font-bold text-foreground text-right">
            {original.duration}
          </div>
        );
      }
      const isFooterRow = original.id === "-1";
      return (
        <div className={`text-right ${isFooterRow ? "font-bold" : ""}`}>
          {original.duration}
        </div>
      );
    },
  },
  {
    accessorKey: "ratePerHour",
    header: "Rate/hr",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
      };
      if (original.isDateHeader || original.isDateTotal) return null;
      const isFooterRow = original.id === "-1";
      if (isFooterRow) return null;
      return (
        <div className="text-right">
          {formatCurrency(original.ratePerHour)}
        </div>
      );
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const original = row.original as InvoicedLessonData & {
        isDateHeader?: boolean;
        isDateTotal?: boolean;
      };
      if (original.isDateHeader) return null;
      if (original.isDateTotal) {
        return (
          <div className="font-bold text-foreground text-right">
            {formatCurrency(original.cost)}
          </div>
        );
      }
      const isFooterRow = original.id === "-1";
      return (
        <div className={`text-right ${isFooterRow ? "font-bold" : ""}`}>
          {formatCurrency(original.cost)}
        </div>
      );
    },
  },
];

const createSummarizedColumns = (): ColumnDef<SummarizedInvoicedLessonData>[] => [
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      printable: true,
      printableName: "Date",
    },
  },
  {
    accessorKey: "duration",
    header: "Duration(hrs)",
    meta: {
      printable: true,
      printableName: "Duration(hrs)",
    },
    cell: ({ row, getValue }) => {
      const duration = (typeof getValue === "function"
        ? getValue()
        : (row.original as SummarizedInvoicedLessonData)?.duration ?? 0) as number;
      return <div className="text-right">{duration.toString()}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    meta: {
      printable: true,
      printableName: "Cost",
    },
    cell: ({ row, getValue }) => {
      const cost = (typeof getValue === "function"
        ? getValue()
        : (row.original as SummarizedInvoicedLessonData)?.cost ?? 0) as number;
      return <div className="text-right">{formatCurrency(cost)}</div>;
    },
  },
];

const buildSummarizedData = (
  data: InvoicedLessonData[] | undefined,
  summariseReport: boolean
): SummarizedInvoicedLessonData[] | null =>
  !summariseReport || !data?.length
    ? null
    : data.map((item) => ({
        date: item.time,
        duration: parseFloat(item.duration) || 0,
        cost: item.cost,
      }));

export function InvoicedLessonsTab({ location, teacherId }: InvoicedLessonsTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.invoicedLessonData);
  const invoicedLessonLoading = useAppSelector((state) => state.teacherTabs.invoicedLessonLoading);
  const invoicedLessonError = useAppSelector((state) => state.teacherTabs.invoicedLessonError);
  const invoicedLessonParams = useAppSelector((state) => state.teacherTabs.invoicedLessonParams);
  const invoicedLessonTotalCost = useAppSelector((state) => state.teacherTabs.invoicedLessonTotalCost);
  const invoicedLessonTotalDuration = useAppSelector((state) => state.teacherTabs.invoicedLessonTotalDuration);
  const invoicedLessonDateTotals = useAppSelector((state) => state.teacherTabs.invoicedLessonDateTotals);
  
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = now;
    const to = now;
    return { from, to };
  });
  const [appliedDateRange, setAppliedDateRange] = useState<{
    from: Date;
    to: Date;
  }>(() => {
    const now = new Date();
    return {
      from: startOfDay(now),
      to: endOfDay(now),
    };
  });
  const [summariseReport, setSummariseReport] = useState(false);

  // Fetch data when tab is opened and when params change
  // Only trigger API if Redux doesn't have data for these params (even if empty)
  useEffect(() => {
    if (!location || !teacherId) return;
    
    const params = {
      startDate: format(appliedDateRange.from, 'yyyy-MM-dd'),
      endDate: format(appliedDateRange.to, 'yyyy-MM-dd'),
      summaryOnly: summariseReport,
    };
    
    // Check if we've already fetched for these exact params (regardless of whether data exists)
    const hasFetchedForParams = invoicedLessonParams &&
      invoicedLessonParams.startDate === params.startDate &&
      invoicedLessonParams.endDate === params.endDate &&
      invoicedLessonParams.summaryOnly === params.summaryOnly;
    
    // Only fetch if we haven't fetched for these params yet
    if (!hasFetchedForParams) {
      dispatch(fetchInvoicedLessonData({ location, teacherId, params }));
    }
  }, [location, teacherId, appliedDateRange.from, appliedDateRange.to, summariseReport, dispatch, invoicedLessonParams]);

  // Handle date range change - apply filter and refetch data
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      setAppliedDateRange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
      // fetchData will be called via useEffect when appliedDateRange changes
    }
  };

  // Handle summary report toggle - refetch data
  const handleSummariseReportChange = (checked: boolean) => {
    setSummariseReport(checked);
    // fetchData will be called via useEffect when summariseReport changes
  };

  const groupedDataWithHeaders = useMemo(
    () => buildGroupedDataWithHeaders(data as InvoicedLessonData[], invoicedLessonDateTotals),
    [data, invoicedLessonDateTotals]
  );
  const groupedColumns = useMemo(() => createGroupedColumns(), []);
  const summarizedColumns = useMemo(() => createSummarizedColumns(), []);
  const summarizedData = useMemo(
    () => buildSummarizedData(data as InvoicedLessonData[], summariseReport),
    [data, summariseReport]
  );

  const totalDuration = useMemo(() => {
    if (invoicedLessonTotalDuration !== null) {
      return invoicedLessonTotalDuration.toString();
    }
    return "0";
  }, [invoicedLessonTotalDuration]);

  const totalCost = useMemo(() => {
    if (invoicedLessonTotalCost !== null) {
      return parseFloat(invoicedLessonTotalCost.replace(/[^0-9.-]+/g, '')) || 0;
    }
    return 0;
  }, [invoicedLessonTotalCost]);

  const summarizedFooterRow: SummarizedInvoicedLessonData = useMemo(() => ({
    date: "Total:",
    duration: parseFloat(totalDuration),
    cost: totalCost,
  }), [totalDuration, totalCost]);

  const regularFooterRow: (InvoicedLessonData & { isDateHeader?: boolean; isDateTotal?: boolean }) | undefined = useMemo(() => {
    if (
      invoicedLessonTotalDuration !== null && 
      invoicedLessonTotalDuration > 0 &&
      invoicedLessonTotalCost !== null &&
      totalCost > 0
    ) {
      return {
        id: "-1",
        time: "Total:",
        program: "",
        student: "",
        duration: totalDuration,
        ratePerHour: 0, // API doesn't provide rate total - hidden in UI (not displayed)
        cost: totalCost,
        isDateHeader: false,
        isDateTotal: false,
      };
    }
    return undefined;
  }, [totalDuration, totalCost, invoicedLessonTotalDuration, invoicedLessonTotalCost]);

  // Handle print functionality - redirect to legacy print URL with date range and summary parameters
  const handlePrintClick = () => {
    // Format date range as "MMM dd,yyyy - MMM dd,yyyy" (e.g., "Nov 24,2025 - Nov 29,2025")
    const formatDateForPrint = (date: Date): string => {
      return format(date, 'MMM dd,yyyy');
    };
    
    const dateRangeStr = `${formatDateForPrint(appliedDateRange.from)} - ${formatDateForPrint(appliedDateRange.to)}`;
    const summariseReportValue = summariseReport ? '1' : '0';
    
    // Build URL with query parameters expected by legacy print (InvoiceSearch[...] params)
    const params = new URLSearchParams({
      id: teacherId.toString(),
      'InvoiceSearch[dateRange]': dateRangeStr,
      'InvoiceSearch[summariseReport]': summariseReportValue,
    });
    
  
    const printUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/print/time-voucher?${params.toString()}`;
    window.open(printUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Invoiced Lessons</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Checkbox
            id="summarise-report-invoiced"
            className="ml-2"
            checked={summariseReport}
            onCheckedChange={(checked) => handleSummariseReportChange(checked === true)}
          />
          <label htmlFor="summarise-report-invoiced" className="text-sm">
            Summarise Report
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {invoicedLessonError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">{invoicedLessonError}</div>
          </div>
        )}
        {summariseReport ? (
          <CustomTable
            data={summarizedData || []}
            columns={summarizedColumns}
            footerRow={summarizedFooterRow}
            enablePrint={true}
            onPrint={handlePrintClick}
            isLoading={invoicedLessonLoading}
            customEmptyState={
              !invoicedLessonLoading && (!summarizedData || summarizedData.length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No invoiced lessons data found for the selected date range</span>
                </div>
              ) : undefined
            }
          />
        ) : (
          <CustomTable
            data={groupedDataWithHeaders}
            columns={groupedColumns}
            footerRow={!invoicedLessonLoading ? regularFooterRow : undefined}
            enablePrint={true}
            onPrint={handlePrintClick}
            isLoading={invoicedLessonLoading}
            customEmptyState={
              !invoicedLessonLoading && groupedDataWithHeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No invoiced lessons data found for the selected date range</span>
                </div>
              ) : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
