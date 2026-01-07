"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { CountriesQuery, CountryRow } from "../countries.api";
import {
  fetchCountries,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
  setActiveFilter,
} from "../countriesListing.slice";

export function useCountryListing(location: string) {
  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      columnFilters: Record<string, unknown>
    ): CountriesQuery => {
      return {
        page,
        limit: pageSize,
        name: columnFilters.name as string | undefined,
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

  return useGenericListing<CountryRow, CountriesQuery>({
    sliceName: "countriesListing",
    fetchThunk: fetchCountries,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
  });
}


