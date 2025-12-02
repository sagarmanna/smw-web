"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchTeachers, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters, 
  setActiveFilter 
} from "../teachersListing.slice";
import { TeachersQuery } from "../teachers.api";
import { SortField } from "../utils/sortTeachers";

export function useTeacherListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.teachersListing.rows);
  const total = useAppSelector((state) => state.teachersListing.total);
  const totalPages = useAppSelector((state) => state.teachersListing.totalPages);
  const isLoading = useAppSelector((state) => state.teachersListing.isLoading);
  const error = useAppSelector((state) => state.teachersListing.error);
  const page = useAppSelector((state) => state.teachersListing.page);
  const pageSize = useAppSelector((state) => state.teachersListing.pageSize);
  const sortBy = useAppSelector((state) => state.teachersListing.sortBy);
  const sortDir = useAppSelector((state) => state.teachersListing.sortDir);
  const columnFilters = useAppSelector((state) => state.teachersListing.columnFilters);
  const activeFilter = useAppSelector((state) => state.teachersListing.activeFilter);

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
  ): TeachersQuery => {
    const showActive = currentActiveFilter === 'inactive' ? false : true;
    const showInActive = currentActiveFilter === 'active' ? false : true;

    return {
      page: currentPage,
      limit: currentPageSize,
      firstName: currentColumnFilters.firstName as string | undefined,
      lastName: currentColumnFilters.lastName as string | undefined,
      email: currentColumnFilters.email as string | undefined,
      phone: currentColumnFilters.phoneNumber as string | undefined,
      showActive,
      showInActive,
      sort: currentSortBy,
      order: currentSortDir,
    };
  }, []);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, activeFilter, sortBy, sortDir);
    await dispatch(fetchTeachers({ location, query }));
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
      dispatch(fetchTeachers({ location, query }));
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
        [columnKey]: filterValue,
      };
      dispatch(setColumnFilters(newFilters));
      
      // If filter is being cleared (null, empty string, or undefined), trigger API call immediately
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined;
      if (isClearing) {
        // Update ref immediately for the API call
        columnFiltersRef.current = newFilters;
        // Trigger API call with cleared filter
        const query = buildQuery(1, pageSize, newFilters, activeFilter, sortBy, sortDir);
        dispatch(fetchTeachers({ location, query }));
        // Also reset page to 1 when clearing filter
        dispatch(setPage(1));
      }
    },
    [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed, bypassing debounce
    // Map active filter to API parameters:
    // all (undefined): showActive=true, showInActive=true
    // active: showActive=true, showInActive=false
    // inactive: showActive=false, showInActive=true
    const showActive = activeFilter === 'inactive' ? false : true;
    const showInActive = activeFilter === 'active' ? false : true;

    const query: TeachersQuery = {
      page: 1, // Reset to first page when filtering
      limit: pageSize,
      firstName: columnFilters.firstName as string | undefined,
      lastName: columnFilters.lastName as string | undefined,
      email: columnFilters.email as string | undefined,
      phone: columnFilters.phoneNumber as string | undefined,
      showActive,
      showInActive,
      sort: sortBy,
      order: sortDir,
    };
    dispatch(fetchTeachers({ location, query }));
  }, [dispatch, location, pageSize, columnFilters, activeFilter, sortBy, sortDir]);

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


