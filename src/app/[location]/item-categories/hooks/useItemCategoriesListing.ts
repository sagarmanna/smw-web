"use client";

import { useCallback, useMemo } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";
import { ItemCategoryRow, ItemCategoriesQuery } from "../itemCategories.api";
import {
  fetchItemCategories,
  setActiveFilter,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
} from "../itemCategoriesListing.slice";

export function useItemCategoriesListing(location: string) {
  const setSorting = useCallback(
    (payload: {
      sortBy?: string;
      sortDir: "asc" | "desc";
    }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
      return setSortingAction({
        sortBy: payload.sortBy as string | undefined,
        sortDir: payload.sortDir,
      });
    },
    []
  );

  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      _columnFilters: Record<string, unknown>,
      _activeFilter: string | undefined,
      sortBy: string | undefined,
      sortDir: "asc" | "desc"
    ): ItemCategoriesQuery => {
      return {
        page,
        limit: pageSize,
        sort: sortBy,
        order: sortBy ? ((sortDir === "asc" ? "ASC" : "DESC") as "ASC" | "DESC") : undefined,
      };
    },
    []
  );

  const actions = useMemo(
    () => ({
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    }),
    [setSorting]
  );

  return useGenericListing<ItemCategoryRow, ItemCategoriesQuery>({
    sliceName: "itemCategoriesListing",
    fetchThunk: fetchItemCategories,
    actions,
    buildQuery,
    location,
  });
}


