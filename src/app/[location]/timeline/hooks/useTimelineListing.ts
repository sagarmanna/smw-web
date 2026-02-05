"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchTimeline, 
  fetchCreatedUsers,
  setPage, 
  setPageSize, 
  setColumnFilters 
} from "../timelineListing.slice";
import { TimelineQuery } from "../timelineListing.api";
import { format } from "date-fns";

// Helper to check if value is a date range-like object
const isDateRange = (val: unknown): val is { from?: unknown; to?: unknown } => {
  if (val === null || typeof val !== 'object') return false;
  return (
    'from' in (val as { from?: unknown }) || 
    'to' in (val as { to?: unknown })
  );
};

export function useTimelineListing() {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.timelineListing.rows);
  const total = useAppSelector((state) => state.timelineListing.total);
  const totalPages = useAppSelector((state) => state.timelineListing.totalPages);
  const isLoading = useAppSelector((state) => state.timelineListing.isLoading);
  const error = useAppSelector((state) => state.timelineListing.error);
  const page = useAppSelector((state) => state.timelineListing.page);
  const pageSize = useAppSelector((state) => state.timelineListing.pageSize);
  const columnFilters = useAppSelector((state) => state.timelineListing.columnFilters);
  const createdUsers = useAppSelector((state) => state.timelineListing.createdUsers);
  const isLoadingUsers = useAppSelector((state) => state.timelineListing.isLoadingUsers);

  // Store latest columnFilters in ref to avoid dependency in callbacks
  const columnFiltersRef = React.useRef(columnFilters);

  // Build query function
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>
  ): TimelineQuery => {
    const query: TimelineQuery = {
      page: currentPage,
      limit: currentPageSize,
    };

    // Handle date range filter
    const dateFilter = currentColumnFilters.date;
    if (dateFilter && isDateRange(dateFilter) && dateFilter.from && dateFilter.to) {
      const fromVal = dateFilter.from;
      const toVal = dateFilter.to;

      if (fromVal instanceof Date && toVal instanceof Date) {
        // Defensive: if Dates somehow reach here, normalize to strings
        query.fromDate = format(fromVal, "yyyy-MM-dd");
        query.toDate = format(toVal, "yyyy-MM-dd");
      } else {
        // Normal path: values already stored as serializable strings
        query.fromDate = String(fromVal);
        query.toDate = String(toVal);
      }
    }

    // Handle created user filter (userId) - stored as string to match dropdown values for display
    const createdUserFilter = currentColumnFilters.createdUser;
    if (createdUserFilter && createdUserFilter !== 'all') {
      const parsed = typeof createdUserFilter === 'string'
        ? parseInt(createdUserFilter, 10)
        : typeof createdUserFilter === 'number'
          ? createdUserFilter
          : NaN;
      if (!isNaN(parsed)) {
        query.createdUserId = parsed;
      }
    }

    // Handle message filter
    const messageFilter = currentColumnFilters.message;
    if (messageFilter && typeof messageFilter === 'string' && messageFilter.trim() !== '') {
      query.message = messageFilter;
    }

    return query;
  }, []);


  // Keep columnFilters ref in sync
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Fetch created users when component mounts or location changes
  const fetchUsers = React.useCallback(async (location: string) => {
    await dispatch(fetchCreatedUsers(location));
  }, [dispatch]);

  // Return a wrapped fetchData that can be called with location
  const wrappedFetchData = React.useCallback(async (location: string) => {
    const query = buildQuery(page, pageSize, columnFilters);
    await dispatch(fetchTimeline({ location, query }));
  }, [dispatch, page, pageSize, columnFilters, buildQuery]);

  const handleSetPage = React.useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleSetPageSize = React.useCallback(
    (newSize: number) => {
      dispatch(setPageSize(newSize));
    },
    [dispatch]
  );

  const handleColumnFilterChange = React.useCallback(
    (columnKey: string, filterValue: unknown) => {
      let value = filterValue;
      
      // Handle date range - normalize to serializable string values in state
      if (columnKey === 'date' && isDateRange(filterValue)) {
        const from = filterValue.from;
        const to = filterValue.to;

        value = {
          from: from instanceof Date ? format(from, "yyyy-MM-dd") : from ? String(from) : undefined,
          to: to instanceof Date ? format(to, "yyyy-MM-dd") : to ? String(to) : undefined,
        };
      } else if (columnKey === 'createdUser') {
        // Keep as string to match dropdown option values - ColumnFilter looks up by value to show label (username)
        if (typeof filterValue === 'string' && filterValue !== 'all' && filterValue !== '') {
          value = filterValue;
        } else {
          value = undefined;
        }
      } else if (filterValue === "all" || filterValue === "" || filterValue === null) {
        value = undefined;
      }
      
      // Use ref to get latest value without dependency
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]: value,
      };
      dispatch(setColumnFilters(newFilters));
      
      // If filter is being cleared (null, empty string, or undefined), reset to page 1
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined || filterValue === 'all';
      if (isClearing) {
        // Update ref immediately
        columnFiltersRef.current = newFilters;
        // Reset page to 1 when clearing filter
        dispatch(setPage(1));
      }
    },
    [dispatch]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Reset to page 1 when filtering
    dispatch(setPage(1));
  }, [dispatch]);

  return {
    rows,
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
    createdUsers,
    isLoadingUsers,
    fetchData: wrappedFetchData,
    fetchUsers,
  };
}

