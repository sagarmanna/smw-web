"use client";

import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { CitiesQuery, CityRow } from "../cities.api";
import { fetchCities, setColumnFilters, setPage, setPageSize, setSorting as setSortingAction, setActiveFilter } from "../citiesListing.slice";

export function useCityListing(location: string) {
  const buildQuery = (
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    _activeFilter: string | undefined,
    _sortBy: string | undefined,
    _sortDir: "asc" | "desc"
  ): CitiesQuery => {
    return {
      page,
      limit: pageSize,
      name: columnFilters.name as string | undefined,
      province: columnFilters.province as string | undefined,
    };
  };

  const setSorting = (payload: {
    sortBy?: string;
    sortDir: "asc" | "desc";
  }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
    return setSortingAction({
      sortBy: payload.sortBy as string | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<CityRow, CitiesQuery>({
    sliceName: "citiesListing",
    fetchThunk: fetchCities,
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

