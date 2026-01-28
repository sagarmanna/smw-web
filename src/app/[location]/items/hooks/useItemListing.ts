"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setShowAll,
} from "../itemsListing.slice";
import type { SortField } from "../itemsListing.slice";
import type { ItemRow } from "../itemsListing.api";

export function useItemListing() {
  const dispatch = useAppDispatch();

  const allRows = useAppSelector((state) => state.itemsListing.rows);
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
    return [{ id: sortBy, desc: sortDir === "desc" }];
  }, [sortBy, sortDir]);

  const columnFiltersRef = React.useRef(columnFilters);

  React.useEffect(() => {
    columnFiltersRef.current = columnFilters;
  }, [columnFilters]);

  const { rows, total, totalPages } = React.useMemo(() => {
    let data: ItemRow[] = [...allRows];

    const codeFilter = (columnFilters.code as string | undefined)?.trim().toLowerCase();
    const itemCategoryFilter = (columnFilters.itemCategory as string | undefined)
      ?.trim()
      .toLowerCase();
    const descriptionFilter = (columnFilters.description as string | undefined)
      ?.trim()
      .toLowerCase();

    if (codeFilter) {
      data = data.filter((row) => row.code.toLowerCase().includes(codeFilter));
    }

    if (itemCategoryFilter) {
      data = data.filter((row) =>
        row.itemCategory.toLowerCase().includes(itemCategoryFilter)
      );
    }

    if (descriptionFilter) {
      data = data.filter((row) =>
        row.description.toLowerCase().includes(descriptionFilter)
      );
    }

    if (sortBy) {
      data = [...data].sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortBy];
        const bValue = (b as unknown as Record<string, unknown>)[sortBy];

        const aStr = (aValue ?? "").toString().toLowerCase();
        const bStr = (bValue ?? "").toString().toLowerCase();

        if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
        if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    const totalFiltered = data.length;

    if (showAll) {
      return {
        rows: data,
        total: totalFiltered,
        totalPages: 1,
      };
    }

    const totalPagesComputed = Math.max(
      1,
      Math.ceil(totalFiltered / (pageSize || 1))
    );
    const currentPage = Math.min(page, totalPagesComputed);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      rows: data.slice(startIndex, endIndex),
      total: totalFiltered,
      totalPages: totalPagesComputed,
    };
  }, [allRows, columnFilters, sortBy, sortDir, showAll, page, pageSize]);

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
    // With client-side filtering, pressing Enter just ensures we start from page 1
    dispatch(setPage(1));
  }, [dispatch]);

  const handleShowAllChange = React.useCallback(
    (checked: boolean) => {
      dispatch(setShowAll(checked));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const fetchData = React.useCallback(async () => {
    // No-op: by design we only call GET once on initial page load (in page.tsx)
    return;
  }, []);

  return {
    rows,
    allRows,
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

