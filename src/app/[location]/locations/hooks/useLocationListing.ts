"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { LocationRow, LocationsQuery } from "../locations.api";
import {
  fetchLocations,
  setActiveFilter,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
} from "../locationsListing.slice";

export function useLocationListing(location: string) {
  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      columnFilters: Record<string, unknown>,
      _activeFilter: string | undefined,
      sortBy: string | undefined,
      sortDir: "asc" | "desc"
    ): LocationsQuery => {
      const sort = (sortBy as LocationsQuery["sort"]) || "name";
      const order: LocationsQuery["order"] = sortDir === "desc" ? "DESC" : "ASC";

      return {
        page,
        limit: pageSize,
        name: columnFilters.name as string | undefined,
        address: columnFilters.address as string | undefined,
        email: columnFilters.email as string | undefined,
        sort,
        order,
      };
    },
    []
  );

  const setSorting = (payload: {
    sortBy?: string;
    sortDir: "asc" | "desc";
  }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
    return setSortingAction({
      sortBy: payload.sortBy as string | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<LocationRow, LocationsQuery>({
    sliceName: "locationsListing",
    fetchThunk: fetchLocations,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
    defaultSortField: "name",
    defaultSortDir: "asc",
  });
}


