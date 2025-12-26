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
import { ItemsQuery } from "../itemsListing.api";
import { SortField } from "../itemsListing.slice";

export function useItemListing(location: string) {
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.itemsListing.rows);
  const total = useAppSelector((state) => state.itemsListing.total);
  const totalPages = useAppSelector((state) => state.itemsListing.totalPages);
  const isLoading = useAppSelector((state) => state.itemsListing.isLoading);
  const error = useAppSelector((state) => state.itemsListing.error);
  const page = useAppSelector((state) => state.itemsListing.page);
  const pageSize = useAppSelector((state) => state.itemsListing.pageSize);
  const sortBy = useAppSelector((state) => state.itemsListing.sortBy);
  const sortDir = useAppSelector((state) => state.itemsListing.sortDir);
  const columnFilters = useAppSelector((state) => state.itemsListing.columnFilters);
  const showAll = useAppSelector((state) => state.itemsListing.showAll);

  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === 'desc' }];
  }, [sortBy, sortDir]);

  const hasInitialFetchedRef = React.useRef(false);
  const lastLocationRef = React.useRef<string | null>(null);
  const columnFiltersRef = React.useRef(columnFilters);
  const prevParamsRef = React.useRef<{
    location: string;
    page: number;
    pageSize: number;
    sortBy: SortField | undefined;
    sortDir: 'asc' | 'desc';
    showAll: boolean;
  } | null>(null);

  const buildQuery = React.useCallback((
    currentPage: number,
    currentPageSize: number,
    currentColumnFilters: Record<string, unknown>,
    currentSortBy: SortField | undefined,
    currentSortDir: 'asc' | 'desc',
    currentShowAll: boolean
  ): ItemsQuery => {
    const query: ItemsQuery = {
      page: currentPage,
      limit: currentShowAll ? -1 : currentPageSize,
      code: currentColumnFilters.code as string | undefined,
      itemCategory: currentColumnFilters.itemCategory as string | undefined,
      description: currentColumnFilters.description as string | undefined,
      sort: currentSortBy,
      order: currentSortDir,
    };

    return query;
  }, []);

  const fetchData = React.useCallback(async () => {
    const query = buildQuery(page, pageSize, columnFilters, sortBy, sortDir, showAll);
    await dispatch(fetchItems({ location, query }));
  }, [dispatch, location, page, pageSize, columnFilters, sortBy, sortDir, showAll, buildQuery]);

  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  React.useEffect(() => {
    const locationChanged = lastLocationRef.current !== null && lastLocationRef.current !== location;
    if (locationChanged) {
      hasInitialFetchedRef.current = false;
      prevParamsRef.current = null;
    }
    lastLocationRef.current = location;

    const paramsChanged = prevParamsRef.current === null ||
      prevParamsRef.current.location !== location ||
      prevParamsRef.current.page !== page ||
      prevParamsRef.current.pageSize !== pageSize ||
      prevParamsRef.current.sortBy !== sortBy ||
      prevParamsRef.current.sortDir !== sortDir ||
      prevParamsRef.current.showAll !== showAll;

    prevParamsRef.current = {
      location,
      page,
      pageSize,
      sortBy,
      sortDir,
      showAll,
    };

    if (!hasInitialFetchedRef.current || paramsChanged) {
      hasInitialFetchedRef.current = true;
      const query = buildQuery(page, pageSize, columnFiltersRef.current, sortBy, sortDir, showAll);
      dispatch(fetchItems({ location, query }));
    }
  }, [location, page, pageSize, sortBy, sortDir, showAll, dispatch, buildQuery]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as SortField | undefined;
      const sortDir = newSorting[0]?.desc ? 'desc' : 'asc';
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

  const handleColumnFilterChange = React.useCallback(
    (columnKey: string, filterValue: unknown) => {
      const newFilters = {
        ...columnFiltersRef.current,
        [columnKey]: filterValue === "" || filterValue === null ? undefined : filterValue,
      };
      dispatch(setColumnFilters(newFilters));
      columnFiltersRef.current = newFilters;
    },
    [dispatch]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    const query = buildQuery(1, pageSize, columnFiltersRef.current, sortBy, sortDir, showAll);
    dispatch(fetchItems({ location, query }));
    dispatch(setPage(1));
  }, [dispatch, location, pageSize, sortBy, sortDir, showAll, buildQuery]);

  const handleShowAllChange = React.useCallback(
    (checked: boolean) => {
      dispatch(setShowAll(checked));
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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleShowAllChange,
  };
}

