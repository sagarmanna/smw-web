"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchEnrolments, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters,
  setActiveFilter
} from "../enrolmentsListing.slice";
import { EnrolmentsQuery } from "../enrolmentsListing.api";
import { SortField } from "../utils/sortEnrolments";

export function useEnrolmentListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.enrolmentsListing.rows);
  const total = useAppSelector((state) => state.enrolmentsListing.total);
  const totalPages = useAppSelector((state) => state.enrolmentsListing.totalPages);
  const isLoading = useAppSelector((state) => state.enrolmentsListing.isLoading);
  const error = useAppSelector((state) => state.enrolmentsListing.error);
  const page = useAppSelector((state) => state.enrolmentsListing.page);
  const pageSize = useAppSelector((state) => state.enrolmentsListing.pageSize);
  const sortBy = useAppSelector((state) => state.enrolmentsListing.sortBy);
  const sortDir = useAppSelector((state) => state.enrolmentsListing.sortDir);
  const columnFilters = useAppSelector((state) => state.enrolmentsListing.columnFilters);
  const activeFilter = useAppSelector((state) => state.enrolmentsListing.activeFilter);

  // Convert Redux sorting state to TanStack Table format
  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === 'desc' }];
  }, [sortBy, sortDir]);

  // Track if initial fetch has been done to prevent duplicate calls
  const hasInitialFetchedRef = React.useRef(false);
  // Track last location to detect location changes
  const lastLocationRef = React.useRef<string | null>(null);
  // Store latest columnFilters in ref to avoid dependency in callbacks
  const columnFiltersRef = React.useRef(columnFilters);
  // Track previous values to detect changes
  const prevParamsRef = React.useRef<{
    location: string;
    page: number;
    pageSize: number;
    activeFilter: string | undefined;
    sortBy: SortField | undefined;
    sortDir: 'asc' | 'desc';
  } | null>(null);

  // Helper to check if value is a date range
  const isDateRange = (val: unknown): val is { from?: Date; to?: Date } => {
    if (val === null || typeof val !== 'object') return false;
    return (
      'from' in (val as { from?: unknown }) ||
      'to' in (val as { to?: unknown })
    );
  };

  // Build query function - not memoized to avoid unnecessary recreations
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>,
    currentActiveFilter: string | undefined,
    currentSortBy: SortField | undefined,
    currentSortDir: 'asc' | 'desc'
  ): EnrolmentsQuery => {
    const query: EnrolmentsQuery = {
      page: currentPage,
      limit: currentPageSize,
      program: currentColumnFilters.program as string | undefined,
      student: currentColumnFilters.student as string | undefined,
      teacher: currentColumnFilters.teacher as string | undefined,
      autoRenewal: currentColumnFilters.autoRenewal as string | undefined,
      lessonsRemaining: currentColumnFilters.lessonsRemaining as string | undefined,
      sort: currentSortBy,
      order: currentSortDir,
    };

    // Handle Start Date range filter
    const startDateFilter = currentColumnFilters.startDate;
    if (isDateRange(startDateFilter) && startDateFilter.from && startDateFilter.to) {
      query.startDateFrom = format(startDateFilter.from, 'yyyy-MM-dd');
      query.startDateTo = format(startDateFilter.to, 'yyyy-MM-dd');
    }

    // Handle End Date range filter
    const endDateFilter = currentColumnFilters.endDate;
    if (isDateRange(endDateFilter) && endDateFilter.from && endDateFilter.to) {
      query.endDateFrom = format(endDateFilter.from, 'yyyy-MM-dd');
      query.endDateTo = format(endDateFilter.to, 'yyyy-MM-dd');
    }

    return query;
  }, []);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, activeFilter, sortBy, sortDir);
    await dispatch(fetchEnrolments({ location, query }));
  }, [dispatch, location, page, pageSize, columnFilters, activeFilter, sortBy, sortDir, buildQuery]);

  // Keep columnFilters ref in sync
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Single effect for initial load and non-filter changes (pagination, sorting, etc.)
  // NOTE: columnFilters is NOT in dependencies - API only called on Enter key press via handleColumnFilterEnter
  React.useEffect(() => {
    // Check if location changed
    const locationChanged = lastLocationRef.current !== null && lastLocationRef.current !== location;
    if (locationChanged) {
      hasInitialFetchedRef.current = false;
      prevParamsRef.current = null; // Reset prev params on location change
    }
    lastLocationRef.current = location;

    // Check if any param changed (except columnFilters which is handled separately)
    const paramsChanged = prevParamsRef.current === null || 
      prevParamsRef.current.location !== location ||
      prevParamsRef.current.page !== page ||
      prevParamsRef.current.pageSize !== pageSize ||
      prevParamsRef.current.activeFilter !== activeFilter ||
      prevParamsRef.current.sortBy !== sortBy ||
      prevParamsRef.current.sortDir !== sortDir;

    // Update previous params
    prevParamsRef.current = {
      location,
      page,
      pageSize,
      activeFilter,
      sortBy,
      sortDir,
    };

    // Fetch if initial load OR if any param changed
    if (!hasInitialFetchedRef.current || paramsChanged) {
      hasInitialFetchedRef.current = true;
      const query = buildQuery(page, pageSize, columnFiltersRef.current, activeFilter, sortBy, sortDir);
      dispatch(fetchEnrolments({ location, query }));
    }
  }, [location, page, pageSize, activeFilter, sortBy, sortDir, dispatch, buildQuery]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as SortField | undefined;
      const sortDir = newSorting[0]?.desc ? 'desc' : 'asc';
      dispatch(setSorting({ sortBy, sortDir }));
    },
    [dispatch]
  );

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
      // Use ref to get latest value without dependency
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]: filterValue === "all" || filterValue === "" || filterValue === null ? undefined : filterValue,
      };
      dispatch(setColumnFilters(newFilters));
      
      // Update ref immediately for the API call
      columnFiltersRef.current = newFilters;
      
      // Check if it's a date range filter
      const isDateRangeFilter = columnKey === 'startDate' || columnKey === 'endDate';
      // Immediately trigger API call for dropdown filters (autoRenewal), date range filters, or when clearing any filter
      const isDropdownFilter = columnKey === 'autoRenewal';
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined || filterValue === "all";
      
      if (isDropdownFilter || isDateRangeFilter || isClearing) {
        // Trigger API call immediately for dropdown selections, date range selections, or when clearing filters
        const query = buildQuery(1, pageSize, newFilters, activeFilter, sortBy, sortDir);
        dispatch(fetchEnrolments({ location, query }));
        // Also reset page to 1 when filtering
        dispatch(setPage(1));
      }
    },
    [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed, bypassing debounce
    const query = buildQuery(1, pageSize, columnFiltersRef.current, activeFilter, sortBy, sortDir);
    dispatch(fetchEnrolments({ location, query }));
    dispatch(setPage(1));
  }, [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery]);


  const handleServerSideFilterChange = React.useCallback(
    (filterKey: string | undefined) => {
      dispatch(setActiveFilter(filterKey));
    },
    [dispatch]
  );

  return {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    sorting,
    setSorting: handleSetSorting,
    page,
    setPage: handleSetPage,
    pageSize,
    setPageSize: handleSetPageSize,
    columnFilters,
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  };
}

