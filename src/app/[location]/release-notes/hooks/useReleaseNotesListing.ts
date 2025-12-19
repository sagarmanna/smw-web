"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchReleaseNotes, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters,
  resetReleaseNotesState
} from "../releaseNotesListing.slice";
import type { ReleaseNotesQuery } from "../types";

export function useReleaseNotesListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.releaseNotesListing.rows);
  const total = useAppSelector((state) => state.releaseNotesListing.total);
  const totalPages = useAppSelector((state) => state.releaseNotesListing.totalPages);
  const isLoading = useAppSelector((state) => state.releaseNotesListing.isLoading);
  const error = useAppSelector((state) => state.releaseNotesListing.error);
  const page = useAppSelector((state) => state.releaseNotesListing.page);
  const pageSize = useAppSelector((state) => state.releaseNotesListing.pageSize);
  const sortBy = useAppSelector((state) => state.releaseNotesListing.sortBy);
  const sortDir = useAppSelector((state) => state.releaseNotesListing.sortDir);
  const columnFilters = useAppSelector((state) => state.releaseNotesListing.columnFilters);

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
    sortBy: "subject" | "scheduleDate" | "createdDate" | undefined;
    sortDir: 'asc' | 'desc';
  } | null>(null);
  // Track last fetch request to prevent duplicate calls
  const lastFetchRef = React.useRef<string | null>(null);

  // Build query function
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>,
    currentSortBy: "subject" | "scheduleDate" | "createdDate" | undefined,
    currentSortDir: 'asc' | 'desc'
  ): ReleaseNotesQuery => {
    return {
      page: currentPage,
      limit: currentPageSize,
      subject: currentColumnFilters.subject as string | undefined,
      sort: currentSortBy,
      order: currentSortDir,
    };
  }, []);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, sortBy, sortDir);
    await dispatch(fetchReleaseNotes({ location, query }));
  }, [dispatch, location, page, pageSize, columnFilters, sortBy, sortDir, buildQuery]);

  // Keep columnFilters ref in sync
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Single effect for initial load and non-filter changes (pagination, sorting, etc.)
  React.useEffect(() => {
    // Check if location changed
    const locationChanged = lastLocationRef.current !== null && lastLocationRef.current !== location;
    
    if (locationChanged) {
      // Reset tracking refs when location changes
      hasInitialFetchedRef.current = false;
      prevParamsRef.current = null;
      lastFetchRef.current = null;
      // Reset Redux state when location changes
      dispatch(resetReleaseNotesState());
      lastLocationRef.current = location;
      // Early return to let the state reset complete, then next render will fetch
      return;
    }
    
    lastLocationRef.current = location;

    // Check if any param changed
    const paramsChanged = prevParamsRef.current === null || 
      prevParamsRef.current.location !== location ||
      prevParamsRef.current.page !== page ||
      prevParamsRef.current.pageSize !== pageSize ||
      prevParamsRef.current.sortBy !== sortBy ||
      prevParamsRef.current.sortDir !== sortDir;

    // Create a unique key for this request to prevent duplicate calls
    const requestKey = `${location}-${page}-${pageSize}-${sortBy}-${sortDir}`;
    
    // Skip if this exact request was already made (prevents duplicate calls)
    if (lastFetchRef.current === requestKey) {
      return;
    }

    // Fetch if initial load OR if any param changed
    if (!hasInitialFetchedRef.current || paramsChanged) {
      hasInitialFetchedRef.current = true;
      lastFetchRef.current = requestKey;
      
      // Update previous params BEFORE dispatching to prevent race conditions
      prevParamsRef.current = {
        location,
        page,
        pageSize,
        sortBy,
        sortDir,
      };
      
      const query = buildQuery(page, pageSize, columnFiltersRef.current, sortBy, sortDir);
      dispatch(fetchReleaseNotes({ location, query }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, page, pageSize, sortBy, sortDir, dispatch]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as "subject" | "scheduleDate" | "createdDate" | undefined;
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
        const query = buildQuery(1, pageSize, newFilters, sortBy, sortDir);
        dispatch(fetchReleaseNotes({ location, query }));
        // Also reset page to 1 when clearing filter
        dispatch(setPage(1));
      }
    },
    [dispatch, location, pageSize, sortBy, sortDir, buildQuery]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed
    const query: ReleaseNotesQuery = {
      page: 1, // Reset to first page when filtering
      limit: pageSize,
      subject: columnFilters.subject as string | undefined,
      sort: sortBy,
      order: sortDir,
    };
    dispatch(fetchReleaseNotes({ location, query }));
  }, [dispatch, location, pageSize, columnFilters, sortBy, sortDir]);

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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  };
}

