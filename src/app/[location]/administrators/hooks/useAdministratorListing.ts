"use client";

import * as React from "react";
import { useGenericListing } from "@/hooks/useGenericListing";
import { 
  fetchAdministrators, 
  setPage, 
  setPageSize, 
  setSorting as setSortingAction, 
  setColumnFilters, 
  setActiveFilter 
} from "../administratorsListing.slice";
import { AdministratorsQuery, AdministratorRow } from "../administrators.api";
import { SortField } from "../utils/sortAdministrators";
import { buildActiveFilterFlags } from "@/utils/listingUtils";
import { PayloadAction } from "@reduxjs/toolkit";

/**
 * Custom hook for administrators listing with server-side pagination, sorting, and filtering
 * 
 * This hook manages the state and API calls for the administrators listing page.
 * It uses the generic listing hook pattern for consistency across listing pages.
 * 
 * @param location - The location slug for API calls
 * @returns Object containing listing state and handlers for pagination, sorting, filtering
 * 
 * @example
 * ```typescript
 * const {
 *   rows,
 *   isLoading,
 *   page,
 *   setPage,
 *   handleColumnFilterEnter
 * } = useAdministratorListing('maple');
 * ```
 */
export function useAdministratorListing(location: string) {
  /**
   * Builds query object from UI state (pagination, filters, sorting)
   * Memoized to prevent unnecessary re-renders and function recreations
   */
  const buildQuery = React.useCallback((
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: 'asc' | 'desc'
  ): AdministratorsQuery => {
    // Convert UI filter string to API boolean flags
    const { showActive, showInActive } = buildActiveFilterFlags(activeFilter);

    return {
      page,
      limit: pageSize,
      firstName: columnFilters.firstName as string | undefined,
      lastName: columnFilters.lastName as string | undefined,
      email: columnFilters.email as string | undefined,
      showActive,
      showInActive,
      sort: sortBy as SortField | undefined,
      order: sortDir,
    };
  }, []); // Empty deps array - function is pure and doesn't depend on any props/state

  /**
   * Wrapper function to adapt setSorting to match generic hook's expected signature
   * Maps string sort field to typed SortField
   */
  const setSorting = (payload: { sortBy?: string; sortDir: 'asc' | 'desc' }): PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }> => {
    return setSortingAction({
      sortBy: payload.sortBy as SortField | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<AdministratorRow, AdministratorsQuery>({
    sliceName: 'administratorsListing',
    fetchThunk: fetchAdministrators,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
    defaultSortField: 'lastName',
  });
}
