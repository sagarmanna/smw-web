"use client";

import { useCallback } from "react";
import { useGenericListing } from "@/hooks/useGenericListing";
import { 
  fetchStaffMembers, 
  setPage, 
  setPageSize, 
  setSorting as setSortingAction, 
  setColumnFilters, 
  setActiveFilter 
} from "../staffMembersListing.slice";
import { StaffMembersQuery, StaffMemberRow } from "../staffMembers.api";
import { SortField } from "../utils/sortStaffMembers";
import { buildActiveFilterFlags } from "@/utils/listingUtils";
import { PayloadAction } from "@reduxjs/toolkit";

export function useStaffMemberListing(location: string) {
  const buildQuery = useCallback((
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: 'asc' | 'desc'
  ): StaffMembersQuery => {
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
  }, []);

  // Wrapper function to adapt setSorting to match generic hook's expected signature
  const setSorting = (payload: { sortBy?: string; sortDir: 'asc' | 'desc' }): PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }> => {
    return setSortingAction({
      sortBy: payload.sortBy as SortField | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<StaffMemberRow, StaffMembersQuery>({
    sliceName: 'staffMembersListing',
    fetchThunk: fetchStaffMembers,
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

