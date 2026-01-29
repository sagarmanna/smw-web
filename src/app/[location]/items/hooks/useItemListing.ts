"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchItems,
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setShowAll,
} from "../itemsListing.slice";
import type { SortField } from "../itemsListing.slice";

export function useItemListing(location: string) {
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.itemsListing.rows);
  const isLoading = useAppSelector((state) => state.itemsListing.isLoading);
  const error = useAppSelector((state) => state.itemsListing.error);
  const page = useAppSelector((state) => state.itemsListing.page);
  const pageSize = useAppSelector((state) => state.itemsListing.pageSize);
  const sortBy = useAppSelector((state) => state.itemsListing.sortBy);
  const sortDir = useAppSelector((state) => state.itemsListing.sortDir);
  const columnFilters = useAppSelector((state) => state.itemsListing.columnFilters);
  const showAll = useAppSelector((state) => state.itemsListing.showAll);
  const total = useAppSelector((state) => state.itemsListing.total);
  const totalPages = useAppSelector((state) => state.itemsListing.totalPages);

  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === "desc" }];
  }, [sortBy, sortDir]);

  const columnFiltersRef = React.useRef(columnFilters);
  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  // Main fetch: only when page/size/sort/showAll change (not on filter text change – like customer listing)
  const queryKey = React.useMemo(
    () => `${location}|${page}|${pageSize}|${sortBy ?? ""}|${sortDir}|${showAll}`,
    [location, page, pageSize, sortBy, sortDir, showAll]
  );
  const lastFetchedQueryKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastFetchedQueryKeyRef.current === queryKey) return;
    lastFetchedQueryKeyRef.current = queryKey;
    const filters = columnFiltersRef.current;
    const query = {
      page,
      limit: pageSize,
      sortBy: sortBy ?? "id",
      sortOrder: (sortDir === "desc" ? "desc" : "asc") as "asc" | "desc",
      code: (filters.code as string | undefined)?.trim() || undefined,
      description: (filters.description as string | undefined)?.trim() || undefined,
      itemCategory: (filters.itemCategory as string | undefined)?.trim() || undefined,
      showAll: showAll ? (1 as const) : (0 as const),
    };
    dispatch(fetchItems({ location, query }));
  }, [location, queryKey, dispatch, page, pageSize, sortBy, sortDir, showAll]);

  const refetch = React.useCallback(() => {
    const filters = columnFiltersRef.current;
    const query = {
      page,
      limit: pageSize,
      sortBy: sortBy ?? "id",
      sortOrder: (sortDir === "desc" ? "desc" : "asc") as "asc" | "desc",
      code: (filters.code as string | undefined)?.trim() || undefined,
      description: (filters.description as string | undefined)?.trim() || undefined,
      itemCategory: (filters.itemCategory as string | undefined)?.trim() || undefined,
      showAll: showAll ? (1 as const) : (0 as const),
    };
    dispatch(fetchItems({ location, query }));
  }, [dispatch, location, page, pageSize, sortBy, sortDir, showAll]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as SortField | undefined;
      const sortDir = newSorting[0]?.desc ? "desc" : "asc";
      dispatch(setSorting({ sortBy, sortDir }));
    },
    [dispatch]
  );

  const handleSetPage = React.useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleSetPageSize = React.useCallback(
    (newSize: number) => {
      dispatch(setPageSize(newSize));
    },
    [dispatch]
  );

  // Search/filter: don't call API on every keystroke – only on Enter (like customer listing)
  const handleColumnFilterChange = React.useCallback(
    (columnKey: string, filterValue: unknown) => {
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]:
          filterValue === "" || filterValue === null ? undefined : filterValue,
      };
      dispatch(setColumnFilters(newFilters));
      columnFiltersRef.current = newFilters;
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    dispatch(setPage(1));
    const query = {
      page: 1,
      limit: pageSize,
      sortBy: sortBy ?? "id",
      sortOrder: (sortDir === "desc" ? "desc" : "asc") as "asc" | "desc",
      code: (columnFilters.code as string | undefined)?.trim() || undefined,
      description: (columnFilters.description as string | undefined)?.trim() || undefined,
      itemCategory: (columnFilters.itemCategory as string | undefined)?.trim() || undefined,
      showAll: showAll ? (1 as const) : (0 as const),
    };
    dispatch(fetchItems({ location, query }));
  }, [dispatch, location, pageSize, sortBy, sortDir, showAll, columnFilters]);

  const handleShowAllChange = React.useCallback(
    (checked: boolean) => {
      dispatch(setShowAll(checked));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  return {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    sorting,
    setSorting: handleSetSorting,
    page,
    setPage: handleSetPage,
    pageSize,
    setPageSize: handleSetPageSize,
    columnFilters,
    showAll,
    refetch,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleShowAllChange,
  };
}

