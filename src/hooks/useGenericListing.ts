"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { AsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

/**
 * Generic listing state interface
 */
export interface GenericListingState<TData> {
  rows: TData[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: 'asc' | 'desc';
  columnFilters: Record<string, unknown>;
  activeFilter?: string;
}

/**
 * Action creators interface
 */
export interface ListingActionCreators {
  setPage: (page: number) => PayloadAction<number>;
  setPageSize: (size: number) => PayloadAction<number>;
  setSorting: (payload: { sortBy?: string; sortDir: 'asc' | 'desc' }) => PayloadAction<{ sortBy?: string; sortDir: 'asc' | 'desc' }>;
  setColumnFilters: (filters: Record<string, unknown>) => PayloadAction<Record<string, unknown>>;
  setActiveFilter: (filter: string | undefined) => PayloadAction<string | undefined>;
}

/**
 * Configuration for generic listing hook
 */
export interface UseGenericListingConfig<TData, TQuery> {
  /**
   * Redux slice name (e.g., 'administratorsListing', 'staffMembersListing')
   */
  sliceName: string;
  
  /**
   * Async thunk for fetching data
   */
  fetchThunk: AsyncThunk<
    { rows: TData[]; total: number; totalPages: number },
    { location: string; query: TQuery },
    { rejectValue: unknown }
  >;
  
  /**
   * Action creators from the slice
   */
  actions: ListingActionCreators;
  
  /**
   * Function to build query from filters, pagination, and sorting
   */
  buildQuery: (
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: 'asc' | 'desc'
  ) => TQuery;
  
  /**
   * Location parameter
   */
  location: string;
  
  /**
   * Default sort field (optional)
   */
  defaultSortField?: string;
  
  /**
   * Default sort direction (optional, defaults to 'asc')
   */
  defaultSortDir?: 'asc' | 'desc';
}

/**
 * Return type for generic listing hook
 */
export interface UseGenericListingReturn<TData> {
  rows: TData[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  columnFilters: Record<string, unknown>;
  activeFilter: string | undefined;
  fetchData: () => Promise<void>;
  handleColumnFilterChange: (columnKey: string, filterValue: unknown) => void;
  handleColumnFilterEnter: () => void;
  handleServerSideFilterChange: (filterKey: string | undefined) => void;
}

/**
 * Generic hook for listing pages with server-side pagination, sorting, and filtering
 * 
 * @example
 * ```tsx
 * import { setPage, setPageSize, setSorting, setColumnFilters, setActiveFilter } from './staffMembersListing.slice';
 * 
 * const listing = useGenericListing({
 *   sliceName: 'staffMembersListing',
 *   fetchThunk: fetchStaffMembers,
 *   actions: { setPage, setPageSize, setSorting, setColumnFilters, setActiveFilter },
 *   buildQuery: (page, pageSize, filters, activeFilter, sortBy, sortDir) => ({
 *     page,
 *     limit: pageSize,
 *     firstName: filters.firstName as string | undefined,
 *     lastName: filters.lastName as string | undefined,
 *     email: filters.email as string | undefined,
 *     ...buildActiveFilterFlags(activeFilter),
 *     sort: sortBy as 'firstName' | 'lastName' | 'email',
 *     order: sortDir,
 *   }),
 *   location,
 *   defaultSortField: 'lastName',
 * });
 * ```
 */
export function useGenericListing<TData, TQuery>(
  config: UseGenericListingConfig<TData, TQuery>
): UseGenericListingReturn<TData> {
  const dispatch = useAppDispatch();
  const { sliceName, fetchThunk, actions, buildQuery, location, defaultSortField, defaultSortDir = 'asc' } = config;

  const isGenericListingState = (value: unknown): value is GenericListingState<TData> => {
    if (!value || typeof value !== "object") return false;
    const v = value as Record<string, unknown>;

    return (
      Array.isArray(v.rows) &&
      typeof v.total === "number" &&
      typeof v.totalPages === "number" &&
      typeof v.isLoading === "boolean" &&
      (v.error === null || typeof v.error === "string") &&
      typeof v.page === "number" &&
      typeof v.pageSize === "number" &&
      (v.sortBy === undefined || typeof v.sortBy === "string") &&
      (v.sortDir === "asc" || v.sortDir === "desc") &&
      !!v.columnFilters &&
      typeof v.columnFilters === "object" &&
      !Array.isArray(v.columnFilters) &&
      (v.activeFilter === undefined || typeof v.activeFilter === "string")
    );
  };

  // Get state from Redux using slice name
  const state = useAppSelector((rootState: RootState) => {
    const slice = (rootState as unknown as Record<string, unknown>)[sliceName];
    return isGenericListingState(slice) ? slice : undefined;
  });
  
  const rows = (state?.rows || []) as TData[];
  const total = state?.total || 0;
  const totalPages = state?.totalPages || 0;
  const isLoading = state?.isLoading || false;
  const error = state?.error || null;
  const page = state?.page || 1;
  const pageSize = state?.pageSize || 20;
  const sortBy = state?.sortBy ?? defaultSortField;
  const sortDir = state?.sortDir || defaultSortDir;
  // Memoize columnFilters to prevent unnecessary re-renders
  const columnFilters = React.useMemo(() => state?.columnFilters || {}, [state?.columnFilters]);
  const activeFilter = state?.activeFilter;

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
    sortBy: string | undefined;
    sortDir: 'asc' | 'desc';
  } | null>(null);

  // Fetch data function - stable reference, reads latest values from refs/state
  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, activeFilter, sortBy, sortDir);
    await dispatch(fetchThunk({ location, query }));
  }, [dispatch, location, page, pageSize, columnFilters, activeFilter, sortBy, sortDir, buildQuery, fetchThunk]);

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
      dispatch(fetchThunk({ location, query }));
    }
  }, [location, page, pageSize, activeFilter, sortBy, sortDir, dispatch, buildQuery, fetchThunk]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as string | undefined;
      const sortDir = newSorting[0]?.desc ? 'desc' : 'asc';
      dispatch(actions.setSorting({ sortBy, sortDir }));
    },
    [dispatch, actions]
  );

  const handleSetPage = React.useCallback(
    (newPage: number) => {
      dispatch(actions.setPage(newPage));
    },
    [dispatch, actions]
  );

  const handleSetPageSize = React.useCallback(
    (newSize: number) => {
      dispatch(actions.setPageSize(newSize));
    },
    [dispatch, actions]
  );

  const handleColumnFilterChange = React.useCallback(
    (columnKey: string, filterValue: unknown) => {
      // Use ref to get latest value without dependency
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]: filterValue,
      };
      dispatch(actions.setColumnFilters(newFilters));
      
      // If filter is being cleared (null, empty string, or undefined), trigger API call immediately
      const isClearing = filterValue === null || filterValue === '' || filterValue === undefined;
      if (isClearing) {
        // Update ref immediately for the API call
        columnFiltersRef.current = newFilters;
        // Trigger API call with cleared filter
        const query = buildQuery(1, pageSize, newFilters, activeFilter, sortBy, sortDir);
        dispatch(fetchThunk({ location, query }));
        // Also reset page to 1 when clearing filter
        dispatch(actions.setPage(1));
      }
    },
    [dispatch, location, pageSize, activeFilter, sortBy, sortDir, buildQuery, fetchThunk, actions]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Immediately fetch when Enter is pressed, bypassing debounce
    // Reset to page 1 when filtering
    const query = buildQuery(1, pageSize, columnFilters, activeFilter, sortBy, sortDir);
    dispatch(fetchThunk({ location, query }));
    dispatch(actions.setPage(1));
  }, [dispatch, location, pageSize, columnFilters, activeFilter, sortBy, sortDir, buildQuery, fetchThunk, actions]);

  const handleServerSideFilterChange = React.useCallback(
    (filterKey: string | undefined) => {
      dispatch(actions.setActiveFilter(filterKey));
    },
    [dispatch, actions]
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

