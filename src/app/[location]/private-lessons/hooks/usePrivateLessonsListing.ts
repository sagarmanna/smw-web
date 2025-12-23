"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchPrivateLessons, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters,
  setActiveFilter
} from "../privateLessonsListing.slice";
import { PrivateLessonsQuery } from "../privateLessonsListing.api";
import { SortField } from "../utils/sortPrivateLessons";
import { 
  isDateRange, 
  serializeDateRange, 
  deserializeDateRange, 
  deserializeColumnFilters 
} from "../utils/dateRangeSerialization";

export function usePrivateLessonsListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.privateLessonsListing.rows);
  const total = useAppSelector((state) => state.privateLessonsListing.total);
  const totalPages = useAppSelector((state) => state.privateLessonsListing.totalPages);
  const isLoading = useAppSelector((state) => state.privateLessonsListing.isLoading);
  const error = useAppSelector((state) => state.privateLessonsListing.error);
  const page = useAppSelector((state) => state.privateLessonsListing.page);
  const pageSize = useAppSelector((state) => state.privateLessonsListing.pageSize);
  const sortBy = useAppSelector((state) => state.privateLessonsListing.sortBy);
  const sortDir = useAppSelector((state) => state.privateLessonsListing.sortDir);
  const columnFilters = useAppSelector((state) => state.privateLessonsListing.columnFilters);
  const activeFilter = useAppSelector((state) => state.privateLessonsListing.activeFilter);

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


  // Build query function - not memoized to avoid unnecessary recreations
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>,
    currentActiveFilter: string | undefined,
    currentSortBy: SortField | undefined,
    currentSortDir: 'asc' | 'desc'
  ): PrivateLessonsQuery => {
    const query: PrivateLessonsQuery = {
      page: currentPage,
      limit: currentPageSize,
      student: currentColumnFilters.student as string | undefined,
      program: currentColumnFilters.program as string | undefined,
      teacher: currentColumnFilters.teacher as string | undefined,
      online: currentColumnFilters.online as string | undefined,
      status: currentColumnFilters.status as string | undefined,
      payment: currentColumnFilters.payment as string | undefined,
      sort: currentSortBy,
      order: currentSortDir,
    };

    // Handle Date range filter (convert from ISO strings or Date objects)
    const dateFilter = currentColumnFilters.date;
    if (isDateRange(dateFilter) && dateFilter.from && dateFilter.to) {
      const fromDate = typeof dateFilter.from === 'string' ? new Date(dateFilter.from) : dateFilter.from;
      const toDate = typeof dateFilter.to === 'string' ? new Date(dateFilter.to) : dateFilter.to;
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        query.dateFrom = format(fromDate, 'yyyy-MM-dd');
        query.dateTo = format(toDate, 'yyyy-MM-dd');
      }
    }

    return query;
  }, []);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, activeFilter, sortBy, sortDir);
    await dispatch(fetchPrivateLessons({ location, query }));
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
      dispatch(fetchPrivateLessons({ location, query }));
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
      // Serialize Date objects to ISO strings before storing in Redux
      let serializedValue = filterValue;
      if (columnKey === 'date' && isDateRange(filterValue)) {
        serializedValue = serializeDateRange(filterValue);
      } else if (filterValue === "all" || filterValue === "" || filterValue === null) {
        serializedValue = undefined;
      }

      // Use ref to get latest value without dependency
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]: serializedValue,
      };
      dispatch(setColumnFilters(newFilters));
      
      // Update ref immediately for the API call (with serialized values)
      columnFiltersRef.current = newFilters;
      
      // Check if it's a date range filter
      const isDateRangeFilter = columnKey === 'date';
      // Immediately trigger API call for dropdown filters (online, status, payment), date range filters, or when clearing any filter
      const isDropdownFilter = columnKey === 'online' || columnKey === 'status' || columnKey === 'payment';
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined || filterValue === "all";
      
      if (isDropdownFilter || isDateRangeFilter || isClearing) {
        // Trigger API call immediately for dropdown selections, date range selections, or when clearing filters
        const query = buildQuery(1, pageSize, newFilters, activeFilter, sortBy, sortDir);
        dispatch(fetchPrivateLessons({ location, query }));
        // Also reset page to 1 when filtering
        dispatch(setPage(1));
      }
    },
    [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed, bypassing debounce
    const query = buildQuery(1, pageSize, columnFiltersRef.current, activeFilter, sortBy, sortDir);
    dispatch(fetchPrivateLessons({ location, query }));
    dispatch(setPage(1));
  }, [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery]);


  const handleServerSideFilterChange = React.useCallback(
    (filterKey: string | undefined) => {
      dispatch(setActiveFilter(filterKey));
    },
    [dispatch]
  );

  // Convert date filter from ISO strings (Redux) to Date objects (for components)
  const columnFiltersForComponents = React.useMemo(() => {
    return deserializeColumnFilters(columnFilters);
  }, [columnFilters]);

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
    columnFilters: columnFiltersForComponents, // Return converted filters with Date objects
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  };
}

