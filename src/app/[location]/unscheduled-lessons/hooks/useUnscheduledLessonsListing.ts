"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchUnscheduledLessons, 
  setPage, 
  setPageSize, 
  setColumnFilters,
  setActiveFilter,
} from "../unscheduledLessonsListing.slice";
import { UnscheduledLessonsQuery } from "../unscheduledLessonsListing.api";

export function useUnscheduledLessonsListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.unscheduledLessonsListing.rows);
  const total = useAppSelector((state) => state.unscheduledLessonsListing.total);
  const totalPages = useAppSelector((state) => state.unscheduledLessonsListing.totalPages);
  const isLoading = useAppSelector((state) => state.unscheduledLessonsListing.isLoading);
  const error = useAppSelector((state) => state.unscheduledLessonsListing.error);
  const page = useAppSelector((state) => state.unscheduledLessonsListing.page);
  const pageSize = useAppSelector((state) => state.unscheduledLessonsListing.pageSize);
  const columnFilters = useAppSelector((state) => state.unscheduledLessonsListing.columnFilters);
  const activeFilter = useAppSelector((state) => state.unscheduledLessonsListing.activeFilter);

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
  } | null>(null);

  // Build query function - not memoized to avoid unnecessary recreations
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>
  ): UnscheduledLessonsQuery => {
    const query: UnscheduledLessonsQuery = {
      page: currentPage,
      limit: currentPageSize,
      student: currentColumnFilters.student as string | undefined,
      program: currentColumnFilters.program as string | undefined,
      teacher: currentColumnFilters.teacher as string | undefined,
    };

    return query;
  }, []);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters);
    await dispatch(fetchUnscheduledLessons({ location, query, activeFilter }));
  }, [dispatch, location, page, pageSize, columnFilters, activeFilter, buildQuery]);

  // Keep columnFilters ref in sync
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Single effect for initial load and non-filter changes (pagination, etc.)
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
      prevParamsRef.current.activeFilter !== activeFilter;

    // Update previous params
    prevParamsRef.current = {
      location,
      page,
      pageSize,
      activeFilter,
    };

    // Fetch if initial load OR if any param changed
    if (!hasInitialFetchedRef.current || paramsChanged) {
      hasInitialFetchedRef.current = true;
      const query = buildQuery(page, pageSize, columnFiltersRef.current);
      dispatch(fetchUnscheduledLessons({ location, query, activeFilter }));
    }
  }, [location, page, pageSize, activeFilter, dispatch, buildQuery]);

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
      
      // Immediately trigger API call when clearing any filter
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined || filterValue === "all";
      
      if (isClearing) {
        // Trigger API call immediately when clearing filters
        const query = buildQuery(1, pageSize, newFilters);
        dispatch(fetchUnscheduledLessons({ location, query, activeFilter }));
        // Also reset page to 1 when filtering
        dispatch(setPage(1));
      }
    },
    [dispatch, location, pageSize, activeFilter, buildQuery]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed, bypassing debounce
    const query = buildQuery(1, pageSize, columnFiltersRef.current);
    dispatch(fetchUnscheduledLessons({ location, query, activeFilter }));
    dispatch(setPage(1));
  }, [dispatch, location, pageSize, activeFilter, buildQuery]);

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

