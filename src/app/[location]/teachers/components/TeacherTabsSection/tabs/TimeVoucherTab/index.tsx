"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/DateRangePicker";
import { subDays, parse, isValid, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { timeVoucherColumns, TimeVoucherData } from "../../../../teacherTabConfigs";
import { usePrintReport } from "@/hooks/usePrintReport";

interface TimeVoucherTabProps {
  location: string;
  teacherId: number;
}

interface SummarizedTimeVoucherData {
  date: string;
  duration: number;
}

// Helper function to parse date from time string
const parseTimeString = (timeStr: string): Date | null => {
  try {
    // Try parsing formats like "Thursday, December 4th, 2025 01:00 PM"
    // Remove ordinal suffixes (st, nd, rd, th)
    const cleaned = timeStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');
    
    // Try multiple date formats
    const formats = [
      "EEEE, MMMM d, yyyy h:mm a", // "Thursday, December 4, 2025 01:00 PM"
      "EEEE, MMMM d, yyyy", // "Thursday, December 4, 2025"
      "MMMM d, yyyy h:mm a", // "December 4, 2025 01:00 PM"
      "MMMM d, yyyy", // "December 4, 2025"
    ];
    
    for (const format of formats) {
      const parsed = parse(cleaned, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

export function TimeVoucherTab({ location, teacherId }: TimeVoucherTabProps) {
  // Suppress unused variable warnings - these will be used for API calls
  void teacherId;
  
  const data = useAppSelector((state) => state.teacherTabs.timeVoucherData);
  const initialDateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<{
    from: Date;
    to: Date;
  }>(() => ({
    from: startOfDay(initialDateRange.from),
    to: endOfDay(initialDateRange.to),
  }));
  const [summariseReport, setSummariseReport] = useState(false);
  const { handlePrint } = usePrintReport<TimeVoucherData | SummarizedTimeVoucherData>();

  // Handle date range change - apply filter immediately
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      setAppliedDateRange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
    }
  };

  // Filter data based on applied date range
  const filteredData = useMemo(() => {
    return (data as TimeVoucherData[]).filter((item) => {
      const itemDate = parseTimeString(item.time);
      if (!itemDate) return false;

      return isWithinInterval(itemDate, {
        start: appliedDateRange.from,
        end: appliedDateRange.to,
      });
    });
  }, [data, appliedDateRange]);

  // Summarized columns
  const summarizedColumns: ColumnDef<SummarizedTimeVoucherData>[] = useMemo(() => [
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
        // Use getValue() if available (standard TanStack Table API)
        // Otherwise fall back to row.original for footer rows
        const duration = (typeof getValue === 'function' 
          ? getValue() 
          : (row.original as SummarizedTimeVoucherData)?.duration ?? 0) as number;
        // Format duration: show one decimal if it's a whole number, otherwise show as is
        const formatted = duration % 1 === 0 ? duration.toFixed(1) : duration.toFixed(2);
        return <div className="text-right">{formatted}</div>;
      },
    },
  ], []);

  // Transform data for summarized view
  const summarizedData = useMemo(() => {
    if (!summariseReport) return null;

    const grouped = filteredData.reduce((acc, item) => {
      // Extract date from time string (e.g., "Thursday, December 4th, 2025 01:00 PM" -> "Thursday, December 4th, 2025")
      const timeStr = item.time;
      const dateMatch = timeStr.match(/([A-Za-z]+,\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?,\s+\d{4})/);
      const dateKey = dateMatch ? dateMatch[1] : timeStr.split(' ').slice(0, -2).join(' ');

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          duration: 0,
        };
      }

      acc[dateKey].duration += parseFloat(item.duration) || 0;
      return acc;
    }, {} as Record<string, SummarizedTimeVoucherData>);

    // Sort by date chronologically
    const sorted = Object.values(grouped).sort((a, b) => {
      // Parse dates - try with time first, then without
      let dateA = parseTimeString(a.date);
      if (!dateA) {
        // Try parsing date without time
        const cleaned = a.date.replace(/(\d+)(st|nd|rd|th)/g, '$1');
        const parsed = parse(cleaned, "EEEE, MMMM d, yyyy", new Date());
        dateA = isValid(parsed) ? parsed : null;
      }
      
      let dateB = parseTimeString(b.date);
      if (!dateB) {
        // Try parsing date without time
        const cleaned = b.date.replace(/(\d+)(st|nd|rd|th)/g, '$1');
        const parsed = parse(cleaned, "EEEE, MMMM d, yyyy", new Date());
        dateB = isValid(parsed) ? parsed : null;
      }
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });

    return sorted;
  }, [filteredData, summariseReport]);

  // Calculate total duration for footer
  const totalDuration = useMemo(() => {
    if (summariseReport) {
      if (!summarizedData || summarizedData.length === 0) return "0.00";
      const total = summarizedData.reduce((sum, item) => sum + item.duration, 0);
      return total.toFixed(2);
    }
    
    if (!filteredData || filteredData.length === 0) return "0.00";
    const total = filteredData.reduce((sum, item) => {
      const duration = parseFloat(item.duration);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0);
    
    return total.toFixed(2);
  }, [filteredData, summarizedData, summariseReport]);

  // Create footer data objects that match the column structure
  const summarizedFooterRow: SummarizedTimeVoucherData = useMemo(() => ({
    date: "Total:",
    duration: parseFloat(totalDuration),
  }), [totalDuration]);

  const regularFooterRow: TimeVoucherData = useMemo(() => ({
    id: "-1",
    time: "Total:",
    program: "",
    student: "",
    duration: totalDuration,
  }), [totalDuration]);

  // Create printable columns for regular view
  const printableTimeVoucherColumns = useMemo(() => 
    timeVoucherColumns.map(col => ({
      ...col,
      meta: {
        printable: true,
        printableName: typeof col.header === 'string' ? col.header : '',
      },
    })),
    []
  );

  // Handle print functionality
  const handlePrintClick = () => {
    if (summariseReport) {
      handlePrint({
        reportTitle: "Time Voucher Report",
        columns: summarizedColumns as ColumnDef<SummarizedTimeVoucherData | TimeVoucherData>[],
        data: (summarizedData || []) as (SummarizedTimeVoucherData | TimeVoucherData)[],
        footer: summarizedFooterRow as SummarizedTimeVoucherData | TimeVoucherData,
        location: location,
        dateRange: appliedDateRange,
        rightAlignedColumns: ["Duration(hrs)"],
      });
    } else {
      handlePrint({
        reportTitle: "Time Voucher Report",
        columns: printableTimeVoucherColumns as ColumnDef<SummarizedTimeVoucherData | TimeVoucherData>[],
        data: filteredData as (SummarizedTimeVoucherData | TimeVoucherData)[],
        footer: regularFooterRow as SummarizedTimeVoucherData | TimeVoucherData,
        location: location,
        dateRange: appliedDateRange,
        rightAlignedColumns: ["Duration(hrs)"],
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Time Voucher</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Checkbox
            id="summarise-report-voucher"
            className="ml-2"
            checked={summariseReport}
            onCheckedChange={(checked) => setSummariseReport(checked === true)}
          />
          <label htmlFor="summarise-report-voucher" className="text-sm">
            Summarise Report
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {summariseReport ? (
          <CustomTable
            data={summarizedData || []}
            columns={summarizedColumns}
            footerRow={summarizedFooterRow}
            enablePrint={true}
            onPrint={handlePrintClick}
          />
        ) : (
          <CustomTable
            data={filteredData}
            columns={timeVoucherColumns}
            footerRow={regularFooterRow}
            enablePrint={true}
            onPrint={handlePrintClick}
          />
        )}
      </CardContent>
    </Card>
  );
}

