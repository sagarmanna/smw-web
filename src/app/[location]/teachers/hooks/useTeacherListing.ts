"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchTeachers, 
  setPage, 
  setPageSize, 
  setSorting, 
  setColumnFilters, 
  setActiveFilter 
} from "../teachersListing.slice";
import { TeachersQuery } from "../teachers.api";
import { SortField } from "../utils/sortTeachers";

export function useTeacherListing(location: string) {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const rows = useAppSelector((state) => state.teachersListing.rows);
  const total = useAppSelector((state) => state.teachersListing.total);
  const totalPages = useAppSelector((state) => state.teachersListing.totalPages);
  const isLoading = useAppSelector((state) => state.teachersListing.isLoading);
  const error = useAppSelector((state) => state.teachersListing.error);
  const page = useAppSelector((state) => state.teachersListing.page);
  const pageSize = useAppSelector((state) => state.teachersListing.pageSize);
  const sortBy = useAppSelector((state) => state.teachersListing.sortBy);
  const sortDir = useAppSelector((state) => state.teachersListing.sortDir);
  const columnFilters = useAppSelector((state) => state.teachersListing.columnFilters);
  const activeFilter = useAppSelector((state) => state.teachersListing.activeFilter);

  // Convert Redux sorting state to TanStack Table format
  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === 'desc' }];
  }, [sortBy, sortDir]);

  const fetchData = React.useCallback(async () => {
    const query: TeachersQuery = {
      page,
      limit: pageSize,
      firstName: columnFilters.firstName as string | undefined,
      lastName: columnFilters.lastName as string | undefined,
      email: columnFilters.email as string | undefined,
      phone: columnFilters.phone as string | undefined,
      status: activeFilter === "inactive" ? "inactive" : undefined,
      sort: sortBy,
      order: sortDir,
    };

    await dispatch(fetchTeachers({ location, query }));
  }, [dispatch, location, page, pageSize, columnFilters, activeFilter, sortBy, sortDir]);

  // Fetch data when dependencies change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      dispatch(setColumnFilters({
        ...columnFilters,
        [columnKey]: filterValue,
      }));
    },
    [dispatch, columnFilters]
  );

  const handleColumnFilterEnter = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleServerSideFilterChange = React.useCallback(
    (filterKey: string | undefined) => {
      dispatch(setActiveFilter(filterKey));
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
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  };
}

