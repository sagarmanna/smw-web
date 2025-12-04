"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/DateRangePicker";
import { parse, isValid, startOfDay, endOfDay, format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { TimeVoucherData } from "../../../../teacherTabConfigs";
import { fetchTimeVoucherData } from "../../../../[id]/teacherTabs.slice";

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
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.timeVoucherData);
  const timeVoucherLoading = useAppSelector((state) => state.teacherTabs.timeVoucherLoading);
  const timeVoucherError = useAppSelector((state) => state.teacherTabs.timeVoucherError);
  const timeVoucherParams = useAppSelector((state) => state.teacherTabs.timeVoucherParams);
  
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
    const hasFetchedForParams = timeVoucherParams &&
      timeVoucherParams.startDate === params.startDate &&
      timeVoucherParams.endDate === params.endDate &&
      timeVoucherParams.summaryOnly === params.summaryOnly;
    
    // Only fetch if we haven't fetched for these params yet
    if (!hasFetchedForParams) {
      dispatch(fetchTimeVoucherData({ location, teacherId, params }));
    }
  }, [location, teacherId, appliedDateRange.from, appliedDateRange.to, summariseReport, dispatch, timeVoucherParams]);

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

  // Transform data to show grouped by date with date headers and totals
  const groupedDataWithHeaders = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by date
    const grouped: Record<string, TimeVoucherData[]> = {};
    
    (data as TimeVoucherData[]).forEach((item) => {
      // Extract date from time string (e.g., "Wednesday, November 5th, 2025 04:00 PM" -> "Wednesday, November 5th, 2025")
      const timeStr = item.time;
      const dateMatch = timeStr.match(/([A-Za-z]+,\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?,\s+\d{4})/);
      const dateKey = dateMatch ? dateMatch[1] : timeStr.split(' ').slice(0, -2).join(' ');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    // Create display data with date headers, lessons, and date totals
    const displayData: (TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean; dateLabel?: string })[] = [];
    
    // Sort dates chronologically
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      let dateA = parseTimeString(a);
      if (!dateA) {
        const cleaned = a.replace(/(\d+)(st|nd|rd|th)/g, '$1');
        const parsed = parse(cleaned, "EEEE, MMMM d, yyyy", new Date());
        dateA = isValid(parsed) ? parsed : null;
      }
      
      let dateB = parseTimeString(b);
      if (!dateB) {
        const cleaned = b.replace(/(\d+)(st|nd|rd|th)/g, '$1');
        const parsed = parse(cleaned, "EEEE, MMMM d, yyyy", new Date());
        dateB = isValid(parsed) ? parsed : null;
      }
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
    
    sortedDates.forEach((dateKey) => {
      const lessons = grouped[dateKey];
      
      // Calculate total duration for this date
      const dateTotal = lessons.reduce((sum, lesson) => {
        const duration = parseFloat(lesson.duration);
        return sum + (isNaN(duration) ? 0 : duration);
      }, 0);
      
      // Add date header row
      displayData.push({
        id: `date-header-${dateKey}`,
        time: dateKey,
        program: '',
        student: '',
        duration: '',
        isDateHeader: true,
        isDateTotal: false,
        dateLabel: dateKey,
      });
      
      // Add lesson rows
      lessons.forEach((lesson) => {
        displayData.push({
          ...lesson,
          isDateHeader: false,
          isDateTotal: false,
        });
      });
      
      // Add date total row
      displayData.push({
        id: `date-total-${dateKey}`,
        time: '',
        program: '',
        student: '',
        duration: dateTotal.toFixed(2),
        isDateHeader: false,
        isDateTotal: true,
        dateLabel: '',
      });
    });
    
    return displayData;
  }, [data]);

  // Create columns with date header and total support
  const groupedColumns: ColumnDef<TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean; dateLabel?: string }>[] = useMemo(() => [
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => {
        const original = row.original as TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean; dateLabel?: string };
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
        // Check if this is the footer row (id === "-1")
        const isFooterRow = original.id === "-1";
        if (isFooterRow) {
          return (
            <div className="font-bold text-foreground">
              {original.time}
            </div>
          );
        }
        // Extract just the time from the full time string (e.g., "Wednesday, November 5th, 2025 04:00 PM" -> "04:00 PM")
        const timeMatch = original.time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        return <div>{timeMatch ? timeMatch[1] : original.time}</div>;
      },
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => {
        const original = row.original as TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean };
        if (original.isDateHeader || original.isDateTotal) {
          return null;
        }
        return <div>{original.program}</div>;
      },
    },
    {
      accessorKey: "student",
      header: "Student",
      cell: ({ row }) => {
        const original = row.original as TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean };
        if (original.isDateHeader || original.isDateTotal) {
          return null;
        }
        return <div>{original.student}</div>;
      },
    },
    {
      accessorKey: "duration",
      header: "Duration(hrs)",
      cell: ({ row }) => {
        const original = row.original as TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean };
        if (original.isDateHeader) {
          return null;
        }
        if (original.isDateTotal) {
          return (
            <div className="font-bold text-foreground text-right">
              {parseFloat(original.duration).toFixed(2)}
            </div>
          );
        }
        // Check if this is the footer row (id === "-1")
        const isFooterRow = original.id === "-1";
        return (
          <div className={`text-right ${isFooterRow ? 'font-bold' : ''}`}>
            {original.duration}
          </div>
        );
      },
    },
  ], []);

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
    if (!summariseReport || !data || data.length === 0) return null;

    const rawData = data as TimeVoucherData[];
    const grouped = rawData.reduce((acc: Record<string, SummarizedTimeVoucherData>, item: TimeVoucherData) => {
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
    const sorted = Object.values(grouped).sort((a: SummarizedTimeVoucherData, b: SummarizedTimeVoucherData) => {
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
  }, [data, summariseReport]);

  // Calculate total duration for footer
  const totalDuration = useMemo(() => {
    if (summariseReport) {
      if (!summarizedData || summarizedData.length === 0) return "0.00";
      const total = summarizedData.reduce((sum: number, item: SummarizedTimeVoucherData) => sum + item.duration, 0);
      return total.toFixed(2);
    }
    
    if (!data || data.length === 0) return "0.00";
    const rawData = data as TimeVoucherData[];
    const total = rawData.reduce((sum: number, item: TimeVoucherData) => {
      const duration = parseFloat(item.duration);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0);
    
    return total.toFixed(2);
  }, [data, summarizedData, summariseReport]);

  // Create footer data objects that match the column structure
  const summarizedFooterRow: SummarizedTimeVoucherData = useMemo(() => ({
    date: "Total:",
    duration: parseFloat(totalDuration),
  }), [totalDuration]);

  const regularFooterRow: TimeVoucherData & { isDateHeader?: boolean; isDateTotal?: boolean } = useMemo(() => ({
    id: "-1",
    time: "Total:",
    program: "",
    student: "",
    duration: totalDuration,
    isDateHeader: false,
    isDateTotal: false,
  }), [totalDuration]);

  // Handle print functionality - redirect to print URL with date range and summary parameters
  const handlePrintClick = () => {
    // Format date range as "MMM dd,yyyy - MMM dd,yyyy" (e.g., "Dec 03,2025 - Dec 03,2025")
    const formatDateForPrint = (date: Date): string => {
      return format(date, 'MMM dd,yyyy');
    };
    
    const dateRangeStr = `${formatDateForPrint(appliedDateRange.from)} - ${formatDateForPrint(appliedDateRange.to)}`;
    const summariseReportValue = summariseReport ? '1' : '0';
    
    // Build URL with query parameters
    const params = new URLSearchParams({
      id: teacherId.toString(),
      'LessonSearch[dateRange]': dateRangeStr,
      'LessonSearch[summariseReport]': summariseReportValue,
    });
    
    const printUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/print/teacher-lessons?${params.toString()}`;
    window.open(printUrl, '_blank');
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
            onCheckedChange={(checked) => handleSummariseReportChange(checked === true)}
          />
          <label htmlFor="summarise-report-voucher" className="text-sm">
            Summarise Report
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {timeVoucherError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">{timeVoucherError}</div>
          </div>
        )}
        {summariseReport ? (
          <CustomTable
            data={summarizedData || []}
            columns={summarizedColumns}
            footerRow={summarizedFooterRow}
            enablePrint={true}
            onPrint={handlePrintClick}
            isLoading={timeVoucherLoading}
            customEmptyState={
              !timeVoucherLoading && (!summarizedData || summarizedData.length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No time voucher data found for the selected date range</span>
                </div>
              ) : undefined
            }
          />
        ) : (
          <CustomTable
            data={groupedDataWithHeaders}
            columns={groupedColumns}
            footerRow={regularFooterRow}
            enablePrint={true}
            onPrint={handlePrintClick}
            isLoading={timeVoucherLoading}
            customEmptyState={
              !timeVoucherLoading && groupedDataWithHeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No time voucher data found for the selected date range</span>
                </div>
              ) : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

