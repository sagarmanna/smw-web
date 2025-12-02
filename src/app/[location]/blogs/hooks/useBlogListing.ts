"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchBlogs, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters,
  resetBlogsState
} from "../blogsListing.slice";
import { BlogsQuery } from "../blogs.api";

/**
 * Custom hook for managing blog listing state and operations
 * 
 * Handles:
 * - Server-side pagination
 * - Sorting (prepared for future implementation)
 * - Data fetching with duplicate request prevention
 * - State management via Redux
 * 
 * @param location - Current location context
 * @returns Object containing blog data, loading state, error state, and control functions
 * 
 * @example
 * ```typescript
 * const { rows, isLoading, page, setPage } = useBlogListing('location1');
 * ```
 */
export function useBlogListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.blogsListing.rows);
  const total = useAppSelector((state) => state.blogsListing.total);
  const totalPages = useAppSelector((state) => state.blogsListing.totalPages);
  const isLoading = useAppSelector((state) => state.blogsListing.isLoading);
  const error = useAppSelector((state) => state.blogsListing.error);
  const page = useAppSelector((state) => state.blogsListing.page);
  const pageSize = useAppSelector((state) => state.blogsListing.pageSize);
  const sortBy = useAppSelector((state) => state.blogsListing.sortBy);
  const sortDir = useAppSelector((state) => state.blogsListing.sortDir);
  const columnFilters = useAppSelector((state) => state.blogsListing.columnFilters);

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
    sortBy: string | undefined;
    sortDir: 'asc' | 'desc';
  } | null>(null);
  // Track last fetch request to prevent duplicate calls
  const lastFetchRef = React.useRef<string | null>(null);

  /**
   * Builds query object for API request
   * Simplified version - can be extended for filters/sorting
   */
  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number
  ): BlogsQuery => {
    return {
      page: currentPage,
      limit: currentPageSize,
    };
  }, []);

  /**
   * Manually triggers a data fetch (useful for retry scenarios)
   */
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize);
    await dispatch(fetchBlogs({ location, query }));
    // Update fetch tracking to prevent duplicate calls
    const requestKey = `${location}-${page}-${pageSize}-${sortBy}-${sortDir}`;
    lastFetchRef.current = requestKey;
  }, [dispatch, location, page, pageSize, sortBy, sortDir]);

  // Keep columnFilters ref in sync
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  /**
   * Main effect for fetching data on mount and when dependencies change
   * Includes duplicate request prevention logic
   */
  React.useEffect(() => {
    // Check if location changed
    const locationChanged = lastLocationRef.current !== null && lastLocationRef.current !== location;
    
    if (locationChanged) {
      // Reset tracking refs when location changes
      hasInitialFetchedRef.current = false;
      prevParamsRef.current = null;
      lastFetchRef.current = null;
      // Reset Redux state when location changes (do this first to avoid re-render issues)
      dispatch(resetBlogsState());
      lastLocationRef.current = location;
      // Early return to let the state reset complete, then next render will fetch
      return;
    }
    
    lastLocationRef.current = location;

    // Check if any param changed (except columnFilters which is handled separately)
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
      
      const query = buildQuery(page, pageSize);
      dispatch(fetchBlogs({ location, query }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, page, pageSize, sortBy, sortDir, dispatch]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as string | undefined;
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

  // Note: Column filter handlers are kept for future use but currently unused
  // since enableColumnFilters={false} in BlogsListingClient
  const handleColumnFilterChange = React.useCallback(
    (_columnKey: string, _filterValue: unknown) => {
      // Placeholder for future filter implementation
    },
    []
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Placeholder for future filter implementation
  }, []);

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

