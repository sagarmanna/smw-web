"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { CitiesQuery, CityRow, type CitiesOrder, type CitiesSortField } from "../cities.api";
import { fetchCities, setColumnFilters, setPage, setPageSize, setSorting as setSortingAction, setActiveFilter } from "../citiesListing.slice";

export function useCityListing(location: string) {
  const buildQuery = useCallback((
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    _activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: "asc" | "desc"
  ): CitiesQuery => {
    const sort: CitiesSortField | undefined =
      sortBy === "province" ? "province" : sortBy === "name" ? "name" : undefined;

    const order: CitiesOrder | undefined = sort
      ? sortDir === "desc"
        ? "DESC"
        : "ASC"
      : undefined;

    return {
      page,
      limit: pageSize,
      name: columnFilters.name as string | undefined,
      province: columnFilters.province as string | undefined,
      sort,
      order,
    };
  }, []);

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

