"use client";

import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";
import { buildActiveFilterFlags } from "@/utils/listingUtils";

import { OwnersQuery, OwnerRow } from "../owners.api";
import { fetchOwners, setActiveFilter, setColumnFilters, setPage, setPageSize, setSorting as setSortingAction } from "../ownersListing.slice";
import { SortField } from "../utils/sortOwners";

export function useOwnerListing(location: string) {
  const buildQuery = (
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: "asc" | "desc"
  ): OwnersQuery => {
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
  };

  const setSorting = (payload: {
    sortBy?: string;
    sortDir: "asc" | "desc";
  }): PayloadAction<{ sortBy?: SortField; sortDir: "asc" | "desc" }> => {
    return setSortingAction({
      sortBy: payload.sortBy as SortField | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<OwnerRow, OwnersQuery>({
    sliceName: "ownersListing",
    fetchThunk: fetchOwners,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
    defaultSortField: "lastName",
  });
}

