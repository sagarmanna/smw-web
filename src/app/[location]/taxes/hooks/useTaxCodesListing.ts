"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import { useGenericListing } from "@/hooks/useGenericListing";

import { TaxCodesQuery, TaxCodeRow } from "../taxes.api";
import {
  fetchTaxCodes,
  setActiveFilter,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
} from "../taxCodesListing.slice";

export function useTaxCodesListing(location: string) {
  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      columnFilters: Record<string, unknown>,
      _activeFilter: string | undefined,
      _sortBy: string | undefined,
      _sortDir: "asc" | "desc"
    ): TaxCodesQuery => {
      return {
        page,
        limit: pageSize,
        taxName: columnFilters.taxName as string | undefined,
        provinceName: columnFilters.provinceName as string | undefined,
        code: columnFilters.code as string | undefined,
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

  return useGenericListing<TaxCodeRow, TaxCodesQuery>({
    sliceName: "taxCodesListing",
    fetchThunk: fetchTaxCodes,
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


