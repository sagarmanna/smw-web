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

  // Get data from Redux (server-side sorted and paginated)
  const rows = useAppSelector((state) => state.releaseNotesListing.rows);
  const isLoading = useAppSelector((state) => state.releaseNotesListing.isLoading);
  const error = useAppSelector((state) => state.releaseNotesListing.error);
  const page = useAppSelector((state) => state.releaseNotesListing.page);
  const pageSize = useAppSelector((state) => state.releaseNotesListing.pageSize);
  const total = useAppSelector((state) => state.releaseNotesListing.total);
  const totalPages = useAppSelector((state) => state.releaseNotesListing.totalPages);
  const sortBy = useAppSelector((state) => state.releaseNotesListing.sortBy);
  const sortDir = useAppSelector((state) => state.releaseNotesListing.sortDir);
  const columnFilters = useAppSelector((state) => state.releaseNotesListing.columnFilters);

  // Client-side filtering only (sorting and pagination are server-side)
  const filteredRows = React.useMemo(() => {
    let filtered = [...rows];
    
    if (columnFilters.subject) {
      const subjectFilter = String(columnFilters.subject).toLowerCase();
      filtered = filtered.filter((row) =>
        row.subject.toLowerCase().includes(subjectFilter)
      );
    }

    return filtered;
  }, [rows, columnFilters]);

  // Convert Redux sorting state to TanStack Table format
  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === 'desc' }];
  }, [sortBy, sortDir]);

  // Track if this is the initial mount to avoid duplicate API calls
  const isInitialMount = React.useRef(true);

  // Trigger API call when sorting or pagination changes (but not on initial mount)
  React.useEffect(() => {
    // Skip on initial mount - page.tsx handles the initial fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only trigger API call if we have a valid sortBy
    if (sortBy) {
      dispatch(fetchReleaseNotes({ 
        location, 
        sortBy, 
        sortDir, 
        page, 
        limit: pageSize 
      }));
    }
  }, [dispatch, location, sortBy, sortDir, page, pageSize]);

  const handleSetSorting = React.useCallback(
    (newSorting: SortingState) => {
      const newSortBy = newSorting[0]?.id as "subject" | "scheduleDate" | "createdDate" | "id" | undefined;
      const newSortDir = newSorting[0]?.desc ? 'desc' : 'asc';
      dispatch(setSorting({ sortBy: newSortBy, sortDir: newSortDir }));
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
   * Fetch data function - for error recovery and manual refresh
   * 
   * Use cases:
   * - Error retry: When fetch fails, user can retry
   * - Manual refresh: Force refresh data from server
   */
  const fetchData = React.useCallback(async () => {
    await dispatch(fetchReleaseNotes({ 
      location,
      sortBy: sortBy || 'scheduleDate',
      sortDir: sortDir || 'desc',
      page,
      limit: pageSize
    }));
  }, [dispatch, location, sortBy, sortDir, page, pageSize]);

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
