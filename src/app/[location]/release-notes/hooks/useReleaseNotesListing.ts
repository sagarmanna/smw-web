"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters,
  fetchReleaseNotes,
} from "../releaseNotesListing.slice";

export function useReleaseNotesListing(location: string) {
  const dispatch = useAppDispatch();

  // Get all data from Redux (fetched once in page.tsx)
  const allRows = useAppSelector((state) => state.releaseNotesListing.allRows);
  const isLoading = useAppSelector((state) => state.releaseNotesListing.isLoading);
  const error = useAppSelector((state) => state.releaseNotesListing.error);
  const page = useAppSelector((state) => state.releaseNotesListing.page);
  const pageSize = useAppSelector((state) => state.releaseNotesListing.pageSize);
  const sortBy = useAppSelector((state) => state.releaseNotesListing.sortBy);
  const sortDir = useAppSelector((state) => state.releaseNotesListing.sortDir);
  const columnFilters = useAppSelector((state) => state.releaseNotesListing.columnFilters);

  // Client-side filtering, sorting, and pagination
  const { filteredRows, total, totalPages } = React.useMemo(() => {
    // Step 1: Apply filters
    let filtered = [...allRows];
    
    if (columnFilters.subject) {
      const subjectFilter = String(columnFilters.subject).toLowerCase();
      filtered = filtered.filter((row) =>
        row.subject.toLowerCase().includes(subjectFilter)
      );
    }

    // Step 2: Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        if (sortBy === "subject") {
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
        } else if (sortBy === "scheduleDate") {
          aValue = new Date(a.scheduleDate).getTime();
          bValue = new Date(b.scheduleDate).getTime();
        } else if (sortBy === "createdDate") {
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
        }

        if (sortDir === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    // Step 3: Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRows = filtered.slice(startIndex, endIndex);

    return {
      filteredRows: paginatedRows,
      total,
      totalPages,
    };
  }, [allRows, columnFilters, sortBy, sortDir, page, pageSize]);

  // Convert Redux sorting state to TanStack Table format
  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === 'desc' }];
  }, [sortBy, sortDir]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as "subject" | "scheduleDate" | "createdDate" | undefined;
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
        ...columnFilters,
        [columnKey]: filterValue,
      };
      dispatch(setColumnFilters(newFilters));
    },
    [dispatch, columnFilters]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    // Filter is already applied via handleColumnFilterChange
    // Just reset to page 1 when Enter is pressed
    dispatch(setPage(1));
  }, [dispatch]);

  /**
   * Fetch data function - ONLY for error recovery and manual refresh
   * 
   * IMPORTANT: This function should NOT be called during normal operations.
   * Data is fetched once on initial page load and stored in Redux.
   * Mutations (add/update/delete) update Redux state directly after API calls.
   * 
   * Use cases:
   * - Error retry: When initial fetch fails, user can retry
   * - Manual refresh: Force refresh all data from server (rarely needed)
   * 
   * DO NOT use this for:
   * - Refreshing after mutations (Redux is already updated)
   * - Regular data updates (data comes from Redux state)
   */
  const fetchData = React.useCallback(async () => {
    await dispatch(fetchReleaseNotes({ location }));
  }, [dispatch, location]);

  return {
    rows: filteredRows,
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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  };
}
