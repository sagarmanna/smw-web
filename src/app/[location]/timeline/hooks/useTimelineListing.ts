"use client";

import * as React from "react";
import { getMockTimelineData, TimelineRow } from "../timelineListing.api";
import { getTimelineUsers } from "../utils/timelineUtils";
import { isWithinInterval, isValid, parseISO, startOfDay, endOfDay } from "date-fns";

// Initialize default date filter to today
const getDefaultDateFilter = () => {
  const today = new Date();
  return {
    from: startOfDay(today),
    to: endOfDay(today),
  };
};

export function useTimelineListing() {
  const [allData] = React.useState<TimelineRow[]>(() => getMockTimelineData());
  const [filteredData, setFilteredData] = React.useState<TimelineRow[]>(allData);
  const [isLoading] = React.useState(false);
  const [error] = React.useState<string | null>(null);
  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>(() => ({
    date: getDefaultDateFilter(),
  }));
  
  const users = React.useMemo(() => getTimelineUsers(allData), [allData]);
  
  // Helper to check if value is a date range
  const isDateRange = (val: unknown): val is { from?: Date; to?: Date } => {
    if (val === null || typeof val !== 'object') return false;
    return (
      'from' in (val as { from?: unknown }) || 
      'to' in (val as { to?: unknown })
    );
  };
  
  // Apply filters
  React.useEffect(() => {
    let result = [...allData];
    
    // Apply date range filter
    const dateFilter = columnFilters.date;
    if (dateFilter && isDateRange(dateFilter) && dateFilter.from && dateFilter.to) {
      result = result.filter(row => {
        const rowDate = parseISO(row.date);
        if (!isValid(rowDate)) return false;
        try {
          return isWithinInterval(rowDate, {
            start: dateFilter.from!,
            end: dateFilter.to!,
          });
        } catch {
          return false;
        }
      });
    }
    
    // Apply created user filter
    const createdUserFilter = columnFilters.createdUser;
    if (createdUserFilter && typeof createdUserFilter === 'string' && createdUserFilter !== 'all') {
      result = result.filter(row => row.createdUser === createdUserFilter);
    }
    
    // Apply message filter (text search)
    const messageFilter = columnFilters.message;
    if (messageFilter && typeof messageFilter === 'string' && messageFilter.trim() !== '') {
      const searchTerm = messageFilter.toLowerCase();
      result = result.filter(row => {
        // Strip HTML tags for searching
        const textContent = row.message.replace(/<[^>]*>/g, '').toLowerCase();
        return textContent.includes(searchTerm);
      });
    }
    
    setFilteredData(result);
    // Reset to page 1 when filters change
    setPage(1);
  }, [allData, columnFilters]);
  
  // Paginate filtered data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, page, pageSize]);
  
  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);
  
  const handleColumnFilterChange = React.useCallback(
    (columnKey: string, filterValue: unknown) => {
      let value = filterValue;
      
      // Handle date range - store as Date objects directly (no serialization needed for local state)
      // The CustomTable ColumnFilter component passes Date objects, so we can store them directly
      if (columnKey === 'date' && isDateRange(filterValue)) {
        // Keep as DateRange object with Date objects
        value = filterValue;
      } else if (filterValue === "all" || filterValue === "" || filterValue === null) {
        value = undefined;
      }
      
      setColumnFilters(prev => ({
        ...prev,
        [columnKey]: value,
      }));
    },
    []
  );
  
  const handleColumnFilterEnter = React.useCallback(
    (columnKey: string) => {
      // For text filters, trigger filter immediately on Enter
      // Already handled by handleColumnFilterChange
    },
    []
  );
  
  const handleSetPage = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  const handleSetPageSize = React.useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);
  
  return {
    rows: paginatedData,
    total,
    totalPages,
    isLoading,
    error,
    page,
    setPage: handleSetPage,
    pageSize,
    setPageSize: handleSetPageSize,
    columnFilters,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    users,
    fetchData: React.useCallback(() => {}, []), // No-op for mock data
  };
}

