"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { ProvincesQuery, ProvinceRow } from "../provinces.api";
import {
  fetchProvinces,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
  setActiveFilter,
} from "../provincesListing.slice";

export function useProvinceListing(location: string) {
  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      columnFilters: Record<string, unknown>,
      _activeFilter: string | undefined,
      sortBy: string | undefined,
      sortDir: "asc" | "desc"
    ): ProvincesQuery => {
      const sort = (sortBy as ProvincesQuery["sort"]) || "name";
      const order: ProvincesQuery["order"] = sortDir === "desc" ? "DESC" : "ASC";

      return {
        page,
        limit: pageSize,
        name: columnFilters.name as string | undefined,
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

  return useGenericListing<ProvinceRow, ProvincesQuery>({
    sliceName: "provincesListing",
    fetchThunk: fetchProvinces,
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


